import { NextRequest, NextResponse } from "next/server";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";
import { GetGameMetaDataUsecase } from "@/backend/game/application/usecase/GetGameMetaDataUsecase";

import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";

import redis from "@/lib/redis";
import { generateCacheKey } from "@/lib/cacheKey";
import type { CacheKeyParams, SortType } from "@/lib/cacheKey";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        const meta = params.get("meta") === "true";

        const cacheKeyParams: CacheKeyParams = {
            sort: (params.get("sort") || "popular") as SortType,
            genre: params.get("genre") ?? undefined,
            theme: params.get("theme") ?? undefined,
            platform: params.get("platform") ?? undefined,
            keyword: params.get("keyword") ?? undefined,
            page: params.get("page") || "1",
            size: params.get("size") || "6",
        };

        const cacheKey = generateCacheKey(cacheKeyParams);

        // 메타데이터 요청 처리
        if (meta) {
            const usecase = new GetGameMetaDataUsecase(
                new PrismaGenreRepository(),
                new PrismaThemeRepository(),
                new PrismaPlatformRepository()
            );
            const metadata = await usecase.execute();
            return NextResponse.json(metadata, { status: 200 });
        }

        // popular 또는 rating 정렬 & 필터 없는 경우만 캐시 사용
        const isCacheTarget = !!cacheKey;

        // 캐시 조회
        if (isCacheTarget) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return NextResponse.json(cached, { status: 200 });
            }
        }

        // 데이터 조회
        const getFilteredGamesUsecase = new GetFilteredGamesUsecase(
            new GamePrismaRepository()
        );

        const { data, totalCount } = await getFilteredGamesUsecase.execute({
            genre: cacheKeyParams.genre,
            theme: cacheKeyParams.theme,
            platform: cacheKeyParams.platform,
            keyword: cacheKeyParams.keyword,
            sort: cacheKeyParams.sort,
            page: cacheKeyParams.page,
            size: cacheKeyParams.size,
        });

        const response = { games: data, totalCount };

        // 캐시 저장
        if (isCacheTarget) {
            await redis.set(cacheKey, JSON.stringify(response), {
                ex: 60 * 60 * 24, // 24시간
            });
        }

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("[GET /api/games] 에러:", error);
        return NextResponse.json(
            { message: "게임 목록 조회 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

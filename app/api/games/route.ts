import { NextRequest, NextResponse } from "next/server";

import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";
import { GetGameMetaDataUsecase } from "@/backend/game/application/usecase/GetGameMetaDataUsecase";
import { GetFilteredGamesSchema } from "@/backend/game/application/usecase/dto/GetFilteredGamesRequestDto";

import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

import redis from "@/lib/redis";
import { generateCacheKey } from "@/lib/cacheKey";
import type { CacheKeyParams } from "@/lib/cacheKey";
import { validate } from "@/utils/validation";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        // 메타데이터 요청 여부
        const meta = params.get("meta") === "true";

        // 메타데이터 요청 처리
        if (meta) {
            const metaUsecase = new GetGameMetaDataUsecase(
                new PrismaGenreRepository(),
                new PrismaThemeRepository(),
                new PrismaPlatformRepository()
            );
            const metadata = await metaUsecase.execute();
            return NextResponse.json(metadata, { status: 200 });
        }

        // 쿼리 파라미터 유효성 검사
        const validation = validate(GetFilteredGamesSchema, Object.fromEntries(params));
        if (!validation.success) {
            return validation.response;
        }

        const { sort, page, size, genreId, themeId, platformId, keyword } = validation.data;
        const offset = (page - 1) * size;
        const limit = size;

        const cacheKeyParams: CacheKeyParams = {
            genreId: genreId?.toString(),
            themeId: themeId?.toString(),
            platformId: platformId?.toString(),
            keyword,
            sort,
            page: page.toString(),
            size: size.toString(),
        };

        const cacheKey = generateCacheKey(cacheKeyParams);

        // // 캐시 조회
        const isCacheTarget = !!cacheKey;
        if (isCacheTarget) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const parsedCached =
                    typeof cached === "string" ? JSON.parse(cached) : cached;
                return NextResponse.json(parsedCached, { status: 200 });
            }
        }

        // 의존성 주입
        const gameRepo = new GamePrismaRepository();
        const reviewRepo = new PrismaReviewRepository();

        const getFilteredGamesUsecase = new GetFilteredGamesUsecase(
            gameRepo,
            reviewRepo
        );

        const { data, totalCount } = await getFilteredGamesUsecase.execute({
            genreId,
            themeId,
            platformId,
            keyword,
            sort,
            offset,
            limit,
        });

        const response = { games: data, totalCount };

        // 캐시 저장
        if (isCacheTarget) {
            await redis.set(
                cacheKey,
                JSON.stringify(response),
                "EX",
                60 * 60 * 24 // 24시간
            );
        }

        return NextResponse.json(response, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("[GET /api/games] 에러:", error.message, error.stack);
            return NextResponse.json(
                { message: "게임 목록 조회 중 오류가 발생했습니다." },
                { status: 500 }
            );
        } else {
            console.error("[GET /api/games] 알 수 없는 에러:", error);
            return NextResponse.json(
                {
                    message:
                        "게임 목록 조회 중 알 수 없는 오류가 발생했습니다.",
                },
                { status: 500 }
            );
        }
    }
}

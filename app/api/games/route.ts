import { NextRequest, NextResponse } from "next/server";

import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";
import { GetGameMetaDataUsecase } from "@/backend/game/application/usecase/GetGameMetaDataUsecase";
import { GetFilteredGamesSchema } from "@/backend/game/application/usecase/dto/GetFilteredGamesRequestDto";

import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

import { withCache } from "@/lib/withCache";
import { generateCacheKey, gameMetaKey } from "@/lib/cacheKey";
import type { CacheKeyParams } from "@/lib/cacheKey";
import { validate } from "@/utils/validation";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
    const log = logger.child({ route: "/api/games", method: "GET" });
    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        const meta = params.get("meta") === "true";

        if (meta) {
            const metaUsecase = new GetGameMetaDataUsecase(
                new PrismaGenreRepository(),
                new PrismaThemeRepository(),
                new PrismaPlatformRepository()
            );
            const metadata = await withCache(gameMetaKey(), 3600, () =>
                metaUsecase.execute()
            );
            return NextResponse.json(metadata, { status: 200 });
        }

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

        const gameRepo = new GamePrismaRepository();
        const reviewRepo = new PrismaReviewRepository();
        const getFilteredGamesUsecase = new GetFilteredGamesUsecase(gameRepo, reviewRepo);

        const response = await withCache(cacheKey, 60 * 60 * 24, async () => {
            const { data, totalCount } = await getFilteredGamesUsecase.execute({
                genreId,
                themeId,
                platformId,
                keyword,
                sort,
                offset,
                limit,
            });
            return { games: data, totalCount };
        });

        return NextResponse.json(response, { status: 200 });
    } catch (error: unknown) {
        log.error({ err: error }, "게임 목록 조회 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: "게임 목록 조회 중 오류가 발생했습니다." },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { message: "게임 목록 조회 중 알 수 없는 오류가 발생했습니다." },
                { status: 500 }
            );
        }
    }
}

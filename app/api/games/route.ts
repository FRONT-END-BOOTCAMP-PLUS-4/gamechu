import { NextRequest, NextResponse } from "next/server";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";

import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";

import { GetAllGenresUsecase } from "@/backend/genre/application/usecase/GetAllGenresUsecase";
import { GetAllThemesUsecase } from "@/backend/theme/application/usecase/GetAllThemesUsecase";
import { GetAllPlatformsUsecase } from "@/backend/platform/application/usecase/GetAllPlatformsUsecase";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const genre = searchParams.get("genre") || undefined;
        const theme = searchParams.get("theme") || undefined;
        const platform = searchParams.get("platform") || undefined;
        const keyword = searchParams.get("keyword") || undefined;
        const meta = searchParams.get("meta") === "true";

        if (meta) {
            const genreUsecase = new GetAllGenresUsecase(
                new PrismaGenreRepository()
            );
            const themeUsecase = new GetAllThemesUsecase(
                new PrismaThemeRepository()
            );
            const platformUsecase = new GetAllPlatformsUsecase(
                new PrismaPlatformRepository()
            );

            const [genres, themes, platforms] = await Promise.all([
                genreUsecase.execute(),
                themeUsecase.execute(),
                platformUsecase.execute(),
            ]);

            return NextResponse.json(
                { genres, themes, platforms },
                { status: 200 }
            );
        }

        const gameRepository = new GamePrismaRepository();
        const getFilteredGamesUsecase = new GetFilteredGamesUsecase(
            gameRepository
        );

        const games = await getFilteredGamesUsecase.execute({
            genre,
            theme,
            platform,
            keyword,
        });

        return NextResponse.json(games, { status: 200 });
    } catch (error) {
        console.error("[GET /api/games] Error:", error);
        return NextResponse.json(
            { message: "서버 오류 발생" },
            { status: 500 }
        );
    }
}

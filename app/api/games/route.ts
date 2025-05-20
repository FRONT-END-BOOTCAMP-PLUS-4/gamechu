import { NextRequest, NextResponse } from "next/server";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";

// GET /api/games?genre=1&theme=2&platform=3
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const genre = searchParams.get("genre") || undefined;
        const theme = searchParams.get("theme") || undefined;
        const platform = searchParams.get("platform") || undefined;
        const keyword = searchParams.get("keyword") || undefined;

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

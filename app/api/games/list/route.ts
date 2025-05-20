// app/api/games/list/route.ts
import { NextResponse } from "next/server";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetGameListUsecase } from "@/backend/game/application/usecase/GetGameListUsecase";

export async function GET() {
    try {
        const gameRepository = new GamePrismaRepository();
        const usecase = new GetGameListUsecase(gameRepository);

        const games = await usecase.execute();

        return NextResponse.json(games, { status: 200 });
    } catch (error) {
        console.error("[GET /api/games/all] Error:", error);
        return NextResponse.json(
            { message: "서버 오류 발생" },
            { status: 500 }
        );
    }
}

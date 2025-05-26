import { type NextRequest, NextResponse } from "next/server";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";

const usecase = new GetGameDetailUsecase(new GamePrismaRepository());

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const gameId = Number(params.id);

    if (isNaN(gameId)) {
        return NextResponse.json(
            { message: "Invalid game ID" },
            { status: 400 }
        );
    }

    try {
        const gameDetail = await usecase.execute(gameId);
        return NextResponse.json(gameDetail);
    } catch (err) {
        console.error("🔥 게임 상세 조회 실패:", err);
        return NextResponse.json(
            { message: "Game not found" },
            { status: 404 }
        );
    }
}

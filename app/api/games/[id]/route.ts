import { type NextRequest, NextResponse } from "next/server";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const gameId = Number(id);

    if (isNaN(gameId)) {
        return NextResponse.json(
            { message: "Invalid game ID" },
            { status: 400 }
        );
    }

    const usecase = new GetGameDetailUsecase(
        new GamePrismaRepository(),
        new PrismaReviewRepository()
    );

    try {
        const gameDetail = await usecase.execute(gameId);
        return NextResponse.json(gameDetail);
    } catch (err) {
        console.error("게임 조회 실패:", err);
        return NextResponse.json(
            { message: "Game not found" },
            { status: 404 }
        );
    }
}

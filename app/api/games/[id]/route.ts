import { type NextRequest, NextResponse } from "next/server";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { withCache } from "@/lib/WithCache";
import { gameDetailKey } from "@/lib/CacheKey";
import logger from "@/lib/Logger";
import { validate, IdSchema } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const log = logger.child({ route: "/api/games/[id]", method: "GET" });
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const gameId = idValidated.data;

    const usecase = new GetGameDetailUsecase(
        new GamePrismaRepository(),
        new PrismaReviewRepository()
    );

    try {
        const gameDetail = await withCache(gameDetailKey(gameId), 600, () =>
            usecase.execute(gameId)
        );
        return NextResponse.json(gameDetail);
    } catch (err) {
        log.error({ err }, "게임 상세 조회 실패");
        return errorResponse("게임을 찾을 수 없습니다", 404);
    }
}

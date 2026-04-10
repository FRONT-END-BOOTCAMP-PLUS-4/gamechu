import { type NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/ApiResponse";
import { validate, IdSchema } from "@/utils/Validation";
import logger from "@/lib/Logger";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const log = logger.child({
        route: "/api/games/[id]/reviews",
        method: "GET",
    });
    try {
        const { id } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const gameId = idValidated.data;

        const viewerId = await getAuthUserId();
        const usecase = new GetReviewsByGameIdUsecase(
            new PrismaReviewRepository(),
            new PrismaReviewLikeRepository()
        );
        const result = await usecase.execute(gameId, viewerId || "");
        return NextResponse.json(result);
    } catch (error: unknown) {
        log.error({ err: error }, "게임 리뷰 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

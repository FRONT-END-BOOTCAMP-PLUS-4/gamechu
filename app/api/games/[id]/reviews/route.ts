import { type NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";
import logger from "@/lib/logger";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const log = logger.child({ route: "/api/games/[id]/reviews", method: "GET" });
    try {
        const { id } = await params;
        const gameId = id;
        const parsedId = Number.parseInt(gameId || "", 10);
        if (isNaN(parsedId)) {
            return errorResponse("Invalid gameId", 400);
        }

        const viewerId = await getAuthUserId();
        const usecase = new GetReviewsByGameIdUsecase(
            new PrismaReviewRepository(),
            new PrismaReviewLikeRepository()
        );
        const result = await usecase.execute(parsedId, viewerId || "");
        return NextResponse.json(result);
    } catch (error: unknown) {
        log.error({ err: error }, "게임 리뷰 조회 실패");
        const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

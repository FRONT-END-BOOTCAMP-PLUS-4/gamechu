import { NextRequest, NextResponse } from "next/server";
import { ToggleReviewLikeUsecase } from "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { IdSchema, validate } from "@/utils/validation";
import { errorResponse } from "@/utils/apiResponse";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return errorResponse("Unauthorized", 401);

        const reviewIdValidation = validate(IdSchema, (await params).reviewId);
        if (!reviewIdValidation.success) return reviewIdValidation.response;
        const parsedReviewId = reviewIdValidation.data;

        const likeRepo = new PrismaReviewLikeRepository();
        const reviewRepo = new PrismaReviewRepository();
        const memberRepo = new PrismaMemberRepository();
        const scoreRecordRepo = new PrismaScoreRecordRepository();
        const scorePolicy = new ScorePolicy();
        const applyReviewScoreUsecase = new ApplyReviewScoreUsecase(
            scorePolicy,
            memberRepo,
            scoreRecordRepo
        );
        const usecase = new ToggleReviewLikeUsecase(
            likeRepo,
            reviewRepo,
            applyReviewScoreUsecase
        );

        const result = await usecase.execute({
            reviewId: parsedReviewId,
            memberId: userId,
        });
        return NextResponse.json(result);
    } catch (err: unknown) {
        console.error("[review-likes] POST error:", err);
        const message = err instanceof Error ? err.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

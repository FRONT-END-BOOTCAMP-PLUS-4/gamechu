import { NextRequest, NextResponse } from "next/server";
import { ToggleReviewLikeUsecase } from "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { IdSchema, validate } from "@/utils/Validation";
import { errorResponse } from "@/utils/ApiResponse";
import logger from "@/lib/Logger";
import { RateLimiter, rateLimitResponse } from "@/lib/RateLimiter";
import { sendTierNotificationIfChanged } from "@/lib/TierNotification";

const reviewLikeLimiter = new RateLimiter("review-like", 60_000, 30);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const userId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/review-likes/[reviewId]",
        method: "POST",
    });
    try {
        if (!userId) return errorResponse("Unauthorized", 401);

        const limitResult = await reviewLikeLimiter.check(userId);
        if (!limitResult.allowed) {
            return rateLimitResponse(limitResult.retryAfterMs);
        }

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

        // Capture review author's score before toggle for tier change detection
        const review = await reviewRepo.findById(parsedReviewId);
        const authorBefore = review ? await memberRepo.findById(review.memberId) : null;

        const result = await usecase.execute({
            reviewId: parsedReviewId,
            memberId: userId,
        });

        // Check if review author's tier changed (non-critical)
        try {
            if (review && authorBefore) {
                const authorAfter = await memberRepo.findById(review.memberId);
                if (authorAfter) {
                    await sendTierNotificationIfChanged(
                        review.memberId,
                        authorBefore.score,
                        authorAfter.score
                    );
                }
            }
        } catch (notificationErr) {
            log.warn({ userId, err: notificationErr }, "티어 알림 생성 실패");
        }

        return NextResponse.json(result);
    } catch (err: unknown) {
        log.error({ userId, err }, "리뷰 좋아요 토글 실패");
        const message =
            err instanceof Error ? err.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

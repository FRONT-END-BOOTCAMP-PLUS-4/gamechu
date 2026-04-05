import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate, IdSchema } from "@/utils/Validation";
import { UpdateReviewSchema } from "@/backend/review/application/usecase/dto/UpdateReviewDto";
import { errorResponse } from "@/utils/ApiResponse";

import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

import { UpdateReviewUsecase } from "@/backend/review/application/usecase/UpdateReviewUsecase";
import { DeleteReviewUsecase } from "@/backend/review/application/usecase/DeleteReviewUsecase";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";
import logger from "@/lib/Logger";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const userId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/games/[gameId]/reviews/[reviewId]", method: "PATCH" });
    if (!userId) {
        return errorResponse("Unauthorized", 401);
    }

    const { reviewId } = await params;

    const reviewIdValidated = validate(IdSchema, reviewId);
    if (!reviewIdValidated.success) return reviewIdValidated.response;

    const validated = validate(UpdateReviewSchema, await req.json());
    if (!validated.success) return validated.response;

    // 의존성 주입
    const reviewRepo = new PrismaReviewRepository();
    const updateReviewUsecase = new UpdateReviewUsecase(reviewRepo);

    const review = await reviewRepo.findById(reviewIdValidated.data);

    if (!review) {
        return errorResponse("리뷰를 찾을 수 없습니다", 404);
    }

    if (review.memberId !== userId) {
        return errorResponse("수정 권한이 없습니다", 403);
    }

    try {
        const result = await updateReviewUsecase.execute(
            reviewIdValidated.data,
            validated.data
        );
        return NextResponse.json(result);
    } catch (err) {
        log.error({ userId, err }, "리뷰 수정 실패");
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return errorResponse(message, 400);
    }
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const { reviewId } = await params;

    const reviewIdValidated = validate(IdSchema, reviewId);
    if (!reviewIdValidated.success) return reviewIdValidated.response;

    const userId = await getAuthUserId();
    if (!userId) {
        return errorResponse("Unauthorized", 401);
    }

    // 의존성 주입
    const reviewRepo = new PrismaReviewRepository();
    const likeRepo = new PrismaReviewLikeRepository();
    const memberRepo = new PrismaMemberRepository();
    const scoreRecordRepo = new PrismaScoreRecordRepository();
    const scorePolicy = new ScorePolicy();
    const applyReviewScoreUsecase = new ApplyReviewScoreUsecase(
        scorePolicy,
        memberRepo,
        scoreRecordRepo
    );
    const deleteReviewUsecase = new DeleteReviewUsecase(
        reviewRepo,
        likeRepo,
        applyReviewScoreUsecase
    );

    const review = await reviewRepo.findById(reviewIdValidated.data);
    if (!review) {
        return errorResponse("리뷰를 찾을 수 없습니다", 404);
    }

    if (review.memberId !== userId) {
        return errorResponse("삭제 권한이 없습니다", 403);
    }

    await deleteReviewUsecase.execute(reviewIdValidated.data);
    return NextResponse.json({ message: "리뷰 삭제 완료" });
}

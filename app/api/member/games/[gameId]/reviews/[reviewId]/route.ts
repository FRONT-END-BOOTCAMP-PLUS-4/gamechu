import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";

import { UpdateReviewUsecase } from "@/backend/review/application/usecase/UpdateReviewUsecase";
import { DeleteReviewUsecase } from "@/backend/review/application/usecase/DeleteReviewUsecase";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviewRepo = new PrismaReviewRepository();
    const updateReviewUsecase = new UpdateReviewUsecase(reviewRepo);

    const reviewId = parseInt((await params).reviewId);
    const review = await reviewRepo.findById(reviewId);

    if (!review) {
        return NextResponse.json(
            { message: "리뷰를 찾을 수 없습니다" },
            { status: 404 }
        );
    }

    if (review.memberId !== userId) {
        return NextResponse.json(
            { message: "수정 권한이 없습니다" },
            { status: 403 }
        );
    }

    const body = await req.json();
    try {
        const result = await updateReviewUsecase.execute(reviewId, body);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "잘못된 요청입니다.";
        return NextResponse.json({ message }, { status: 400 });
    }
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const { reviewId } = await params;
    const reviewIdNum = parseInt(reviewId, 10);

    if (!reviewIdNum || isNaN(reviewIdNum)) {
        return NextResponse.json(
            { message: "유효하지 않은 리뷰 ID입니다" },
            { status: 400 }
        );
    }

    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    const review = await reviewRepo.findById(reviewIdNum);
    if (!review) {
        return NextResponse.json(
            { message: "리뷰를 찾을 수 없습니다" },
            { status: 404 }
        );
    }

    if (review.memberId !== userId) {
        return NextResponse.json(
            { message: "삭제 권한이 없습니다" },
            { status: 403 }
        );
    }

    await deleteReviewUsecase.execute(reviewIdNum);
    return NextResponse.json({ message: "리뷰 삭제 완료" });
}

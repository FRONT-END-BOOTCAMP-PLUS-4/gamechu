import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate, IdSchema } from "@/utils/validation";
import { UpdateReviewSchema } from "@/backend/review/application/usecase/dto/UpdateReviewDto";

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
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gameId, reviewId } = await params;

    const gameIdResult = IdSchema.safeParse(gameId);
    if (!gameIdResult.success) {
        return NextResponse.json(
            { message: "유효하지 않은 게임 ID입니다." },
            { status: 400 }
        );
    }

    const reviewIdResult = IdSchema.safeParse(reviewId);
    if (!reviewIdResult.success) {
        return NextResponse.json(
            { message: "유효하지 않은 리뷰 ID입니다." },
            { status: 400 }
        );
    }

    const validated = validate(UpdateReviewSchema, await req.json());
    if (!validated.success) return validated.response;

    // 의존성 주입
    const reviewRepo = new PrismaReviewRepository();
    const updateReviewUsecase = new UpdateReviewUsecase(reviewRepo);

    const review = await reviewRepo.findById(reviewIdResult.data);

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

    const result = await updateReviewUsecase.execute(
        reviewIdResult.data,
        validated.data
    );
    return NextResponse.json(result);
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const { gameId, reviewId } = await params;

    const gameIdResult = IdSchema.safeParse(gameId);
    if (!gameIdResult.success) {
        return NextResponse.json(
            { message: "유효하지 않은 게임 ID입니다." },
            { status: 400 }
        );
    }

    const reviewIdResult = IdSchema.safeParse(reviewId);
    if (!reviewIdResult.success) {
        return NextResponse.json(
            { message: "유효하지 않은 리뷰 ID입니다." },
            { status: 400 }
        );
    }

    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const review = await reviewRepo.findById(reviewIdResult.data);
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

    await deleteReviewUsecase.execute(reviewIdResult.data);
    return NextResponse.json({ message: "리뷰 삭제 완료" });
}

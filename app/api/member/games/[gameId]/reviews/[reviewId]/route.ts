// 리뷰 수정, 삭제

import { NextRequest, NextResponse } from "next/server";
import { UpdateReviewUsecase } from "@/backend/review/application/usecase/UpdateReviewUsecase";
import { DeleteReviewUsecase } from "@/backend/review/application/usecase/DeleteReviewUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

const reviewRepo = new PrismaReviewRepository();
const updateReviewUsecase = new UpdateReviewUsecase(reviewRepo);
const deleteReviewUsecase = new DeleteReviewUsecase(reviewRepo);

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
    const result = await updateReviewUsecase.execute(reviewId, body);
    return NextResponse.json(result);
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const { reviewId } = await params;

    if (!reviewId) {
        return NextResponse.json(
            { message: "리뷰 ID가 필요합니다" },
            { status: 400 }
        );
    }

    const reviewIdNum = Number.parseInt(reviewId, 10);

    if (isNaN(reviewIdNum) || reviewIdNum <= 0) {
        return NextResponse.json(
            { message: "유효하지 않은 리뷰 ID입니다" },
            { status: 400 }
        );
    }

    const userId = await getAuthUserId();

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

import { NextRequest, NextResponse } from "next/server";
import { ToggleReviewLikeUsecase } from "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { ApplyReviewScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyReviewScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

// 의존성 생성
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsedReviewId = Number.parseInt((await params).reviewId ?? "", 10);
    if (isNaN(parsedReviewId)) {
        return NextResponse.json(
            { message: "Invalid reviewId" },
            { status: 400 }
        );
    }

    try {
        const result = await usecase.execute({
            reviewId: parsedReviewId,
            memberId: userId,
        });
        return NextResponse.json(result);
    } catch (err) {
        console.error("리뷰 좋아요 처리 실패", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

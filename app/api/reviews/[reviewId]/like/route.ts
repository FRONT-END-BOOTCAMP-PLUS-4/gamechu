import { NextRequest, NextResponse } from "next/server";
import { ToggleReviewLikeUsecase } from "@/backend/review-like/application/usecase/ToggleReviewLikeUsecase";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";

const usecase = new ToggleReviewLikeUsecase(new PrismaReviewLikeRepository());

export async function POST(
    req: NextRequest,
    context: { params: { reviewId: string } }
) {
    const reviewId = parseInt(context.params.reviewId ?? "", 10);
    const { memberId } = await req.json();
    console.log("✅ reviewId:", reviewId); // 디버깅 추가
    console.log("✅ memberId:", memberId);

    if (!memberId || isNaN(reviewId)) {
        return NextResponse.json(
            { message: "Invalid reviewId or memberId" },
            { status: 400 }
        );
    }

    try {
        const liked = await usecase.execute({ reviewId, memberId });
        return NextResponse.json({ liked });
    } catch (err) {
        console.error("리뷰 좋아요 처리 실패", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

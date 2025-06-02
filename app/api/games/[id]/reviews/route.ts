import { type NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

const usecase = new GetReviewsByGameIdUsecase(
    new PrismaReviewRepository(),
    new PrismaReviewLikeRepository()
);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const { id } = await params; // 폴더 이름이 [id]일 경우
    const gameId = id;

    const viewerId = await getAuthUserId();
    const parsedId = Number.parseInt(gameId || "", 10);
    if (isNaN(parsedId)) {
        return NextResponse.json(
            { message: "Invalid gameId" },
            { status: 400 }
        );
    }

    const result = await usecase.execute(parsedId, viewerId || "");
    return NextResponse.json(result);
    console.log("🧪 API viewerId:", viewerId);
}

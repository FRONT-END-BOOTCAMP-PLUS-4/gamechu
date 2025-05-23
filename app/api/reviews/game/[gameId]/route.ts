// app/api/reviews/game/[gameId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";

const usecase = new GetReviewsByGameIdUsecase(
    new PrismaReviewRepository(),
    new PrismaReviewLikeRepository()
);

export async function GET(
    req: NextRequest,
    { params }: { params: Record<string, string> }
) {
    const gameId = params.gameId;
    const viewerId = req.nextUrl.searchParams.get("viewerId") ?? "";

    const parsedId = parseInt(gameId || "", 10);
    if (isNaN(parsedId)) {
        return NextResponse.json(
            { message: "Invalid gameId" },
            { status: 400 }
        );
    }

    const result = await usecase.execute(parsedId, viewerId);
    return NextResponse.json(result);
}

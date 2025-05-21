import { NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

const usecase = new GetReviewsByGameIdUsecase(new PrismaReviewRepository());

export async function GET(
    req: NextRequest,
    context: { params: Record<string, string> }
) {
    const params = await context.params;
    const gameIdParam = params.gameId;

    if (!gameIdParam) {
        return NextResponse.json(
            { message: "Missing gameId" },
            { status: 400 }
        );
    }

    const gameId = parseInt(gameIdParam, 10);
    if (isNaN(gameId)) {
        return NextResponse.json(
            { message: "유효하지 않은 gameId입니다." },
            { status: 400 }
        );
    }
    const result = await usecase.execute(gameId);

    return NextResponse.json(result);
}

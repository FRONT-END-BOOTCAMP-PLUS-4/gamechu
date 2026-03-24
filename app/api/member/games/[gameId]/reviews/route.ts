// 리뷰 작성

import { NextRequest, NextResponse } from "next/server";
import { CreateReviewUsecase } from "@/backend/review/application/usecase/CreateReviewUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate, IdSchema } from "@/utils/validation";
import { CreateReviewSchema } from "@/backend/review/application/usecase/dto/CreateReviewDto";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    const memberId = await getAuthUserId();

    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await params;
    const gameIdValidated = validate(IdSchema, gameId);
    if (!gameIdValidated.success) return gameIdValidated.response;

    const validated = validate(CreateReviewSchema, await req.json());
    if (!validated.success) return validated.response;

    const repository = new PrismaReviewRepository();
    const usecase = new CreateReviewUsecase(repository);

    try {
        const result = await usecase.execute(memberId, {
            gameId: gameIdValidated.data,
            ...validated.data,
        });
        return NextResponse.json(result);
    } catch (err) {
        console.error("리뷰 작성 실패", err);
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Internal Server Error" },
            { status: 400 }
        );
    }
}

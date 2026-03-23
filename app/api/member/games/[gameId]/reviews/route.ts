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
    const gameIdResult = IdSchema.safeParse(gameId);
    if (!gameIdResult.success) {
        return NextResponse.json(
            { message: "유효하지 않은 게임 ID입니다." },
            { status: 400 }
        );
    }

    const validated = validate(CreateReviewSchema, await req.json());
    if (!validated.success) return validated.response;

    const repository = new PrismaReviewRepository();
    const usecase = new CreateReviewUsecase(repository);

    const result = await usecase.execute(memberId, {
        gameId: gameIdResult.data,
        ...validated.data,
    });
    return NextResponse.json(result);
}

// 리뷰 작성

import { NextRequest, NextResponse } from "next/server";
import { CreateReviewUsecase } from "@/backend/review/application/usecase/CreateReviewUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

const repository = new PrismaReviewRepository();
const usecase = new CreateReviewUsecase(repository);

export async function POST(req: NextRequest) {
    const memberId = await getAuthUserId();

    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const result = await usecase.execute(memberId, body);
    return NextResponse.json(result);
}

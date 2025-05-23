// 로그인 유저의 리뷰 조회(app/api/reviews/member/[memberId]/route.ts)

import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

const usecase = new GetReviewsByMemberIdUsecase(new PrismaReviewRepository());

export async function GET() {
    const memberId = await getAuthUserId();
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await usecase.execute(memberId);
    return NextResponse.json(result);
}

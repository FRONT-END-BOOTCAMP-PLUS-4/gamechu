//비 로그인 유저의 리뷰 조회(app\api\reviews\member\[memberId]\route.ts)
import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

const usecase = new GetReviewsByMemberIdUsecase(new PrismaReviewRepository());

export async function GET(
    request: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const { memberId } = await params;

    if (!memberId) {
        return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const result = await usecase.execute(memberId);
    return NextResponse.json(result);
}

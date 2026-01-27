//닉네임으로 멤버 정보 가져오기(app\api\member\profile\[nickname]\route.ts)
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileByNicknameUsecase } from "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase";

const getUsecase = new GetMemberProfileByNicknameUsecase(
    new PrismaMemberRepository()
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    const { nickname } = await params;
    const profile = await getUsecase.execute(nickname);

    if (!profile)
        return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(profile);
}

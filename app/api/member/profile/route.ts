import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileUsecase } from "@/backend/member/application/usecase/GetMemberProfileUsecase"

const usecase = new GetMemberProfileUsecase(new PrismaMemberRepository());

export async function GET() {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    if (!memberId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const profile = await usecase.execute(memberId);
    if (!profile) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(profile);
}

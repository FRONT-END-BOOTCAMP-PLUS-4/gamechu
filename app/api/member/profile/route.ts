import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileUsecase } from "@/backend/member/application/usecase/GetMemberProfileUsecase";
import { UpdateMemberProfileUseCase } from "@/backend/member/application/usecase/UpdateMemberProfileUseCase";
import { UpdateProfileRequestDto } from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";

const getUsecase = new GetMemberProfileUsecase(new PrismaMemberRepository());
const updateUsecase = new UpdateMemberProfileUseCase(
    new PrismaMemberRepository()
);

export async function GET() {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const profile = await getUsecase.execute(memberId);
    if (!profile)
        return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(profile);
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const memberId = session?.user?.id;
        if (!memberId)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        const body = await req.json();

        const dto = new UpdateProfileRequestDto({
            memberId,
            nickname: body.nickname,
            isMale: body.isMale,
            birthDate: body.birthDate, // yyyymmdd
            imageUrl: body.imageUrl,
        });

        await updateUsecase.execute(dto);

        return NextResponse.json({
            message: "프로필이 성공적으로 수정되었습니다.",
        });
    } catch (err) {
        console.error("[PROFILE_UPDATE_ERROR]", err);
        return NextResponse.json(
            { message: (err as Error).message || "프로필 수정 실패" },
            { status: 400 }
        );
    }
}

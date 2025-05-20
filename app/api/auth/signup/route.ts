import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { SignUpUsecase } from "@/backend/member/application/usecase/SignUpUsecase";
import { SignUpRequestDto } from "@/backend/member/application/usecase/dto/SignUpRequestDto";

export async function POST(req: NextRequest) {
    try {
        const { nickname, email, password, birthDate, gender } =
            await req.json();

        const dto = new SignUpRequestDto(
            nickname,
            email,
            password,
            birthDate,
            gender
        );
        const repo = new PrismaMemberRepository();
        const usecase = new SignUpUsecase(repo);

        const user = await usecase.execute(dto);

        return NextResponse.json(
            { message: "회원가입 성공", memberId: user.id, email: user.email },
            { status: 201 }
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

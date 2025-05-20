import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { EmailCheckUsecase } from "@/backend/member/application/usecase/EmailCheckUsecase";
import { EmailCheckResponseDto } from "@/backend/member/application/usecase/dto/EmailCheckResponseDto";

export async function GET(
    req: NextRequest
): Promise<NextResponse<EmailCheckResponseDto | { error: string }>> {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json(
            { error: "이메일이 누락되었습니다." },
            { status: 400 }
        );
    }

    const repo = new PrismaMemberRepository();
    const usecase = new EmailCheckUsecase(repo);

    try {
        const result: EmailCheckResponseDto = await usecase.execute(email);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

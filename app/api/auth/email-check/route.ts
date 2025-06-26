// /app/api/auth/email-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { EmailCheckUsecase } from "@/backend/member/application/usecase/EmailCheckUsecase";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json(
            { message: "이메일이 누락되었습니다." },
            { status: 400 }
        );
    }

    const repo = new PrismaMemberRepository();
    const usecase = new EmailCheckUsecase(repo);

    try {
        const result = await usecase.execute(email);

        if (result.isDuplicate) {
            return NextResponse.json(
                { message: "이미 존재하는 이메일입니다." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "사용 가능한 이메일입니다." },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { NicknameCheckUsecase } from "@/backend/member/application/usecase/NicknameCheckUsecase";
import {
    RateLimiter,
    getClientIp,
    rateLimitResponse,
} from "@/lib/RateLimiter";

const nicknameCheckLimiter = new RateLimiter(
    "member-nickname-check",
    60_000,
    10
);

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rateLimit = await nicknameCheckLimiter.check(ip);
    if (!rateLimit.allowed) {
        return rateLimitResponse(rateLimit.retryAfterMs);
    }

    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get("nickname");

    if (!nickname) {
        return NextResponse.json(
            { message: "닉네임이 누락되었습니다." },
            { status: 400 }
        );
    }

    if (nickname.length > 8) {
        return NextResponse.json(
            { message: "닉네임은 8자 이하여야 합니다." },
            { status: 400 }
        );
    }

    const repo = new PrismaMemberRepository();
    const usecase = new NicknameCheckUsecase(repo);

    try {
        const result = await usecase.execute(nickname);

        if (result.isDuplicate) {
            // 자신의 현재 닉네임이면 사용 가능 처리
            const member = await repo.findByNickname(nickname);
            if (member?.id === memberId) {
                return NextResponse.json(
                    { message: "사용 가능한 닉네임입니다." },
                    { status: 200 }
                );
            }
            return NextResponse.json(
                { message: "이미 사용 중인 닉네임입니다." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "사용 가능한 닉네임입니다." },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}

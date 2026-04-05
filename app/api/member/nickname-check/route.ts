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
import { validate } from "@/utils/Validation";
import { z } from "zod";
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

const nicknameCheckLimiter = new RateLimiter(
    "member-nickname-check",
    60_000,
    10
);
const NicknameQuerySchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임이 누락되었습니다.")
        .max(8, "닉네임은 8자 이하여야 합니다."),
});

export async function GET(req: NextRequest) {
    const log = logger.child({ route: "/api/member/nickname-check", method: "GET" });
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    if (!memberId) {
        return errorResponse("Unauthorized", 401);
    }

    const ip = getClientIp(req);
    const rateLimit = await nicknameCheckLimiter.check(ip);
    if (!rateLimit.allowed) {
        return rateLimitResponse(rateLimit.retryAfterMs);
    }

    const { searchParams } = new URL(req.url);
    const validated = validate(NicknameQuerySchema, Object.fromEntries(searchParams));
    if (!validated.success) return validated.response;

    const repo = new PrismaMemberRepository();
    const usecase = new NicknameCheckUsecase(repo);

    try {
        const result = await usecase.execute(validated.data.nickname);

        if (result.isDuplicate) {
            if (result.foundMemberId === memberId) {
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
        log.error({ err }, "닉네임 중복 확인 실패");
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return errorResponse(message, 500);
    }
}

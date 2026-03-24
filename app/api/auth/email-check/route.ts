import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { EmailCheckUsecase } from "@/backend/member/application/usecase/EmailCheckUsecase";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";
import { z } from "zod";

const emailCheckLimiter = new RateLimiter("email-check", 60_000, 10);
// 단일 쿼리 파라미터 전용 스키마 — 별도 DTO 파일 불필요 (intentional inline exception)
const EmailQuerySchema = z.object({ email: z.string().email("올바른 이메일 형식이 아닙니다.") });

export async function GET(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = await emailCheckLimiter.check(ip);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const { searchParams } = new URL(req.url);
    const validated = validate(EmailQuerySchema, Object.fromEntries(searchParams));
    if (!validated.success) return validated.response;

    const repo = new PrismaMemberRepository();
    const usecase = new EmailCheckUsecase(repo);

    try {
        const result = await usecase.execute(validated.data.email);
        if (result.isDuplicate) {
            return NextResponse.json({ message: "이미 존재하는 이메일입니다." }, { status: 409 });
        }
        return NextResponse.json({ message: "사용 가능한 이메일입니다." }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}

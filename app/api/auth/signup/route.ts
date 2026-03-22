import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { SignUpUsecase } from "@/backend/member/application/usecase/SignUpUsecase";
import { SignUpRequestDto, SignUpSchema } from "@/backend/member/application/usecase/dto/SignUpRequestDto";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";

const signupLimiter = new RateLimiter("signup", 3_600_000, 5);

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = await signupLimiter.check(ip);
    if (!rateLimit.allowed) {
        return rateLimitResponse(rateLimit.retryAfterMs, "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
    }

    const validated = validate(SignUpSchema, await req.json());
    if (!validated.success) return validated.response;

    try {
        const { nickname, email, password, birthDate, gender } = validated.data;
        const dto = new SignUpRequestDto(nickname, email, password, birthDate, gender);
        const repo = new PrismaMemberRepository();
        const usecase = new SignUpUsecase(repo);
        const user = await usecase.execute(dto);
        return NextResponse.json(
            { message: "회원가입 성공", memberId: user.id, email: user.email },
            { status: 201 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ message }, { status: 400 });
    }
}

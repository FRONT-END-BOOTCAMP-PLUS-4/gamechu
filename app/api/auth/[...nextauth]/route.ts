// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import {
    RateLimiter,
    getClientIp,
    rateLimitResponse,
} from "@/lib/RateLimiter";

const handler = NextAuth(authOptions);
const loginLimiter = new RateLimiter("login", 60_000, 10);

async function rateLimitedPost(
    req: NextRequest,
    context: { params: Promise<{ nextauth: string[] }> }
) {
    const ip = getClientIp(req);
    const result = await loginLimiter.check(ip);
    if (!result.allowed) {
        return rateLimitResponse(
            result.retryAfterMs,
            "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
    }
    return handler(req, context);
}

export { handler as GET, rateLimitedPost as POST };

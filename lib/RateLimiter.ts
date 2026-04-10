import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/Redis";
import logger from "@/lib/Logger";

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
};

export class RateLimiter {
    constructor(
        private prefix: string,
        private windowMs: number,
        private maxRequests: number
    ) {}

    async check(key: string): Promise<RateLimitResult> {
        try {
            const redisKey = `ratelimit:${this.prefix}:${key}`;
            const now = Date.now();
            const windowStart = now - this.windowMs;

            const pipeline = redis.pipeline();
            pipeline.zremrangebyscore(redisKey, 0, windowStart);
            pipeline.zcard(redisKey);
            pipeline.pexpire(redisKey, this.windowMs);

            const results = await pipeline.exec();
            const currentCount = (results?.[1]?.[1] as number) ?? 0;

            if (currentCount >= this.maxRequests) {
                const oldestEntries = await redis.zrange(
                    redisKey,
                    0,
                    0,
                    "WITHSCORES"
                );
                const oldestTimestamp =
                    oldestEntries.length >= 2 ? Number(oldestEntries[1]) : now;
                const retryAfterMs = Math.max(
                    oldestTimestamp + this.windowMs - now,
                    0
                );
                logger.warn({ prefix: this.prefix, key }, "레이트 리밋 초과");
                return { allowed: false, remaining: 0, retryAfterMs };
            }

            // 허용된 경우에만 요청 기록 (초과 시 ZADD 생략 → 무한 lockout 방지)
            await redis.zadd(redisKey, now, `${now}-${crypto.randomUUID()}`);
            await redis.pexpire(redisKey, this.windowMs);

            return {
                allowed: true,
                remaining: this.maxRequests - currentCount - 1,
                retryAfterMs: 0,
            };
        } catch (error) {
            logger.warn({ prefix: this.prefix, err: error }, "레이트 리미터 Redis 오류 — 요청 허용");
            return {
                allowed: true,
                remaining: this.maxRequests,
                retryAfterMs: 0,
            };
        }
    }
}

export function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        const ips = forwarded.split(",").map((ip) => ip.trim());
        return ips[ips.length - 1]; // last entry is set by trusted proxy, not the client
    }
    return req.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitResponse(
    retryAfterMs: number,
    message?: string,
    limit?: number
): NextResponse {
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return NextResponse.json(
        {
            message:
                message ?? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        },
        {
            status: 429,
            headers: {
                "Retry-After": String(retryAfterSec),
                ...(limit != null && {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(
                        Math.ceil((Date.now() + retryAfterMs) / 1000)
                    ),
                }),
            },
        }
    );
}

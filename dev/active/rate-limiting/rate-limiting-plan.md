# Rate Limiting on Auth Routes

> Last Updated: 2026-03-13

## Executive Summary

인증 라우트(로그인, 회원가입, 이메일 중복 확인)에 Redis 기반 sliding-window rate limiter를 구현한다. Brute force 공격, 대량 계정 생성, 이메일 열거 공격을 방지하는 것이 목적이다. 외부 패키지 없이 기존 ioredis + sorted set으로 구현하며, 단일 이슈/브랜치로 진행한다.

---

## Current State Analysis

### 대상 라우트 (3개)

| Route                     | Method | 현재 상태          | 위험           |
| ------------------------- | ------ | ------------------ | -------------- |
| `/api/auth/[...nextauth]` | POST   | 로그인 시도 무제한 | Brute force    |
| `/api/auth/signup`        | POST   | Rate limit 없음    | 대량 계정 생성 |
| `/api/auth/email-check`   | GET    | 조회 무제한        | 이메일 열거    |

### 기존 인프라

- **Redis**: `ioredis@5.8.2` 싱글턴 (`lib/redis.ts`), arena 캐시에 이미 사용 중
- **Cache key 패턴**: `lib/cacheKey.ts`에 `games:`, `arena:` prefix 패턴 확립
- **Cache service 패턴**: `ArenaCacheService.ts` — graceful degradation (에러 시 null 반환)
- **Middleware**: `middleware.ts` — 페이지 경로만 매칭 (`/profile`, `/log-in`, `/sign-up`), API 보호 없음

### 제약 사항

- NextAuth의 `authorize()` 함수는 NextAuth 내부에서 호출됨 → route-level 래핑 필요
- `[...nextauth]/route.ts`는 `handler as GET, handler as POST`로 export → POST만 rate limit
- 서버: Raspberry Pi 5 (ARM64) — 가벼운 구현 필수
- Next.js middleware는 Edge Runtime → ioredis 사용 불가 → route-level 적용

---

## Proposed Future State

### Architecture

```
lib/
  RateLimiter.ts          # Redis sorted set sliding-window rate limiter + helpers

app/api/auth/
  [...nextauth]/route.ts  # POST에 rate limit 적용
  signup/route.ts         # POST에 rate limit 적용
  email-check/route.ts    # GET에 rate limit 적용
```

### Rate Limit 정책

| Route           | Window | Max Requests | Key Pattern                  |
| --------------- | ------ | ------------ | ---------------------------- |
| Login POST      | 1분    | 10회         | `ratelimit:login:{ip}`       |
| Signup POST     | 1시간  | 5회          | `ratelimit:signup:{ip}`      |
| Email Check GET | 1분    | 10회         | `ratelimit:email-check:{ip}` |

### 응답 형식

Rate limit 초과 시:

```json
{ "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }
```

- HTTP Status: `429 Too Many Requests`
- Headers: `Retry-After: <seconds>`

---

## Implementation Details

### 1. RateLimiter 클래스 (`lib/RateLimiter.ts`)

Redis sorted set 기반 sliding window. 단일 파일에 클래스 + IP 추출 + 429 응답 헬퍼를 모두 포함한다.

```typescript
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

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
            pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
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
                return { allowed: false, remaining: 0, retryAfterMs };
            }

            return {
                allowed: true,
                remaining: this.maxRequests - currentCount - 1,
                retryAfterMs: 0,
            };
        } catch (error) {
            console.error(
                `[RateLimiter] Redis error for ${this.prefix}:`,
                error
            );
            return {
                allowed: true,
                remaining: this.maxRequests,
                retryAfterMs: 0,
            };
        }
    }
}

export function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

export function rateLimitResponse(
    retryAfterMs: number,
    message?: string
): NextResponse {
    return NextResponse.json(
        {
            message:
                message ?? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        },
        {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
    );
}
```

**설계 결정 사항:**

- **왜 sorted set인가**: Fixed window는 경계에서 burst 허용. Sliding window는 어느 시점에서든 정확한 제한 보장.
- **왜 `Math.random()` suffix인가**: 동일 밀리초에 여러 요청이 들어올 때 sorted set member 충돌 방지.
- **Graceful degradation**: Redis 에러 시 `allowed: true` 반환 — availability > security.
- **초과 시 zadd**: Pipeline atomic 실행으로 조건부 삽입은 복잡도만 증가. TTL로 자연 만료됨.

### 2. 각 라우트 적용 방식

#### Login (`[...nextauth]/route.ts`)

NextAuth handler를 래핑. GET은 그대로, POST만 rate limit 적용:

```typescript
import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";

const handler = NextAuth(authOptions);
const loginLimiter = new RateLimiter("login", 60_000, 10);

async function rateLimitedPost(req: NextRequest) {
    const ip = getClientIp(req);
    const result = await loginLimiter.check(ip);
    if (!result.allowed) {
        return rateLimitResponse(
            result.retryAfterMs,
            "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
    }
    return handler(req, { params: Promise.resolve({}) });
}

export { handler as GET, rateLimitedPost as POST };
```

#### Signup (`signup/route.ts`)

기존 `POST` 함수 상단에 rate limit 체크 추가:

```typescript
const signupLimiter = new RateLimiter("signup", 3_600_000, 5);

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const result = await signupLimiter.check(ip);
    if (!result.allowed) {
        return rateLimitResponse(
            result.retryAfterMs,
            "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
    }
    // ... 기존 로직
}
```

#### Email Check (`email-check/route.ts`)

기존 `GET` 함수 상단에 rate limit 체크 추가:

```typescript
const emailCheckLimiter = new RateLimiter("email-check", 60_000, 10);

export async function GET(req: NextRequest) {
    const ip = getClientIp(req);
    const result = await emailCheckLimiter.check(ip);
    if (!result.allowed) {
        return rateLimitResponse(result.retryAfterMs);
    }
    // ... 기존 로직
}
```

---

## Risk Assessment

### Convention Drift Check

| Area                       | Status          | Notes                                                                                                                                        |
| -------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| File naming                | ✅ Pass         | `RateLimiter.ts` — PascalCase, 컨벤션 준수                                                                                                   |
| Variable naming            | ✅ Pass         | camelCase throughout                                                                                                                         |
| Error response             | ⚠️ Medium drift | `signup/route.ts:30`이 `{ error: message }`로 응답하나 컨벤션은 `{ message }`. 기존 코드의 문제이며 이번 태스크에서 수정하지 않음 (scope 외) |
| Module-level instantiation | ✅ Pass         | `RateLimiter` 인스턴스는 stateless 설정 객체 — module-level 생성 허용                                                                        |
| Git workflow               | ✅ Pass         | 단일 issue + branch, CODE_CONVENTIONS.md 준수                                                                                                |

### Risks

| Risk                                            | Severity | Mitigation                                                                              |
| ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| Nginx `x-forwarded-for` 미설정                  | High     | 현재 Nginx conf에 `proxy_set_header X-Forwarded-For` 없음 — 프로덕션 배포 전 추가 필요 |
| Redis 다운 시 rate limit 우회                    | Medium   | Graceful degradation — 에러 시 요청 허용 (availability 우선)                            |
| IP 스푸핑                                        | Low      | Nginx가 `X-Forwarded-For`를 덮어쓰도록 설정하면 해결                                    |
| Shared IP (NAT) false positive                   | Low      | 10회/분은 일반 사용에 충분한 여유                                                       |
| `NextAuth handler` 호출 시 context 매개변수      | Medium   | `handler(req, { params: Promise.resolve({}) })` — Next.js 15 App Router 시그니처 확인 필요 |

### Nginx 설정 추가 필요 (프로덕션 배포 전)

현재 `/etc/nginx/sites-available/gamechu.com` location 블록에 아래 헤더가 누락되어 있음:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
```

이 설정 없이는 `getClientIp()`가 항상 `"unknown"`을 반환하여 모든 사용자가 하나의 rate limit 버킷을 공유하게 됨. Rate limit 코드 배포와 함께 Nginx 설정도 업데이트해야 함.

---

## Success Metrics

- Rate limit 초과 시 429 응답 + `Retry-After` 헤더 반환
- Rate limit 미초과 시 기존 동작 유지 (기능 회귀 없음)
- Redis 다운 시에도 정상 요청 처리 (graceful degradation)
- 기존 로그인/회원가입/이메일 체크 기능에 영향 없음

## Dependencies

- Redis 서버 가동 중 (이미 arena 캐시에 사용 중이므로 보장됨)
- 외부 패키지 추가 없음 (ioredis 기존 사용)
- Nginx `X-Forwarded-For` / `X-Real-IP` 헤더 설정 추가 (프로덕션 배포 전)

## Timeline Estimate

| Phase                     | Effort |
| ------------------------- | ------ |
| RateLimiter 클래스 + 헬퍼 | S      |
| 3개 라우트 적용           | S      |
| 수동 테스트 (curl)        | S      |
| **Total**                 | **S**  |

---

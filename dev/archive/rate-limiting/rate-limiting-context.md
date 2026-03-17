# Rate Limiting — Context

> Last Updated: 2026-03-13

## Key Files

### 수정 대상

| File                                  | 변경 내용                                          |
| ------------------------------------- | -------------------------------------------------- |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth POST 핸들러를 rate-limited wrapper로 교체 |
| `app/api/auth/signup/route.ts`        | POST 함수 상단에 rate limit 체크 추가              |
| `app/api/auth/email-check/route.ts`   | GET 함수 상단에 rate limit 체크 추가               |

### 신규 생성

| File                 | 역할                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| `lib/RateLimiter.ts` | Redis sorted set sliding-window rate limiter + `getClientIp()` + `rateLimitResponse()` |

### 참조 (읽기 전용)

| File                                             | 참조 이유                                                 |
| ------------------------------------------------ | --------------------------------------------------------- |
| `lib/redis.ts`                                   | Redis 싱글턴 import                                       |
| `lib/cacheKey.ts`                                | 기존 키 패턴 참조 (rate limit은 `ratelimit:` prefix 사용) |
| `backend/arena/infra/cache/ArenaCacheService.ts` | Graceful degradation 패턴 참조                            |
| `lib/auth/authOptions.ts`                        | NextAuth 설정 — authorize 함수 동작 이해                  |
| `middleware.ts`                                  | 현재 middleware는 페이지 경로만 매칭 — API 보호 없음 확인 |

## Key Decisions

### D1: Route-level 적용 (Middleware 아님)

- Next.js middleware는 Edge Runtime → ioredis 사용 불가
- 대상이 3개 라우트뿐이므로 직접 적용이 간단
- NextAuth handler 래핑은 route-level에서만 가능

### D2: 자체 구현 (외부 패키지 아님)

- `rate-limiter-flexible` 등은 Express 중심 설계
- Redis sorted set 패턴은 ~60줄로 구현 가능
- Raspberry Pi 5 환경에서 외부 의존성 최소화

### D3: IP 추출 — `x-forwarded-for` → `x-real-ip` → `"unknown"`

- 프로덕션은 Nginx reverse proxy 뒤에서 동작
- "unknown" fallback: 모든 unknown IP가 하나의 버킷 → 최악의 경우에도 가용
- **주의**: 현재 Nginx conf에 `X-Forwarded-For` / `X-Real-IP` 헤더 미설정 — 배포 전 추가 필수

### D4: 초과 시 zadd 생략 (변경됨)

- 초과된 클라이언트가 반복 요청하면 ZADD가 window의 oldest entry를 밀어내어 lockout이 무한 연장됨
- Pipeline에서 ZADD를 분리하여, 허용된 경우에만 별도 실행
- 약간의 atomicity 손실이 있으나, rate limiter 용도에서는 무시 가능

### D5: Sorted set member에 crypto.randomUUID() suffix (변경됨)

- 동일 밀리초 내 복수 요청 시 member 충돌 방지
- `${now}-${crypto.randomUUID()}` 형태로 유니크 보장
- `Math.random()`은 IEEE 754 double 범위 내에서 충돌 가능성 있음 — `crypto.randomUUID()`가 더 안전

### D6: Rate limit 초과 로깅

- `console.warn`으로 IP와 route prefix를 기록
- 보안 모니터링에 활용 — 실제 brute-force 시도 감지 가능

### D7: NextAuth POST handler의 scope

- `[...nextauth]` catch-all은 login 외에도 signout, `_log` 등 여러 POST action을 처리
- 모든 POST에 동일 rate limit 적용 — signout은 고빈도가 아니므로 문제 없음
- 필요 시 `(await context.params).nextauth[0]`으로 action별 분기 가능

## Dependencies

- 외부 패키지 추가 없음
- Redis 서버 가동 필수 (이미 arena 캐시에서 사용 중)
- **[Blocker]** Nginx `X-Forwarded-For` / `X-Real-IP` 헤더 설정 — 프로덕션 배포 전 반드시 완료 (Task 0)

## Open Questions (구현 전 확인 권장)

- **프론트엔드 429 처리**: NextAuth `signIn()` 함수가 비표준 429 응답을 받을 때 어떻게 동작하는지 확인 필요. 회원가입/이메일 체크 폼에서도 429 에러 메시지가 사용자에게 표시되는지 검증.
- **Signup 5회/시간 제한**: 이메일 중복, 비밀번호 불일치 등으로 재시도 시 5회가 부족할 수 있음. 10회/시간도 고려 가능.

## Current Route Code Summary

### `[...nextauth]/route.ts` (6줄)

- `NextAuth(authOptions)` → `handler as GET, handler as POST` export
- 변경: POST를 `rateLimitedPost(req, context)` 래퍼로 교체
- **주의**: `rateLimitedPost`는 반드시 `context: { params: Promise<{ nextauth: string[] }> }`를 받아서 handler에 전달해야 함

### `signup/route.ts` (32줄)

- `POST`: body 파싱 → `SignUpRequestDto` → `SignUpUsecase.execute()` → 201 응답
- 에러: `{ error: message }` (컨벤션 drift — `{ message }` 여야 하나 scope 외)
- 변경: 함수 상단에 rate limit 체크 3줄 추가

### `email-check/route.ts` (38줄)

- `GET`: query param `email` → `EmailCheckUsecase.execute()` → 200/409 응답
- 변경: 함수 상단에 rate limit 체크 3줄 추가

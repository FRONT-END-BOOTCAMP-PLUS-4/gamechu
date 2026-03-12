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

### D4: 초과 시에도 zadd 실행

- Atomic pipeline에서 조건부 실행은 복잡도만 증가
- TTL이 window size와 동일하므로 자연 만료
- 미세한 over-counting은 보안 관점에서 무해

### D5: Sorted set member에 Math.random() suffix

- 동일 밀리초 내 복수 요청 시 member 충돌 방지
- `${now}-${Math.random()}` 형태로 유니크 보장

## Dependencies

- 외부 패키지 추가 없음
- Redis 서버 가동 필수 (이미 arena 캐시에서 사용 중)
- Nginx `X-Forwarded-For` / `X-Real-IP` 헤더 설정 확인 필요 (프로덕션 배포 전)

## Current Route Code Summary

### `[...nextauth]/route.ts` (6줄)

- `NextAuth(authOptions)` → `handler as GET, handler as POST` export
- 변경: POST를 `rateLimitedPost` 래퍼로 교체

### `signup/route.ts` (32줄)

- `POST`: body 파싱 → `SignUpRequestDto` → `SignUpUsecase.execute()` → 201 응답
- 에러: `{ error: message }` (컨벤션 drift — `{ message }` 여야 하나 scope 외)
- 변경: 함수 상단에 rate limit 체크 3줄 추가

### `email-check/route.ts` (38줄)

- `GET`: query param `email` → `EmailCheckUsecase.execute()` → 200/409 응답
- 변경: 함수 상단에 rate limit 체크 3줄 추가

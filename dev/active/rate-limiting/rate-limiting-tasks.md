# Rate Limiting — Tasks

> Last Updated: 2026-03-13

## Task 1: RateLimiter 클래스 구현 [S]

**File**: `lib/RateLimiter.ts` (신규 생성)

- [ ] `RateLimiter` 클래스 생성
    - constructor: `prefix`, `windowMs`, `maxRequests`
    - `check(key)` 메서드: Redis sorted set sliding window
        - Pipeline: `ZREMRANGEBYSCORE` → `ZCARD` → `ZADD` → `PEXPIRE`
        - Member key: `${now}-${Math.random()}` (밀리초 충돌 방지)
        - 반환: `{ allowed, remaining, retryAfterMs }`
    - try-catch로 graceful degradation (Redis 에러 시 `allowed: true`)
- [ ] `getClientIp(req: NextRequest)` export 함수
    - `x-forwarded-for` → `x-real-ip` → `"unknown"` fallback
- [ ] `rateLimitResponse(retryAfterMs, message?)` export 함수
    - 429 status + `Retry-After` 헤더 + JSON body

**Acceptance criteria**: RateLimiter가 Redis sorted set에 요청을 기록하고, window 내 요청 수를 정확히 추적. Redis 에러 시 요청 허용.

---

## Task 2: Login rate limit 적용 [S]

**File**: `app/api/auth/[...nextauth]/route.ts`

- [ ] `loginLimiter` 인스턴스 생성 (`"login"`, 60_000, 10)
- [ ] `rateLimitedPost(req)` 래퍼 함수 작성
    - IP 추출 → `loginLimiter.check(ip)` → 초과 시 429 반환 → 정상 시 `handler` 호출
- [ ] export 변경: `handler as GET, rateLimitedPost as POST`

**Acceptance criteria**: 1분 내 11번째 로그인 시도부터 429 반환. GET (OAuth callback 등)은 영향 없음.

---

## Task 3: Signup rate limit 적용 [S]

**File**: `app/api/auth/signup/route.ts`

- [ ] `signupLimiter` 인스턴스 생성 (`"signup"`, 3_600_000, 5)
- [ ] `POST` 함수 상단에 rate limit 체크 추가 (3줄)
- [ ] 초과 시 메시지: "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."

**Acceptance criteria**: 1시간 내 6번째 가입 시도부터 429 반환. 기존 가입 로직 영향 없음.

---

## Task 4: Email check rate limit 적용 [S]

**File**: `app/api/auth/email-check/route.ts`

- [ ] `emailCheckLimiter` 인스턴스 생성 (`"email-check"`, 60_000, 10)
- [ ] `GET` 함수 상단에 rate limit 체크 추가 (3줄)

**Acceptance criteria**: 1분 내 11번째 이메일 체크부터 429 반환. 기존 이메일 체크 영향 없음.

---

## Task 5: 수동 테스트 [S]

- [ ] `docker start gamechu-redis` 로 Redis 실행 확인
- [ ] `npm run dev` 서버 시작
- [ ] curl로 로그인 rate limit 테스트 (rapid 11회 요청 → 11번째에 429)
- [ ] curl로 회원가입 rate limit 테스트 (rapid 6회 요청 → 6번째에 429)
- [ ] curl로 이메일 체크 rate limit 테스트 (rapid 11회 요청 → 11번째에 429)
- [ ] Rate limit 미초과 시 정상 응답 확인
- [ ] `Retry-After` 헤더 값 확인
- [ ] Redis 키 확인: `docker exec gamechu-redis redis-cli KEYS "ratelimit:*"`
- [ ] Redis 중지 후 요청 → graceful degradation 확인 (요청 허용)

# Rate Limiting — Tasks

> Last Updated: 2026-03-13

## Task 0: Nginx X-Forwarded-For 설정 확인 [S] (Blocker)

**File**: `/etc/nginx/sites-available/gamechu.com` (프로덕션 서버)

- [x] location 블록에 아래 헤더 추가 확인:
      `nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
`
- 미설정 시 `getClientIp()`가 항상 `"unknown"` 반환 → 모든 사용자가 하나의 버킷 공유

**Note**: 코드 구현과 병행 가능하나, 프로덕션 배포 전 반드시 완료해야 함.

---

## Task 1: RateLimiter 클래스 구현 [S]

**File**: `lib/RateLimiter.ts` (신규 생성)

- [x] `RateLimiter` 클래스 생성
    - constructor: `prefix`, `windowMs`, `maxRequests`
    - `check(key)` 메서드: Redis sorted set sliding window
        - Pipeline: `ZREMRANGEBYSCORE` → `ZCARD` → `PEXPIRE`
        - 허용 시에만 별도 `ZADD` 실행 (초과 시 ZADD 생략 → 무한 lockout 방지)
        - Member key: `${now}-${crypto.randomUUID()}` (밀리초 충돌 방지, `Math.random()`보다 안전)
        - 반환: `{ allowed, remaining, retryAfterMs }`
        - 초과 시 `console.warn`으로 IP + prefix 로깅 (보안 모니터링)
    - try-catch로 graceful degradation (Redis 에러 시 `allowed: true`)
- [x] `getClientIp(req: NextRequest)` export 함수
    - `x-forwarded-for` → `x-real-ip` → `"unknown"` fallback
- [x] `rateLimitResponse(retryAfterMs, message?, limit?)` export 함수
    - 429 status + `Retry-After` + `X-RateLimit-Limit/Remaining/Reset` 헤더 + JSON body

**Acceptance criteria**: RateLimiter가 Redis sorted set에 요청을 기록하고, window 내 요청 수를 정확히 추적. Redis 에러 시 요청 허용.

---

## Task 2: Login rate limit 적용 [S]

**File**: `app/api/auth/[...nextauth]/route.ts`

- [x] `loginLimiter` 인스턴스 생성 (`"login"`, 60_000, 10)
- [x] `rateLimitedPost(req, context)` 래퍼 함수 작성
    - **반드시 `context: { params: Promise<{ nextauth: string[] }> }`를 받아서 `handler`에 전달**
    - IP 추출 → `loginLimiter.check(ip)` → 초과 시 429 반환 → 정상 시 `handler(req, context)` 호출
    - ⚠️ `handler(req, { params: Promise.resolve({}) })`는 NextAuth action/provider를 파괴함
- [x] export 변경: `handler as GET, rateLimitedPost as POST`

**Acceptance criteria**: 1분 내 11번째 로그인 시도부터 429 반환. GET (OAuth callback 등)은 영향 없음.

---

## Task 3: Signup rate limit 적용 [S]

**File**: `app/api/auth/signup/route.ts`

- [x] `signupLimiter` 인스턴스 생성 (`"signup"`, 3_600_000, 5)
- [x] `POST` 함수 상단에 rate limit 체크 추가 (3줄)
- [x] 초과 시 메시지: "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."

**Acceptance criteria**: 1시간 내 6번째 가입 시도부터 429 반환. 기존 가입 로직 영향 없음.

---

## Task 4: Email check rate limit 적용 [S]

**File**: `app/api/auth/email-check/route.ts`

- [x] `emailCheckLimiter` 인스턴스 생성 (`"email-check"`, 60_000, 10)
- [x] `GET` 함수 상단에 rate limit 체크 추가 (3줄)

**Acceptance criteria**: 1분 내 11번째 이메일 체크부터 429 반환. 기존 이메일 체크 영향 없음.

---

## Task 5: 수동 테스트 [S]

- [x] `docker start gamechu-redis` 로 Redis 실행 확인
- [x] `npm run dev` 서버 시작
- [x] curl로 로그인 rate limit 테스트 (rapid 11회 요청 → 11번째에 429)
- [x] curl로 회원가입 rate limit 테스트 (rapid 6회 요청 → 6번째에 429)
- [x] curl로 이메일 체크 rate limit 테스트 (rapid 11회 요청 → 11번째에 429)
- [x] Rate limit 미초과 시 정상 응답 확인
- [x] **로그인 end-to-end 테스트**: rate limit 통과 후 실제 로그인 성공 확인 (토큰 발급, 세션 생성)
- [x] `Retry-After` 및 `X-RateLimit-*` 헤더 값 확인
- [x] `console.warn` 로그 출력 확인 (rate limit 초과 시)
- [x] Redis 키 확인: `docker exec gamechu-redis redis-cli KEYS "ratelimit:*"`
- [x] Redis 중지 후 요청 → graceful degradation 확인 (요청 허용)
- [x] dev 환경에서 `X-Forwarded-For` 헤더로 IP 분리 테스트: `curl -H "X-Forwarded-For: 1.2.3.4" ...`

# Testing Setup — Tasks

> Last Updated: 2026-03-15 (session 6 — Phase H complete; 116 tests passing across 35 files; all phases A–H complete)

---

## Phase A — Infrastructure Setup

- [x] **A1.** Install devDependencies: `vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom` (do NOT install `@types/testing-library__jest-dom` — deprecated, ships conflicts)
- [x] **A2.** Create `vitest.config.ts` at project root (node default env, jsdom for hooks/stores, `@/` alias, `tests/setup.ts`)
- [x] **A3.** Create `tests/setup.ts`: use `import "@testing-library/jest-dom/vitest"` (not plain `/jest-dom`); `afterEach` must call `vi.clearAllMocks()` AND `vi.unstubAllGlobals()` (stub leaks across tests otherwise)
- [x] **A4.** Add scripts to `package.json`: `test`, `test:watch`, `test:coverage`, `lint`, `format`
- [x] **A5.** Verify `npm test` runs with 0 test files (no crash) — smoke check

---

## Phase B — Test Utilities

- [x] **B1.** Create `tests/mocks/` directory
- [x] **B2.** Create `MockArenaRepository.ts` — `vi.fn()` for all `ArenaRepository` interface methods: `count`, `findAll`, `findById`, `getArenaById`, `save`, `update`, `updateStatus`, `updateChallengerAndStatus`, `deleteById`
- [x] **B3.** Create `MockMemberRepository.ts` — for auth/score usecase tests
- [x] **B4.** Create `MockScoreRecordRepository.ts` — for score usecase tests
- [x] **B5.** Create `MockReviewRepository.ts`, `MockVoteRepository.ts`

---

## Phase C — Usecase Tests

### C1: Auth Usecases

- [x] `backend/member/application/usecase/__tests__/LoginUsecase.test.ts`
    - Happy path: valid credentials → returns member
    - Error: invalid password → throws
    - Error: member not found → throws
- [x] `backend/member/application/usecase/__tests__/SignUpUsecase.test.ts`
    - Happy path: new email → creates member
    - Error: duplicate email → throws
- [x] `backend/member/application/usecase/__tests__/EmailCheckUsecase.test.ts`
    - Available: `findByEmail` returns null → available response
    - Taken: `findByEmail` returns member → taken response

### C2: Arena Usecases

- [x] `backend/arena/application/usecase/__tests__/CreateArenaUsecase.test.ts`
    - Saves with `status: 1`, `challengerId: null`
    - Propagates repository errors
- [x] `backend/arena/application/usecase/__tests__/EndArenaUsecase.test.ts`
    - Note: `EndArenaUsecase` does NOT call `updateStatus` — it applies score policies only. Constructor takes `ApplyArenaScoreUsecase` as a dependency (mock inline, not via mock factory).
    - WIN case: `applyArenaScoreUsecase.execute` called with `{ memberId: winnerId, result: "WIN" }`
    - DRAW case: `applyArenaScoreUsecase.execute` called twice with `result: "DRAW"`
    - CANCEL case (no challenger): `applyArenaScoreUsecase.execute` called once with `result: "CANCEL"`
- [x] `backend/arena/application/usecase/__tests__/UpdateArenaStatusUsecase.test.ts`
    - Valid status transition
    - Invalid transition handled

### C3: Score Usecases

- [x] `backend/score-policy/application/usecase/__tests__/ApplyArenaScoreUsecase.test.ts`
    - Calls `incrementScore` with correct delta
    - Creates score record with correct policyId
- [x] `backend/score-policy/application/usecase/__tests__/ApplyReviewScoreUsecase.test.ts`
    - Delta calculation with `currentLikeCount` passed through
- [x] `backend/score-policy/application/usecase/__tests__/ApplyAttendanceScoreUsecase.test.ts`
    - Attendance score applied correctly

### C4: Review + Vote Usecases

- [x] `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts`
- [x] `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts`
- [x] `backend/review/application/usecase/__tests__/DeleteReviewUsecase.test.ts`
- [x] `backend/vote/application/usecase/__tests__/CreateVoteUsecase.test.ts`
- [x] `backend/vote/application/usecase/__tests__/UpdateVoteUsecase.test.ts`

---

## Phase D — Zustand Store Tests

- [x] `stores/__tests__/AuthStore.test.ts`
    - Initial state: `user: null`
    - `setUser` → updates user
    - `clearUser` → resets to null
- [x] `stores/__tests__/loadingStore.test.ts`
    - All state transitions
- [x] `stores/__tests__/modalStore.test.ts`
    - Open/close transitions
- [x] `stores/__tests__/useArenaStore.test.ts`
    - `setArenaData` → stores data
    - `clearArenaData` → resets to null

---

## Phase E — Hook Tests

- [x] `hooks/__tests__/useArenas.test.ts`
    - Returns `arenaListDto` on successful fetch
    - Sets `error` on fetch failure
    - `loading` starts true, ends false
    - Builds correct URL params (status, mine, pageSize, targetMemberId)
- [x] `hooks/__tests__/useArenaList.test.ts`
- [x] `hooks/__tests__/useVote.test.ts`
- [x] `hooks/__tests__/useVoteList.test.ts`
- [x] `hooks/__tests__/useArenaAutoStatus.test.ts` — uses `setTimeout` with dayjs UTC delays; requires `vi.useFakeTimers()` + `vi.advanceTimersByTime()` (not the simple `waitFor` pattern)
- [x] `hooks/__tests__/useArenaAutoStatusDetail.test.ts` — same timer pattern as above

---

## Phase G — API Route Tests (mocked usecase layer, no DB)

- [x] **G1.** `app/api/arenas/__tests__/route.test.ts`
    - `GET` returns 200 with arena list
    - `GET` without `pageSize` param: verifies §2.2 fix (not 0)
    - `GET` with `status` filter: correct params forwarded to usecase
- [x] **G2.** `app/api/auth/signup/__tests__/route.test.ts`
    - `POST` with valid body → 201
    - `POST` with duplicate email → 400
- [x] **G3.** `app/api/games/__tests__/route.test.ts`
    - **Prerequisite**: must `vi.mock("@/lib/redis", ...)` before importing handler — route imports Redis at module scope (top-level), causes ECONNREFUSED without mock
    - `GET` returns 200 with games array
- [x] **G4.** `app/api/member/arenas/__tests__/route.test.ts`
    - `POST` without auth session → 401
    - `POST` with valid session + body → 201
- [x] **G5.** `app/api/member/arenas/[id]/__tests__/route.test.ts`
    - `DELETE` without auth → 401
    - `DELETE` by non-owner → 401 (handler uses single combined condition — both cases return 401, not 403)
    - `DELETE` by owner → 200
- [x] **G6.** `app/api/member/games/[gameId]/reviews/__tests__/route.test.ts`
    - **Prerequisite**: refactored `reviews/route.ts` — moved `const repository` and `const usecase` instantiation from module scope into the `POST` handler body ✅ DONE
    - `POST` without auth → 401
    - `POST` with valid body + auth → 200

> **Mock pattern for auth in all G tests:**
>
> ```ts
> vi.mock("@/utils/GetAuthUserId.server", () => ({
>     getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
> }));
> ```
>
> For unauth tests: `vi.mocked(getAuthUserId).mockResolvedValueOnce(null)`

---

## Phase H — Test Expansion (High Value)

> Added 2026-03-15. Targets identified after session 3 as having meaningful business logic currently unprotected by tests.

### H1: GetArenaDetailUsecase

- [x] `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts`
    - **Prerequisite**: `ArenaCacheService` is NOT constructor-injected — must `vi.mock("@/backend/arena/infra/cache/ArenaCacheService", ...)` using Vitest 4.x `function` syntax
    - Cache hit: `getArenaDetailCache` returns cached value → result returned immediately, no repo calls, `setArenaDetailCache` NOT called
    - Cache miss: `getArenaDetailCache` returns `null` → `getArenaById` called, result built + `setArenaDetailCache` called
    - Vote percentage: `totalCount > 0` → `leftPercent` and `rightPercent` are computed correctly
    - Zero-vote edge case: `totalCount === 0` → both percents are `0` (not NaN / divide-by-zero)
    - Time calculations: `endChatting = startDate + 30min`, `endVote = endChatting + 24h` — assert exact ms offsets

### H2: ToggleReviewLikeUsecase

- [x] Create `tests/mocks/MockReviewLikeRepository.ts` — `isLiked`, `count`, `like`, `unlike` as `vi.fn()`
- [x] `backend/review-like/application/usecase/__tests__/ToggleReviewLikeUsecase.test.ts`
    - Like path: `isLiked` returns `false` → `like` called, `applyReviewScoreUsecase.execute` called with `action: "LIKE"`, returns `{ liked: true }`
    - Unlike path: `isLiked` returns `true` → `unlike` called, `applyReviewScoreUsecase.execute` called with `action: "UNLIKE"`, returns `{ liked: false }`
    - Not found: `reviewRepo.findById` returns `null` → throws `"리뷰 없음"`
    - `applyReviewScoreUsecase` passed as inline `{ execute: vi.fn() }` (same pattern as `EndArenaUsecase`)

### H3: UpdateArenaUsecase

- [x] `backend/arena/application/usecase/__tests__/UpdateArenaUsecase.test.ts`
    - Not found: `findById` returns `null` → throws `"Arena not found"`
    - Status update: `findById` returns arena + `updateArenaDto.status` is set → `arena.status` mutated, `update` called with modified arena
    - No status in dto: `updateArenaDto.status` is `undefined` → `arena.status` unchanged, `update` still called

### H4: PATCH `/api/member/arenas/[id]` (extend G5)

- [x] Add to `app/api/member/arenas/[id]/__tests__/route.test.ts`:
    - 400 when body has none of `description`, `challengerId`, `startDate`
    - 401 when `getAuthUserId` returns null
    - 200 on valid body (any one of the three fields present)
    - Mock `PrismaArenaRepository` with `findById` + `update` as `vi.fn()` (Vitest 4.x `function` syntax)

### H5: POST `/api/member/attend`

- [x] `app/api/member/attend/__tests__/route.test.ts`
    - 401 when not authenticated
    - 200 on valid request — verify response shape `{ success: true, attendedDate: string | null }`
    - `attendedDate` is `null` when `getLastAttendedDate` returns `null`
    - `attendedDate` is a non-empty string (Korean locale) when last attended date exists
    - Mock: `PrismaMemberRepository` (needs `getLastAttendedDate` + `incrementScore`), `PrismaScoreRecordRepository`

### H6: GET `/api/auth/email-check` (optional, low effort)

- [x] `app/api/auth/email-check/__tests__/route.test.ts`
    - 200 with available response when email not taken
    - 200 with taken response when email exists
    - Check if route imports `@/lib/redis` at module scope — if yes, mock it (same as games route)

---

## Phase F — CI Integration

- [x] **F1.** Update `.github/workflows/deploy-on-ubuntu-server.yml`:
    - Replace `echo "Test..."` with `/home/gamechu/www/gamechu/next-app-test.sh` in `test` job (server-side shell script for extensibility)
    - Add `needs: build` to `test` job
    - Change `deploy` job `needs` from `[build]` to `[build, test]`

---

## Acceptance Criteria

- [x] `npm test` exits 0 with ≥ 55 passing tests → **116 passing (35 files)**
- [x] `npm run test:coverage` shows ≥ 60% line coverage on `backend/**/usecase/*.ts` → all ≥ 88%, most 100%
- [x] `npm run test:coverage` shows ≥ 40% line coverage on Phase G API route files → lowest is 65.38%
- [x] `npm run lint` runs without script-not-found error
- [x] CI `test` job no longer uses `echo`
- [x] No new manual testing required to verify usecase/route regressions

---

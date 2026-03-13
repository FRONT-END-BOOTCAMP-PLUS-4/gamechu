# Testing Setup — Tasks

> Last Updated: 2026-03-14

---

## Phase A — Infrastructure Setup

- [ ] **A1.** Install devDependencies: `vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom` (do NOT install `@types/testing-library__jest-dom` — deprecated, ships conflicts)
- [ ] **A2.** Create `vitest.config.ts` at project root (node default env, jsdom for hooks/stores, `@/` alias, `tests/setup.ts`)
- [ ] **A3.** Create `tests/setup.ts`: use `import "@testing-library/jest-dom/vitest"` (not plain `/jest-dom`); `afterEach` must call `vi.clearAllMocks()` AND `vi.unstubAllGlobals()` (stub leaks across tests otherwise)
- [ ] **A4.** Add scripts to `package.json`: `test`, `test:watch`, `test:coverage`, `lint`, `format`
- [ ] **A5.** Verify `npm test` runs with 0 test files (no crash) — smoke check

---

## Phase B — Test Utilities

- [ ] **B1.** Create `tests/mocks/` directory
- [ ] **B2.** Create `MockArenaRepository.ts` — `vi.fn()` for all `ArenaRepository` interface methods: `count`, `findAll`, `findById`, `getArenaById`, `save`, `update`, `updateStatus`, `updateChallengerAndStatus`, `deleteById`
- [ ] **B3.** Create `MockMemberRepository.ts` — for auth/score usecase tests
- [ ] **B4.** Create `MockScoreRecordRepository.ts` — for score usecase tests
- [ ] **B5.** Create `MockReviewRepository.ts`, `MockVoteRepository.ts`

---

## Phase C — Usecase Tests

### C1: Auth Usecases
- [ ] `backend/member/application/usecase/__tests__/LoginUsecase.test.ts`
  - Happy path: valid credentials → returns member
  - Error: invalid password → throws
  - Error: member not found → throws
- [ ] `backend/member/application/usecase/__tests__/SignUpUsecase.test.ts`
  - Happy path: new email → creates member
  - Error: duplicate email → throws
- [ ] `backend/member/application/usecase/__tests__/EmailCheckUsecase.test.ts`
  - Available: `findByEmail` returns null → available response
  - Taken: `findByEmail` returns member → taken response

### C2: Arena Usecases
- [ ] `backend/arena/application/usecase/__tests__/CreateArenaUsecase.test.ts`
  - Saves with `status: 1`, `challengerId: null`
  - Propagates repository errors
- [ ] `backend/arena/application/usecase/__tests__/EndArenaUsecase.test.ts`
  - Note: `EndArenaUsecase` does NOT call `updateStatus` — it applies score policies only. Constructor takes `ApplyArenaScoreUsecase` as a dependency (mock inline, not via mock factory).
  - WIN case: `applyArenaScoreUsecase.execute` called with `{ memberId: winnerId, result: "WIN" }`
  - DRAW case: `applyArenaScoreUsecase.execute` called twice with `result: "DRAW"`
  - CANCEL case (no challenger): `applyArenaScoreUsecase.execute` called once with `result: "CANCEL"`
- [ ] `backend/arena/application/usecase/__tests__/UpdateArenaStatusUsecase.test.ts`
  - Valid status transition
  - Invalid transition handled

### C3: Score Usecases
- [ ] `backend/score-policy/application/usecase/__tests__/ApplyArenaScoreUsecase.test.ts`
  - Calls `incrementScore` with correct delta
  - Creates score record with correct policyId
- [ ] `backend/score-policy/application/usecase/__tests__/ApplyReviewScoreUsecase.test.ts`
  - Delta calculation with `currentLikeCount` passed through
- [ ] `backend/score-policy/application/usecase/__tests__/ApplyAttendanceScoreUsecase.test.ts`
  - Attendance score applied correctly

### C4: Review + Vote Usecases
- [ ] `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts`
- [ ] `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts`
- [ ] `backend/review/application/usecase/__tests__/DeleteReviewUsecase.test.ts`
- [ ] `backend/vote/application/usecase/__tests__/CreateVoteUsecase.test.ts`
- [ ] `backend/vote/application/usecase/__tests__/UpdateVoteUsecase.test.ts`

---

## Phase D — Zustand Store Tests

- [ ] `stores/__tests__/AuthStore.test.ts`
  - Initial state: `user: null`
  - `setUser` → updates user
  - `clearUser` → resets to null
- [ ] `stores/__tests__/loadingStore.test.ts`
  - All state transitions
- [ ] `stores/__tests__/modalStore.test.ts`
  - Open/close transitions
- [ ] `stores/__tests__/useArenaStore.test.ts`
  - `setArenaData` → stores data
  - `clearArenaData` → resets to null

---

## Phase E — Hook Tests

- [ ] `hooks/__tests__/useArenas.test.ts`
  - Returns `arenaListDto` on successful fetch
  - Sets `error` on fetch failure
  - `loading` starts true, ends false
  - Builds correct URL params (status, mine, pageSize, targetMemberId)
- [ ] `hooks/__tests__/useArenaList.test.ts`
- [ ] `hooks/__tests__/useVote.test.ts`
- [ ] `hooks/__tests__/useVoteList.test.ts`
- [ ] `hooks/__tests__/useArenaAutoStatus.test.ts` — uses `setTimeout` with dayjs UTC delays; requires `vi.useFakeTimers()` + `vi.advanceTimersByTime()` (not the simple `waitFor` pattern)
- [ ] `hooks/__tests__/useArenaAutoStatusDetail.test.ts` — same timer pattern as above

---

## Phase G — API Route Tests (mocked usecase layer, no DB)

- [ ] **G1.** `app/api/arenas/__tests__/route.test.ts`
  - `GET` returns 200 with arena list
  - `GET` without `pageSize` param: verifies §2.2 fix (not 0)
  - `GET` with `status` filter: correct params forwarded to usecase
- [ ] **G2.** `app/api/auth/signup/__tests__/route.test.ts`
  - `POST` with valid body → 201
  - `POST` with duplicate email → 400
  - `POST` with missing fields → 400
- [ ] **G3.** `app/api/games/__tests__/route.test.ts`
  - **Prerequisite**: must `vi.mock("@/lib/redis", () => ({ default: { get: vi.fn().mockResolvedValue(null), set: vi.fn() } }))` before importing handler — route imports Redis at module scope (top-level), causes ECONNREFUSED without mock
  - `GET` returns 200 with games array
- [ ] **G4.** `app/api/member/arenas/__tests__/route.test.ts`
  - `POST` without auth session → 401
  - `POST` with valid session + body → 201
- [ ] **G5.** `app/api/member/arenas/[id]/__tests__/route.test.ts`
  - `DELETE` without auth → 401
  - `DELETE` by non-owner → 401 (handler uses single combined condition — both cases return 401, not 403)
  - `DELETE` by owner → 200
- [ ] **G6.** `app/api/member/games/[gameId]/reviews/__tests__/route.test.ts`
  - **Prerequisite**: refactor `reviews/route.ts` — move `const repository` and `const usecase` instantiation from module scope into the `POST` handler body (currently module-scope, `vi.mock()` cannot intercept them)
  - `POST` with missing required fields → 400
  - `POST` with valid body + auth → 201

> **Mock pattern for auth in all G tests:**
> ```ts
> vi.mock("@/utils/GetAuthUserId.server", () => ({
>     getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
> }))
> ```
> For unauth tests: `vi.mocked(getAuthUserId).mockResolvedValueOnce(null)`

---

## Phase F — CI Integration

- [ ] **F1.** Update `.github/workflows/deploy-on-ubuntu-server.yml`:
  - Replace `echo "Test..."` with `npm test` in `test` job
  - Add `needs: build` to `test` job
  - Change `deploy` job `needs` from `[build]` to `[build, test]`
- [ ] **F2.** Verify CI runs tests on next push

---

## Acceptance Criteria

- [ ] `npm test` exits 0 with ≥ 55 passing tests
- [ ] `npm run test:coverage` shows ≥ 60% line coverage on `backend/**/usecase/*.ts`
- [ ] `npm run test:coverage` shows ≥ 40% line coverage on Phase G API route files
- [ ] `npm run lint` runs without script-not-found error
- [ ] CI `test` job no longer uses `echo`
- [ ] No new manual testing required to verify usecase/route regressions

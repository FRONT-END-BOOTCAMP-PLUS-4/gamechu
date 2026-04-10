# Testing Setup — Context

> Last Updated: 2026-03-15 (session 6 — Phase H complete; 116 tests across 35 files; this-annotation fixes applied; READY FOR PR)

---

## Issue & Branch

- **GitHub Issue**: #264
- **Branch**: `feat/#264`
- **Target**: PR → `dev`

---

## Why This Task Exists

- Zero tests in the codebase — only quality gate is `next build` in pre-commit
- CI `test` job is a placeholder (`echo "Test..."`)
- MASTER_PLAN §4.1 identifies this as Order #11, but it's a prerequisite for §7.5.2 (CI test integration) and §4.4 (E2E testing)

---

## Current Implementation State

**All phases complete (A–H). 116 tests passing across 35 files. READY FOR PR.**

### What was built this session

#### Infrastructure (Phase A)

- Installed: `vitest@4.1.0`, `@vitejs/plugin-react@6.0.1`, `@testing-library/react@16.3.2`, `@testing-library/user-event@14.6.1`, `@testing-library/jest-dom@6.9.1`, `jsdom@28.1.0`
- `vitest.config.ts` at project root
- `tests/setup.ts` with jest-dom + afterEach cleanup
- Scripts added to `package.json`: `test`, `test:watch`, `test:coverage`, `lint`, `format`

#### Mock Repositories (Phase B)

All in `tests/mocks/`:

- `MockArenaRepository.ts`
- `MockMemberRepository.ts`
- `MockScoreRecordRepository.ts`
- `MockReviewRepository.ts`
- `MockVoteRepository.ts`

Each exports a factory function (not a class): `MockArenaRepository()` returns a plain object with all interface methods set to `vi.fn()`.

#### Usecase Tests (Phase C — 25 tests)

- `backend/member/application/usecase/__tests__/LoginUsecase.test.ts` — 3 tests (uses `bcryptjs.hash` to create real hashed passwords in test data)
- `backend/member/application/usecase/__tests__/SignUpUsecase.test.ts` — 2 tests
- `backend/member/application/usecase/__tests__/EmailCheckUsecase.test.ts` — 2 tests
- `backend/arena/application/usecase/__tests__/CreateArenaUsecase.test.ts` — 2 tests
- `backend/arena/application/usecase/__tests__/EndArenaUsecase.test.ts` — 3 tests
- `backend/arena/application/usecase/__tests__/UpdateArenaStatusUsecase.test.ts` — 3 tests
- `backend/score-policy/application/usecase/__tests__/ApplyArenaScoreUsecase.test.ts` — 4 tests (WIN/DRAW/JOIN/CANCEL)
- `backend/score-policy/application/usecase/__tests__/ApplyReviewScoreUsecase.test.ts` — 5 tests (LIKE <20, LIKE ≥20, UNLIKE, DELETE 10 likes, DELETE 25 likes)
- `backend/score-policy/application/usecase/__tests__/ApplyAttendanceScoreUsecase.test.ts` — 3 tests (new day, same day, null)
- `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts` — 2 tests
- `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts` — 1 test
- `backend/review/application/usecase/__tests__/DeleteReviewUsecase.test.ts` — 2 tests
- `backend/vote/application/usecase/__tests__/CreateVoteUsecase.test.ts` — 5 tests
- `backend/vote/application/usecase/__tests__/UpdateVoteUsecase.test.ts` — 2 tests

#### Zustand Store Tests (Phase D — 12 tests)

- `stores/__tests__/AuthStore.test.ts` — 3 tests
- `stores/__tests__/loadingStore.test.ts` — 3 tests
- `stores/__tests__/modalStore.test.ts` — 3 tests
- `stores/__tests__/useArenaStore.test.ts` — 3 tests

Pattern: `useXxxStore.setState({...})` to reset between tests (no `renderHook` needed — tests call `useXxxStore.getState()` directly).

#### Hook Tests (Phase E — 34 tests)

- `hooks/__tests__/useArenas.test.ts` — 6 tests
- `hooks/__tests__/useArenaList.test.ts` — 5 tests
- `hooks/__tests__/useVote.test.ts` — 7 tests
- `hooks/__tests__/useVoteList.test.ts` — 4 tests
- `hooks/__tests__/useArenaAutoStatus.test.ts` — 6 tests (fake timers + unmount cleanup)
- `hooks/__tests__/useArenaAutoStatusDetail.test.ts` — 6 tests (same timer pattern, Zustand-driven)

#### API Route Tests (Phase G — 15 tests)

- `app/api/arenas/__tests__/route.test.ts` — 3 tests
- `app/api/auth/signup/__tests__/route.test.ts` — 2 tests
- `app/api/games/__tests__/route.test.ts` — 1 test
- `app/api/member/arenas/__tests__/route.test.ts` — 2 tests
- `app/api/member/arenas/[id]/__tests__/route.test.ts` — 3 tests
- `app/api/member/games/[gameId]/reviews/__tests__/route.test.ts` — 2 tests

#### CI Update (Phase F)

- `.github/workflows/deploy-on-ubuntu-server.yml`: `test` job now runs `/home/gamechu/www/gamechu/next-app-test.sh` (shell script on server, not `npm test` directly), has `needs: build`; `deploy` now `needs: [build, test]`

---

## Key Decisions Made This Session

### 1. jsdom via docblock, not environmentMatchGlobs

The `environmentMatchGlobs` in `vitest.config.ts` was set to `["hooks/**", "jsdom"]` and `["stores/**", "jsdom"]`, but these globs did NOT match the test files at `hooks/__tests__/useArenas.test.ts`. Rather than fixing the glob (which would require `"hooks/__tests__/**"`), the hook test file uses a docblock:

```ts
// @vitest-environment jsdom
```

Store tests work without jsdom (Zustand `getState()` doesn't need browser globals). Only hook tests using `renderHook` require jsdom.

**The `environmentMatchGlobs` in `vitest.config.ts` still references `hooks/**`and`stores/**` but is effectively unused — the docblock takes precedence for hooks. This is fine.**

### 2. Vitest 4.x requires `function`/`class` syntax for constructor mocks

Vitest 4.x enforces that `vi.fn()` mocks used as `new` constructors (i.e., `new PrismaXxxRepository()`) must use `function` keyword or `class` syntax in their implementation. Arrow functions silently break `new`.

**Correct:**

```ts
vi.mock("@/backend/.../PrismaArenaRepository", () => ({
    PrismaArenaRepository: vi.fn(function () {
        this.findById = vi.fn().mockResolvedValue({ ... });
    }),
}));
```

**Wrong (arrow function — silently fails in Vitest 4.x):**

```ts
vi.mock("@/backend/.../PrismaArenaRepository", () => ({
    PrismaArenaRepository: vi
        .fn()
        .mockImplementation(() => ({ findById: vi.fn() })),
}));
```

### 3. EndArenaUsecase takes ApplyArenaScoreUsecase directly, not MockArenaRepository

`EndArenaUsecase` constructor: `(arenaRepository, applyArenaScoreUsecase, voteRepository)`. The `applyArenaScoreUsecase` is passed as an inline mock `{ execute: vi.fn() }`, NOT via the `MockArenaRepository` factory (it's not a repository — it's a usecase).

### 4. reviews/route.ts was refactored (G6 prerequisite)

`app/api/member/games/[gameId]/reviews/route.ts` had module-scope instantiation:

```ts
const repository = new PrismaReviewRepository(); // module scope
const usecase = new CreateReviewUsecase(repository);
```

This was moved inside the `POST` handler body so `vi.mock()` can intercept it. Without this refactor, the mock is applied AFTER the module is evaluated, so the original class runs.

### 5. Score usecases use real ScorePolicy (no mock needed)

`ApplyArenaScoreUsecase`, `ApplyReviewScoreUsecase`, `ApplyAttendanceScoreUsecase` all take a `ScorePolicy` instance. Rather than mocking it, tests use `new ScorePolicy()` directly — it's a pure class with no external dependencies. This gives better regression coverage.

---

## Files Modified This Session

| File                                                                                     | Change                                                                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                                                           | Added `test`, `test:watch`, `test:coverage`, `lint`, `format` scripts                                                     |
| `vitest.config.ts`                                                                       | Created (new file)                                                                                                        |
| `tests/setup.ts`                                                                         | Created (new file)                                                                                                        |
| `tests/mocks/MockArenaRepository.ts`                                                     | Created (new file)                                                                                                        |
| `tests/mocks/MockMemberRepository.ts`                                                    | Created (new file)                                                                                                        |
| `tests/mocks/MockScoreRecordRepository.ts`                                               | Created (new file)                                                                                                        |
| `tests/mocks/MockReviewRepository.ts`                                                    | Created (new file)                                                                                                        |
| `tests/mocks/MockVoteRepository.ts`                                                      | Created (new file)                                                                                                        |
| `backend/member/application/usecase/__tests__/LoginUsecase.test.ts`                      | Created (new file)                                                                                                        |
| `backend/member/application/usecase/__tests__/SignUpUsecase.test.ts`                     | Created (new file)                                                                                                        |
| `backend/member/application/usecase/__tests__/EmailCheckUsecase.test.ts`                 | Created (new file)                                                                                                        |
| `backend/arena/application/usecase/__tests__/CreateArenaUsecase.test.ts`                 | Created (new file)                                                                                                        |
| `backend/arena/application/usecase/__tests__/EndArenaUsecase.test.ts`                    | Created (new file)                                                                                                        |
| `backend/arena/application/usecase/__tests__/UpdateArenaStatusUsecase.test.ts`           | Created (new file)                                                                                                        |
| `backend/score-policy/application/usecase/__tests__/ApplyArenaScoreUsecase.test.ts`      | Created (new file)                                                                                                        |
| `backend/score-policy/application/usecase/__tests__/ApplyReviewScoreUsecase.test.ts`     | Created (new file)                                                                                                        |
| `backend/score-policy/application/usecase/__tests__/ApplyAttendanceScoreUsecase.test.ts` | Created (new file)                                                                                                        |
| `backend/review/application/usecase/__tests__/CreateReviewUsecase.test.ts`               | Created (new file)                                                                                                        |
| `backend/review/application/usecase/__tests__/UpdateReviewUsecase.test.ts`               | Created (new file)                                                                                                        |
| `backend/review/application/usecase/__tests__/DeleteReviewUsecase.test.ts`               | Created (new file)                                                                                                        |
| `backend/vote/application/usecase/__tests__/CreateVoteUsecase.test.ts`                   | Created (new file)                                                                                                        |
| `backend/vote/application/usecase/__tests__/UpdateVoteUsecase.test.ts`                   | Created (new file)                                                                                                        |
| `stores/__tests__/AuthStore.test.ts`                                                     | Created (new file)                                                                                                        |
| `stores/__tests__/loadingStore.test.ts`                                                  | Created (new file)                                                                                                        |
| `stores/__tests__/modalStore.test.ts`                                                    | Created (new file)                                                                                                        |
| `stores/__tests__/useArenaStore.test.ts`                                                 | Created (new file)                                                                                                        |
| `hooks/__tests__/useArenas.test.ts`                                                      | Created (new file, `// @vitest-environment jsdom` docblock)                                                               |
| `hooks/__tests__/useArenaList.test.ts`                                                   | Created (new file)                                                                                                        |
| `hooks/__tests__/useVote.test.ts`                                                        | Created (new file)                                                                                                        |
| `hooks/__tests__/useVoteList.test.ts`                                                    | Created (new file)                                                                                                        |
| `hooks/__tests__/useArenaAutoStatus.test.ts`                                             | Created (new file, fake timers + unmount)                                                                                 |
| `hooks/__tests__/useArenaAutoStatusDetail.test.ts`                                       | Created (new file, same timer pattern)                                                                                    |
| `app/api/arenas/__tests__/route.test.ts`                                                 | Created (new file)                                                                                                        |
| `app/api/auth/signup/__tests__/route.test.ts`                                            | Created (new file)                                                                                                        |
| `app/api/games/__tests__/route.test.ts`                                                  | Created (new file)                                                                                                        |
| `app/api/member/arenas/__tests__/route.test.ts`                                          | Created (new file)                                                                                                        |
| `app/api/member/arenas/[id]/__tests__/route.test.ts`                                     | Created (new file)                                                                                                        |
| `app/api/member/games/[gameId]/reviews/__tests__/route.test.ts`                          | Created (new file)                                                                                                        |
| `app/api/member/games/[gameId]/reviews/route.ts`                                         | **Refactored**: moved `repository`/`usecase` from module scope into `POST` handler body                                   |
| `.github/workflows/deploy-on-ubuntu-server.yml`                                          | `test` job: `echo` → `/home/gamechu/www/gamechu/next-app-test.sh`, added `needs: build`; `deploy`: `needs: [build, test]` |

---

## Next Immediate Steps

1. **PR**: Open PR `feat/#264` → `dev` following `docs/CODE_CONVENTIONS.md` GitHub workflow (this is the only remaining step)
2. **Verify CI**: After merge, confirm `test` job runs on next push and calls `/home/gamechu/www/gamechu/next-app-test.sh`

---

## Code Review Findings (session 5)

> Source: full diff review of `feat/#264`. All issues are post-merge backlog — none block the PR.

### 🟡 Potential flakiness

- **`ApplyAttendanceScoreUsecase.test.ts`**: uses `new Date()` to compute yesterday — can fail at UTC midnight. Fix: use fixed dates (`new Date("2026-01-01")`) instead of `new Date()`.

### 🟡 Missing test paths

- **All API routes**: input validation untested (missing fields, wrong types, invalid JSON). Highest priority.
- **All usecases**: repository/DB error paths almost entirely absent. Add at least one `mockRejectedValue` case per usecase.
- **`GET /api/games`**: only 1 test (happy path). Redis cache is mocked but never asserted. No filter/pagination tests.
- **`POST /api/auth/signup`**: Redis rate limiting is mocked but its invocation is never verified.
- **`useVoteList`**: no test for partial fetch failure (one arena succeeds, another fails).

### 🟢 Minor style

- `useArenas.test.ts` lines 72–85: four separate `expect(fetch).toHaveBeenCalledWith(stringContaining(...))` calls for one fetch — consolidate into `stringMatching(/param1.*param2/s)`.
- `useArenaList.test.ts` line 16: `as unknown as Response` double-cast is harmless but loose.
- `POST /api/auth/signup` test re-imports and reconfigures the mock mid-test — consider lifting to top-level `vi.mock`.

### Exemplary files (reference quality for Phase H)

- `EndArenaUsecase.test.ts` — score delegation + all outcome branches
- `ApplyArenaScoreUsecase.test.ts` / `ApplyReviewScoreUsecase.test.ts` — exhaustive threshold testing
- `CreateVoteUsecase.test.ts` — all business rule validations
- `DELETE /api/member/arenas/[id]` tests — authorization (owner vs non-owner) pattern
- `useArenaAutoStatus.test.ts` — fake timers + `act()` + unmount cleanup

---

## Architecture Facts for Testing

### Usecases are constructor-injected (easy to unit test)

```ts
// Pattern across all ~58 usecases
class CreateArenaUsecase {
    constructor(private arenaRepository: ArenaRepository) {}
    async execute(dto: CreateArenaDto): Promise<Arena> { ... }
}
```

→ Mock `ArenaRepository` with `vi.fn()`, no Prisma needed.

### Zustand stores use `create()` with a reset pattern

```ts
// Reset between tests (call BEFORE each test, not after):
useAuthStore.setState({ user: null });
// Access state without renderHook:
useAuthStore.getState().setUser({ id: "u1" });
expect(useAuthStore.getState().user).toEqual({ id: "u1" });
```

### Hooks use raw fetch

```ts
// All hooks follow this pattern:
const res = await fetch(`/api/...`);
```

→ Mock with `vi.stubGlobal("fetch", vi.fn())` in `beforeEach`. `vi.unstubAllGlobals()` in afterEach (already in `tests/setup.ts`).

### Hook tests require jsdom

Add docblock at top of file:

```ts
// @vitest-environment jsdom
```

### Vitest 4.x constructor mock syntax

```ts
// For classes used with `new` in the route handler:
vi.mock("@/path/to/PrismaXxx", () => ({
    PrismaXxx: vi.fn(function () {
        this.methodA = vi.fn().mockResolvedValue(...);
    }),
}));
```

### Score policyIds (from ScorePolicy.ts)

| Action                   | Delta              | PolicyId |
| ------------------------ | ------------------ | -------- |
| Arena JOIN               | -100               | 4        |
| Arena WIN                | +190               | 5        |
| Arena DRAW               | +100               | 6        |
| Arena CANCEL             | +100               | 7        |
| Review LIKE (< 20 likes) | +5                 | 3        |
| Review UNLIKE            | -5                 | 8        |
| Review DELETE            | -min(likes×5, 100) | 2        |
| Attendance               | +5                 | 1        |

---

## Key Architecture Facts for Testing

### Vitest Config Key Decisions

| Decision            | Choice                                  | Reason                                                     |
| ------------------- | --------------------------------------- | ---------------------------------------------------------- |
| Test runner         | Vitest (not Jest)                       | Native ESM, Vite-compatible, faster, works with Next.js 15 |
| Default environment | `node`                                  | Usecases are pure Node — no browser APIs needed            |
| Hook environment    | `// @vitest-environment jsdom` docblock | Simpler than glob matching which didn't work reliably      |
| `@/` alias          | Manually set in `resolve.alias`         | tsconfig aliases not auto-applied by Vitest                |
| React plugin        | `@vitejs/plugin-react`                  | JSX transform for `@testing-library/react`                 |
| ScorePolicy         | Real instance, not mock                 | Pure class with no external deps — better coverage         |

### Packages to Install

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Do NOT install `@types/testing-library__jest-dom` — deprecated, ships type conflicts. Use `import "@testing-library/jest-dom/vitest"` in `tests/setup.ts` (not the plain `/jest-dom` import) to correctly extend Vitest's `expect` type namespace.

---

## Phase H — Test Expansion Patterns

### H1: Mocking ArenaCacheService (not injected)

`GetArenaDetailUsecase` instantiates `ArenaCacheService` inside its constructor — it is NOT passed in. Mock at module scope:

```ts
vi.mock("@/backend/arena/infra/cache/ArenaCacheService", () => ({
    ArenaCacheService: vi.fn(function () {
        this.getArenaDetailCache = vi.fn().mockResolvedValue(null); // default: miss
        this.setArenaDetailCache = vi.fn().mockResolvedValue(undefined);
    }),
}));
```

For cache hit test: `vi.mocked(ArenaCacheService).mock.instances[0].getArenaDetailCache.mockResolvedValueOnce(cachedData)` — or reset the mock in `beforeEach` and override per test.

`voteRepository.countByArenaIds` returns an array: `[{ arenaId, totalCount, leftCount, rightCount }]`. Mock it returning `[]` to trigger the zero-vote path.

### H2: MockReviewLikeRepository

Add `tests/mocks/MockReviewLikeRepository.ts`:

```ts
export function MockReviewLikeRepository() {
    return {
        isLiked: vi.fn(),
        count: vi.fn(),
        like: vi.fn(),
        unlike: vi.fn(),
    };
}
```

`ToggleReviewLikeUsecase` takes `(likeRepo, reviewRepo, applyReviewScoreUsecase)`. Pass inline `{ execute: vi.fn() }` for the usecase (same pattern as `EndArenaUsecase`).

### H4: PATCH route — params pattern

Same as G5 DELETE — `params` must be `Promise.resolve({ id: "1" })`:

```ts
const res = await PATCH(
    new Request("http://localhost/api/member/arenas/1", {
        method: "PATCH",
        body: JSON.stringify({ description: "updated" }),
    }),
    { params: Promise.resolve({ id: "1" }) }
);
```

Body validation fires before auth — test 400 without needing auth mock.

### H5: attend route mock pattern

`ApplyAttendanceScoreUsecase` takes `(ScorePolicy, MemberRepository, ScoreRecordRepository)`. All three are instantiated inside the route handler. Mock all three Prisma repos:

```ts
vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function () {
            this.getLastAttendedDate = vi.fn().mockResolvedValue(null);
            this.incrementScore = vi.fn().mockResolvedValue(undefined);
            this.updateLastAttendedDate = vi.fn().mockResolvedValue(undefined);
        }),
    })
);
```

`ScorePolicy` is a pure class — use the real instance (no mock needed, same as score usecase tests).

---

## Dependencies

- No dependencies on other open tasks
- §7.5.2 (CI test integration) depends on THIS task completing
- §4.4 (E2E Playwright) depends on THIS task completing

---

## API Route Test Notes

Routes tested by importing handler + calling with native `Request`. Usecase layer is fully mocked. No DB/server needed.

| Route                                     | Notes                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET /api/arenas`                         | Mocks `GetArenaUsecase`, `PrismaArenaRepository`, `PrismaMemberRepository`, `PrismaVoteRepository` |
| `POST /api/auth/signup`                   | Also mocks `@/lib/redis` (RateLimiter uses redis at module scope)                                  |
| `GET /api/games`                          | Mocks `@/lib/redis` (top-level import causes ECONNREFUSED)                                         |
| `POST /api/member/arenas`                 | Mocks `PrismaMemberRepository.findById` returning `{ score: 200 }` (score gate)                    |
| `DELETE /api/member/arenas/[id]`          | `params` must be `Promise.resolve({ id: "1" })` (Next.js 15 awaits params)                         |
| `POST /api/member/games/[gameId]/reviews` | Route was refactored (G6 prerequisite) — instantiation now inside handler                          |

---

## Committed State

All files committed to `feat/#264`. Commits:

- `0df22a6` — testing-setup 계획 수립
- `25da608` — 테스트 인프라 구축 및 99개 테스트 작성
- `554e521` — 테스트 파일 any 타입을 명시적 타입으로 교체
- (session 6) — Phase H 테스트 추가 및 this 타입 어노테이션 적용

**Next action**: `/archive-task` after PR is merged.

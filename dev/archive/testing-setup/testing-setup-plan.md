# Testing Framework Setup — Plan

> Last Updated: 2026-03-14 (rev 2 — added framework comparison, Phase G API route tests, test-type decision matrix)

---

## Executive Summary

GameChu has zero automated tests. The only quality gate is `next build` in a pre-commit hook — which catches type errors and build failures, but nothing about runtime behavior, business logic correctness, or regressions. This plan installs **Vitest** as the test runner, configures it for the project's architecture, and writes an initial high-ROI test suite targeting usecases, Zustand stores, and data-fetching hooks. The goal is to make every future task automatically verifiable without manual click-through.

---

## Part 0A: Test Runner Framework Comparison

### Candidates evaluated

| Framework                | ESM Support       | Speed                   | Next.js 15 Compat                                                    | Built-in Mocking                        | `@/` Alias             | Decision        |
| ------------------------ | ----------------- | ----------------------- | -------------------------------------------------------------------- | --------------------------------------- | ---------------------- | --------------- |
| **Vitest**               | Native (esbuild)  | Fast                    | ✅ First-class                                                       | ✅ `vi.fn()`, `vi.mock()`, `vi.spyOn()` | Via `resolve.alias`    | ✅ **Selected** |
| **Jest**                 | Broken by default | Slow (babel transforms) | ⚠️ Requires `--experimental-vm-modules` or `ts-jest` + custom preset | ✅ `jest.fn()`                          | Via `moduleNameMapper` | ❌              |
| **Mocha + Chai + Sinon** | Manual config     | Medium                  | ⚠️ No built-in transform                                             | ❌ Separate `sinon` package             | Manual                 | ❌              |
| **Jasmine**              | No                | Slow                    | ❌                                                                   | Limited                                 | No                     | ❌              |
| **Bun test**             | Native            | Fastest                 | ❌ Wrong runtime (project uses Node/npm)                             | ✅                                      | No                     | ❌              |

### Why Vitest, not Jest

Jest is the most widely used JS test runner, but it has a fundamental ESM problem. This project uses `"module": "esnext"` and `"moduleResolution": "bundler"` in `tsconfig.json`. Running Jest on this setup requires:

1. `--experimental-vm-modules` Node flag (unstable, verbose)
2. A `jest.config.ts` with `extensionsToTreatAsEsm`, `transform` preset (usually `ts-jest` or `babel-jest`)
3. Manual handling for packages that ship only ESM (Prisma generated client, `ioredis`, `next-auth`)
4. Next.js's own packages (`next/headers`, `next/navigation`) require a special Jest preset (`@next/jest`) which adds another layer

Vitest uses Vite's esbuild pipeline which handles ESM natively. It reads `tsconfig.json` automatically via `@vitejs/plugin-react` and respects `moduleResolution: "bundler"`. Its API is 100% Jest-compatible (`describe`, `it`, `expect`, `beforeEach`) — zero learning curve.

**Bottom line**: Vitest eliminates ~2 days of configuration pain that Jest would require, with no API difference.

---

## Part 0B: Test Types — What to Include and Why

Not all test types belong in this task. Here is the full decision matrix:

| Test Type           | What it tests                               | Tools                             | Infrastructure needed                   | Status in this task                          |
| ------------------- | ------------------------------------------- | --------------------------------- | --------------------------------------- | -------------------------------------------- |
| **Unit**            | Single class/function in isolation          | Vitest + `vi.fn()`                | None                                    | ✅ Phase C, D, E                             |
| **API Route**       | Route handler request→response contract     | Vitest + native `Request`         | None (repos mocked)                     | ✅ Added as Phase G                          |
| **Integration**     | Multiple layers + real DB (Prisma queries)  | Vitest + test PostgreSQL          | Docker, test DB, CI service containers  | ⏳ Deferred — separate task                  |
| **E2E**             | Full browser user flows                     | Playwright                        | Running server, real DB, Redis          | ⏳ §4.4 (separate issue, depends on this)    |
| **Performance**     | Throughput, latency under load              | k6, autocannon, wrk               | Production-like server, load generation | ❌ Premature — Raspberry Pi 5 at low traffic |
| **Security (SAST)** | Static code vulnerability scan              | `eslint-plugin-security`, Semgrep | None                                    | ⏳ Add to lint step in §7.2                  |
| **Security (DAST)** | Dynamic attack simulation (XSS, SQLi, etc.) | OWASP ZAP                         | Running server                          | ❌ Deferred to §7.2                          |

### Why API Route tests ARE included (Phase G)

Next.js 15 App Router route handlers are plain async functions that accept a `Request` object:

```ts
export async function GET(request: Request, { params }: RequestParams) { ... }
```

This means they can be **imported directly** in a Vitest test and called with a mock `Request` — no running server needed. By mocking the usecase layer, these tests verify:

- Correct HTTP status codes (200, 201, 400, 401, 404)
- Response shape matches what the frontend expects
- Auth guard behavior (returns 401 when no session)
- Query param parsing correctness

This is the most direct regression protection for the API contract.

### Why Integration tests (Prisma) are deferred

Integration tests that hit Prisma/PostgreSQL require:

1. A dedicated **test database** (separate from dev DB)
2. `prisma migrate reset` or transaction rollback for test isolation
3. **CI service container** (`services: postgres:` in GitHub Actions YAML) with matching schema

The value is real — they catch SQL bugs (like the MySQL-vs-PostgreSQL `CAST` issue that hit production). But setting this up is a separate infrastructure task. Attempting it here would double the scope without delivering faster value.

### Why Performance tests are not included

The production server is a **Raspberry Pi 5** at low user traffic. Performance testing at this stage is premature — the bottleneck isn't code performance but infrastructure capacity. When traffic grows, the correct tools are `k6` (scripted load scenarios) or `autocannon` (HTTP benchmarking). These run separately from the unit test suite, not in CI.

### Why Security tests are partially deferred

`npm audit` already runs (done in `feat/#262`). Static security analysis via `eslint-plugin-security` is a 15-minute add-on to the lint step — but that belongs in §7.2 (Security Headers) rather than here. Dynamic security testing (OWASP ZAP scanning for XSS/injection) requires a running application and is part of §2.3/§3.4 (XSS sanitization task).

---

## Part 0: Normal Ways to Test (Background)

Before choosing tools, it's important to understand the test layers and when to use each.

### Test Pyramid

```
        ▲
       /E2E\         → Playwright (planned in §4.4): full browser, slowest
      /──────\
     /  Integ  \     → API routes + Prisma against a real test DB
    /────────────\
   /  Unit Tests  \  ← THIS PLAN: usecases, stores, hooks (mocked deps)
  /────────────────\
```

### Layer Descriptions

| Layer           | What it tests                                             | Dependencies                         | Speed          | When to use                                           |
| --------------- | --------------------------------------------------------- | ------------------------------------ | -------------- | ----------------------------------------------------- |
| **Unit**        | Single class/function in isolation                        | All external deps mocked (`vi.fn()`) | <5ms/test      | Business logic, state transformations, pure functions |
| **Integration** | Multiple layers together (e.g., route → usecase → Prisma) | Real or test DB, may need Docker     | ~100ms–1s/test | API contract validation, DB query correctness         |
| **E2E**         | Full app in a real browser                                | Running server, real DB, Redis       | 5–30s/test     | Critical user flows (login, arena creation, etc.)     |
| **Manual**      | Developer clicks through UI                               | Everything running                   | Minutes        | Exploratory only — should not be the primary gate     |

### Why GameChu benefits most from Unit Tests (right now)

- **Usecases receive repository interfaces via constructor** — they are designed for unit testing. No infrastructure needed.
- **Zustand stores are pure state machines** — trivial to test, zero mocking.
- **Hooks use `fetch` calls** — fetch can be mocked with `vi.fn()` or MSW.
- Integration and E2E tests require a running DB/Redis, which adds CI complexity. Those come later.

### Mocking Strategies

| Scenario               | Tool                              | Example                                                 |
| ---------------------- | --------------------------------- | ------------------------------------------------------- |
| Repository interface   | `vi.fn()` on each method          | `const mockRepo = { save: vi.fn(), findById: vi.fn() }` |
| Global `fetch`         | `vi.stubGlobal('fetch', vi.fn())` | For hook tests                                          |
| Prisma client          | `vi.mock('@/lib/prisma')`         | For route integration tests                             |
| External modules       | `vi.mock('module-name')`          | For `next-auth`, `bcryptjs`, etc.                       |
| Class instance methods | `vi.spyOn(instance, 'method')`    | For `ScorePolicy` calls                                 |

---

## 1. Current State Analysis

### What exists

- No test framework, no test files, no test scripts in `package.json`
- Pre-commit hook: runs secret scan + `next build` (TypeScript errors caught, logic bugs not)
- CI (GitHub Actions): `test` job runs `echo "Test..."` — placeholder only

### Architecture properties that make testing easy

- **58 usecase classes** accept repository interfaces via constructor → pure unit-testable
- **4 Zustand stores** are stateless class-free functions → trivial to test
- **8 data-fetching hooks** use `useState + useEffect + fetch` → testable with `renderHook`
- No DI container — instantiation is manual, which means tests control all dependencies

### What makes testing harder

- `@/` path alias must be re-configured in Vitest (tsconfig aliases don't apply automatically)
- Prisma client is at `@/prisma/generated` (not `@prisma/client`) — an unusual path
- Some usecases import `next/headers` or call `getServerSession` indirectly → need to mock Next.js internals for route-level tests
- `moduleResolution: "bundler"` in tsconfig — Vitest must match this resolution mode

---

## 2. Proposed Future State

After this task:

- `npm test` runs the full test suite (Vitest)
- `npm run test:watch` for development
- `npm run test:coverage` for coverage report
- Every usecase in critical features has at least one happy-path + one error-path test
- All 4 Zustand stores have full state transition tests
- All 8 data-fetching hooks have fetch-mocked tests
- `package.json` has `lint` and `format` scripts (§4.2 — trivial, bundled here)
- CI `test` job replaced with real `npm test`

### Test file location convention

Co-located `__tests__/` directory within each feature:

```
backend/arena/application/usecase/
  CreateArenaUsecase.ts
  __tests__/
    CreateArenaUsecase.test.ts    ← PascalCase.test.ts per project convention

stores/
  AuthStore.ts
  __tests__/
    AuthStore.test.ts

hooks/
  useArenas.ts
  __tests__/
    useArenas.test.ts
```

---

## 3. Implementation Phases

### Phase A — Infrastructure Setup (Effort: S)

Install and configure the test runner. No tests written yet, just the tooling.

**Tools to install:**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

| Package                       | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `vitest`                      | Test runner (Jest-compatible API, native ESM, Vite-powered)  |
| `@vitejs/plugin-react`        | JSX transform for React component/hook tests                 |
| `@testing-library/react`      | `render`, `renderHook`, `screen`, `fireEvent`                |
| `@testing-library/user-event` | Realistic user interaction simulation                        |
| `@testing-library/jest-dom`   | Extended matchers (`toBeInTheDocument`, `toHaveValue`, etc.) |
| `jsdom`                       | Browser environment for hooks/component tests                |

**`vitest.config.ts`** (project root):

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "node", // default: pure Node for usecase/DTO tests
        environmentMatchGlobs: [
            // Must match test file paths, not source paths.
            // hooks/__tests__/* is a subdirectory of hooks/ — explicit glob prevents
            // silent breakage if test location convention changes later.
            ["hooks/__tests__/**", "jsdom"],
            ["stores/__tests__/**", "jsdom"],
        ],
        setupFiles: ["./tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "/tmp/vitest-coverage", // outside app dir — prevents HTML output in production directory on Raspberry Pi
            include: ["backend/**/usecase/*.ts", "stores/*.ts", "hooks/*.ts"],
            exclude: ["**/dto/**", "**/node_modules/**"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
```

**`tests/setup.ts`** (shared setup file):

```ts
import "@testing-library/jest-dom/vitest"; // vitest-specific import — extends Vitest's expect type namespace correctly
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup(); // unmount React trees between tests
    vi.clearAllMocks(); // reset mock call counts
    vi.unstubAllGlobals(); // restore vi.stubGlobal("fetch", ...) — clearAllMocks does NOT do this
});
```

**`package.json` scripts additions:**

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"lint": "eslint .",
"format": "prettier --write ."
```

> Note: `lint` and `format` scripts are also added here (§4.2 — 15 min effort, bundled into this task).

---

### Phase B — Test Utility Helpers (Effort: S)

Create shared mock factories so tests don't repeat boilerplate.

**`tests/mocks/MockArenaRepository.ts`**:

```ts
import { vi } from "vitest";
import type { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

export function createMockArenaRepository(): ArenaRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        getArenaById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        updateChallengerAndStatus: vi.fn(),
        deleteById: vi.fn(),
    };
}
```

> One mock factory per repository interface. Pattern is identical across all features — copy + adjust method list.

---

### Phase C — Usecase Unit Tests (Effort: M)

Target the 15 highest-value usecases first. Remaining ~43 can be added incrementally as features are touched.

**Priority order:**

| Feature        | Usecases                                                                           | Why first                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `member`       | `LoginUsecase`, `SignUpUsecase`, `EmailCheckUsecase`                               | Auth is the entry gate — bugs here affect all users                                                                                                      |
| `arena`        | `CreateArenaUsecase`, `EndArenaUsecase`, `UpdateArenaStatusUsecase`                | Core game loop; `EndArenaUsecase` applies score policies (not `updateStatus` — that's `UpdateArenaStatusUsecase`); status transitions have complex rules |
| `score-policy` | `ApplyArenaScoreUsecase`, `ApplyReviewScoreUsecase`, `ApplyAttendanceScoreUsecase` | Score calculation involves delta math — regression-prone                                                                                                 |
| `review`       | `CreateReviewUsecase`, `UpdateReviewUsecase`, `DeleteReviewUsecase`                | Has known XSS issue (§2.3) — tests will catch sanitization correctness once added                                                                        |
| `vote`         | `CreateVoteUsecase`, `UpdateVoteUsecase`                                           | Vote logic tied to arena state                                                                                                                           |

**Test structure per usecase (example: `CreateArenaUsecase`):**

```ts
describe("CreateArenaUsecase", () => {
    let mockRepo: ReturnType<typeof createMockArenaRepository>;
    let usecase: CreateArenaUsecase;

    beforeEach(() => {
        mockRepo = createMockArenaRepository();
        usecase = new CreateArenaUsecase(mockRepo);
    });

    it("saves arena with status=1 and null challengerId", async () => {
        const dto = new CreateArenaDto("member-1", "Title", "Desc", new Date());
        const fakeArena = { id: 1, ...dto, status: 1, challengerId: null };
        vi.mocked(mockRepo.save).mockResolvedValue(fakeArena as any);

        const result = await usecase.execute(dto);

        expect(mockRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({ status: 1, challengerId: null })
        );
        expect(result.status).toBe(1);
    });

    it("propagates repository errors", async () => {
        vi.mocked(mockRepo.save).mockRejectedValue(new Error("DB error"));
        const dto = new CreateArenaDto("member-1", "Title", "Desc", new Date());

        await expect(usecase.execute(dto)).rejects.toThrow("DB error");
    });
});
```

**Score usecase test pattern (SpyOn ScorePolicy):**

```ts
it("increments member score by correct delta", async () => {
    const fakePolicy = {
        calculateDeltaForArena: vi.fn().mockReturnValue(50),
        getPolicyIdByArenaResult: vi.fn().mockReturnValue(5), // returns number (4/5/6/7), not a string
    };
    const mockMemberRepo = { incrementScore: vi.fn() };
    const mockScoreRecordRepo = { createRecord: vi.fn() };

    const usecase = new ApplyArenaScoreUsecase(
        fakePolicy as any,
        mockMemberRepo,
        mockScoreRecordRepo
    );
    await usecase.execute({ memberId: "m1", result: "win" });

    expect(mockMemberRepo.incrementScore).toHaveBeenCalledWith("m1", 50);
    expect(mockScoreRecordRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ memberId: "m1", actualScore: 50 })
    );
});
```

---

### Phase D — Zustand Store Tests (Effort: S)

All 4 stores are pure state machines — no mocking needed.

```ts
// AuthStore.test.ts
import { act, renderHook } from "@testing-library/react";
import { useAuthStore } from "@/stores/AuthStore";

describe("AuthStore", () => {
    beforeEach(() => useAuthStore.setState({ user: null }));

    it("sets user", () => {
        const { result } = renderHook(() => useAuthStore());
        act(() => result.current.setUser({ id: "u1" }));
        expect(result.current.user).toEqual({ id: "u1" });
    });

    it("clears user", () => {
        useAuthStore.setState({ user: { id: "u1" } });
        const { result } = renderHook(() => useAuthStore());
        act(() => result.current.clearUser());
        expect(result.current.user).toBeNull();
    });
});
```

Stores to cover: `AuthStore`, `loadingStore`, `modalStore`, `useArenaStore`.

---

### Phase E — Hook Tests (Effort: M)

Hooks use `fetch` — mock it with `vi.stubGlobal`.

```ts
// useArenas.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import useFetchArenas from "@/hooks/useArenas";

describe("useFetchArenas", () => {
    it("returns arenaListDto on success", async () => {
        const mockData = { arenas: [], currentPage: 1, pages: [1], endPage: 1 };
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockData),
            })
        );

        const { result } = renderHook(() =>
            useFetchArenas({ status: 1, mine: false, pageSize: 10 })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.arenaListDto).toEqual(mockData);
    });

    it("sets error on fetch failure", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(new Error("Network error"))
        );
        const { result } = renderHook(() =>
            useFetchArenas({ status: 1, mine: false, pageSize: 10 })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeInstanceOf(Error);
    });
});
```

Hooks to cover: `useArenas`, `useArenaList`, `useVote`, `useVoteList`, `useArenaAutoStatus`, `useArenaAutoStatusDetail`.

> **Note**: Socket hooks (`useArenaSocket`, `useArenaChatManagement`) require `socket.io-client` mocking — defer to a later task.

> **Note**: `useArenaAutoStatus` and `useArenaAutoStatusDetail` use `setTimeout` with dynamic `dayjs` UTC delays and make fetch calls inside timer callbacks — not directly in the effect. The simple `waitFor` pattern above does not apply. These tests require `vi.useFakeTimers()` before render and `vi.advanceTimersByTime()` to trigger callbacks. Mock `fetch` before advancing time, then assert calls. Restore with `vi.useRealTimers()` in `afterEach`.

---

### Phase G — API Route Tests (Effort: M)

These are **not integration tests** — they mock the usecase layer, so no DB is needed. They test the HTTP boundary: parsing, auth, status codes, and response shape.

**Pattern: import handler + call with mock `Request`**

```ts
// app/api/arenas/route.test.ts
import { GET } from "@/app/api/arenas/route";
import { vi } from "vitest";

// Mock the usecase — no Prisma, no DB
vi.mock("@/backend/arena/application/usecase/GetArenaUsecase", () => ({
    GetArenaUsecase: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue({
            arenas: [],
            currentPage: 1,
            pages: [1],
            endPage: 1,
        }),
    })),
}));

describe("GET /api/arenas", () => {
    it("returns 200 with arena list", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=10&status=1"
        );
        const response = await GET(request);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("arenas");
    });

    it("returns pageSize=10 default when not provided", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&status=1"
        );
        const response = await GET(request);
        // Verifies §2.2 fix: pageSize should not default to 0
        expect(response.status).toBe(200);
    });
});
```

**Routes to cover in Phase G:**

| Route                                     | Tests                                  | Why                                                                                                                                                       |
| ----------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/arenas`                         | pageSize default, status filter        | Covers known §2.2 bug                                                                                                                                     |
| `POST /api/auth/signup`                   | 201 on success, 400 on duplicate email | Abuse vector §7.1                                                                                                                                         |
| `GET /api/games`                          | 200, returns games array               | Most-fetched endpoint — **requires `vi.mock("@/lib/redis", ...)` before handler import** (top-level Redis import causes ECONNREFUSED)                     |
| `POST /api/member/arenas`                 | 401 without auth, 201 with auth        | Auth guard                                                                                                                                                |
| `DELETE /api/member/arenas/[id]`          | 401 without auth, 401 on wrong owner   | Ownership check — handler returns 401 for both cases (single combined condition)                                                                          |
| `POST /api/member/games/[gameId]/reviews` | 400 on missing fields, 201 on valid    | Validation gate — **prerequisite: refactor route to move repo/usecase instantiation inside handler** (currently module-scope, vi.mock() cannot intercept) |

**Important**: These tests require mocking `getServerSession` from `next-auth/next`:

```ts
vi.mock("next-auth/next", () => ({
    getServerSession: vi
        .fn()
        .mockResolvedValue({ user: { id: "test-user-id" } }),
}));
```

And for unauth tests:

```ts
vi.mocked(getServerSession).mockResolvedValueOnce(null);
```

**Note on Next.js internals**: Some routes call `getAuthUserId()` from `utils/GetAuthUserId.server.ts`, which wraps `getServerSession`. Mock that utility directly:

```ts
vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));
```

---

### Phase F — CI Integration (Effort: S)

Update `.github/workflows/deploy-on-ubuntu-server.yml` to replace the placeholder `test` job:

```yaml
test:
    needs: build
    runs-on: [self-hosted, gamechu-server]
    steps:
        - name: Run tests
          run: |
              cd ~/www/gamechu
              npm test
```

Update `deploy` job to depend on `[build, test]`:

```yaml
deploy:
    needs: [build, test]
```

> This is §7.5.2 from MASTER_PLAN — small, done here since it depends on §4.1.

---

## 4. Risk Assessment

### Convention Drift

| Item                                   | Severity     | Note                                                                                                                  |
| -------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `__tests__/` folder naming             | **Low**      | Project uses kebab-case for folders; `__tests__` is an accepted framework convention (like `.next/`, `node_modules/`) |
| Test file naming: `PascalCase.test.ts` | ✅ Compliant | Follows project PascalCase file convention                                                                            |
| `vitest.config.ts` naming              | ✅ Compliant | Framework file exception (like `next.config.ts`)                                                                      |
| `tests/setup.ts` (root level)          | **Low**      | Lowercase exception — `tests/` is a root-level dev infrastructure folder, consistent with `prisma/`, `docs/`          |

**Overall**: Convention check passed — no breaking drift detected.

### Technical Risks

| Risk                                                                | Mitigation                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `@/` alias not resolved in Vitest                                   | `resolve.alias` in `vitest.config.ts` maps `@` → project root                                                 |
| Prisma generated client at `@/prisma/generated` (non-standard path) | Usecases don't import Prisma directly — repos do. Usecase tests mock repos, so no Prisma import in test files |
| `next/headers`, `next-auth` imports in tested files                 | Only occurs in API route layer (not targeted in Phase C-E). Route tests deferred to integration testing phase |
| Zustand `create` uses browser store internals                       | `jsdom` environment + `useAuthStore.setState()` reset pattern handles this cleanly                            |
| `moduleResolution: "bundler"` in tsconfig                           | Vitest uses Vite's resolver which is compatible with bundler resolution                                       |
| `GET /api/games` imports Redis at module scope                      | Must `vi.mock("@/lib/redis", ...)` in G3 test file before importing handler                                   |
| `reviews/route.ts` instantiates usecase at module scope             | Refactor route before writing G6: move instantiation inside `POST` handler                                    |
| `useArenaAutoStatus` uses `setTimeout` with dayjs delays            | Requires `vi.useFakeTimers()` + `vi.advanceTimersByTime()` — not the simple `waitFor` pattern                 |
| Coverage HTML output written to production directory                | `reportsDirectory: "/tmp/vitest-coverage"` in config keeps output out of `~/www/gamechu`                      |
| Tests run in production environment with live `DATABASE_URL`        | All Phase G tests MUST mock all repository classes — any forgotten mock hits production DB                    |

---

## 5. Success Metrics

| Metric                                                       | Target                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `npm test` exits 0                                           | ✅ Required                                                              |
| Test count                                                   | ≥ 55 tests (15 usecases × 2 + 4 stores × 2 + 6 hooks × 2 + 6 routes × 2) |
| Coverage on `backend/**/usecase/*.ts`                        | ≥ 60% line coverage (initial)                                            |
| Coverage on `app/api/` route handlers                        | ≥ 40% (Phase G routes only)                                              |
| CI `test` job                                                | Runs real tests, not `echo`                                              |
| No manual click-through needed for usecase/route regressions | ✅                                                                       |

---

## 6. Out of Scope (Deferred)

| Item                                                           | Deferred To                                 | Reason                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Integration tests (Prisma + real PostgreSQL)                   | Future task — needs test DB infrastructure  | Requires Docker, CI service containers, test DB provisioning                             |
| Socket hook tests (`useArenaSocket`, `useArenaChatManagement`) | Future task                                 | Complex `socket.io-client` mock setup                                                    |
| Playwright E2E tests                                           | §4.4 (separate issue, depends on this task) | Requires running server, DB, Redis                                                       |
| Component render tests (GameCard, ArenaCard, etc.)             | After accessibility pass §5.2               | Component API is likely to change during §5.2 a11y refactor                              |
| Performance tests (load/throughput)                            | When traffic warrants it                    | Premature at current Raspberry Pi 5 scale; tools are k6/autocannon, separate from Vitest |
| Security SAST (`eslint-plugin-security`)                       | §7.2 Security Headers task                  | Belongs in lint pipeline, not test suite                                                 |
| Security DAST (OWASP ZAP)                                      | §2.3/§3.4 XSS Sanitization task             | Requires running application + attack surface knowledge                                  |

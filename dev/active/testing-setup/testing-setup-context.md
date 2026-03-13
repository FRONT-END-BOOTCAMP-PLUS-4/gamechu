# Testing Setup — Context

> Last Updated: 2026-03-14

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

## Key Architecture Facts for Testing

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
// Reset between tests:
useAuthStore.setState({ user: null })
```

### Hooks use raw fetch
```ts
// All 8 hooks follow this pattern:
const res = await fetch(`/api/...`)
```
→ Mock with `vi.stubGlobal("fetch", vi.fn())`

---

## Critical Paths

| File | Role |
|------|------|
| `vitest.config.ts` | Test runner config (root) |
| `tests/setup.ts` | Global test setup (jest-dom + cleanup) |
| `tests/mocks/` | Shared mock factory functions |
| `backend/**/usecase/__tests__/*.test.ts` | Usecase unit tests |
| `stores/__tests__/*.test.ts` | Zustand store tests |
| `hooks/__tests__/*.test.ts` | Hook tests |

---

## Vitest Config Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Test runner | Vitest (not Jest) | Native ESM, Vite-compatible, faster, works with Next.js 15 |
| Default environment | `node` | Usecases are pure Node — no browser APIs needed |
| Hook/store environment | `jsdom` via `environmentMatchGlobs: ["hooks/__tests__/**", "stores/__tests__/**"]` | React hooks + Zustand need browser globals — globs match test file paths, must be explicit subdirectory paths |
| `@/` alias | Manually set in `resolve.alias` | tsconfig aliases not auto-applied by Vitest |
| React plugin | `@vitejs/plugin-react` | JSX transform for `@testing-library/react` |
| Coverage provider | `v8` | Built into Node, no extra install |

---

## Packages to Install

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Do NOT install `@types/testing-library__jest-dom` — deprecated, ships type conflicts. Use `import "@testing-library/jest-dom/vitest"` in `tests/setup.ts` (not the plain `/jest-dom` import) to correctly extend Vitest's `expect` type namespace.

---

## Usecase Target List (Phase C)

Priority 1 — Auth (3):
- `backend/member/application/usecase/LoginUsecase.ts`
- `backend/member/application/usecase/SignUpUsecase.ts`
- `backend/member/application/usecase/EmailCheckUsecase.ts`

Priority 2 — Arena (3):
- `backend/arena/application/usecase/CreateArenaUsecase.ts`
- `backend/arena/application/usecase/EndArenaUsecase.ts`
- `backend/arena/application/usecase/UpdateArenaStatusUsecase.ts`

Priority 3 — Score (3):
- `backend/score-policy/application/usecase/ApplyArenaScoreUsecase.ts`
- `backend/score-policy/application/usecase/ApplyReviewScoreUsecase.ts`
- `backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase.ts`

Priority 4 — Review + Vote (5):
- `backend/review/application/usecase/CreateReviewUsecase.ts`
- `backend/review/application/usecase/UpdateReviewUsecase.ts`
- `backend/review/application/usecase/DeleteReviewUsecase.ts`
- `backend/vote/application/usecase/CreateVoteUsecase.ts`
- `backend/vote/application/usecase/UpdateVoteUsecase.ts`

---

## Store Target List (Phase D)

- `stores/AuthStore.ts` → 2 actions: `setUser`, `clearUser`
- `stores/loadingStore.ts`
- `stores/modalStore.ts`
- `stores/useArenaStore.ts` → 2 actions: `setArenaData`, `clearArenaData`

---

## Hook Target List (Phase E)

- `hooks/useArenas.ts` — main arena list fetch
- `hooks/useArenaList.ts` — profile arena list fetch
- `hooks/useVote.ts` — single vote fetch
- `hooks/useVoteList.ts` — vote list fetch
- `hooks/useArenaAutoStatus.ts` — status auto-update
- `hooks/useArenaAutoStatusDetail.ts` — detail auto-update

Deferred:
- `hooks/useArenaSocket.ts` — requires socket.io-client mock
- `hooks/useArenaChatManagement.ts` — requires socket.io-client mock

---

## Dependencies

- No dependencies on other open tasks
- §7.5.2 (CI test integration) depends on THIS task completing
- §4.4 (E2E Playwright) depends on THIS task completing

---

## API Route Test Target List (Phase G)

These tests import handlers directly and pass a native `Request` object — no running server needed.
The usecase layer is mocked via `vi.mock()`.

Key mock needed in all route tests:
```ts
vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}))
```

Routes:
- `app/api/arenas/route.ts` — GET (includes §2.2 pageSize=0 regression check)
- `app/api/auth/signup/route.ts` — POST
- `app/api/games/route.ts` — GET
- `app/api/member/arenas/route.ts` — POST (auth required)
- `app/api/member/arenas/[id]/route.ts` — DELETE (ownership check)
- `app/api/member/games/[gameId]/reviews/route.ts` — POST (validation)

## Test Type Decision Summary

| Type | In this task? | Reason |
|------|-------------|--------|
| Unit (usecase, store, hook) | ✅ Phase C/D/E | Pure logic, no infra needed |
| API Route (mocked usecase) | ✅ Phase G | `Request` object importable, no server |
| Integration (Prisma + real DB) | ❌ Deferred | Needs test DB, Docker, CI service containers |
| E2E (Playwright) | ❌ §4.4 | Depends on this task completing |
| Performance (k6) | ❌ Premature | Low traffic, wrong tool for this task |
| Security SAST | ❌ §7.2 | Belongs in lint step |
| Security DAST | ❌ §2.3 | Needs running server |

## Prisma Path Note

Project uses `@/prisma/generated` (not `@prisma/client`). Usecases do NOT import Prisma directly — they use repository interfaces. Therefore, **no Prisma mocking is needed for Phase C usecase tests**. Prisma mocking becomes relevant only for integration tests (API route layer) — deferred.

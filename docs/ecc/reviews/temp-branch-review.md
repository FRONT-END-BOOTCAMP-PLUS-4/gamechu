# Branch Review: temp → dev

**Reviewed**: 2026-04-10  
**Branch**: temp  
**Base**: dev  
**Decision**: APPROVE with comments

---

## Summary

The temp branch delivers a well-scoped set of improvements across four areas: (1) security hardening of arena auth/authz, (2) server-side timer migration with `ArenaTimerRecovery`, (3) removal of the client-side `useArenaAutoStatus` / `useArenaAutoStatusDetail` hooks in favour of TanStack Query `refetchInterval`, and (4) convention cleanup (file renames to PascalCase, `errorResponse` unification, CSP enforcement). All 311 tests pass, ESLint reports 0 errors (3 pre-existing warnings).

---

## Findings

### CRITICAL

None.

### HIGH

None.

### MEDIUM

**M-1 — `/api/member/arenas/[id]/join` has no test file**  
`app/api/member/arenas/[id]/join/route.ts` is new and security-sensitive (score check, self-join guard, session-bound challengerId). Every other member arena route has a co-located `__tests__/route.test.ts`. This one does not.  
→ Add `app/api/member/arenas/[id]/join/__tests__/route.test.ts` covering at minimum: 401 (no auth), 403 (creator joining own arena), 403 (score < 100), 409 (already occupied), 200 (happy path).

**M-2 — `recoverPendingArenaTimers` uses hardcoded `pageSize: 10_000`**  
`lib/ArenaTimerRecovery.ts:28` — If the arena table grows past 10 000 active rows, recovery silently truncates.  
→ Either remove the limit (pass `Number.MAX_SAFE_INTEGER`) or use cursor-based pagination.

**M-3 — `scheduleArenaTransitions` does not guard against duplicate timers**  
If `scheduleArenaTransitions(arena)` is called twice for the same arena (e.g., once on server startup and again from the join route), two overlapping `setTimeout` chains will fire. The `transitionArena` function's idempotency check mitigates data corruption but still causes redundant DB writes.  
→ Track in-flight timers with a `Map<number, NodeJS.Timeout>` and skip scheduling if one already exists for the given arenaId.

### LOW

**L-1 — `export type { ArenasQueryParams }` removed from `hooks/useArenas.ts`**  
The re-export was removed without checking consumers. Currently no files import `ArenasQueryParams` from this path (they use `@/lib/QueryKeys` directly), so no breakage today — but the removal is a silent API surface change worth noting in a PR description.

**L-2 — 3 pre-existing ESLint warnings not fixed**  
`hooks/useArenaChatManagement.ts:102,183` and `app/(base)/games/components/GameFilterWrapper.tsx:31` have `react-hooks/exhaustive-deps` warnings. These are pre-existing but would be good to resolve before merging to `dev`.

**L-3 — `setTimeout` for 24 h+ timers can drift under load**  
`lib/ArenaTimerRecovery.ts:54` — Node.js `setTimeout` may fire late under event-loop pressure. For a 24 h vote window this is unlikely to cause visible issues, and the idempotency check at line 71-78 prevents double transitions. Acceptable for current scale; worth revisiting if arena usage grows.

---

## Validation Results

| Check                 | Result                                       |
| --------------------- | -------------------------------------------- |
| Tests (`npm test`)    | **Pass** — 311 tests, 73 files               |
| Lint (`npm run lint`) | **Pass** — 0 errors, 3 pre-existing warnings |
| Build                 | Not run (pre-commit hook handles this)       |

---

## Positive Highlights

- **Auth/authz split** in `PATCH` and `DELETE` handlers: unauthenticated → 401, authenticated but unauthorised → 403. Correct HTTP semantics and now covered by tests.
- **`challengerId` removed from `UpdateArenaSchema`**: eliminates the IDOR where a user could set their own challengerId through the member PATCH route. The dedicated `/join` route now controls this exclusively via session.
- **CSP enforcement**: `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `next.config.ts`. Policies are now enforced, not just reported.
- **`useArenaAutoStatus` / `useArenaAutoStatusDetail` removed**: client-side status transitions are gone. Status is now driven server-side by `ArenaTimerRecovery` and reflected to the UI via `refetchInterval: 30_000` in TanStack Query — the correct architecture.
- **New tests added**: `PATCH by non-owner returns 403`, `DELETE by non-owner returns 403`, refetchInterval behaviour (positive and negative cases).
- **`console.*` cleanup**: all `console.log`/`console.error` calls removed from components and hooks; replaced by proper `logger` usage in API routes.

---

## Files Reviewed

| File                                                      | Change                                               |
| --------------------------------------------------------- | ---------------------------------------------------- |
| `lib/ArenaTimerRecovery.ts`                               | Added                                                |
| `instrumentation.ts`                                      | Added                                                |
| `app/api/member/arenas/[id]/join/route.ts`                | Added                                                |
| `app/api/member/arenas/[id]/route.ts`                     | Modified — auth/authz fix                            |
| `app/api/arenas/[id]/route.ts`                            | Modified — removed unauthenticated PATCH/DELETE      |
| `app/api/member/arenas/[id]/votes/route.ts`               | Modified — errorResponse, logger                     |
| `app/api/member/arenas/[id]/chattings/route.ts`           | Modified — errorResponse                             |
| `backend/arena/application/usecase/dto/UpdateArenaDto.ts` | Modified — `challengerId` removed from member schema |
| `hooks/useArenas.ts`                                      | Modified — `refetchInterval` option added            |
| `hooks/useArenaAutoStatus.ts`                             | Deleted                                              |
| `hooks/useArenaAutoStatusDetail.ts`                       | Deleted                                              |
| `hooks/__tests__/useArenas.test.ts`                       | Modified — refetchInterval tests added               |
| `hooks/__tests__/useArenaAutoStatus.test.ts`              | Deleted                                              |
| `hooks/__tests__/useArenaAutoStatusDetail.test.ts`        | Deleted                                              |
| `app/(base)/arenas/[id]/page.tsx`                         | Modified — TanStack Query + useMemo                  |
| `app/(base)/arenas/components/WaitingArenaSection.tsx`    | Modified — hook removal, refetchInterval             |
| `next.config.ts`                                          | Modified — CSP enforcement                           |
| `app/api/member/arenas/[id]/__tests__/route.test.ts`      | Modified — 403 assertions                            |

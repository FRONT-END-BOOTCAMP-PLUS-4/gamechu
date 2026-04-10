# Security Fixes Implementation Review

**Reviewed**: 2026-04-10
**Plan**: `docs/ecc/plans/security-fixes.md`
**Branch**: `temp`
**Decision**: REQUEST CHANGES

## Summary

All 10 issues from the security plan are addressed. The architecture change (CRITICAL-3: server-side timers via `instrumentation.ts` + `ArenaTimerRecovery.ts`) is the most significant piece and is implemented correctly. However, one HIGH bug causes a live test-suite failure, one HIGH logic bug creates a timer race condition that can silently delete a challenger-joined arena, and a MEDIUM issue re-opens a partial authorization gap in the PATCH route.

---

## Findings

### HIGH

#### H-1: Stale import path — profile route fails at runtime

**File:** `app/api/member/profile/[nickname]/route.ts:3`

```ts
// BROKEN — file no longer exists at this path
import { GetMemberPublicProfileUsecase } from "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase";
```

`GetMemberProfileByNicknameUsecase.ts` was renamed to `GetMemberPublicProfileUsecase.ts` but the import still points to the old path. This causes `ERR_MODULE_NOT_FOUND` at runtime — the `GET /api/member/profile/[nickname]` endpoint throws on every request. The test suite confirms this: 1 suite currently fails with this exact error.

**Fix — update the import path:**

```ts
import { GetMemberPublicProfileUsecase } from "@/backend/member/application/usecase/GetMemberPublicProfileUsecase";
```

---

#### H-2: Stale vi.mock path in test — test is mocking a module that does not exist

**File:** `app/api/member/profile/[nickname]/__tests__/route.test.ts:21`

```ts
vi.mock(
    "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase",  // ← old path
    () => ({
        GetMemberProfileByNicknameUsecase: vi.fn(function (...) { ... }), // ← old class name
    })
);
```

After the rename the mock target does not exist. The test should mock the new path and export the new class name:

```ts
vi.mock(
    "@/backend/member/application/usecase/GetMemberPublicProfileUsecase",
    () => ({
        GetMemberPublicProfileUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue(null);
        }),
    })
);
```

The inline import inside the second test case must be updated to match as well.

---

#### H-3: Delete-timer race condition — joined arena can be silently deleted

**File:** `lib/ArenaTimerRecovery.ts:57`

On server startup, `recoverPendingArenaTimers()` schedules a `delete` timer for every status=1 arena with no challenger (line 57). A user can join that arena after startup — the join route sets status to 2 — but the `delete` timer already registered in `setTimeout` is not cancelled. When it fires at `startDate`, `DeleteArenaUsecase.execute(arenaId)` runs unconditionally against an arena now at status=2, potentially deleting an active, challenger-joined arena and silently discarding any subsequent score settlement.

**Fix:** `transitionArena` must re-fetch and guard current arena state before acting:

```ts
async function transitionArena(arenaId: number, newStatus: ArenaStatus | "delete") {
    try {
        const arenaRepo = new PrismaArenaRepository();
        const current = await arenaRepo.findById(arenaId);
        if (!current) return; // already deleted

        if (newStatus === "delete") {
            // Only delete if still recruiting (status=1) with no challenger
            if (current.status !== 1 || current.challengerId) {
                log.info({ arenaId }, "delete 타이머 취소: 이미 참가자 있음");
                return;
            }
            await new DeleteArenaUsecase(arenaRepo).execute(arenaId);
        } else {
            // Only advance if still at the expected predecessor status
            if (current.status >= newStatus) {
                log.info({ arenaId, currentStatus: current.status, newStatus }, "상태 전환 건너뜀: 이미 진행됨");
                return;
            }
            // ... rest of status transition
        }
    }
}
```

---

### MEDIUM

#### M-1: PATCH /api/member/arenas/[id] still accepts `challengerId` in body

**File:** `app/api/member/arenas/[id]/route.ts:61–66`

```ts
const updateArenaDto: UpdateArenaDto = {
    id: arenaId,
    challengerId: validated.data.challengerId,  // ← arena creator can inject any memberId
    description: validated.data.description,
    startDate: ...,
};
```

The ownership check (CRITICAL-2) now correctly blocks non-participants. But `arena.creatorId === memberId` satisfies the check, so the creator can still `PATCH { challengerId: "any-uuid" }` to bypass the join flow (score-100 check, self-join block, slot-taken check). The dedicated `POST /api/member/arenas/[id]/join` exists precisely to own those validations — the PATCH route should not also be able to set `challengerId`.

**Fix:** Strip `challengerId` from `UpdateArenaDto` in the PATCH handler (or remove it from `UpdateArenaSchema`):

```ts
const updateArenaDto: UpdateArenaDto = {
    id: arenaId,
    // challengerId intentionally excluded — use POST .../join
    description: validated.data.description,
    startDate: validated.data.startDate
        ? new Date(validated.data.startDate)
        : undefined,
};
```

---

#### M-2: PATCH test lacks an ownership-violation case

**File:** `app/api/member/arenas/[id]/__tests__/route.test.ts`

The test suite covers 401 (no auth) and 200 (owner), but there is no test asserting that a non-owner authenticated caller receives 403. Given that ownership check is the core of CRITICAL-2, this case should be explicitly tested to prevent regression.

**Fix — add test:**

```ts
it("PATCH by non-owner returns 403", async () => {
    const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
    vi.mocked(getAuthUserId).mockResolvedValueOnce("non-owner-id");

    const req = new Request("http://localhost/api/member/arenas/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "unauthorized" }),
    });
    const response = await PATCH(req, { params });
    expect(response.status).toBe(403);
});
```

---

### LOW

#### L-1: Dead interface props on `useArenaAutoStatus`

**File:** `hooks/useArenaAutoStatus.ts:6–8`

The hook now ignores both `arenaList` and `onStatusUpdate` props (correctly, since transitions are server-side). The `_props` naming + eslint suppression comment communicate this, but consumers still have to pass `{ arenaList: [...] }`. Consider removing the props from the public interface entirely or marking the parameter as optional (`_props?: Props`) to avoid confusion at call sites.

---

## Validation Results

| Check      | Result                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| Tests      | **FAIL** — 1 suite fails (`profile/[nickname]/__tests__/route.test.ts`) due to H-1/H-2 |
| Type check | Not run (blocked by test failure)                                                      |
| Lint       | Not run                                                                                |
| Build      | Not run — H-1 would cause build failure at `profile/[nickname]/route.ts`               |

---

## Plan Coverage

| Issue                                                  | Status  | Note                                                                               |
| ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------- |
| CRITICAL-1: Password in profile DTO                    | ✅ Done | `MemberProfileResponseDto` and usecase clean                                       |
| CRITICAL-2: Arena PATCH ownership check                | ✅ Done | 401/403 split correct — see M-1 for partial gap                                    |
| CRITICAL-3: Admin endpoints unauthenticated            | ✅ Done | `instrumentation.ts` + `ArenaTimerRecovery.ts` + join route + hooks converted      |
| HIGH-1: IDOR wishlist delete                           | ✅ Done | Route uses `gameId`; hook calls `DELETE /wishlists/${gameId}`                      |
| HIGH-2: Score POST ignored validated body              | ✅ Done | POST handler removed entirely                                                      |
| HIGH-3: Unauthenticated notification creation          | ✅ Done | `notification-records/route.ts` deleted                                            |
| HIGH-4: IP spoofing bypasses rate limiter              | ✅ Done | Option C (last XFF entry)                                                          |
| HIGH-5: CSP in report-only mode                        | ✅ Done | Header key changed to `Content-Security-Policy`                                    |
| MEDIUM-1: Unvalidated imageUrl domain                  | ✅ Done | Allow-list in `UpdateProfileRequestDto.ts` matches `next.config.ts` remotePatterns |
| MEDIUM-2: No rate limiting on score-mutating endpoints | ✅ Done | `review-likes` has per-user 30/min limiter                                         |

---

## Files Reviewed

| File                                                                  | Change                                                          |
| --------------------------------------------------------------------- | --------------------------------------------------------------- |
| `app/(base)/arenas/[id]/components/ArenaDetailRecruiting.tsx`         | Modified — calls new join endpoint                              |
| `app/api/arenas/[id]/route.ts`                                        | Modified — PATCH/DELETE handlers deleted, GET kept              |
| `app/api/arenas/[id]/__tests__/route.test.ts`                         | Modified — updated for GET-only route                           |
| `app/api/member/arenas/[id]/route.ts`                                 | Modified — ownership check added                                |
| `app/api/member/arenas/[id]/__tests__/route.test.ts`                  | Modified — expanded test coverage                               |
| `app/api/member/arenas/[id]/join/route.ts`                            | **Added** — dedicated join endpoint                             |
| `app/api/member/profile/[nickname]/route.ts`                          | Modified — **stale import path (H-1)**                          |
| `app/api/member/profile/[nickname]/__tests__/route.test.ts`           | Modified — **stale mock path (H-2)**                            |
| `app/api/member/review-likes/[reviewId]/route.ts`                     | Modified — rate limiter added                                   |
| `app/api/member/scores/route.ts`                                      | Modified — POST handler removed                                 |
| `app/api/member/wishlists/[id]/route.ts`                              | Modified — uses gameId, ownership scoped                        |
| `app/api/notification-records/route.ts`                               | **Deleted**                                                     |
| `backend/member/application/usecase/GetMemberProfileUsecase.ts`       | Modified — password removed                                     |
| `backend/member/application/usecase/GetMemberPublicProfileUsecase.ts` | Modified (renamed from `GetMemberProfileByNicknameUsecase.ts`)  |
| `backend/member/application/usecase/dto/GetMemberPublicProfileDto.ts` | Modified (renamed from `MemberProfileByNicknameResponseDto.ts`) |
| `backend/member/application/usecase/dto/MemberProfileResponseDto.ts`  | Modified — password field removed                               |
| `backend/member/application/usecase/dto/UpdateProfileRequestDto.ts`   | Modified — imageUrl allow-list added                            |
| `hooks/useArenaAutoStatus.ts`                                         | Modified — UI-only polling, no PATCH calls                      |
| `hooks/useArenaAutoStatusDetail.ts`                                   | Modified — UI-only polling                                      |
| `hooks/useWishlist.ts`                                                | Modified — DELETE URL uses gameId                               |
| `hooks/__tests__/useArenaAutoStatus.test.ts`                          | Modified                                                        |
| `hooks/__tests__/useArenaAutoStatusDetail.test.ts`                    | Modified                                                        |
| `hooks/__tests__/useWishlist.test.ts`                                 | Modified                                                        |
| `instrumentation.ts`                                                  | **Added** — server startup hook                                 |
| `lib/ArenaTimerRecovery.ts`                                           | **Added** — timer scheduling and recovery                       |
| `lib/RateLimiter.ts`                                                  | Modified — IP detection uses last XFF entry                     |
| `next.config.ts`                                                      | Modified — CSP enforced                                         |

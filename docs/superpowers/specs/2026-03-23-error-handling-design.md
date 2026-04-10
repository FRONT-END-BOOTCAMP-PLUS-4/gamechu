# Error Handling Standardization — Design Spec

> **MASTER_PLAN**: §3.2a (Error Response Utilities) + §3.2b (Module-level Instantiation Cleanup)
> **Date**: 2026-03-23
> **Branch pattern**: `refactor/#[issue]`
> **Depends on**: Nothing (independent)
> **Blocks**: §6.3 `withApiHandler` (this PR lays the foundation)

---

## Problem

37 API routes have three overlapping issues:

1. **Inconsistent error response shape** — project mandates `{ message }` (CLAUDE.md) but `{ error }` appears in `attend/route.ts`, `notification-records/[id]/route.ts`, and `arenas/[id]/route.ts`
2. **Missing try-catch** — `games/[id]/reviews/route.ts`, `attend/route.ts`, `profile/[nickname]/route.ts`, `reviews/member/route.ts` have no error handling; unhandled rejections crash the endpoint silently
3. **Module-level repo/usecase instantiation** — 8+ route files instantiate repos at module scope, holding stale Prisma connections across requests

No shared error utility exists. Each route hand-rolls its own catch block with varying format.

---

## Decision

**Option A — Simple response helpers** (chosen over typed error classes).

Typed error classes (`NotFoundError`, `ValidationError`) provide the most value when a central `withApiHandler` catches them automatically. Without that wrapper, each route still needs its own catch block, so typed errors add boilerplate with little gain. They belong in §6.3. For now, two pure functions fix the immediate problems cleanly and serve as the foundation `withApiHandler` will build on.

---

## New File

### `utils/apiResponse.ts`

```typescript
import { NextResponse } from "next/server";

export const errorResponse = (message: string, status: number) =>
    NextResponse.json({ message }, { status });

export const successResponse = <T>(data: T, status = 200) =>
    NextResponse.json(data, { status });
```

Two functions. The `{ message }` shape is mechanically enforced — callers cannot accidentally pass `{ error }`.

---

## Standard Route Pattern

Every handler follows this order, no variation:

```typescript
type RequestParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RequestParams) {
    try {
        // 1. Auth guard
        const memberId = await getAuthUserId();
        if (!memberId) return errorResponse("Unauthorized", 401);

        // 2. Param validation (using existing validate() + IdSchema)
        const { id: rawId } = await params;
        const id = validate(IdSchema, rawId);
        if (!id.success) return id.response;

        // 3. Per-request instantiation
        const repo = new PrismaFooRepository();
        const usecase = new GetFooUsecase(repo);

        // 4. Execute
        const result = await usecase.execute(id.data, memberId);
        return successResponse(result);
    } catch (error: unknown) {
        console.error("[route] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

Rules:

- Auth guard and param validation return early **before** instantiation — no wasted work on bad requests
- Domain-level 404/403 are returned **explicitly** inside the try block, not via thrown exceptions
- catch block always returns 500 — it is the unexpected-error fallback only
- `console.error` stays until §4.3 structured logging replaces it

---

## §3.2b Cleanup Scope

All fixes applied in a single pass per file:

| Fix                               | Files                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ error }` → `{ message }`       | `app/api/member/attend/route.ts` _(also missing try-catch — see below)_<br>`app/api/member/notification-records/[id]/route.ts` _(only the three early-return guards on auth/404/403 need fixing; catch block already uses `{ message }`)_<br>`app/api/arenas/[id]/route.ts`                                                                                                                    |
| Add missing try-catch             | `app/api/games/[id]/reviews/route.ts` _(also closes the §2.1 critical bug)_<br>`app/api/member/attend/route.ts` _(no try-catch at all — fix alongside `{ error }` change)_<br>`app/api/member/profile/[nickname]/route.ts`<br>`app/api/reviews/member/route.ts`                                                                                                                                |
| Move instantiation inside handler | `app/api/games/[id]/reviews/route.ts`<br>`app/api/member/wishlists/route.ts` _(repos only at module scope — usecases are already instantiated inside handlers)_<br>`app/api/member/review-likes/[reviewId]/route.ts`<br>`app/api/member/profile/route.ts`<br>`app/api/member/profile/[nickname]/route.ts`<br>`app/api/reviews/member/route.ts`<br>`app/api/reviews/member/[memberId]/route.ts` |

**~10 route files total.** No business logic changes — structural cleanup only.

Note: `games/[id]/reviews/route.ts` receives all three fixes simultaneously and closes the §2.1 critical bug. `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts` was removed from scope — instantiation is already per-request inside handlers.

---

## Testing

`utils/apiResponse.ts` — no unit tests needed (two one-liner wrappers around `NextResponse.json`).

For routes receiving try-catch that currently have **no error-path tests** (`games/[id]/reviews`, `attend`, `profile/[nickname]`, `reviews/member`): add a minimal test — mock the usecase to throw, assert 500 response + `{ message }` key.

All existing route tests must pass unchanged after the refactor. If a test breaks during module-level cleanup, the fix is updating `vi.mock` declarations to appear before the import (known Vitest pattern).

---

## What This Is Not

- Not typed error classes — those come with `withApiHandler` (§6.3)
- Not a route wrapper — `withApiHandler` is a separate future task
- Not structured logging — `console.error` stays until §4.3
- Not validation changes — Zod validation already handled in §3.1 (`refactor/#275`)

---

## Success Criteria

- [ ] `utils/apiResponse.ts` exists and is used by all refactored routes
- [ ] Zero routes use `{ error }` key in responses
- [ ] All ~10 affected routes have try-catch
- [ ] No repos or usecases instantiated at module level
- [ ] `npm test` passes (all 182 tests green)
- [ ] §2.1 critical bug closed (`games/[id]/reviews` has try-catch)

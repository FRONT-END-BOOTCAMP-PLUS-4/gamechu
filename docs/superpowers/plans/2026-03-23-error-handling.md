# Error Handling Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize error responses across ~10 API routes — enforce `{ message }` shape, add missing try-catch, and move module-level repo/usecase instantiation inside handlers.

**Architecture:** Add `utils/apiResponse.ts` with two helper functions (`errorResponse`, `successResponse`) that mechanically enforce the `{ message }` shape. Then fix each affected route in isolation: fix `{ error }` guard returns, wrap missing try-catch, and move module-level instantiation inside each handler. No business logic changes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Vitest 4.1 for tests.

---

## File Map

| Action     | File                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| **CREATE** | `utils/apiResponse.ts`                                                  |
| **MODIFY** | `app/api/member/notification-records/[id]/route.ts`                     |
| **MODIFY** | `app/api/arenas/[id]/route.ts`                                          |
| **MODIFY** | `app/api/member/attend/route.ts`                                        |
| **MODIFY** | `app/api/games/[id]/reviews/route.ts`                                   |
| **MODIFY** | `app/api/member/profile/[nickname]/route.ts`                            |
| **MODIFY** | `app/api/reviews/member/route.ts`                                       |
| **MODIFY** | `app/api/member/wishlists/route.ts`                                     |
| **MODIFY** | `app/api/member/review-likes/[reviewId]/route.ts`                       |
| **MODIFY** | `app/api/member/profile/route.ts`                                       |
| **MODIFY** | `app/api/reviews/member/[memberId]/route.ts`                            |
| **MODIFY** | `app/api/member/attend/__tests__/route.test.ts` _(add error-path test)_ |
| **CREATE** | `app/api/games/[id]/reviews/__tests__/route.test.ts`                    |
| **CREATE** | `app/api/member/profile/[nickname]/__tests__/route.test.ts`             |
| **CREATE** | `app/api/reviews/member/__tests__/route.test.ts`                        |

---

## Task 1: Create `utils/apiResponse.ts`

**Files:**

- Create: `utils/apiResponse.ts`

The two helper functions that enforce `{ message }` shape. No unit tests needed — trivial wrappers over `NextResponse.json`.

- [ ] **Step 1: Create the file**

```typescript
// utils/apiResponse.ts
import { NextResponse } from "next/server";

export const errorResponse = (message: string, status: number) =>
    NextResponse.json({ message }, { status });

export const successResponse = <T>(data: T, status = 200) =>
    NextResponse.json(data, { status });
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: All 182 tests pass (new file has no tests of its own).

- [ ] **Step 3: Commit**

```bash
git add utils/apiResponse.ts
git commit -m "[refactor/#277] utils/apiResponse.ts 헬퍼 함수 추가"
```

---

## Task 2: Fix `notification-records/[id]/route.ts` — `{ error }` guards only

**Files:**

- Modify: `app/api/member/notification-records/[id]/route.ts:19-46`

Only the three early-return guards use `{ error }`. The catch block already uses `{ message }`. No structural changes needed.

- [ ] **Step 1: Fix the three `{ error }` guards**

Current lines 19-46:

```typescript
if (!memberId) {
    return NextResponse.json({ error: "멤버가 아닙니다." }, { status: 401 });
}
// ...
if (!notificationRecord) {
    return NextResponse.json(
        { error: "알림이 존재하지 않습니다." },
        { status: 404 }
    );
}
if (notificationRecord.memberId !== memberId) {
    return NextResponse.json(
        { error: "알림 삭제 권한이 없습니다." },
        { status: 403 }
    );
}
```

Replace all three with `errorResponse`:

```typescript
import { errorResponse } from "@/utils/apiResponse";

// line 19
if (!memberId) {
    return errorResponse("멤버가 아닙니다.", 401);
}
// line 37
if (!notificationRecord) {
    return errorResponse("알림이 존재하지 않습니다.", 404);
}
// line 43
if (notificationRecord.memberId !== memberId) {
    return errorResponse("알림 삭제 권한이 없습니다.", 403);
}
```

Also update the catch block's two `NextResponse.json` calls to use `errorResponse`:

```typescript
} catch (error: unknown) {
    console.error("Error deleting notification records:", error);
    if (error instanceof Error) {
        return errorResponse(error.message || "알림 삭제 실패", 400);
    }
    return errorResponse("알 수 없는 오류 발생", 500);
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All 182 tests pass (no test file for this route).

- [ ] **Step 3: Commit**

```bash
git add app/api/member/notification-records/[id]/route.ts
git commit -m "[refactor/#277] notification-records: { error } → { message } 수정"
```

---

## Task 3: Fix `arenas/[id]/route.ts` — `{ error }` throughout

**Files:**

- Modify: `app/api/arenas/[id]/route.ts`

The GET handler and the business-logic guards in PATCH/DELETE use `{ error }`. The catch blocks in PATCH and DELETE already use `{ message }` correctly.

- [ ] **Step 1: Add import and fix all `{ error }` occurrences**

Add import at top:

```typescript
import { errorResponse, successResponse } from "@/utils/apiResponse";
```

**GET handler** — replace lines 29, 50–55:

```typescript
// line 29 (invalid arenaId)
return errorResponse("Invalid arenaId", 400);

// lines 49–57 (catch block)
} catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Arena not found")) {
        return errorResponse("투기장이 존재하지 않습니다.", 404);
    }
    return errorResponse(`Failed to fetch participants: ${error}`, 500);
}
```

**PATCH handler** — replace lines 98, 105, 112–118:

```typescript
// line 98
return errorResponse("참여자 정보를 찾을 수 없습니다.", 400);

// line 105
return errorResponse("회원 정보를 찾을 수 없습니다.", 404);

// line 112
return errorResponse(
    "투기장 참여를 위해서는 최소 100점 이상의 점수가 필요합니다.",
    403
);
```

**DELETE handler** — replace lines 176–180 (the 404 guard):

```typescript
if (!arena) {
    return errorResponse("투기장이 존재하지 않습니다.", 404);
}
```

Leave the PATCH and DELETE catch blocks unchanged (they already use `{ message }` correctly).

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All 182 tests pass.

- [ ] **Step 3: Commit**

```bash
git add app/api/arenas/[id]/route.ts
git commit -m "[refactor/#277] arenas/[id]: { error } → { message } 수정"
```

---

## Task 4: Fix `attend/route.ts` — `{ error }` + add try-catch (TDD)

**Files:**

- Modify: `app/api/member/attend/__tests__/route.test.ts` _(add error-path test)_
- Modify: `app/api/member/attend/route.ts`

This route has `{ error: "Unauthorized" }` and no try-catch. Write the failing test first.

- [ ] **Step 1: Add failing error-path test to existing test file**

Open `app/api/member/attend/__tests__/route.test.ts`. Add `// @vitest-environment node` as the **very first line** of the file (before all imports and mocks), then add the new test inside the existing `describe` block:

```typescript
it("returns 500 when usecase throws", async () => {
    const { ApplyAttendanceScoreUsecase } = await import(
        "@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase"
    );
    vi.mocked(ApplyAttendanceScoreUsecase).mockImplementationOnce(function (
        this: Record<string, unknown>
    ) {
        this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
    } as unknown as typeof ApplyAttendanceScoreUsecase);

    const response = await POST();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toHaveProperty("message");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test app/api/member/attend/__tests__/route.test.ts
```

Expected: FAIL — the route currently has no try-catch, so the promise rejects unhandled.

- [ ] **Step 3: Fix the route**

Replace the entire `attend/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { ApplyAttendanceScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyAttendanceScoreUsecase";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { errorResponse } from "@/utils/apiResponse";

export async function POST() {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const memberRepo = new PrismaMemberRepository();
        const lastAttendedDate = await memberRepo.getLastAttendedDate(memberId);

        const usecase = new ApplyAttendanceScoreUsecase(
            new ScorePolicy(),
            memberRepo,
            new PrismaScoreRecordRepository()
        );

        await usecase.execute({ memberId, lastAttendedDate });

        let attendedDateStr: string | null = null;
        if (lastAttendedDate) {
            attendedDateStr = new Date(lastAttendedDate).toLocaleDateString(
                "ko-KR",
                {
                    timeZone: "Asia/Seoul",
                }
            );
        }

        return NextResponse.json({
            success: true,
            attendedDate: attendedDateStr,
        });
    } catch (error: unknown) {
        console.error("[attend] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test app/api/member/attend/__tests__/route.test.ts
```

Expected: All 4 tests PASS (3 existing + 1 new error-path).

- [ ] **Step 5: Commit**

```bash
git add app/api/member/attend/route.ts app/api/member/attend/__tests__/route.test.ts
git commit -m "[refactor/#277] attend: { error } 수정, try-catch 추가, 에러 경로 테스트"
```

---

## Task 5: Fix `games/[id]/reviews/route.ts` — try-catch + module-level cleanup (TDD)

**Files:**

- Create: `app/api/games/[id]/reviews/__tests__/route.test.ts`
- Modify: `app/api/games/[id]/reviews/route.ts`

This route has module-level usecase instantiation and no try-catch. This also closes the §2.1 critical bug.

- [ ] **Step 1: Write failing test**

Create `app/api/games/[id]/reviews/__tests__/route.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue(null),
}));

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByGameId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository",
    () => ({
        PrismaReviewLikeRepository: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.findByReviewId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/GetReviewsByGameIdUsecase",
    () => ({
        GetReviewsByGameIdUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue([]);
        }),
    })
);

import { GET } from "../route";

const makeRequest = (id = "1") =>
    new Request(`http://localhost/api/games/${id}/reviews`);

const makeParams = (id = "1") => ({
    params: Promise.resolve({ id }),
});

describe("GET /api/games/[id]/reviews", () => {
    it("returns 400 for invalid gameId", async () => {
        const response = await GET(
            makeRequest("abc") as never,
            makeParams("abc")
        );
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetReviewsByGameIdUsecase } = await import(
            "@/backend/review/application/usecase/GetReviewsByGameIdUsecase"
        );
        vi.mocked(GetReviewsByGameIdUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
        } as unknown as typeof GetReviewsByGameIdUsecase);

        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test "app/api/games/\[id\]/reviews/__tests__/route.test.ts"
```

Expected: FAIL on the "returns 500 when usecase throws" test — the route has no try-catch.

- [ ] **Step 3: Fix the route**

Replace the entire `app/api/games/[id]/reviews/route.ts`:

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { GetReviewsByGameIdUsecase } from "@/backend/review/application/usecase/GetReviewsByGameIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { PrismaReviewLikeRepository } from "@/backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    try {
        const { id } = await params;
        const gameId = id;
        const parsedId = Number.parseInt(gameId || "", 10);
        if (isNaN(parsedId)) {
            return errorResponse("Invalid gameId", 400);
        }

        const viewerId = await getAuthUserId();
        const usecase = new GetReviewsByGameIdUsecase(
            new PrismaReviewRepository(),
            new PrismaReviewLikeRepository()
        );
        const result = await usecase.execute(parsedId, viewerId || "");
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[games/reviews] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test "app/api/games/\[id\]/reviews/__tests__/route.test.ts"
```

Expected: Both tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add "app/api/games/[id]/reviews/route.ts" "app/api/games/[id]/reviews/__tests__/route.test.ts"
git commit -m "[refactor/#277] games/[id]/reviews: try-catch 추가, 모듈 스코프 정리, 에러 경로 테스트"
```

---

## Task 6: Fix `profile/[nickname]/route.ts` — try-catch + module-level cleanup (TDD)

**Files:**

- Create: `app/api/member/profile/[nickname]/__tests__/route.test.ts`
- Modify: `app/api/member/profile/[nickname]/route.ts`

- [ ] **Step 1: Write failing test**

Create `app/api/member/profile/[nickname]/__tests__/route.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByNickname = vi.fn().mockResolvedValue(null);
        }),
    })
);

vi.mock(
    "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase",
    () => ({
        GetMemberProfileByNicknameUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue(null);
        }),
    })
);

import { GET } from "../route";

const makeRequest = () =>
    new Request("http://localhost/api/member/profile/testuser");
const makeParams = (nickname = "testuser") => ({
    params: Promise.resolve({ nickname }),
});

describe("GET /api/member/profile/[nickname]", () => {
    it("returns 404 when profile not found", async () => {
        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetMemberProfileByNicknameUsecase } = await import(
            "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase"
        );
        vi.mocked(GetMemberProfileByNicknameUsecase).mockImplementationOnce(
            function (this: Record<string, unknown>) {
                this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
            } as unknown as typeof GetMemberProfileByNicknameUsecase
        );

        const response = await GET(makeRequest() as never, makeParams());
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
```

- [ ] **Step 2: Run test to verify the "500" case fails**

```bash
npm test "app/api/member/profile/\[nickname\]/__tests__/route.test.ts"
```

Expected: "returns 500 when usecase throws" FAILS — no try-catch.

- [ ] **Step 3: Fix the route**

Replace the entire `app/api/member/profile/[nickname]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileByNicknameUsecase } from "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase";
import { errorResponse } from "@/utils/apiResponse";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    try {
        const { nickname } = await params;
        const usecase = new GetMemberProfileByNicknameUsecase(
            new PrismaMemberRepository()
        );
        const profile = await usecase.execute(nickname);

        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("[profile/nickname] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test "app/api/member/profile/\[nickname\]/__tests__/route.test.ts"
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/api/member/profile/[nickname]/route.ts" "app/api/member/profile/[nickname]/__tests__/route.test.ts"
git commit -m "[refactor/#277] profile/[nickname]: try-catch 추가, 모듈 스코프 정리, 에러 경로 테스트"
```

---

## Task 7: Fix `reviews/member/route.ts` — try-catch + module-level cleanup (TDD)

**Files:**

- Create: `app/api/reviews/member/__tests__/route.test.ts`
- Modify: `app/api/reviews/member/route.ts`

- [ ] **Step 1: Write failing test**

Create `app/api/reviews/member/__tests__/route.test.ts`:

```typescript
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-member-id"),
}));

vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findByMemberId = vi.fn().mockResolvedValue([]);
        }),
    })
);

vi.mock(
    "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase",
    () => ({
        GetReviewsByMemberIdUsecase: vi.fn(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockResolvedValue([]);
        }),
    })
);

import { GET } from "../route";

describe("GET /api/reviews/member", () => {
    it("returns 401 when not authenticated", async () => {
        const { getAuthUserId } = await import("@/utils/GetAuthUserId.server");
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

        const response = await GET();
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });

    it("returns 500 when usecase throws", async () => {
        const { GetReviewsByMemberIdUsecase } = await import(
            "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase"
        );
        vi.mocked(GetReviewsByMemberIdUsecase).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.execute = vi.fn().mockRejectedValue(new Error("DB error"));
        } as unknown as typeof GetReviewsByMemberIdUsecase);

        const response = await GET();
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body).toHaveProperty("message");
    });
});
```

- [ ] **Step 2: Run test to verify the "500" case fails**

```bash
npm test "app/api/reviews/member/__tests__/route.test.ts"
```

Expected: "returns 500 when usecase throws" FAILS — no try-catch.

- [ ] **Step 3: Fix the route**

Replace the entire `app/api/reviews/member/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { errorResponse } from "@/utils/apiResponse";

export async function GET() {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const usecase = new GetReviewsByMemberIdUsecase(
            new PrismaReviewRepository()
        );
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[reviews/member] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test "app/api/reviews/member/__tests__/route.test.ts"
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/reviews/member/route.ts "app/api/reviews/member/__tests__/route.test.ts"
git commit -m "[refactor/#277] reviews/member: try-catch 추가, 모듈 스코프 정리, 에러 경로 테스트"
```

---

## Task 8: Fix `wishlists/route.ts` — move repos inside handlers

**Files:**

- Modify: `app/api/member/wishlists/route.ts`

Three module-level repo instances (`wishlistRepo`, `gameRepo`, `reviewRepo`) at lines 13–15. Move them inside each handler. The catch blocks and `{ message }` responses are already correct — no other changes.

- [ ] **Step 1: Replace the entire file**

`wishlists/route.ts` has three handlers that all reference the module-level repos. Replace the full file (all three handlers) to avoid leaving dangling references:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaWishListRepository } from "@/backend/wishlist/infra/repositories/prisma/PrismaWishListRepository";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { GetWishlistUsecase } from "@/backend/wishlist/application/usecase/GetWishlistUsecase";
import { GetWishlistsUsecase } from "@/backend/wishlist/application/usecase/GetWishlistsUsecase";
import { CreateWishlistUsecase } from "@/backend/wishlist/application/usecase/CreateWishlistUsecase";
import { GetWishlistDto } from "@/backend/wishlist/application/usecase/dto/GetWishlistDto";
import { GetWishlistsDto } from "@/backend/wishlist/application/usecase/dto/GetWishlistsDto";

export async function GET(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gameIdParam = searchParams.get("gameId");
    const pageParam = searchParams.get("page");
    const page = Math.max(Number(pageParam) || 1, 1);

    if (gameIdParam !== null) {
        const gameId = Number(gameIdParam);
        if (isNaN(gameId)) {
            return NextResponse.json(
                { message: "Invalid gameId" },
                { status: 400 }
            );
        }

        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new GetWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        try {
            const result = await usecase.execute(getWishlistDto);
            return NextResponse.json(result);
        } catch (err) {
            console.error("[WISHLIST_SINGLE_FETCH_ERROR]", err);
            return NextResponse.json(
                { message: "단일 위시리스트 조회 실패" },
                { status: 500 }
            );
        }
    }

    const wishlistRepo = new PrismaWishListRepository();
    const gameRepo = new GamePrismaRepository();
    const reviewRepo = new PrismaReviewRepository();
    const usecase = new GetWishlistsUsecase(wishlistRepo, gameRepo, reviewRepo);
    const getWishlistsDto = new GetWishlistsDto(memberId, page);
    try {
        const result = await usecase.execute(getWishlistsDto);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[WISHLIST_FETCH_ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 목록 조회 실패" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const memberId = await getAuthUserId();
    if (!memberId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { gameId } = await req.json();
        const wishlistRepo = new PrismaWishListRepository();
        const usecase = new CreateWishlistUsecase(wishlistRepo);
        const getWishlistDto = new GetWishlistDto(gameId, memberId);
        const wishlistId = await usecase.execute(getWishlistDto);

        return NextResponse.json(
            { message: "위시리스트에 추가되었습니다.", wishlistId },
            { status: 200 }
        );
    } catch (error) {
        console.error("[WISHLIST_ADD_ERROR]", error);
        return NextResponse.json(
            { message: "위시리스트 등록 실패" },
            { status: 400 }
        );
    }
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass (no test file for wishlists, but full suite passes).

- [ ] **Step 3: Commit**

```bash
git add app/api/member/wishlists/route.ts
git commit -m "[refactor/#277] wishlists: 모듈 스코프 repo 인스턴스 핸들러 내부로 이동"
```

---

## Task 9: Fix `review-likes/[reviewId]/route.ts` — move all deps inside handler

**Files:**

- Modify: `app/api/member/review-likes/[reviewId]/route.ts`

Lines 12–26 define 7 module-level instances. Move them all inside the POST handler.

- [ ] **Step 1: Move instantiation inside the handler**

Remove lines 11–26. Inside the POST handler, before the `try` block:

```typescript
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsedReviewId = Number.parseInt((await params).reviewId ?? "", 10);
    if (isNaN(parsedReviewId)) {
        return NextResponse.json(
            { message: "Invalid reviewId" },
            { status: 400 }
        );
    }

    const likeRepo = new PrismaReviewLikeRepository();
    const reviewRepo = new PrismaReviewRepository();
    const memberRepo = new PrismaMemberRepository();
    const scoreRecordRepo = new PrismaScoreRecordRepository();
    const scorePolicy = new ScorePolicy();
    const applyReviewScoreUsecase = new ApplyReviewScoreUsecase(
        scorePolicy,
        memberRepo,
        scoreRecordRepo
    );
    const usecase = new ToggleReviewLikeUsecase(
        likeRepo,
        reviewRepo,
        applyReviewScoreUsecase
    );

    try {
        const result = await usecase.execute({
            reviewId: parsedReviewId,
            memberId: userId,
        });
        return NextResponse.json(result);
    } catch (err) {
        console.error("리뷰 좋아요 처리 실패", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add "app/api/member/review-likes/[reviewId]/route.ts"
git commit -m "[refactor/#277] review-likes/[reviewId]: 모듈 스코프 의존성 핸들러 내부로 이동"
```

---

## Task 10: Fix `profile/route.ts` — move usecases inside handlers + add try-catch to GET

**Files:**

- Modify: `app/api/member/profile/route.ts`

Lines 9–12 define two module-level usecases. Also, the GET handler has no try-catch.

- [ ] **Step 1: Move usecases inside handlers and add try-catch to GET**

Remove lines 9–12. Rewrite both handlers:

```typescript
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileUsecase } from "@/backend/member/application/usecase/GetMemberProfileUsecase";
import { UpdateMemberProfileUseCase } from "@/backend/member/application/usecase/UpdateMemberProfileUseCase";
import { UpdateProfileRequestDto } from "@/backend/member/application/usecase/dto/UpdateProfileRequestDto";
import { errorResponse } from "@/utils/apiResponse";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const memberId = session?.user?.id;
        if (!memberId) return errorResponse("Unauthorized", 401);

        const usecase = new GetMemberProfileUsecase(
            new PrismaMemberRepository()
        );
        const profile = await usecase.execute(memberId);
        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("[profile] GET error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const memberId = session?.user?.id;
        if (!memberId) return errorResponse("Unauthorized", 401);

        const body = await req.json();
        const dto = new UpdateProfileRequestDto({
            memberId,
            nickname: body.nickname,
            isMale: body.isMale,
            birthDate: body.birthDate,
            imageUrl: body.imageUrl,
        });

        const usecase = new UpdateMemberProfileUseCase(
            new PrismaMemberRepository()
        );
        await usecase.execute(dto);

        return NextResponse.json({
            message: "프로필이 성공적으로 수정되었습니다.",
        });
    } catch (err) {
        console.error("[PROFILE_UPDATE_ERROR]", err);
        return errorResponse((err as Error).message || "프로필 수정 실패", 400);
    }
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add app/api/member/profile/route.ts
git commit -m "[refactor/#277] member/profile: 모듈 스코프 정리, GET try-catch 추가"
```

---

## Task 11: Fix `reviews/member/[memberId]/route.ts` — move usecase + add try-catch

**Files:**

- Modify: `app/api/reviews/member/[memberId]/route.ts`

Line 6 has a module-level `const usecase = ...`. Move it inside the handler and add try-catch.

- [ ] **Step 1: Fix the route**

Replace the entire file:

```typescript
import { NextResponse } from "next/server";
import { GetReviewsByMemberIdUsecase } from "@/backend/review/application/usecase/GetReviewsByMemberIdUsecase";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { errorResponse } from "@/utils/apiResponse";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const { memberId } = await params;

        if (!memberId) {
            return errorResponse("Not Found", 404);
        }

        const usecase = new GetReviewsByMemberIdUsecase(
            new PrismaReviewRepository()
        );
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("[reviews/member/[memberId]] error:", error);
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add "app/api/reviews/member/[memberId]/route.ts"
git commit -m "[refactor/#277] reviews/member/[memberId]: 모듈 스코프 정리, try-catch 추가"
```

---

## Task 12: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass. Count should be ≥ 182 + 6 new tests = **≥ 188 tests**.

- [ ] **Step 2: Verify zero `{ error }` in responses**

```bash
grep -r '"error"' app/api/ --include="*.ts" -l
```

Expected: No files returned (or only files where `"error"` appears in a comment or log string, not in a `NextResponse.json` call).

- [ ] **Step 3: Verify no module-level instantiation remains**

```bash
grep -n "^const.*= new Prisma\|^const.*= new.*Usecase\|^const.*= new.*Repository" app/api/ -r --include="*.ts"
```

Expected: No matches.

- [ ] **Step 4: Final commit message (if any cleanup needed)**

If any stray issues found, fix and commit:

```bash
git add <file>
git commit -m "[refactor/#277] 최종 정리"
```

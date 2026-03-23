# Zod Input Validation — Design Spec

**Date:** 2026-03-22
**Branch:** `refactor/#[issue]`
**MASTER_PLAN ref:** §3.1 Input Validation with Zod

---

## Problem

Every API route implements its own ad-hoc validation. Current issues:

- `Number(null)` → `NaN` for `pageSize` in arenas route (known bug)
- `as SortType` type assertion with no runtime check in games route
- Email format not validated — only checks presence
- Review rating range (1–5) not validated at route layer
- Arena title/description length limits not enforced
- Votes, profile update, wishlist, notification routes have no body validation
- Validation patterns inconsistent: mix of `Number()`, `parseInt()`, `isNaN()`, null checks, and nothing
- Some routes return `{ error }` instead of `{ message }` — fixed in this PR where encountered

---

## Terminology

- **Prisma schema** — `prisma/schema.prisma`, database table definitions
- **Zod schema** — a `z.object(...)` declaration in TypeScript code used for runtime input validation

---

## Decisions

| Question | Decision |
|---|---|
| Schema placement | Co-located in DTO file (Option A) |
| DTO classes | Unchanged — classes stay classes |
| Error response format | `{ message: string }` — first error only, matches existing `{ message }` convention |
| Scope | All 44 API routes, one PR |
| ID (path param) validation | Route layer via shared `IdSchema`, not inside DTO |
| Naming convention | `[DtoName minus "Dto"]Schema` — e.g., `CreateArenaSchema` |
| `{ error }` legacy responses | Convert to `{ message }` in any route touched by this PR |

---

## Architecture

### Validation Flow

```
req.json() / searchParams / path params
    ↓
[Zod schema .safeParse()]          ← added at route layer
    ↓ fail → { message } 400
    ↓ pass (validated.data is fully typed)
new CreateXxxDto(validated.data)   ← DTO class unchanged
    ↓
usecase.execute(dto)
    ↓
NextResponse.json(result)
```

### Layer Responsibilities

| File | Responsibility |
|---|---|
| `backend/.../dto/CreateXxxDto.ts` | Declares what shape is valid (Zod schema) + data container (DTO class) |
| `utils/validation.ts` | How to run validation and format the 400 error response |
| `app/api/.../route.ts` | When to validate and what to do with the result |

---

## What Gets a Zod Schema

**Input DTOs only** — ones that receive user-provided data:

- `CreateXxxDto` — POST request bodies
- `UpdateXxxDto` — PATCH / PUT request bodies
- `GetXxxDto` — GET query string params

**Output DTOs do NOT get Zod schemas** (`ArenaDto`, `ArenaListDto`, `ReviewDto`, etc.) — these are populated from trusted DB data.

---

## New File: `utils/validation.ts`

```typescript
import { z } from "zod";
import { NextResponse } from "next/server";

export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; response: NextResponse<{ message: string }> } {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            response: NextResponse.json(
                { message: result.error.issues[0].message },
                { status: 400 }
            ),
        };
    }
    return { success: true, data: result.data };
}

// Shared path param ID validator — used inline in routes
export const IdSchema = z.coerce.number().int().positive();
```

---

## Zod Schema Conventions

### Request bodies (POST / PATCH / PUT)

Fields come from `req.json()` — already parsed JS types, use `z.string()` / `z.number()` directly:

```typescript
// CreateArenaDto.ts
import { z } from "zod";

export const CreateArenaSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요.").max(100, "제목은 100자 이하여야 합니다."),
    description: z.string().min(1, "설명을 입력해주세요.").max(500, "설명은 500자 이하여야 합니다."),
    startDate: z.string().datetime("올바른 날짜 형식이 아닙니다."),
});

export class CreateArenaDto {
    constructor(
        public creatorId: string,   // from auth — never from user input
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}
```

### Query params (GET)

Query params are always raw strings — use `z.coerce` and `.default()`:

```typescript
// GetArenaDto.ts
export const GetArenaSchema = z.object({
    currentPage:  z.coerce.number().int().min(1).default(1),
    status:       z.coerce.number().int().default(0),
    // mine is absent from searchParams when not set — .default("false") handles that.
    // Any value other than "true" (including "1", "yes") produces false — intentional.
    mine:         z.string().transform(v => v === "true").default("false"),
    pageSize:     z.coerce.number().int().min(1).default(9),  // fixes NaN bug
    memberId:     z.string().optional(),  // targetMemberId — present for "my arenas" view
});
```

### Update DTOs — require at least one field

`UpdateXxxDto` fields are all optional, but an empty body should be rejected. Use `.refine()`:

```typescript
// Member route — only fields that route actually reads from body (not title/status)
export const UpdateArenaSchema = z.object({
    challengerId: z.string().optional(),
    description:  z.string().min(1).max(500).optional(),
    startDate:    z.string().datetime().optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);

// Admin route — different field set
export const UpdateArenaAdminSchema = z.object({
    status:       z.number().int().optional(),
    challengerId: z.string().optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);
```

### Path param IDs

Validated inline in the route using the shared `IdSchema` — no DTO schema needed:

```typescript
const idResult = IdSchema.safeParse(id);
if (!idResult.success) return NextResponse.json({ message: "유효하지 않은 ID입니다." }, { status: 400 });
const arenaId = idResult.data; // number, guaranteed
```

### Error messages

- Written in Korean, consistent with existing UI strings
- First error only (`.issues[0].message`) — no field-level map for now
- Auth (`creatorId` / `memberId`) always comes from `getAuthUserId()`, never validated via Zod schema

---

## Route Handler Patterns

### Pattern 1 — POST / PATCH with body

```typescript
export async function POST(req: Request) {
    const memberId = await getAuthUserId();
    if (!memberId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const validated = validate(CreateArenaSchema, await req.json());
    if (!validated.success) return validated.response;

    const repo = new PrismaArenaRepository();
    const usecase = new CreateArenaUsecase(repo);
    const dto = new CreateArenaDto(
        memberId,
        validated.data.title,
        validated.data.description,
        new Date(validated.data.startDate)
    );
    const result = await usecase.execute(dto);
    return NextResponse.json(result, { status: 201 });
}
```

### Pattern 2 — GET with query params

```typescript
export async function GET(req: Request) {
    const memberId = await getAuthUserId();  // must be called even for GET if needed by DTO

    const url = new URL(req.url);
    const validated = validate(GetArenaSchema, Object.fromEntries(url.searchParams));
    if (!validated.success) return validated.response;

    const repo = new PrismaArenaRepository();
    const usecase = new GetArenaListUsecase(repo);
    const dto = new GetArenaDto(validated.data, memberId, validated.data.pageSize);
    const result = await usecase.execute(dto);
    return NextResponse.json(result);
}
```

### Pattern 3 — Path param ID (inline)

```typescript
const idResult = IdSchema.safeParse(id);
if (!idResult.success) return NextResponse.json({ message: "유효하지 않은 ID입니다." }, { status: 400 });
const arenaId = idResult.data;
```

---

## Routes Requiring No New Validation

These routes have no user input beyond auth — no Zod schema needed:

- `POST /api/member/attend` — no body, auth only
- `GET /api/member/scores` — read-only, auth only
- `GET /api/genres`, `GET /api/themes`, `GET /api/platforms` — no input
- `GET /api/preferred-genres`, `GET /api/preferred-platforms`, `GET /api/preferred-themes` — no input

Path-param-only routes (add `IdSchema` for the path param, no body schema):
- `POST /api/member/review-likes/[reviewId]` — no body; path param `[reviewId]` validated with `IdSchema`

---

## Validation Rules Per Feature

### Auth

| Route | Field | Rule |
|---|---|---|
| `POST /api/auth/signup` | `email` | `z.string().email("올바른 이메일 형식이 아닙니다.")` |
| `POST /api/auth/signup` | `nickname` | `z.string().min(1).max(20)` |
| `POST /api/auth/signup` | `password` | `z.string().min(8, "비밀번호는 8자 이상이어야 합니다.")` |
| `POST /api/auth/signup` | `birthDate` | `z.string().date()` |
| `POST /api/auth/signup` | `gender` | `z.enum(["M", "F"])` |
| `GET /api/auth/email-check` | `email` (query param) | `z.string().email()` |

### Reviews

| Route | Field | Rule |
|---|---|---|
| `POST /api/member/games/[gameId]/reviews` | `[gameId]` path param | `IdSchema` |
| `POST /api/member/games/[gameId]/reviews` | `content` | `z.string().min(1, "리뷰 내용을 입력해주세요.")` |
| `POST /api/member/games/[gameId]/reviews` | `rating` | `z.number().int().min(1).max(5)` |
| `PATCH .../reviews/[reviewId]` | `[reviewId]` path param | `IdSchema` |
| `PATCH .../reviews/[reviewId]` | `content` | `z.string().min(1).optional()` |
| `PATCH .../reviews/[reviewId]` | `rating` | `z.number().int().min(1).max(5).optional()` |

### Arenas

| Route | Field | Rule |
|---|---|---|
| `POST /api/member/arenas` | `title` | `z.string().min(1).max(100)` |
| `POST /api/member/arenas` | `description` | `z.string().min(1).max(500)` |
| `POST /api/member/arenas` | `startDate` | `z.string().datetime()` |
| `PATCH /api/member/arenas/[id]` | `[id]` path param | `IdSchema` |
| `PATCH /api/member/arenas/[id]` | body | `UpdateArenaSchema` with `.refine()` (at least one field) — fields: `challengerId`, `description`, `startDate` only (matches what the route actually reads from body; `title` and `status` are NOT wired through this route) |
| `PATCH /api/arenas/[id]` (admin) | `[id]` path param | `IdSchema` |
| `PATCH /api/arenas/[id]` (admin) | body | separate `UpdateArenaAdminSchema` — fields: `status`, `challengerId` (what the admin route reads) |
| `GET /api/arenas` | `currentPage` | `z.coerce.number().int().min(1).default(1)` |
| `GET /api/arenas` | `pageSize` | `z.coerce.number().int().min(1).default(9)` |
| `GET /api/arenas` | `status` | `z.coerce.number().int().default(0)` |
| `GET /api/arenas` | `mine` | `z.string().transform(v => v === "true").default("false")` |
| `GET /api/arenas` | `memberId` | `z.string().optional()` |

### Games

> **Note:** When `meta=true` is present, `app/api/games/route.ts` short-circuits and returns metadata. No validation needed for this case — the route returns early before any schema is checked.

| Route | Field | Rule |
|---|---|---|
| `GET /api/games` | `sort` | `z.enum(["popular", "latest", "rating"]).default("popular")` |
| `GET /api/games` | `page` | `z.coerce.number().int().min(1).default(1)` |
| `GET /api/games` | `size` | `z.coerce.number().int().min(1).default(6)` |
| `GET /api/games` | `genreId` | `z.coerce.number().int().positive().optional()` |
| `GET /api/games` | `themeId` | `z.coerce.number().int().positive().optional()` |
| `GET /api/games` | `platformId` | `z.coerce.number().int().positive().optional()` |
| `GET /api/games` | `keyword` | `z.string().max(100).optional()` |

### Votes

> **Note:** `arenaId` comes from the **request body** in the current implementation (`const { arenaId, votedTo } = body`), not from the `[id]` path param. The path param `[id]` is still validated with `IdSchema` (it is present in the URL), but the DTO receives `arenaId` from the body.

| Route | Field | Rule |
|---|---|---|
| `POST /api/member/arenas/[id]/votes` | `[id]` path param | `IdSchema` (URL validation) |
| `POST /api/member/arenas/[id]/votes` | `arenaId` (body) | `z.number().int().positive()` |
| `POST /api/member/arenas/[id]/votes` | `votedTo` (body) | `z.string().min(1, "투표 대상을 선택해주세요.")` |
| `PATCH /api/member/arenas/[id]/votes` | `[id]` path param | `IdSchema` |
| `PATCH /api/member/arenas/[id]/votes` | `arenaId` (body) | `z.number().int().positive()` |
| `PATCH /api/member/arenas/[id]/votes` | `votedTo` (body) | `z.string().min(1)` |

### Chat (Chattings)

| Route | Field | Rule |
|---|---|---|
| `POST /api/member/arenas/[id]/chattings` | `[id]` path param | `IdSchema` |
| `POST /api/member/arenas/[id]/chattings` | `content` | `z.string().min(1).max(200)` — matches `MAX_MESSAGE_LENGTH = 200` enforced in `CreateChattingUsecase` |

### Member Profile

> **Note:** `UpdateProfileRequestDto` currently declares all four fields as required (no `?`). This PR makes them optional in the Zod schema AND adds `.refine()`, and the DTO class must also be updated to mark all fields optional (`nickname?: string`, etc.) so partial updates work correctly. This is the only DTO class change in this PR.

| Route | Field | Rule |
|---|---|---|
| `PUT /api/member/profile` | body | `UpdateProfileSchema` with `.refine()` (at least one field) |
| `PUT /api/member/profile` | `nickname` | `z.string().min(1).max(20).optional()` |
| `PUT /api/member/profile` | `isMale` | `z.boolean().optional()` |
| `PUT /api/member/profile` | `birthDate` | `z.string().regex(/^\d{8}$/, "날짜는 yyyymmdd 형식이어야 합니다.").optional()` — format is `yyyymmdd` (e.g. `"19900101"`), not ISO |
| `PUT /api/member/profile` | `imageUrl` | `z.string().url().optional()` |

### Wishlists

| Route | Field | Rule |
|---|---|---|
| `POST /api/member/wishlists` | `gameId` | `z.number().int().positive()` |

### Notifications

| Route | Field | Rule |
|---|---|---|
| `POST /api/notification-records` | `memberId` | `z.string().min(1)` |
| `POST /api/notification-records` | `typeId` | `z.number().int().positive()` |
| `POST /api/notification-records` | `description` | `z.string().min(1)` |
| `GET /api/member/notification-records` | `currentPage` | `z.coerce.number().int().min(1).default(1)` |

---

## Testing

### Schema unit tests

Co-located in `backend/[feature]/application/usecase/dto/__tests__/`:

```typescript
// __tests__/CreateArenaDto.test.ts
import { CreateArenaSchema } from "../CreateArenaDto";

describe("CreateArenaSchema", () => {
    it("유효한 입력 통과", () => {
        const result = CreateArenaSchema.safeParse({
            title: "테스트 투기장",
            description: "설명",
            startDate: "2026-04-01T00:00:00.000Z",
        });
        expect(result.success).toBe(true);
    });

    it("제목 없으면 실패", () => {
        const result = CreateArenaSchema.safeParse({ title: "", description: "설명", startDate: "2026-04-01T00:00:00.000Z" });
        expect(result.success).toBe(false);
        expect(result.error!.issues[0].message).toBe("제목을 입력해주세요.");
    });
});
```

### Route validation tests

Added to existing `app/api/.../route/__tests__/route.test.ts` files:

```typescript
it("제목 없으면 400 반환", async () => {
    const req = new Request("http://localhost/api/member/arenas", {
        method: "POST",
        body: JSON.stringify({ description: "설명만 있음" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("message");
});
```

**Scope:**
- Schema unit tests for every new Zod schema
- Route validation tests for routes currently lacking any validation (signup, review create/update, arena create/update, games list, votes, notifications, wishlists, profile PUT)
- Existing manual-check routes: update existing tests to match new Zod-based behaviour

---

## Files to Create / Modify

**New:**
- `utils/validation.ts`
- `backend/*/application/usecase/dto/__tests__/*.test.ts` (schema unit tests, one per new schema)

**Modified — add Zod schema export (input DTOs):**
- `backend/member/application/usecase/dto/SignUpRequestDto.ts`
- `backend/member/application/usecase/dto/UpdateProfileRequestDto.ts` — also update class fields to `nickname?: string`, `isMale?: boolean`, `birthDate?: string`, `imageUrl?: string` (only DTO class change in this PR)
- `backend/arena/application/usecase/dto/CreateArenaDto.ts`
- `backend/arena/application/usecase/dto/UpdateArenaDto.ts`
- `backend/arena/application/usecase/dto/GetArenaDto.ts`
- `backend/review/application/usecase/dto/CreateReviewDto.ts`
- `backend/review/application/usecase/dto/UpdateReviewDto.ts`
- `backend/chatting/application/usecase/dto/CreateChattingDto.ts`
- `backend/vote/application/usecase/dto/SubmitVoteDto.ts`
- `backend/wishlist/application/usecase/dto/GetWishlistDto.ts` (gameId body field)
- `backend/notification-record/application/usecase/dto/CreateNotificationRecordDto.ts`
- `backend/notification-record/application/usecase/dto/GetNotificationRecordDto.ts` (currentPage)
- `backend/game/application/usecase/dto/GetFilteredGamesRequestDto.ts`

**Modified — add validation call + fix `{ error }` → `{ message }` where present:**
- `app/api/auth/signup/route.ts`
- `app/api/auth/email-check/route.ts`
- `app/api/arenas/route.ts`
- `app/api/arenas/[id]/route.ts` (admin PATCH — uses `UpdateArenaAdminSchema`)
- `app/api/arenas/[id]/chattings/route.ts`
- `app/api/arenas/[id]/votes/route.ts`
- `app/api/member/arenas/route.ts`
- `app/api/member/arenas/[id]/route.ts`
- `app/api/member/arenas/[id]/chattings/route.ts`
- `app/api/member/arenas/[id]/votes/route.ts`
- `app/api/games/route.ts`
- `app/api/member/games/[gameId]/reviews/route.ts`
- `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts`
- `app/api/member/profile/route.ts`
- `app/api/member/wishlists/route.ts`
- `app/api/member/wishlists/[id]/route.ts`
- `app/api/notification-records/route.ts`
- `app/api/member/notification-records/route.ts`
- `app/api/member/review-likes/[reviewId]/route.ts` (IdSchema only, no body schema)
- All existing route `__tests__/route.test.ts` files for the above routes

**Out of scope — `{ error }` routes not touched by this PR:**
The following routes still return `{ error }` after this PR and require a separate follow-up ticket:
- `app/api/member/notification-records/[id]/route.ts`
- `app/api/member/attend/route.ts`
- `app/api/member/scores/route.ts`
- `app/api/preferred-genres/route.ts`, `preferred-platforms/route.ts`, `preferred-themes/route.ts`

Also: `app/api/games/route.ts` returns `{ message, error }` on 500 — remove the `error` key when touching this file.

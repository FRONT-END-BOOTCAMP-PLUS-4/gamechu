# Zod Input Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Zod runtime input validation to all 44 API routes, replacing ad-hoc manual checks with consistent schema-based validation at the route layer.

**Architecture:** Co-locate a Zod schema (`const XxxSchema = z.object(...)`) in each input DTO file. Route handlers import the schema, call the shared `validate()` helper from `utils/validation.ts`, and return `{ message }` 400 on failure. DTO classes are unchanged except `UpdateProfileRequestDto` (fields made optional).

**Tech Stack:** Zod v4 (already installed), Next.js 15 App Router, Vitest 4.x for unit tests

---

## Prerequisites

- Create a GitHub issue for this work first (branch type: `refactor/`)
- Branch off `dev`: `git checkout -b refactor/#NNN`
- All commit messages follow: `[refactor/#NNN] message`

---

## File Map

**New:**

- `utils/validation.ts` — `validate()` helper + `IdSchema`

**Modified — add Zod schema export (input DTO files):**

- `backend/member/application/usecase/dto/SignUpRequestDto.ts`
- `backend/member/application/usecase/dto/UpdateProfileRequestDto.ts` ← also make fields optional
- `backend/arena/application/usecase/dto/CreateArenaDto.ts`
- `backend/arena/application/usecase/dto/UpdateArenaDto.ts`
- `backend/arena/application/usecase/dto/GetArenaDto.ts`
- `backend/review/application/usecase/dto/CreateReviewDto.ts`
- `backend/review/application/usecase/dto/UpdateReviewDto.ts`
- `backend/chatting/application/usecase/dto/CreateChattingDto.ts`
- `backend/vote/application/usecase/dto/SubmitVoteDto.ts`
- `backend/wishlist/application/usecase/dto/GetWishlistDto.ts`
- `backend/notification-record/application/usecase/dto/CreateNotificationRecordDto.ts`
- `backend/notification-record/application/usecase/dto/GetNotificationRecordDto.ts`
- `backend/game/application/usecase/dto/GetFilteredGamesRequestDto.ts`

**Modified — add validation call + fix `{ error }` → `{ message }`:**

- `app/api/auth/signup/route.ts`
- `app/api/auth/email-check/route.ts`
- `app/api/arenas/route.ts`
- `app/api/arenas/[id]/route.ts`
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
- `app/api/member/review-likes/[reviewId]/route.ts`

**New test files:**

- `utils/__tests__/validation.test.ts`
- `backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts`
- `backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts`
- `backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts`
- `backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts`
- `backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts`
- `backend/review/application/usecase/dto/__tests__/CreateReviewDto.test.ts`
- `backend/review/application/usecase/dto/__tests__/UpdateReviewDto.test.ts`
- `backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts`
- `backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts`
- `backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts`
- `backend/wishlist/application/usecase/dto/__tests__/GetWishlistDto.test.ts`
- `backend/notification-record/application/usecase/dto/__tests__/CreateNotificationRecordDto.test.ts`
- `backend/notification-record/application/usecase/dto/__tests__/GetNotificationRecordDto.test.ts`

---

## Task 1: Foundation — `utils/validation.ts`

**Files:**

- Create: `utils/validation.ts`
- Create: `utils/__tests__/validation.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// utils/__tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validate, IdSchema } from "../validation";

describe("validate()", () => {
    const TestSchema = z.object({ name: z.string().min(1, "이름 필수") });

    it("유효한 데이터 → success: true, data 반환", () => {
        const result = validate(TestSchema, { name: "홍길동" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.name).toBe("홍길동");
    });

    it("유효하지 않은 데이터 → success: false, 400 response", async () => {
        const result = validate(TestSchema, { name: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.response.status).toBe(400);
            const body = await result.response.json();
            expect(body.message).toBe("이름 필수");
        }
    });

    it("완전히 잘못된 데이터 → success: false", () => {
        const result = validate(TestSchema, null);
        expect(result.success).toBe(false);
    });
});

describe("IdSchema", () => {
    it("숫자 문자열 → 양의 정수", () => {
        expect(IdSchema.parse("42")).toBe(42);
    });

    it("0 → 실패", () => {
        expect(() => IdSchema.parse("0")).toThrow();
    });

    it("음수 → 실패", () => {
        expect(() => IdSchema.parse("-1")).toThrow();
    });

    it("문자 → 실패", () => {
        expect(() => IdSchema.parse("abc")).toThrow();
    });
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npx vitest run utils/__tests__/validation.test.ts --reporter verbose
```

Expected: FAIL — `Cannot find module '../validation'`

- [ ] **Step 3: Create `utils/validation.ts`**

```typescript
import { z } from "zod";
import { NextResponse } from "next/server";

export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
):
    | { success: true; data: T }
    | { success: false; response: NextResponse<{ message: string }> } {
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

export const IdSchema = z.coerce.number().int().positive();
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
npx vitest run utils/__tests__/validation.test.ts --reporter verbose
```

Expected: PASS (all 7 tests)

- [ ] **Step 5: Run full test suite — confirm no regressions**

```bash
npm test
```

Expected: all existing tests still pass

- [ ] **Step 6: Commit**

```bash
git add utils/validation.ts utils/__tests__/validation.test.ts
git commit -m "[refactor/#NNN] utils/validation.ts: validate() 헬퍼 + IdSchema 추가"
```

---

## Task 2: Auth Validation

**Files:**

- Modify: `backend/member/application/usecase/dto/SignUpRequestDto.ts`
- Modify: `app/api/auth/signup/route.ts`
- Modify: `app/api/auth/email-check/route.ts`
- Create: `backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts`

- [ ] **Step 1: Write failing schema unit test**

```typescript
// backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts
import { describe, it, expect } from "vitest";
import { SignUpSchema } from "../SignUpRequestDto";

describe("SignUpSchema", () => {
    const valid = {
        nickname: "홍길동",
        email: "test@example.com",
        password: "password123",
        birthDate: "19900101",
        gender: "M",
    };

    it("유효한 입력 통과", () => {
        expect(SignUpSchema.safeParse(valid).success).toBe(true);
    });

    it("이메일 형식 오류 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, email: "not-an-email" });
        expect(r.success).toBe(false);
    });

    it("비밀번호 8자 미만 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, password: "short" });
        expect(r.success).toBe(false);
    });

    it("birthDate 8자리 숫자 아님 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, birthDate: "1990-01-01" });
        expect(r.success).toBe(false);
    });

    it("gender M/F 외 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, gender: "X" });
        expect(r.success).toBe(false);
    });

    it("nickname 빈 문자열 → 실패", () => {
        const r = SignUpSchema.safeParse({ ...valid, nickname: "" });
        expect(r.success).toBe(false);
    });
});
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npx vitest run "backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts" --reporter verbose
```

Expected: FAIL — `SignUpSchema` not exported

- [ ] **Step 3: Add `SignUpSchema` to `SignUpRequestDto.ts`**

```typescript
import { z } from "zod";

export const SignUpSchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임을 입력해주세요.")
        .max(20, "닉네임은 20자 이하여야 합니다."),
    email: z.string().email("올바른 이메일 형식이 아닙니다."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    birthDate: z
        .string()
        .regex(/^\d{8}$/, "생년월일은 yyyymmdd 형식이어야 합니다."),
    gender: z.enum(["M", "F"], { error: "성별은 M 또는 F여야 합니다." }),
});

export class SignUpRequestDto {
    constructor(
        public readonly nickname: string,
        public readonly email: string,
        public readonly password: string,
        public readonly birthDate: string, // YYYYMMDD
        public readonly gender: "M" | "F"
    ) {}
}
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npx vitest run "backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts" --reporter verbose
```

Expected: PASS (all 6 tests)

- [ ] **Step 5: Update `app/api/auth/signup/route.ts`**

Add `validate()` call after rate limit, before DTO construction. Also fix `{ error }` → `{ message }` in catch.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { SignUpUsecase } from "@/backend/member/application/usecase/SignUpUsecase";
import {
    SignUpRequestDto,
    SignUpSchema,
} from "@/backend/member/application/usecase/dto/SignUpRequestDto";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";

const signupLimiter = new RateLimiter("signup", 3_600_000, 5);

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = await signupLimiter.check(ip);
    if (!rateLimit.allowed) {
        return rateLimitResponse(
            rateLimit.retryAfterMs,
            "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
    }

    const validated = validate(SignUpSchema, await req.json());
    if (!validated.success) return validated.response;

    try {
        const { nickname, email, password, birthDate, gender } = validated.data;
        const dto = new SignUpRequestDto(
            nickname,
            email,
            password,
            birthDate,
            gender
        );
        const repo = new PrismaMemberRepository();
        const usecase = new SignUpUsecase(repo);
        const user = await usecase.execute(dto);
        return NextResponse.json(
            { message: "회원가입 성공", memberId: user.id, email: user.email },
            { status: 201 }
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ message }, { status: 400 });
    }
}
```

- [ ] **Step 6: Update `app/api/auth/email-check/route.ts`**

Replace the manual `!email` check with `validate()` using an inline schema:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { EmailCheckUsecase } from "@/backend/member/application/usecase/EmailCheckUsecase";
import { RateLimiter, getClientIp, rateLimitResponse } from "@/lib/RateLimiter";
import { validate } from "@/utils/validation";
import { z } from "zod";

const emailCheckLimiter = new RateLimiter("email-check", 60_000, 10);
const EmailQuerySchema = z.object({
    email: z.string().email("올바른 이메일 형식이 아닙니다."),
});

export async function GET(req: NextRequest) {
    const ip = getClientIp(req);
    const rateLimit = await emailCheckLimiter.check(ip);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

    const { searchParams } = new URL(req.url);
    const validated = validate(
        EmailQuerySchema,
        Object.fromEntries(searchParams)
    );
    if (!validated.success) return validated.response;

    const repo = new PrismaMemberRepository();
    const usecase = new EmailCheckUsecase(repo);

    try {
        const result = await usecase.execute(validated.data.email);
        if (result.isDuplicate) {
            return NextResponse.json(
                { message: "이미 존재하는 이메일입니다." },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { message: "사용 가능한 이메일입니다." },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ message }, { status: 500 });
    }
}
```

> **Note:** `EmailQuerySchema` is defined inline in the route file since it's only used there and doesn't need a DTO.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add backend/member/application/usecase/dto/SignUpRequestDto.ts \
        backend/member/application/usecase/dto/__tests__/SignUpRequestDto.test.ts \
        app/api/auth/signup/route.ts \
        app/api/auth/email-check/route.ts
git commit -m "[refactor/#NNN] auth 라우트 Zod 유효성 검사 추가 (signup, email-check)"
```

---

## Task 3: Review Validation

**Files:**

- Modify: `backend/review/application/usecase/dto/CreateReviewDto.ts`
- Modify: `backend/review/application/usecase/dto/UpdateReviewDto.ts`
- Modify: `app/api/member/games/[gameId]/reviews/route.ts`
- Modify: `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts`
- Create: `backend/review/application/usecase/dto/__tests__/CreateReviewDto.test.ts`
- Create: `backend/review/application/usecase/dto/__tests__/UpdateReviewDto.test.ts`

- [ ] **Step 1: Read current UpdateReviewDto**

```bash
# Read to understand the current structure before modifying
```

Read: `backend/review/application/usecase/dto/UpdateReviewDto.ts`

- [ ] **Step 2: Write failing schema tests**

```typescript
// backend/review/application/usecase/dto/__tests__/CreateReviewDto.test.ts
import { describe, it, expect } from "vitest";
import { CreateReviewSchema } from "../CreateReviewDto";

describe("CreateReviewSchema", () => {
    const valid = { content: "재미있어요", rating: 4 };

    it("유효한 입력 통과", () => {
        expect(CreateReviewSchema.safeParse(valid).success).toBe(true);
    });

    it("content 빈 문자열 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, content: "" }).success
        ).toBe(false);
    });

    it("rating 0 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 0 }).success
        ).toBe(false);
    });

    it("rating 6 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 6 }).success
        ).toBe(false);
    });

    it("rating 소수점 → 실패", () => {
        expect(
            CreateReviewSchema.safeParse({ ...valid, rating: 3.5 }).success
        ).toBe(false);
    });
});
```

```typescript
// backend/review/application/usecase/dto/__tests__/UpdateReviewDto.test.ts
import { describe, it, expect } from "vitest";
import { UpdateReviewSchema } from "../UpdateReviewDto";

describe("UpdateReviewSchema", () => {
    it("content만 있어도 통과", () => {
        expect(
            UpdateReviewSchema.safeParse({ content: "수정된 내용" }).success
        ).toBe(true);
    });

    it("rating만 있어도 통과", () => {
        expect(UpdateReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드 필요)", () => {
        expect(UpdateReviewSchema.safeParse({}).success).toBe(false);
    });

    it("rating 범위 초과 → 실패", () => {
        expect(UpdateReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    });
});
```

- [ ] **Step 3: Run tests — confirm fail**

```bash
npx vitest run "backend/review/application/usecase/dto/__tests__" --reporter verbose
```

- [ ] **Step 4: Add schemas to DTO files**

`CreateReviewDto.ts` — add schema above existing interface:

```typescript
import { z } from "zod";

export const CreateReviewSchema = z.object({
    content: z.string().min(1, "리뷰 내용을 입력해주세요."),
    rating: z
        .number()
        .int()
        .min(1, "별점은 1-5 사이여야 합니다.")
        .max(5, "별점은 1-5 사이여야 합니다."),
});

export interface CreateReviewDto {
    gameId: number;
    content: string;
    rating: number;
}
```

`UpdateReviewDto.ts` — read the file first, then add:

```typescript
import { z } from "zod";

export const UpdateReviewSchema = z
    .object({
        content: z.string().min(1, "리뷰 내용을 입력해주세요.").optional(),
        rating: z
            .number()
            .int()
            .min(1, "별점은 1-5 사이여야 합니다.")
            .max(5, "별점은 1-5 사이여야 합니다.")
            .optional(),
    })
    .refine((data) => data.content !== undefined || data.rating !== undefined, {
        message: "수정할 내용을 입력해주세요.",
    });
```

- [ ] **Step 5: Run schema tests — confirm pass**

```bash
npx vitest run "backend/review/application/usecase/dto/__tests__" --reporter verbose
```

- [ ] **Step 6: Update review create route**

Read `app/api/member/games/[gameId]/reviews/route.ts` first, then add `IdSchema` for `gameId` path param and `CreateReviewSchema` for body. Import `validate` and `IdSchema` from `@/utils/validation`. Import `CreateReviewSchema` from the DTO.

Key pattern — add at the top of the POST handler:

```typescript
import { validate, IdSchema } from "@/utils/validation";
import { CreateReviewSchema } from "@/backend/review/application/usecase/dto/CreateReviewDto";

// Inside POST handler, after params:
const gameIdResult = IdSchema.safeParse(gameId);
if (!gameIdResult.success)
    return NextResponse.json(
        { message: "유효하지 않은 게임 ID입니다." },
        { status: 400 }
    );

const validated = validate(CreateReviewSchema, await req.json());
if (!validated.success) return validated.response;
```

- [ ] **Step 7: Update review update/delete route**

Read `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts` first, then add `IdSchema` for both `gameId` and `reviewId`, and `UpdateReviewSchema` for the PATCH body.

- [ ] **Step 8: Run full test suite**

```bash
npm test
```

- [ ] **Step 9: Commit**

```bash
git add backend/review/application/usecase/dto/CreateReviewDto.ts \
        backend/review/application/usecase/dto/UpdateReviewDto.ts \
        backend/review/application/usecase/dto/__tests__/CreateReviewDto.test.ts \
        backend/review/application/usecase/dto/__tests__/UpdateReviewDto.test.ts \
        app/api/member/games/[gameId]/reviews/route.ts \
        "app/api/member/games/[gameId]/reviews/[reviewId]/route.ts"
git commit -m "[refactor/#NNN] review 라우트 Zod 유효성 검사 추가"
```

---

## Task 4: Arena GET Validation (fixes NaN bug)

**Files:**

- Modify: `backend/arena/application/usecase/dto/GetArenaDto.ts`
- Modify: `app/api/arenas/route.ts`
- Create: `backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts`

- [ ] **Step 1: Write failing schema test**

```typescript
// backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts
import { describe, it, expect } from "vitest";
import { GetArenaSchema } from "../GetArenaDto";

describe("GetArenaSchema", () => {
    it("기본값: 빈 객체 → 모든 필드 기본값", () => {
        const r = GetArenaSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.currentPage).toBe(1);
            expect(r.data.pageSize).toBe(9);
            expect(r.data.status).toBe(0);
            expect(r.data.mine).toBe(false);
        }
    });

    it("pageSize=null → NaN 버그 방지, 기본값 9", () => {
        // Object.fromEntries(searchParams) omits absent keys — empty object simulates this
        const r = GetArenaSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.pageSize).toBe(9);
    });

    it("mine=true 문자열 → boolean true", () => {
        const r = GetArenaSchema.safeParse({ mine: "true" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.mine).toBe(true);
    });

    it("mine=false 문자열 → boolean false", () => {
        const r = GetArenaSchema.safeParse({ mine: "false" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.mine).toBe(false);
    });

    it("currentPage 문자열 숫자 → 숫자로 변환", () => {
        const r = GetArenaSchema.safeParse({ currentPage: "3" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.currentPage).toBe(3);
    });

    it("currentPage=0 → 실패 (min 1)", () => {
        expect(GetArenaSchema.safeParse({ currentPage: "0" }).success).toBe(
            false
        );
    });

    it("memberId 있으면 string으로 통과", () => {
        const r = GetArenaSchema.safeParse({ memberId: "user-123" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.memberId).toBe("user-123");
    });
});
```

- [ ] **Step 2: Run test — confirm fail**

```bash
npx vitest run "backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts" --reporter verbose
```

- [ ] **Step 3: Add `GetArenaSchema` to `GetArenaDto.ts`**

```typescript
import { z } from "zod";

export const GetArenaSchema = z.object({
    currentPage: z.coerce
        .number()
        .int()
        .min(1, "페이지는 1 이상이어야 합니다.")
        .default(1),
    status: z.coerce.number().int().default(0),
    // Absent from searchParams when not set → .default("false") handles it.
    // Any value other than exact string "true" produces false — intentional.
    mine: z
        .string()
        .transform((v) => v === "true")
        .default("false"),
    pageSize: z.coerce
        .number()
        .int()
        .min(1, "페이지 크기는 1 이상이어야 합니다.")
        .default(9),
    memberId: z.string().optional(), // targetMemberId — for "other user's arenas" view
});

export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
            targetMemberId?: string;
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "startDate",
        public ascending: boolean = false
    ) {}
}
```

- [ ] **Step 4: Run schema test — confirm pass**

```bash
npx vitest run "backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts" --reporter verbose
```

- [ ] **Step 5: Update `app/api/arenas/route.ts`**

Replace the manual `Number()` coercions with `validate(GetArenaSchema, ...)`. Map `validated.data` carefully to the `GetArenaDto` constructor:

```typescript
import { GetArenaSchema } from "@/backend/arena/application/usecase/dto/GetArenaDto";
import { validate } from "@/utils/validation";

export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const url = new URL(request.url);

        const validated = validate(
            GetArenaSchema,
            Object.fromEntries(url.searchParams)
        );
        if (!validated.success) return validated.response;

        const {
            currentPage,
            status,
            mine,
            pageSize,
            memberId: targetMemberId,
        } = validated.data;

        // Determine effective member ID (same logic as before)
        let effectiveMemberId: string | undefined;
        if (targetMemberId) {
            effectiveMemberId = targetMemberId;
        } else if (mine && memberId) {
            effectiveMemberId = memberId;
        } else {
            effectiveMemberId = undefined;
        }

        if (!memberId && mine) {
            return NextResponse.json(
                { message: "멤버 투기장 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        const arenaRepository = new PrismaArenaRepository();
        const memberRepository = new PrismaMemberRepository();
        const voteRepository = new PrismaVoteRepository();
        const getArenaUsecase = new GetArenaUsecase(
            arenaRepository,
            memberRepository,
            voteRepository
        );

        const getArenaDto = new GetArenaDto(
            {
                currentPage,
                status,
                mine: false,
                targetMemberId: effectiveMemberId,
            },
            memberId,
            pageSize
        );

        const arenaListDto = await getArenaUsecase.execute(getArenaDto);
        return NextResponse.json(arenaListDto);
    } catch (error: unknown) {
        console.error("Error fetching arenas:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 조회 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

> **Note:** The `{ error }` on line 46 of the original is also converted to `{ message }` here.

- [ ] **Step 6: Run full test suite**

```bash
npm test
```

- [ ] **Step 7: Commit**

```bash
git add backend/arena/application/usecase/dto/GetArenaDto.ts \
        "backend/arena/application/usecase/dto/__tests__/GetArenaDto.test.ts" \
        app/api/arenas/route.ts
git commit -m "[refactor/#NNN] arenas GET Zod 유효성 검사 추가, pageSize NaN 버그 수정"
```

---

## Task 5: Arena Create/Update Validation

**Files:**

- Modify: `backend/arena/application/usecase/dto/CreateArenaDto.ts`
- Modify: `backend/arena/application/usecase/dto/UpdateArenaDto.ts`
- Modify: `app/api/member/arenas/route.ts`
- Modify: `app/api/member/arenas/[id]/route.ts`
- Modify: `app/api/arenas/[id]/route.ts` (admin PATCH + fix `{ error }` in GET/DELETE)
- Create: `backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts`
- Create: `backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts`

- [ ] **Step 1: Write failing schema tests**

```typescript
// backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts
import { describe, it, expect } from "vitest";
import { CreateArenaSchema } from "../CreateArenaDto";

describe("CreateArenaSchema", () => {
    const valid = {
        title: "테스트 투기장",
        description: "설명입니다",
        startDate: "2026-04-01T00:00:00.000Z",
    };

    it("유효한 입력 통과", () => {
        expect(CreateArenaSchema.safeParse(valid).success).toBe(true);
    });

    it("제목 빈 문자열 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, title: "" }).success
        ).toBe(false);
    });

    it("제목 100자 초과 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, title: "a".repeat(101) })
                .success
        ).toBe(false);
    });

    it("설명 500자 초과 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({
                ...valid,
                description: "a".repeat(501),
            }).success
        ).toBe(false);
    });

    it("잘못된 날짜 형식 → 실패", () => {
        expect(
            CreateArenaSchema.safeParse({ ...valid, startDate: "2026-04-01" })
                .success
        ).toBe(false);
    });
});
```

```typescript
// backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts
import { describe, it, expect } from "vitest";
import { UpdateArenaSchema, UpdateArenaAdminSchema } from "../UpdateArenaDto";

describe("UpdateArenaSchema", () => {
    it("description만 있어도 통과", () => {
        expect(
            UpdateArenaSchema.safeParse({ description: "수정된 설명" }).success
        ).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드)", () => {
        expect(UpdateArenaSchema.safeParse({}).success).toBe(false);
    });

    it("description 빈 문자열 → 실패", () => {
        expect(UpdateArenaSchema.safeParse({ description: "" }).success).toBe(
            false
        );
    });
});

describe("UpdateArenaAdminSchema", () => {
    it("status만 있어도 통과", () => {
        expect(UpdateArenaAdminSchema.safeParse({ status: 2 }).success).toBe(
            true
        );
    });

    it("빈 객체 → 실패", () => {
        expect(UpdateArenaAdminSchema.safeParse({}).success).toBe(false);
    });
});
```

- [ ] **Step 2: Run tests — confirm fail**

```bash
npx vitest run "backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts" "backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts" --reporter verbose
```

- [ ] **Step 3: Add schemas to DTO files**

`CreateArenaDto.ts`:

```typescript
import { z } from "zod";

export const CreateArenaSchema = z.object({
    title: z
        .string()
        .min(1, "제목을 입력해주세요.")
        .max(100, "제목은 100자 이하여야 합니다."),
    description: z
        .string()
        .min(1, "설명을 입력해주세요.")
        .max(500, "설명은 500자 이하여야 합니다."),
    startDate: z.string().datetime("올바른 날짜 형식이 아닙니다."),
});

export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}
```

`UpdateArenaDto.ts` — read the file first, then add at the top (keep existing class unchanged):

```typescript
import { z } from "zod";

// Member route fields (challengerId, description, startDate only — title/status not wired)
export const UpdateArenaSchema = z.object({
    challengerId: z.string().optional(),
    description:  z.string().min(1, "설명을 입력해주세요.").max(500, "설명은 500자 이하여야 합니다.").optional(),
    startDate:    z.string().datetime("올바른 날짜 형식이 아닙니다.").optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);

// Admin route fields
export const UpdateArenaAdminSchema = z.object({
    status:       z.number().int().optional(),
    challengerId: z.string().optional(),
}).refine(
    data => Object.values(data).some(v => v !== undefined),
    { message: "변경된 내용을 입력해주세요." }
);

// Existing class below — unchanged
export class UpdateArenaDto { ... }
```

- [ ] **Step 4: Run schema tests — confirm pass**

```bash
npx vitest run "backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts" "backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts" --reporter verbose
```

- [ ] **Step 5: Update `app/api/member/arenas/route.ts`**

Read the file first. Replace three manual `if (!body.title)` / `if (!body.description)` / `if (!body.startDate)` checks with a single `validate(CreateArenaSchema, body)` call. Move auth check before validation. Fix all `{ error }` → `{ message }`.

Key change:

```typescript
import { CreateArenaSchema } from "@/backend/arena/application/usecase/dto/CreateArenaDto";
import { validate } from "@/utils/validation";

export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId)
            return NextResponse.json(
                { message: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );

        const validated = validate(CreateArenaSchema, await request.json());
        if (!validated.success) return validated.response;

        // score validation
        const memberRepository = new PrismaMemberRepository();
        const member = await memberRepository.findById(memberId);
        if (!member)
            return NextResponse.json(
                { message: "회원 정보를 찾을 수 없습니다." },
                { status: 404 }
            );
        if (member.score < 100)
            return NextResponse.json(
                {
                    message:
                        "투기장 작성을 위해서는 최소 100점 이상의 점수가 필요합니다.",
                },
                { status: 403 }
            );

        const dto = new CreateArenaDto(
            memberId,
            validated.data.title,
            validated.data.description,
            new Date(validated.data.startDate)
        );
        const arenaRepository = new PrismaArenaRepository();
        const usecase = new CreateArenaUsecase(arenaRepository);
        const newArena = await usecase.execute(dto);
        return NextResponse.json(newArena, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating arenas:", error);
        if (error instanceof Error)
            return NextResponse.json(
                { message: error.message || "투기장 생성 실패" },
                { status: 400 }
            );
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

- [ ] **Step 6: Update `app/api/member/arenas/[id]/route.ts`**

Read the file first. Add `IdSchema` for path param, replace `!body.description && !body.challengerId && !body.startDate` check with `validate(UpdateArenaSchema, body)`. Fix `{ error }` → `{ message }`.

- [ ] **Step 7: Update `app/api/arenas/[id]/route.ts` (admin)**

Read the file first. Add `IdSchema` for path param on PATCH handler. Add `validate(UpdateArenaAdminSchema, body)` for PATCH body. Fix `{ error }` → `{ message }` in GET, PATCH, and DELETE handlers throughout this file.

- [ ] **Step 8: Run full test suite**

```bash
npm test
```

- [ ] **Step 9: Commit**

```bash
git add backend/arena/application/usecase/dto/CreateArenaDto.ts \
        backend/arena/application/usecase/dto/UpdateArenaDto.ts \
        "backend/arena/application/usecase/dto/__tests__/CreateArenaDto.test.ts" \
        "backend/arena/application/usecase/dto/__tests__/UpdateArenaDto.test.ts" \
        app/api/member/arenas/route.ts \
        "app/api/member/arenas/[id]/route.ts" \
        "app/api/arenas/[id]/route.ts"
git commit -m "[refactor/#NNN] arena 생성/수정 라우트 Zod 유효성 검사 추가"
```

---

## Task 6: Games Validation

**Files:**

- Modify: `backend/game/application/usecase/dto/GetFilteredGamesRequestDto.ts`
- Modify: `app/api/games/route.ts`
- Create: `backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts`

- [ ] **Step 1: Read current DTO and route files**

Read both files before writing schemas.

- [ ] **Step 2: Write failing schema test**

```typescript
// backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts
import { describe, it, expect } from "vitest";
import { GetFilteredGamesSchema } from "../GetFilteredGamesRequestDto";

describe("GetFilteredGamesSchema", () => {
    it("빈 객체 → 기본값 적용", () => {
        const r = GetFilteredGamesSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.sort).toBe("popular");
            expect(r.data.page).toBe(1);
            expect(r.data.size).toBe(6);
        }
    });

    it("sort=latest 통과", () => {
        expect(
            GetFilteredGamesSchema.safeParse({ sort: "latest" }).success
        ).toBe(true);
    });

    it("sort=invalid → 실패", () => {
        expect(
            GetFilteredGamesSchema.safeParse({ sort: "newest" }).success
        ).toBe(false);
    });

    it("genreId 문자열 숫자 → 숫자 변환", () => {
        const r = GetFilteredGamesSchema.safeParse({ genreId: "5" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.genreId).toBe(5);
    });

    it("keyword 있으면 통과", () => {
        expect(
            GetFilteredGamesSchema.safeParse({ keyword: "zelda" }).success
        ).toBe(true);
    });
});
```

- [ ] **Step 3: Run test — confirm fail**

```bash
npx vitest run "backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts" --reporter verbose
```

- [ ] **Step 4: Add `GetFilteredGamesSchema` to DTO file**

```typescript
import { z } from "zod";

export const GetFilteredGamesSchema = z.object({
    sort: z.enum(["popular", "latest", "rating"]).default("popular"),
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(6),
    genreId: z.coerce.number().int().positive().optional(),
    themeId: z.coerce.number().int().positive().optional(),
    platformId: z.coerce.number().int().positive().optional(),
    keyword: z.string().max(100).optional(),
});

// Existing DTO types/interfaces below — unchanged
```

- [ ] **Step 5: Run test — confirm pass**

```bash
npx vitest run "backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts" --reporter verbose
```

- [ ] **Step 6: Update `app/api/games/route.ts`**

Read the file. The route short-circuits for `meta=true` before any game list logic — skip validation for that branch. For the main path, replace manual `parseInt()` + `as SortType` with `validate(GetFilteredGamesSchema, Object.fromEntries(params))`. Also fix the 500 catch block that returns `{ message, error }` — remove the `error` key.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

> **Note:** `app/api/games/route.ts` imports redis at module scope. The existing test file for this route already has `vi.mock("@/lib/redis", ...)`. Confirm the mock is still in place.

- [ ] **Step 8: Commit**

```bash
git add backend/game/application/usecase/dto/GetFilteredGamesRequestDto.ts \
        "backend/game/application/usecase/dto/__tests__/GetFilteredGamesRequestDto.test.ts" \
        app/api/games/route.ts
git commit -m "[refactor/#NNN] games GET Zod 유효성 검사 추가, SortType 타입 단언 제거"
```

---

## Task 7: Votes, Chat, Review-Likes Validation

**Files:**

- Modify: `backend/vote/application/usecase/dto/SubmitVoteDto.ts`
- Modify: `backend/chatting/application/usecase/dto/CreateChattingDto.ts`
- Modify: `app/api/arenas/[id]/votes/route.ts`
- Modify: `app/api/member/arenas/[id]/votes/route.ts`
- Modify: `app/api/arenas/[id]/chattings/route.ts`
- Modify: `app/api/member/arenas/[id]/chattings/route.ts`
- Modify: `app/api/member/review-likes/[reviewId]/route.ts`
- Create: `backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts`
- Create: `backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts`

- [ ] **Step 1: Read all target DTO and route files before modifying**

Read:

- `backend/chatting/application/usecase/dto/CreateChattingDto.ts`
- `app/api/arenas/[id]/votes/route.ts`
- `app/api/member/arenas/[id]/votes/route.ts`
- `app/api/arenas/[id]/chattings/route.ts`
- `app/api/member/arenas/[id]/chattings/route.ts`
- `app/api/member/review-likes/[reviewId]/route.ts`

- [ ] **Step 2: Write failing schema tests**

```typescript
// backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts
import { describe, it, expect } from "vitest";
import { SubmitVoteSchema } from "../SubmitVoteDto";

describe("SubmitVoteSchema", () => {
    const valid = { arenaId: 1, votedTo: "member-abc" };

    it("유효한 입력 통과", () => {
        expect(SubmitVoteSchema.safeParse(valid).success).toBe(true);
    });

    it("arenaId 0 → 실패", () => {
        expect(
            SubmitVoteSchema.safeParse({ ...valid, arenaId: 0 }).success
        ).toBe(false);
    });

    it("votedTo 빈 문자열 → 실패", () => {
        expect(
            SubmitVoteSchema.safeParse({ ...valid, votedTo: "" }).success
        ).toBe(false);
    });
});
```

```typescript
// backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts
import { describe, it, expect } from "vitest";
import { CreateChattingSchema } from "../CreateChattingDto";

describe("CreateChattingSchema", () => {
    it("유효한 입력 통과", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "안녕하세요" }).success
        ).toBe(true);
    });

    it("빈 content → 실패", () => {
        expect(CreateChattingSchema.safeParse({ content: "" }).success).toBe(
            false
        );
    });

    it("200자 초과 → 실패", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "a".repeat(201) }).success
        ).toBe(false);
    });

    it("200자 정확히 → 통과", () => {
        expect(
            CreateChattingSchema.safeParse({ content: "a".repeat(200) }).success
        ).toBe(true);
    });
});
```

- [ ] **Step 3: Run tests — confirm fail**

```bash
npx vitest run "backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts" "backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts" --reporter verbose
```

- [ ] **Step 4: Add schemas to DTO files**

`SubmitVoteDto.ts` — add at top:

```typescript
import { z } from "zod";

export const SubmitVoteSchema = z.object({
    arenaId: z.number().int().positive("유효하지 않은 투기장 ID입니다."),
    votedTo: z.string().min(1, "투표 대상을 선택해주세요."),
});

export class SubmitVoteDto { ... } // unchanged
```

`CreateChattingDto.ts` — add at top:

```typescript
import { z } from "zod";

export const CreateChattingSchema = z.object({
    content: z
        .string()
        .min(1, "메시지를 입력해주세요.")
        .max(200, "메시지는 200자 이하여야 합니다."),
});

// Existing DTO class/interface below — unchanged
```

- [ ] **Step 5: Run schema tests — confirm pass**

```bash
npx vitest run "backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts" "backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts" --reporter verbose
```

- [ ] **Step 6: Update vote routes**

Both `app/api/arenas/[id]/votes/route.ts` and `app/api/member/arenas/[id]/votes/route.ts`:

- Add `IdSchema` for `[id]` path param
- Add `validate(SubmitVoteSchema, body)` for the request body (`arenaId` + `votedTo` come from body)
- Fix any `{ error }` → `{ message }`

- [ ] **Step 7: Update chatting routes**

Both `app/api/arenas/[id]/chattings/route.ts` and `app/api/member/arenas/[id]/chattings/route.ts`:

- Add `IdSchema` for `[id]` path param (replace existing `isNaN` check)
- Add `validate(CreateChattingSchema, body)` for POST body

- [ ] **Step 8: Update review-likes route**

`app/api/member/review-likes/[reviewId]/route.ts`:

- Add `IdSchema` for `[reviewId]` path param (replace any existing `isNaN` or `Number()` check)
- No body validation needed

- [ ] **Step 9: Run full test suite**

```bash
npm test
```

- [ ] **Step 10: Commit**

```bash
git add backend/vote/application/usecase/dto/SubmitVoteDto.ts \
        "backend/vote/application/usecase/dto/__tests__/SubmitVoteDto.test.ts" \
        backend/chatting/application/usecase/dto/CreateChattingDto.ts \
        "backend/chatting/application/usecase/dto/__tests__/CreateChattingDto.test.ts" \
        "app/api/arenas/[id]/votes/route.ts" \
        "app/api/member/arenas/[id]/votes/route.ts" \
        "app/api/arenas/[id]/chattings/route.ts" \
        "app/api/member/arenas/[id]/chattings/route.ts" \
        "app/api/member/review-likes/[reviewId]/route.ts"
git commit -m "[refactor/#NNN] votes, chat, review-likes 라우트 Zod 유효성 검사 추가"
```

---

## Task 8: Profile Validation (+ DTO class field change)

**Files:**

- Modify: `backend/member/application/usecase/dto/UpdateProfileRequestDto.ts` ← make fields optional
- Modify: `app/api/member/profile/route.ts`
- Create: `backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts`

- [ ] **Step 1: Read `app/api/member/profile/route.ts`**

Read the file before modifying to understand how `UpdateProfileRequestDto` is constructed.

- [ ] **Step 2: Write failing schema test**

```typescript
// backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts
import { describe, it, expect } from "vitest";
import { UpdateProfileSchema } from "../UpdateProfileRequestDto";

describe("UpdateProfileSchema", () => {
    it("nickname만 있어도 통과", () => {
        expect(
            UpdateProfileSchema.safeParse({ nickname: "새닉네임" }).success
        ).toBe(true);
    });

    it("빈 객체 → 실패 (최소 1개 필드)", () => {
        expect(UpdateProfileSchema.safeParse({}).success).toBe(false);
    });

    it("nickname 빈 문자열 → 실패", () => {
        expect(UpdateProfileSchema.safeParse({ nickname: "" }).success).toBe(
            false
        );
    });

    it("birthDate yyyymmdd 형식 통과", () => {
        expect(
            UpdateProfileSchema.safeParse({ birthDate: "19900101" }).success
        ).toBe(true);
    });

    it("birthDate ISO 형식 → 실패", () => {
        expect(
            UpdateProfileSchema.safeParse({ birthDate: "1990-01-01" }).success
        ).toBe(false);
    });

    it("imageUrl 유효한 URL 통과", () => {
        expect(
            UpdateProfileSchema.safeParse({
                imageUrl: "https://example.com/img.png",
            }).success
        ).toBe(true);
    });

    it("imageUrl 잘못된 URL → 실패", () => {
        expect(
            UpdateProfileSchema.safeParse({ imageUrl: "not-a-url" }).success
        ).toBe(false);
    });
});
```

- [ ] **Step 3: Run test — confirm fail**

```bash
npx vitest run "backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts" --reporter verbose
```

- [ ] **Step 4: Update `UpdateProfileRequestDto.ts`**

Make all DTO class fields optional AND add Zod schema:

```typescript
import { z } from "zod";

export const UpdateProfileSchema = z
    .object({
        nickname: z
            .string()
            .min(1, "닉네임을 입력해주세요.")
            .max(20, "닉네임은 20자 이하여야 합니다.")
            .optional(),
        isMale: z.boolean().optional(),
        birthDate: z
            .string()
            .regex(/^\d{8}$/, "날짜는 yyyymmdd 형식이어야 합니다.")
            .optional(),
        imageUrl: z.string().url("올바른 URL 형식이 아닙니다.").optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
        message: "수정할 내용을 입력해주세요.",
    });

export class UpdateProfileRequestDto {
    memberId: string;
    nickname?: string;
    isMale?: boolean;
    birthDate?: string; // "yyyymmdd"
    imageUrl?: string;

    constructor(props: {
        memberId: string;
        nickname?: string;
        isMale?: boolean;
        birthDate?: string;
        imageUrl?: string;
    }) {
        this.memberId = props.memberId;
        this.nickname = props.nickname;
        this.isMale = props.isMale;
        this.birthDate = props.birthDate;
        this.imageUrl = props.imageUrl;
    }
}
```

> **Important:** Check if `UpdateMemberProfileUseCase` and the Prisma repository use these fields — making them optional may require updating the usecase/repo to handle `undefined` gracefully (e.g., skip field in Prisma `update` call). Read those files before proceeding.

- [ ] **Step 5: Run schema test — confirm pass**

```bash
npx vitest run "backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts" --reporter verbose
```

- [ ] **Step 6: Update `app/api/member/profile/route.ts`**

Add `validate(UpdateProfileSchema, body)` for the PUT handler. Fix `{ error }` → `{ message }` throughout. Also move `UpdateMemberProfileUseCase` instantiation inside the handler (it's currently at module level — move it per-request as the project convention requires).

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

- [ ] **Step 8: Commit**

```bash
git add backend/member/application/usecase/dto/UpdateProfileRequestDto.ts \
        "backend/member/application/usecase/dto/__tests__/UpdateProfileRequestDto.test.ts" \
        app/api/member/profile/route.ts
git commit -m "[refactor/#NNN] profile PUT Zod 유효성 검사 추가, UpdateProfileRequestDto 필드 optional 변경"
```

---

## Task 9: Wishlists, Notifications, Misc Validation

**Files:**

- Modify: `backend/wishlist/application/usecase/dto/GetWishlistDto.ts`
- Modify: `backend/notification-record/application/usecase/dto/CreateNotificationRecordDto.ts`
- Modify: `backend/notification-record/application/usecase/dto/GetNotificationRecordDto.ts`
- Modify: `app/api/member/wishlists/route.ts`
- Modify: `app/api/member/wishlists/[id]/route.ts`
- Modify: `app/api/notification-records/route.ts`
- Modify: `app/api/member/notification-records/route.ts`

- [ ] **Step 1: Read all target DTO and route files**

Read each file before modifying — including `backend/wishlist/application/usecase/`, `backend/notification-record/application/usecase/`, and `backend/member/infra/repositories/prisma/PrismaMemberRepository.ts` for the profile update (to ensure optional fields are handled correctly in the Prisma `update` call).

- [ ] **Step 2: Write failing schema tests**

```typescript
// backend/wishlist/application/usecase/dto/__tests__/GetWishlistDto.test.ts
import { describe, it, expect } from "vitest";
import { WishlistBodySchema } from "../GetWishlistDto";

describe("WishlistBodySchema", () => {
    it("양의 정수 gameId 통과", () => {
        expect(WishlistBodySchema.safeParse({ gameId: 5 }).success).toBe(true);
    });
    it("gameId 0 → 실패", () => {
        expect(WishlistBodySchema.safeParse({ gameId: 0 }).success).toBe(false);
    });
    it("gameId 없음 → 실패", () => {
        expect(WishlistBodySchema.safeParse({}).success).toBe(false);
    });
});
```

```typescript
// backend/notification-record/application/usecase/dto/__tests__/CreateNotificationRecordDto.test.ts
import { describe, it, expect } from "vitest";
import { CreateNotificationRecordSchema } from "../CreateNotificationRecordDto";

describe("CreateNotificationRecordSchema", () => {
    const valid = { memberId: "user-1", typeId: 1, description: "알림 내용" };
    it("유효한 입력 통과", () => {
        expect(CreateNotificationRecordSchema.safeParse(valid).success).toBe(
            true
        );
    });
    it("memberId 빈 문자열 → 실패", () => {
        expect(
            CreateNotificationRecordSchema.safeParse({ ...valid, memberId: "" })
                .success
        ).toBe(false);
    });
    it("typeId 0 → 실패", () => {
        expect(
            CreateNotificationRecordSchema.safeParse({ ...valid, typeId: 0 })
                .success
        ).toBe(false);
    });
});
```

```typescript
// backend/notification-record/application/usecase/dto/__tests__/GetNotificationRecordDto.test.ts
import { describe, it, expect } from "vitest";
import { GetNotificationRecordSchema } from "../GetNotificationRecordDto";

describe("GetNotificationRecordSchema", () => {
    it("빈 객체 → 기본값 1", () => {
        const r = GetNotificationRecordSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.currentPage).toBe(1);
    });
    it("currentPage=0 → 실패", () => {
        expect(
            GetNotificationRecordSchema.safeParse({ currentPage: "0" }).success
        ).toBe(false);
    });
});
```

Run tests to confirm they fail:

```bash
npx vitest run "backend/wishlist/application/usecase/dto/__tests__" "backend/notification-record/application/usecase/dto/__tests__" --reporter verbose
```

- [ ] **Step 3: Add schemas to DTO files**

`GetWishlistDto.ts` — add at top (the POST route reads `gameId` from body and uses this DTO):

```typescript
import { z } from "zod";

export const WishlistBodySchema = z.object({
    gameId: z.number().int().positive("유효하지 않은 게임 ID입니다."),
});

// Existing DTO class below — unchanged
```

`CreateNotificationRecordDto.ts`:

```typescript
import { z } from "zod";

export const CreateNotificationRecordSchema = z.object({
    memberId: z.string().min(1, "회원 ID를 입력해주세요."),
    typeId: z.number().int().positive("유효하지 않은 알림 유형입니다."),
    description: z.string().min(1, "알림 내용을 입력해주세요."),
});

// Existing DTO class below — unchanged
```

`GetNotificationRecordDto.ts` — add query param schema:

```typescript
import { z } from "zod";

export const GetNotificationRecordSchema = z.object({
    currentPage: z.coerce.number().int().min(1).default(1),
});

// Existing DTO class below — unchanged
```

- [ ] **Step 4: Run schema tests — confirm pass**

```bash
npx vitest run "backend/wishlist/application/usecase/dto/__tests__" "backend/notification-record/application/usecase/dto/__tests__" --reporter verbose
```

- [ ] **Step 5: Update wishlist routes**

`app/api/member/wishlists/route.ts` — add `validate(WishlistBodySchema, body)` for POST.
`app/api/member/wishlists/[id]/route.ts` — add `IdSchema` for `[id]` path param on DELETE.

- [ ] **Step 6: Update notification routes**

`app/api/notification-records/route.ts` — add `validate(CreateNotificationRecordSchema, body)` for POST. Fix `{ error }` → `{ message }`.
`app/api/member/notification-records/route.ts` — add `validate(GetNotificationRecordSchema, Object.fromEntries(url.searchParams))` for GET. Fix `{ error }` → `{ message }`.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

- [ ] **Step 8: Commit**

```bash
git add backend/wishlist/application/usecase/dto/GetWishlistDto.ts \
        backend/notification-record/application/usecase/dto/CreateNotificationRecordDto.ts \
        backend/notification-record/application/usecase/dto/GetNotificationRecordDto.ts \
        app/api/member/wishlists/route.ts \
        "app/api/member/wishlists/[id]/route.ts" \
        app/api/notification-records/route.ts \
        app/api/member/notification-records/route.ts \
        "backend/wishlist/application/usecase/dto/__tests__/GetWishlistDto.test.ts" \
        "backend/notification-record/application/usecase/dto/__tests__/CreateNotificationRecordDto.test.ts" \
        "backend/notification-record/application/usecase/dto/__tests__/GetNotificationRecordDto.test.ts"
git commit -m "[refactor/#NNN] wishlist, notification 라우트 Zod 유효성 검사 추가"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all existing 126+ tests pass, plus new schema unit tests

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: clean build, no TypeScript errors

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: no new lint errors

- [ ] **Step 4: Create PR**

```bash
git push -u origin refactor/#NNN
gh pr create --base dev --head refactor/#NNN
```

Use `.github/PULL_REQUEST_TEMPLATE.md` for the PR body.

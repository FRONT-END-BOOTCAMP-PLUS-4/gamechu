# Routing and API Route Handlers - Best Practices

Complete guide to clean Next.js API route definitions and handler patterns for GameChu.

## Table of Contents

- [API Routes: Handler Only](#api-routes-handler-only)
- [Route Handler Pattern](#route-handler-pattern)
- [Good Examples](#good-examples)
- [Anti-Patterns](#anti-patterns)
- [Refactoring Guide](#refactoring-guide)
- [Error Handling](#error-handling)
- [HTTP Status Codes](#http-status-codes)

---

## API Routes: Handler Only

### The Golden Rule

**Route handlers should ONLY:**

- ✅ Parse request params/query/body
- ✅ Check authentication (getAuthUserId)
- ✅ Instantiate repositories + usecases
- ✅ Delegate to usecases
- ✅ Return NextResponse

**Route handlers should NEVER:**

- ❌ Contain business logic
- ❌ Access database directly (Prisma calls)
- ❌ Implement complex validation logic
- ❌ Format complex responses
- ❌ Handle complex error scenarios inline

### Clean Route Handler Pattern

```typescript
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaUserRepository } from "@/backend/user/infra/repositories/prisma/PrismaUserRepository";
import { GetUsersUsecase } from "@/backend/user/application/usecase/GetUsersUsecase";

// ✅ CLEAN: Parse → Auth → Instantiate → Delegate → Respond
export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);

        const userRepository = new PrismaUserRepository();
        const getUsersUsecase = new GetUsersUsecase(userRepository);

        const result = await getUsersUsecase.execute({ page, memberId });
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Error fetching users:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
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

**Key Points:**

- Each handler: parse, auth, instantiate, delegate, respond
- No DI container — repos instantiated inline per request
- try-catch wraps entire handler body
- Clean, readable, maintainable

---

## Route Handler Pattern

### Next.js App Router Conventions

**File:** `app/api/[feature]/route.ts` — collection endpoints (GET list, POST create)
**File:** `app/api/[feature]/[id]/route.ts` — item endpoints (GET one, PATCH update, DELETE)

```typescript
// app/api/arenas/route.ts — collection
export async function GET(request: Request) {
    /* list */
}
export async function POST(request: Request) {
    /* create */
}

// app/api/arenas/[id]/route.ts — item
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    /* get single */
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    /* update */
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    /* delete */
}
```

### Request Parsing

```typescript
// Query parameters
const url = new URL(request.url);
const page = Number(url.searchParams.get("page") || 1);
const status = url.searchParams.get("status");

// Request body (POST/PATCH)
const body = await request.json();

// Dynamic route params (Next.js 15: params is Promise)
const { id } = await params;
```

---

## Good Examples

### Example 1: Arena List Route (Excellent ✅)

**File:** `app/api/arenas/route.ts`

```typescript
export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const url = new URL(request.url);
        const currentPage = Number(url.searchParams.get("currentPage") || 1);
        const status = Number(url.searchParams.get("status"));
        const pageSize = Number(url.searchParams.get("pageSize")!);

        const arenaRepository = new PrismaArenaRepository();
        const memberRepository = new PrismaMemberRepository();
        const voteRepository = new PrismaVoteRepository();

        const getArenaUsecase = new GetArenaUsecase(
            arenaRepository,
            memberRepository,
            voteRepository
        );

        const dto = new GetArenaDto(
            { currentPage, status },
            memberId,
            pageSize
        );
        const result = await getArenaUsecase.execute(dto);
        return NextResponse.json(result);
    } catch (error: unknown) {
        // unified error handling
    }
}
```

**What Makes This Excellent:**

- Zero business logic in route handler
- Repositories instantiated and injected into usecase
- DTO encapsulates input parameters
- Usecase does all the work

---

## Anti-Patterns

### Anti-Pattern 1: Business Logic in Route Handler (Bad ❌)

```typescript
// ❌ ANTI-PATTERN: Business logic in route handler
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const memberId = await getAuthUserId();

        // ❌ Permission checking in handler
        const member = await prismaClient.member.findUnique({
            where: { id: memberId },
        });
        if (member?.score < 100) {
            return NextResponse.json({ error: "점수 부족" }, { status: 403 });
        }

        // ❌ Database operations directly in handler
        const arena = await prismaClient.arena.create({
            data: {
                title: body.title,
                creatorId: memberId,
                status: 1,
            },
        });

        // ❌ More business logic...
        await prismaClient.notification.create({
            data: { targetId: memberId, type: "ARENA_CREATED" },
        });

        return NextResponse.json(arena, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "실패" }, { status: 500 });
    }
}
```

**Why This Is Bad:**

- Business logic mixed into route handler
- Hard to test (requires HTTP mocking)
- Hard to reuse (tied to route)
- Direct Prisma calls (skips repository abstraction)

### How to Refactor (Step-by-Step)

**Step 1: Create Usecase**

```typescript
// backend/arena/application/usecase/CreateArenaUsecase.ts
export class CreateArenaUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository
    ) {}

    async execute(dto: CreateArenaDto): Promise<Arena> {
        // Permission check
        const member = await this.memberRepository.findById(dto.memberId);
        if (!member || member.score < 100) {
            throw new Error("투기장 생성 권한이 없습니다.");
        }

        // Create arena
        return await this.arenaRepository.save({
            title: dto.title,
            creatorId: dto.memberId,
        });
    }
}
```

**Step 2: Update Route Handler**

```typescript
// app/api/arenas/route.ts
export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const body = await request.json();

        const arenaRepository = new PrismaArenaRepository();
        const memberRepository = new PrismaMemberRepository();
        const createArenaUsecase = new CreateArenaUsecase(
            arenaRepository,
            memberRepository
        );

        const dto = new CreateArenaDto({ title: body.title }, memberId);
        const result = await createArenaUsecase.execute(dto);
        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        // unified error handling
    }
}
```

**Result:**

- Route handler: ~15 lines (parse + delegate)
- Usecase: ~20 lines (business logic)
- Testable, reusable, maintainable!

---

## Error Handling

### Unified Error Pattern

```typescript
catch (error: unknown) {
    console.error("Error message:", error);
    if (error instanceof Error) {
        return NextResponse.json(
            { message: error.message || "fallback message" },
            { status: 400 }
        );
    }
    return NextResponse.json(
        { message: "알 수 없는 오류 발생" },
        { status: 500 }
    );
}
```

### Custom Error Status Codes

```typescript
// In usecase — throw with specific message
if (!arena) {
    throw new Error("투기장을 찾을 수 없습니다."); // handled as 400
}

// In route handler — check error types for specific status codes
catch (error: unknown) {
    if (error instanceof NotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
    }
    // fallback
}
```

---

## HTTP Status Codes

### Standard Codes

| Code | Use Case              | Example                            |
| ---- | --------------------- | ---------------------------------- |
| 200  | Success (GET, PATCH)  | Arena retrieved, Updated           |
| 201  | Created (POST)        | Arena created                      |
| 204  | No Content (DELETE)   | Arena deleted                      |
| 400  | Bad Request           | Invalid input data                 |
| 401  | Unauthorized          | Not authenticated                  |
| 403  | Forbidden             | No permission / insufficient score |
| 404  | Not Found             | Resource doesn't exist             |
| 500  | Internal Server Error | Unexpected error                   |

---

## Refactoring Guide

### Identify Handlers Needing Refactoring

**Red Flags:**

- Route handler > 50 lines
- Direct `prismaClient` calls in handler
- Complex business logic (if statements, loops)
- Permission checks in handler

### Refactoring Process

**1. Extract to Usecase:**

```typescript
// Before: Handler with logic
export async function POST(request: Request) {
    const body = await request.json();
    // 50 lines of logic
    return NextResponse.json(result);
}

// After: Clean handler
export async function POST(request: Request) {
    const body = await request.json();
    const memberId = await getAuthUserId();

    const repo = new PrismaFeatureRepository();
    const usecase = new CreateFeatureUsecase(repo);
    const result = await usecase.execute(new CreateFeatureDto(body, memberId));

    return NextResponse.json(result, { status: 201 });
}
```

**2. Extract Repository if direct Prisma calls exist:**

```typescript
// Domain interface
export interface FeatureRepository {
    findById(id: number): Promise<Feature | null>;
    save(data: CreateFeatureInput): Promise<Feature>;
}

// Prisma implementation
export class PrismaFeatureRepository implements FeatureRepository {
    private prisma = prismaClient;

    async findById(id: number): Promise<Feature | null> {
        return this.prisma.feature.findUnique({ where: { id } });
    }
}
```

---

**Related Files:**

- [SKILL.md](SKILL.md) - Main guide
- [services-and-repositories.md](services-and-repositories.md) - Usecase and repository details
- [complete-examples.md](complete-examples.md) - Full feature examples

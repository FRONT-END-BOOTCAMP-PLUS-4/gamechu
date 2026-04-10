# Validation Patterns - Input Validation with Zod

Complete guide to input validation using Zod schemas for type-safe validation in GameChu.

## Table of Contents

- [Why Zod?](#why-zod)
- [Basic Zod Patterns](#basic-zod-patterns)
- [Route Handler Validation](#route-handler-validation)
- [DTO Pattern](#dto-pattern)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)

---

## Why Zod?

### Benefits

**Type Safety:**

- ✅ Full TypeScript inference
- ✅ Runtime + compile-time validation
- ✅ Automatic type generation with `z.infer<>`

**Developer Experience:**

- ✅ Intuitive API
- ✅ Composable schemas
- ✅ Excellent error messages

**Performance:**

- ✅ Fast validation
- ✅ Small bundle size
- ✅ Tree-shakeable

---

## Basic Zod Patterns

### Primitive Types

```typescript
import { z } from "zod";

// Strings
const nameSchema = z.string();
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();
const minLengthSchema = z.string().min(3);
const maxLengthSchema = z.string().max(100);

// Numbers
const ageSchema = z.number().int().positive();
const priceSchema = z.number().positive();
const rangeSchema = z.number().min(0).max(100);

// Booleans
const activeSchema = z.boolean();

// Dates
const dateSchema = z.string().datetime(); // ISO 8601 string

// Enums
const statusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
```

### Objects

```typescript
// Simple object
const userSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    age: z.number().int().positive(),
});

// Optional fields
const updateSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
});

// Nullable fields
const profileSchema = z.object({
    name: z.string(),
    bio: z.string().nullable(),
});
```

### Arrays

```typescript
const tagsSchema = z.array(z.string()).min(1).max(10);
const nonEmptyArray = z.array(z.string()).nonempty();
```

---

## Route Handler Validation

### Pattern 1: Validate in Route Handler

```typescript
// app/api/arenas/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";

const createArenaSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    gameId: z.number().int().positive(),
});

export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();
        if (!memberId) {
            return NextResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validated = createArenaSchema.parse(body);

        const repo = new PrismaArenaRepository();
        const usecase = new CreateArenaUsecase(repo);
        const result = await usecase.execute({ ...validated, memberId });

        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message: "입력 데이터가 올바르지 않습니다.",
                    errors: error.errors,
                },
                { status: 400 }
            );
        }
        // fallback error handling
    }
}
```

### Pattern 2: Validate Query Params

```typescript
const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(9),
    status: z.coerce.number().int().optional(),
});

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const query = listQuerySchema.parse({
            page: url.searchParams.get("page"),
            pageSize: url.searchParams.get("pageSize"),
            status: url.searchParams.get("status"),
        });

        // query.page, query.pageSize, query.status are typed and validated
        // ...
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "잘못된 쿼리 파라미터입니다." },
                { status: 400 }
            );
        }
    }
}
```

---

## DTO Pattern

### Type Inference from Schemas

```typescript
import { z } from "zod";

// Define schema
const createArenaSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    gameId: z.number().int().positive(),
});

// Infer TypeScript type from schema
type CreateArenaInput = z.infer<typeof createArenaSchema>;
// Equivalent to:
// type CreateArenaInput = {
//     title: string;
//     description?: string;
//     gameId: number;
// }
```

### GameChu DTO Pattern (Class-Based)

GameChu currently uses class-based DTOs:

```typescript
// backend/arena/application/usecase/dto/GetArenaDto.ts
export class GetArenaDto {
    constructor(
        public queryString: { currentPage: number; status: number },
        public memberId: string | null,
        public pageSize: number = 9
    ) {}
}

// backend/arena/application/usecase/dto/ArenaListDto.ts
export class ArenaListDto {
    constructor(
        public arenas: ArenaDto[],
        public currentPage: number,
        public pages: number[],
        public endPage: number
    ) {}
}
```

When Zod is adopted more broadly, schemas can complement DTOs:

```typescript
// Validate input in route handler with Zod
const validated = createArenaSchema.parse(body);

// Pass to DTO for usecase
const dto = new CreateArenaDto(validated, memberId);
```

---

## Error Handling

### Zod Error Format

```typescript
try {
    const validated = schema.parse(data);
} catch (error) {
    if (error instanceof z.ZodError) {
        // error.errors = [
        //   {
        //     code: 'invalid_type',
        //     expected: 'string',
        //     received: 'number',
        //     path: ['email'],
        //     message: 'Expected string, received number'
        //   }
        // ]
    }
}
```

### NextResponse Error Pattern

```typescript
catch (error: unknown) {
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                message: "입력 데이터가 올바르지 않습니다.",
                errors: error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            },
            { status: 400 }
        );
    }
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
```

### Custom Error Messages

```typescript
const arenaSchema = z.object({
    title: z.string().min(1, { message: "제목을 입력해주세요." }),
    description: z
        .string()
        .max(500, { message: "설명은 500자 이내여야 합니다." }),
    gameId: z.number({ message: "게임을 선택해주세요." }),
});
```

---

## Advanced Patterns

### Conditional Validation

```typescript
const submissionSchema = z
    .object({
        type: z.enum(["NEW", "UPDATE"]),
        arenaId: z.number().optional(),
    })
    .refine(
        (data) => {
            if (data.type === "UPDATE") {
                return data.arenaId !== undefined;
            }
            return true;
        },
        {
            message: "arenaId is required for UPDATE type",
            path: ["arenaId"],
        }
    );
```

### Transform Data

```typescript
// Coerce string query params to numbers
const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(9),
});

// Trim strings before validation
const inputSchema = z.object({
    title: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
});
```

### Union Types

```typescript
// Discriminated unions
const notificationSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("arena"),
        arenaId: z.number(),
    }),
    z.object({
        type: z.literal("game"),
        gameId: z.number(),
    }),
]);
```

### Schema Composition

```typescript
// Base schemas
const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(9),
});

// Extend for specific use cases
const arenaListQuerySchema = paginationSchema.extend({
    status: z.coerce.number().int().optional(),
    mine: z.coerce.boolean().optional(),
});
```

---

**Related Files:**

- [SKILL.md](SKILL.md) - Main guide
- [routing-and-controllers.md](routing-and-controllers.md) - Using validation in route handlers
- [services-and-repositories.md](services-and-repositories.md) - Using DTOs in usecases
- [async-and-errors.md](async-and-errors.md) - Error handling patterns

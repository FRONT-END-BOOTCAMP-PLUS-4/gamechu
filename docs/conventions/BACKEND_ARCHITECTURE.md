# Backend Architecture Conventions

## Repository Layer

### Filter

Define a filter class when filtering is needed:

```typescript
export class ArenaFilter {
    constructor(
        // 1. Filtering columns
        public status: number | null,
        public memberId: string | null,
        // 2. Sorting (set defaults even if unused)
        public sortField: string = "startDate",
        public ascending: boolean = false,
        // 3. Pagination
        public offset: number = 0,
        public limit: number = 9
    ) {}
}
```

### Repository interface

- Import entities from `@/prisma/generated` (not `@prisma/client`)
- Import filters from `./filters/`
- Define `Omit<Entity, "id">` type for `save()`
- Use `UpdateDto` for `update()`
- Only implement CRUD methods that are needed — no speculative methods

```typescript
import { Arena } from "@/prisma/generated";
import { ArenaFilter } from "./filters/ArenaFilters";

export type CreateArenaInput = Omit<Arena, "id">;

export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>; // Count by filter
    findAll(filter: ArenaFilter): Promise<Arena[]>; // Find by filter with pagination
    findById(id: number): Promise<Arena | null>; // Find single by ID
    save(arena: CreateArenaInput): Promise<Arena>; // Create
    update(arena: Arena): Promise<Arena>; // Update (pass full entity; partial field updates happen in usecase before calling)
    deleteAll(filter: ArenaFilter): Promise<void>; // Bulk delete (only if needed)
    deleteById(id: number): Promise<void>; // Delete by ID
}
```

### PrismaRepository implementation

- Import the shared Prisma singleton — do NOT instantiate `new PrismaClient()` directly
- Extract `getWhereClause(filter)` for reuse across `count`, `findAll`, etc.
- Use spread + conditional for optional filter fields

```typescript
import prisma from "@/lib/prisma";
```

```typescript
private getWhereClause(filter: ArenaFilter): Prisma.ArenaWhereInput {
    const { status, memberId } = filter;
    return {
        ...(status && { status }),
        ...(memberId && {
            OR: [{ creatorId: memberId }, { challengerId: memberId }],
        }),
    };
}
```

---

## DTO Layer

### Base DTO

Include all fields from the entity, derived fields, and fields from related tables:

```typescript
export class ArenaDto {
    constructor(
        // 1. All fields from the original table
        public id: number,
        public creatorId: string,
        // ...

        // 2. Derived/computed fields
        public debateEndDate: Date,
        public voteEndDate: Date,

        // 3. Fields from related tables (via FK)
        public creatorNickname: string,
        public creatorProfileImageUrl: string,
        public voteCount: number,
        public leftPercent: number
    ) {}
}
```

### List DTO (with pagination)

```typescript
export class ArenaListDto {
    constructor(
        public arenas: ArenaDto[],
        public totalCount: number,
        public currentPage: number,
        public pages: number[],
        public endPage: number
    ) {}
}
```

### Get DTO (query input)

```typescript
export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "startDate",
        public ascending: boolean = false
    ) {}
}
```

### Create/Update DTO

- **Create**: Only fields the user provides (no `id`, no auto-generated fields like `createdAt`)
- **Update**: `id` is required (non-nullable), changeable fields are optional

```typescript
export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}

export class UpdateArenaDto {
    constructor(
        public id: number,
        public challengerId?: string,
        public title?: string,
        public description?: string,
        public status?: number,
        public startDate?: Date
    ) {}
}
```

---

## Usecase Layer

- Inject all needed repositories via constructor
- Use the repository's CRUD methods — no raw queries in usecases
- Call utility functions for derived data (e.g., `GetArenaDates()`)
- For pagination, build the `ListDto` with page calculations
- Separate usecases for different update operations (e.g., `UpdateArenaStatusUsecase`)

---

## API Route Layer

### Request params & query strings

```typescript
type RequestParams = {
    params: Promise<{
        id: string; // Next.js always provides slug as string
    }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const { id } = await params;
    const arenaId: number = Number(id);
    const url = new URL(request.url);
    const votedTo: string = url.searchParams.get("votedTo") || "";
    // ...
}
```

### Instance creation

**Always instantiate repositories and use cases inside the handler function** — never at module level. Module-level instances share state across requests and can cause stale connection issues.

```typescript
// ❌ Module level — breaks between requests
const repo = new PrismaArenaRepository();
const usecase = new GetArenaListUsecase(repo);

export async function GET(request: Request) { ... }

// ✅ Per-request — instantiate inside handler
export async function GET(request: Request) {
    const repo = new PrismaArenaRepository();
    const usecase = new GetArenaListUsecase(repo);
    // ...
}
```

### Structure per HTTP method

1. **GET**: Parse query params -> validate auth if needed -> instantiate repos & usecase -> execute -> return JSON
2. **POST**: Validate body -> validate auth -> build CreateDto -> execute usecase -> return `201`
3. **PATCH**: Parse params + body -> validate auth + ownership -> build UpdateDto -> execute usecase -> return JSON
4. **PUT**: Parse params + body -> validate auth + ownership -> build UpdateDto -> execute usecase -> return JSON
5. **DELETE**: Parse params -> validate existence -> validate auth + ownership -> execute usecase -> return `200`

### Error handling (unified)

See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for the full catch block pattern and `errorResponse` helper.

```typescript
import logger from "@/lib/logger";
import { errorResponse } from "@/utils/apiResponse";

// inside handler:
const log = logger.child({ route: "/api/...", method: "POST" });

catch (error: unknown) {
    log.error({ err: error }, "operation failed");
    const message = error instanceof Error ? error.message : "알 수 없는 오류 발생";
    return errorResponse(message, 500);
}
```

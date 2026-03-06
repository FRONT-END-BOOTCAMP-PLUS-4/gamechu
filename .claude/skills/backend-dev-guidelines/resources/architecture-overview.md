# Architecture Overview - GameChu Backend

Complete guide to the layered architecture pattern used in GameChu's Next.js backend.

## Table of Contents

- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Request Lifecycle](#request-lifecycle)
- [Directory Structure Rationale](#directory-structure-rationale)
- [Module Organization](#module-organization)
- [Separation of Concerns](#separation-of-concerns)

---

## Layered Architecture Pattern

### The Four Layers (Clean Architecture + DDD)

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 1: API ROUTE HANDLERS        │
│  (app/api/[feature]/route.ts)       │
│  - Parse params/query/body          │
│  - Auth check (getAuthUserId)       │
│  - Instantiate repos + usecase      │
│  - Delegate to usecase              │
│  - Return NextResponse              │
│  - NO business logic                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 2: USECASES                  │
│  (backend/[feature]/application/)   │
│  - Business logic orchestration     │
│  - Uses injected repositories       │
│  - Single responsibility per class  │
│  - No HTTP knowledge                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 3: REPOSITORIES              │
│  (backend/[feature]/infra/)         │
│  - Prisma operations                │
│  - Data access abstraction          │
│  - Query optimization               │
│  - Caching (Redis, if applicable)   │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Database (PostgreSQL)       │
└─────────────────────────────────────┘
```

### Why This Architecture?

**Testability:**
- Each layer can be tested independently
- Repositories can be swapped (interface-based)
- Clear test boundaries

**Maintainability:**
- Changes isolated to specific layers
- Business logic separate from HTTP concerns
- Easy to locate bugs

**Reusability:**
- Usecases can be used by different route handlers
- Repositories hide database implementation
- Business logic not tied to HTTP

**No DI Container:**
- Repos instantiated inline per request in route handlers
- Simple, explicit dependency wiring
- No framework overhead

---

## Request Lifecycle

### Complete Flow Example

```
1. HTTP POST /api/arenas
   ↓
2. Next.js App Router matches app/api/arenas/route.ts POST export
   ↓
3. Route handler executes:
   - Parse request body/query params
   - getAuthUserId() for authentication
   - Instantiate repositories (PrismaArenaRepository, etc.)
   - Instantiate usecase with repos
   - Create DTO from request data
   ↓
4. Usecase executes business logic:
   - Validate business rules
   - Call repository methods
   - Return result
   ↓
5. Repository performs database operation:
   - prismaClient.arena.create({ data })
   - Handle database errors
   - Return created entity
   ↓
6. Response flows back:
   Repository → Usecase → Route Handler → NextResponse.json()
```

### Authentication Flow

```typescript
// NextAuth.js handles sessions
// getAuthUserId() extracts user ID from session
const memberId = await getAuthUserId();

// Returns null if not logged in
if (!memberId) {
    return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
    );
}
```

### Next.js Middleware (if needed)

```typescript
// middleware.ts (project root)
// Runs before route handlers for matching paths
export function middleware(request: NextRequest) {
    // Auth checks, redirects, etc.
}

export const config = {
    matcher: ["/api/protected/:path*"],
};
```

**Note:** GameChu currently handles auth per-handler with `getAuthUserId()` rather than via middleware.

---

## Directory Structure Rationale

### API Route Handlers (`app/api/`)

**Purpose:** HTTP request/response handling only

**Structure:**
```
app/api/
  arenas/
    route.ts                # GET (list), POST (create)
    [id]/route.ts           # GET (detail), PATCH (update), DELETE
  games/
    route.ts
    [id]/route.ts
  members/
    route.ts
```

**Responsibilities:**
- Parse request parameters
- Check authentication
- Instantiate repos + usecases
- Delegate to usecases
- Return NextResponse with status codes

### Business Logic (`backend/`)

**Purpose:** Clean Architecture per feature domain

**Structure:**
```
backend/
  arena/
    application/
      usecase/
        GetArenaUsecase.ts
        CreateArenaUsecase.ts
        dto/
          GetArenaDto.ts
          ArenaListDto.ts
    domain/
      repositories/
        ArenaRepository.ts        # Interface
        filters/
          ArenaFilter.ts          # Query filter class
    infra/
      repositories/
        prisma/
          PrismaArenaRepository.ts  # Prisma implementation
      cache/
        ArenaCacheService.ts        # Redis cache (arena only)
```

**Naming:** PascalCase for all files (e.g., `GetArenaUsecase.ts`, `PrismaArenaRepository.ts`)

### Shared Libraries (`lib/`)

**Purpose:** Singletons and shared configuration

**Contents:**
- `prisma.ts` — Prisma client singleton
- `redis.ts` — Redis client singleton
- `cacheKey.ts` — Cache key generators
- `auth/authOptions.ts` — NextAuth configuration

### Utilities (`utils/`)

**Contents:**
- `GetAuthUserId.server.ts` — Server-side auth helper
- `GetAuthUserId.client.ts` — Client-side auth helper

---

## Module Organization

### Feature-Based Organization (Standard)

Each backend feature follows Clean Architecture:

```
backend/[feature]/
├── application/
│   └── usecase/           # Use case classes (business logic)
│       └── dto/           # Input/output DTOs
├── domain/
│   └── repositories/      # Repository interfaces
│       └── filters/       # Query filter classes
└── infra/
    ├── repositories/
    │   └── prisma/        # Prisma implementations
    └── cache/             # Redis cache (if needed)
```

**When to use:** Every backend feature follows this structure.

### Reference Implementation

Use `backend/arena/` as the template — it has all layers including cache.

---

## Separation of Concerns

### What Goes Where

**Route Handlers (app/api/):**
- ✅ Request parsing (params, body, query)
- ✅ Authentication check
- ✅ Repo + usecase instantiation
- ✅ Response formatting (NextResponse)
- ✅ Error handling (try-catch)
- ❌ Business logic
- ❌ Database operations
- ❌ Complex validation

**Usecases (backend/[feature]/application/):**
- ✅ Business logic
- ✅ Business rules enforcement
- ✅ Orchestration (multiple repos)
- ✅ Data transformation
- ❌ HTTP concerns (Request/Response)
- ❌ Direct Prisma calls (use repositories)

**Repositories (backend/[feature]/infra/):**
- ✅ Prisma operations
- ✅ Query construction
- ✅ Caching (Redis)
- ❌ Business logic
- ❌ HTTP concerns

### Example: Arena Creation

**Route Handler:**
```typescript
export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const body = await request.json();

        const repo = new PrismaArenaRepository();
        const memberRepo = new PrismaMemberRepository();
        const usecase = new CreateArenaUsecase(repo, memberRepo);
        const result = await usecase.execute(new CreateArenaDto(body, memberId));

        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) { /* unified error handling */ }
}
```

**Usecase:**
```typescript
async execute(dto: CreateArenaDto): Promise<Arena> {
    const member = await this.memberRepository.findById(dto.memberId);
    if (!member || member.score < 100) {
        throw new Error("투기장 생성 권한이 없습니다.");
    }
    return await this.arenaRepository.save(dto);
}
```

**Repository:**
```typescript
async save(data: CreateArenaInput): Promise<Arena> {
    return this.prisma.arena.create({ data });
}
```

**Notice:** Each layer has clear, distinct responsibilities!

---

**Related Files:**
- [SKILL.md](SKILL.md) - Main guide
- [routing-and-controllers.md](routing-and-controllers.md) - Route handler details
- [services-and-repositories.md](services-and-repositories.md) - Usecase and repository patterns

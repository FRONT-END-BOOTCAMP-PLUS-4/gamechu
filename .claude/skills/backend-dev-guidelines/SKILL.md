---
name: backend-dev-guidelines
description: Backend development guide for GameChu's Next.js API routes with Clean Architecture + DDD. Use when creating API route handlers, usecases, repositories, DTOs, middleware, or working with Prisma database access, Redis caching, Zod validation, or async patterns. Covers layered architecture (API routes → usecases → repositories), error handling, and caching strategies.
---

# Backend Development Guidelines

## Purpose

Establish consistency and best practices for GameChu's backend: Next.js 15 API route handlers + Clean Architecture per feature domain.

## When to Use This Skill

Automatically activates when working on:

- Creating or modifying API route handlers (`app/api/`)
- Building usecases, repositories, DTOs (`backend/`)
- Database operations with Prisma
- Redis caching (arena feature)
- Input validation with Zod
- Error handling patterns
- Backend refactoring

---

## Quick Start

### New Backend Feature Checklist

- [ ] **API Route**: `app/api/[feature]/route.ts` with GET/POST/PATCH/DELETE exports
- [ ] **Usecase**: `backend/[feature]/application/usecase/` with single-responsibility classes
- [ ] **DTOs**: `backend/[feature]/application/usecase/dto/` for input/output
- [ ] **Repository Interface**: `backend/[feature]/domain/repositories/`
- [ ] **Prisma Repository**: `backend/[feature]/infra/repositories/prisma/`
- [ ] **Validation**: Input validation in route handler (Zod when adopted)
- [ ] **Error Handling**: try/catch with unified error response pattern
- [ ] **Cache** (if needed): `backend/[feature]/infra/cache/` with Redis

---

## Architecture Overview

### Layered Architecture (Clean Architecture + DDD)

```
HTTP Request
    ↓
API Route Handler (app/api/[feature]/route.ts)
  - Parse params/query/body
  - Auth check (getAuthUserId)
  - Instantiate repos + usecase
    ↓
Usecase (backend/[feature]/application/usecase/)
  - Business logic orchestration
  - Uses injected repositories
    ↓
Repository (backend/[feature]/infra/repositories/prisma/)
  - Prisma queries
  - Data access only
    ↓
Database (PostgreSQL via Prisma)
```

**Key Principle:** Each layer has ONE responsibility. No DI container — repos are instantiated inline per request.

See [architecture-overview.md](architecture-overview.md) for complete details.

---

## Directory Structure

```
app/api/                          # Next.js API route handlers
  [feature]/
    route.ts                      # GET, POST handlers
    [id]/route.ts                 # GET, PATCH, DELETE by ID

backend/                          # Business logic — Clean Architecture
  [feature]/
    application/usecase/          # Use case classes
      dto/                        # Input/output DTOs
    domain/repositories/          # Repository interfaces + filter classes
      filters/                    # Query filter classes
    infra/
      repositories/prisma/        # Prisma implementations
      cache/                      # Redis cache services (if needed)

lib/                              # Singletons
  prisma.ts                       # Prisma client singleton
  redis.ts                        # Redis client singleton
  cacheKey.ts                     # Cache key generators
  auth/authOptions.ts             # NextAuth config

utils/                            # Utilities
  GetAuthUserId.server.ts         # Server-side auth helper
  GetAuthUserId.client.ts         # Client-side auth helper
```

**Naming Conventions (from `docs/CODE_CONVENTIONS.md`):**

- Folders: `kebab-case`
- Files: `PascalCase` (e.g., `GetArenaUsecase.ts`, `PrismaArenaRepository.ts`)
- Variables & functions: `camelCase`
- DB tables & columns: `snake_case`

---

## Core Principles

### 1. API Routes Are Thin — Delegate to Usecases

```typescript
// ✅ GameChu pattern: API route instantiates repos + usecase inline
export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const url = new URL(request.url);
        const currentPage = Number(url.searchParams.get("currentPage") || 1);

        const arenaRepository = new PrismaArenaRepository();
        const memberRepository = new PrismaMemberRepository();
        const getArenaUsecase = new GetArenaUsecase(
            arenaRepository,
            memberRepository
        );

        const dto = new GetArenaDto({ currentPage }, memberId);
        const result = await getArenaUsecase.execute(dto);

        return NextResponse.json(result);
    } catch (error: unknown) {
        // unified error handling
    }
}
```

### 2. Repository Pattern with Prisma

```typescript
// Domain layer — interface
export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    findById(id: number): Promise<Arena | null>;
    save(arena: CreateArenaInput): Promise<Arena>;
}

// Infra layer — Prisma implementation
export class PrismaArenaRepository implements ArenaRepository {
    private prisma = prismaClient;

    async findById(id: number): Promise<Arena | null> {
        return this.prisma.arena.findUnique({ where: { id } });
    }
}
```

### 3. Unified Error Handling

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

### 4. Use DTOs for Data Transfer

```typescript
// Input DTO
export class GetArenaDto {
    constructor(
        public queryString: { currentPage: number; status: number },
        public memberId: string | null,
        public pageSize: number = 9
    ) {}
}

// Output DTO
export class ArenaListDto {
    constructor(
        public arenas: ArenaDto[],
        public currentPage: number,
        public pages: number[],
        public endPage: number
    ) {}
}
```

### 5. Import from `@/prisma/generated` (NOT `@prisma/client`)

```typescript
// ✅ CORRECT
import { Arena } from "@/prisma/generated";
import type { Prisma } from "@/prisma/generated";

// ❌ WRONG — will break
import { Arena } from "@prisma/client";
```

### 6. Redis Caching (Arena Feature Pattern)

```typescript
import redis from "@/lib/redis";
import { getArenaListKey, getArenaDetailKey } from "@/lib/cacheKey";

// Cache with TTL
await redis.setex(key, TTL_SECONDS, JSON.stringify(data));

// Invalidate on mutation
await redis.del(getArenaDetailKey(arenaId));
```

---

## Common Imports

```typescript
// Next.js
import { NextRequest, NextResponse } from "next/server";

// Auth
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

// Database
import { prismaClient } from "@/lib/prisma";
import { Arena } from "@/prisma/generated";
import type { Prisma } from "@/prisma/generated";

// Redis (when caching)
import redis from "@/lib/redis";
import { getArenaListKey } from "@/lib/cacheKey";

// Validation (future)
import { z } from "zod";
```

---

## Quick Reference

### HTTP Status Codes

| Code | Use Case                                   |
| ---- | ------------------------------------------ |
| 200  | Success (GET, PATCH, DELETE)               |
| 201  | Created (POST)                             |
| 400  | Bad Request / Validation Error             |
| 401  | Unauthorized (not logged in)               |
| 403  | Forbidden (insufficient permissions/score) |
| 404  | Not Found                                  |
| 500  | Server Error                               |

### Feature Module Template

Use `backend/arena/` as the reference implementation — it has all layers including cache.

---

## Anti-Patterns to Avoid

❌ Business logic in route handlers (use usecases)
❌ Importing from `@prisma/client` (use `@/prisma/generated`)
❌ Raw SQL in usecases (use repository methods)
❌ Direct `process.env` without proper singleton pattern
❌ Missing error handling in route handlers
❌ `CAST(... AS UNSIGNED)` — PostgreSQL uses `::INTEGER`

---

## Navigation Guide

| Need to...                | Read this                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Understand architecture   | [architecture-overview.md](architecture-overview.md)         |
| Create API routes         | [routing-and-controllers.md](routing-and-controllers.md)     |
| Organize usecases & repos | [services-and-repositories.md](services-and-repositories.md) |
| Validate input            | [validation-patterns.md](validation-patterns.md)             |
| Create middleware         | [middleware-guide.md](middleware-guide.md)                   |
| Database access           | [database-patterns.md](database-patterns.md)                 |
| Manage config             | [configuration.md](configuration.md)                         |
| Handle async/errors       | [async-and-errors.md](async-and-errors.md)                   |
| Write tests               | [testing-guide.md](testing-guide.md)                         |
| See examples              | [complete-examples.md](complete-examples.md)                 |

---

## Resource Files

### [architecture-overview.md](architecture-overview.md)

Clean Architecture + DDD layers, request lifecycle, separation of concerns

### [routing-and-controllers.md](routing-and-controllers.md)

Next.js API route handlers, request params, query strings, error handling

### [services-and-repositories.md](services-and-repositories.md)

Usecase patterns, repository interfaces, Prisma implementations, caching

### [validation-patterns.md](validation-patterns.md)

Zod schemas (future), DTO validation patterns

### [middleware-guide.md](middleware-guide.md)

Next.js middleware, auth patterns, NextAuth.js integration

### [database-patterns.md](database-patterns.md)

Prisma client, repositories, raw queries, PostgreSQL specifics

### [configuration.md](configuration.md)

Environment variables, singleton patterns, lib/ structure

### [async-and-errors.md](async-and-errors.md)

Async patterns, unified error handling, custom errors

### [testing-guide.md](testing-guide.md)

Testing strategy (no framework yet), manual testing patterns

### [complete-examples.md](complete-examples.md)

Full feature examples based on arena module

---

## Related Skills

- **frontend-dev-guidelines** - React/TailwindCSS/Zustand patterns
- **route-tester** - Testing API routes with auth
- **skill-developer** - Meta-skill for creating and managing skills

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅
**Progressive Disclosure**: 10 resource files ✅

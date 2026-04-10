# Complete Examples - Full Working Code

Real-world examples showing complete implementation patterns based on GameChu's architecture.

## Table of Contents

- [Complete Route Handler Example](#complete-route-handler-example)
- [Complete Usecase Example](#complete-usecase-example)
- [Complete Repository Example](#complete-repository-example)
- [Refactoring Example: Bad to Good](#refactoring-example-bad-to-good)
- [End-to-End Feature Example](#end-to-end-feature-example)

---

## Complete Route Handler Example

### Arena Routes (Following All Best Practices)

```typescript
// app/api/arenas/route.ts
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { GetArenaUsecase } from "@/backend/arena/application/usecase/GetArenaUsecase";
import { GetArenaDto } from "@/backend/arena/application/usecase/dto/GetArenaDto";

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

---

## Complete Usecase Example

### GetArenaUsecase

```typescript
// backend/arena/application/usecase/GetArenaUsecase.ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { ArenaFilter } from "@/backend/arena/domain/repositories/filters/ArenaFilter";
import { GetArenaDto } from "./dto/GetArenaDto";
import { ArenaListDto } from "./dto/ArenaListDto";

export class GetArenaUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository,
        private voteRepository: VoteRepository
    ) {}

    async execute(dto: GetArenaDto): Promise<ArenaListDto> {
        const filter = new ArenaFilter({
            status: dto.queryString.status,
            memberId: dto.queryString.targetMemberId,
            page: dto.queryString.currentPage,
            pageSize: dto.pageSize,
        });

        const [arenas, totalCount] = await Promise.all([
            this.arenaRepository.findAll(filter),
            this.arenaRepository.count(filter),
        ]);

        const endPage = Math.ceil(totalCount / dto.pageSize);

        return new ArenaListDto(
            arenas,
            dto.queryString.currentPage,
            Array.from({ length: endPage }, (_, i) => i + 1),
            endPage
        );
    }
}
```

---

## Complete Repository Example

### Domain Interface + Prisma Implementation

```typescript
// backend/arena/domain/repositories/ArenaRepository.ts
import { ArenaFilter } from "./filters/ArenaFilter";
import type { Arena } from "@/prisma/generated";

export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    findById(id: number): Promise<Arena | null>;
    save(arena: CreateArenaInput): Promise<Arena>;
    update(id: number, data: Partial<Arena>): Promise<Arena>;
    delete(id: number): Promise<void>;
}
```

```typescript
// backend/arena/infra/repositories/prisma/PrismaArenaRepository.ts
import { prismaClient } from "@/lib/prisma";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaFilter } from "@/backend/arena/domain/repositories/filters/ArenaFilter";
import type { Arena } from "@/prisma/generated";

export class PrismaArenaRepository implements ArenaRepository {
    private prisma = prismaClient;

    async findById(id: number): Promise<Arena | null> {
        return this.prisma.arena.findUnique({
            where: { id },
            include: { creator: true },
        });
    }

    async findAll(filter: ArenaFilter): Promise<Arena[]> {
        return this.prisma.arena.findMany({
            where: filter.toWhereClause(),
            skip: filter.offset,
            take: filter.pageSize,
            orderBy: { createdAt: "desc" },
            include: { creator: true },
        });
    }

    async count(filter: ArenaFilter): Promise<number> {
        return this.prisma.arena.count({
            where: filter.toWhereClause(),
        });
    }

    async save(data: CreateArenaInput): Promise<Arena> {
        return this.prisma.arena.create({
            data,
            include: { creator: true },
        });
    }

    async update(id: number, data: Partial<Arena>): Promise<Arena> {
        return this.prisma.arena.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.arena.delete({ where: { id } });
    }
}
```

---

## Refactoring Example: Bad to Good

### BEFORE: Business Logic in Route Handler ❌

```typescript
// app/api/arenas/route.ts (BAD - 80+ lines)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const memberId = await getAuthUserId();

        // ❌ Permission check in handler
        const member = await prismaClient.member.findUnique({
            where: { id: memberId },
        });
        if (!member || member.score < 100) {
            return NextResponse.json({ error: "점수 부족" }, { status: 403 });
        }

        // ❌ Business logic in handler
        const arena = await prismaClient.arena.create({
            data: {
                title: body.title,
                description: body.description,
                creatorId: memberId,
                status: 1,
            },
        });

        // ❌ Side effects in handler
        await prismaClient.notification.create({
            data: { memberId, type: "ARENA_CREATED", arenaId: arena.id },
        });

        // ... more lines
        return NextResponse.json(arena, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: "실패" }, { status: 500 });
    }
}
```

### AFTER: Clean Separation ✅

**1. Clean Route Handler:**

```typescript
// app/api/arenas/route.ts
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
        const arenaRepository = new PrismaArenaRepository();
        const memberRepository = new PrismaMemberRepository();
        const createArenaUsecase = new CreateArenaUsecase(
            arenaRepository,
            memberRepository
        );

        const dto = new CreateArenaDto(body, memberId);
        const result = await createArenaUsecase.execute(dto);
        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        // unified error handling
    }
}
```

**2. Usecase:**

```typescript
// backend/arena/application/usecase/CreateArenaUsecase.ts
export class CreateArenaUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository
    ) {}

    async execute(dto: CreateArenaDto): Promise<Arena> {
        const member = await this.memberRepository.findById(dto.memberId);
        if (!member || member.score < 100) {
            throw new Error("투기장 생성을 위한 점수가 부족합니다.");
        }

        return await this.arenaRepository.save({
            title: dto.title,
            description: dto.description,
            creatorId: dto.memberId,
        });
    }
}
```

**Result:**

- Route handler: ~20 lines (parse + delegate)
- Usecase: ~15 lines (business logic)
- **Testable, maintainable, reusable!**

---

## End-to-End Feature Example

### Complete Feature Module (Arena Pattern)

**1. DTO:**

```typescript
// backend/arena/application/usecase/dto/CreateArenaDto.ts
export class CreateArenaDto {
    public title: string;
    public description: string;
    public memberId: string;

    constructor(
        body: { title: string; description: string },
        memberId: string
    ) {
        this.title = body.title;
        this.description = body.description;
        this.memberId = memberId;
    }
}
```

**2. Domain Repository Interface:**

```typescript
// backend/arena/domain/repositories/ArenaRepository.ts
export interface ArenaRepository {
    findById(id: number): Promise<Arena | null>;
    findAll(filter: ArenaFilter): Promise<Arena[]>;
    count(filter: ArenaFilter): Promise<number>;
    save(data: CreateArenaInput): Promise<Arena>;
}
```

**3. Prisma Implementation:**

```typescript
// backend/arena/infra/repositories/prisma/PrismaArenaRepository.ts
export class PrismaArenaRepository implements ArenaRepository {
    private prisma = prismaClient;

    async findById(id: number): Promise<Arena | null> {
        return this.prisma.arena.findUnique({ where: { id } });
    }

    async save(data: CreateArenaInput): Promise<Arena> {
        return this.prisma.arena.create({ data });
    }
}
```

**4. Usecase:**

```typescript
// backend/arena/application/usecase/CreateArenaUsecase.ts
export class CreateArenaUsecase {
    constructor(
        private arenaRepository: ArenaRepository,
        private memberRepository: MemberRepository,
    ) {}

    async execute(dto: CreateArenaDto): Promise<Arena> {
        // Business rules here
        return await this.arenaRepository.save({ ... });
    }
}
```

**5. Route Handler:**

```typescript
// app/api/arenas/route.ts
export async function POST(request: Request) {
    try {
        const memberId = await getAuthUserId();
        const body = await request.json();

        const arenaRepo = new PrismaArenaRepository();
        const memberRepo = new PrismaMemberRepository();
        const usecase = new CreateArenaUsecase(arenaRepo, memberRepo);

        const result = await usecase.execute(
            new CreateArenaDto(body, memberId)
        );
        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        // unified error handling
    }
}
```

**Complete Request Flow:**

```
POST /api/arenas
  ↓
Next.js matches app/api/arenas/route.ts POST handler
  ↓
Handler parses body, gets auth user ID
  ↓
Repositories instantiated inline
  ↓
Usecase instantiated with repos
  ↓
DTO created from request data
  ↓
usecase.execute(dto) — business logic runs
  ↓
Repository performs Prisma operation
  ↓
Result flows back to handler
  ↓
NextResponse.json(result, { status: 201 })
```

---

**Related Files:**

- [SKILL.md](SKILL.md)
- [routing-and-controllers.md](routing-and-controllers.md)
- [services-and-repositories.md](services-and-repositories.md)
- [validation-patterns.md](validation-patterns.md)

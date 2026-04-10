# Structured Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 44 console.error/warn logging sites with structured pino logging and remove error-swallowing try-catch wrappers in 7 use cases / 1 repository.

**Architecture:** pino singleton in `lib/logger.ts`; each API route handler creates a `log = logger.child({ route, method })` at function scope; `userId` is moved before the try block so it's accessible in catch; use cases drop outer try-catch so Prisma errors bubble with full stack.

**Tech Stack:** pino (dependency), pino-pretty (devDependency), Next.js 15 App Router

---

## File Map

**New:**

- `lib/logger.ts` — pino singleton

**Modified (use cases — remove try-catch):**

- `backend/arena/application/usecase/GetArenaUsecase.ts`
- `backend/chatting/application/usecase/CreateChattingUsecase.ts`
- `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts`
- `backend/notification-type/application/usecase/GetNotificationTypeUsecase.ts`
- `backend/score-record/application/usecase/GetScoreRecordUsecase.ts`
- `backend/score-policy/application/usecase/GetScorePolicyUsecase.ts`
- `backend/review/infra/repositories/prisma/PrismaReviewRepository.ts`

**Modified (lib files — console → pino warn):**

- `lib/withCache.ts`
- `lib/RateLimiter.ts`

**Modified (API routes — console → pino, 29 files):**

- `app/api/arenas/route.ts`
- `app/api/arenas/[id]/route.ts`
- `app/api/arenas/[id]/chattings/route.ts`
- `app/api/arenas/[id]/votes/route.ts`
- `app/api/games/route.ts`
- `app/api/games/[id]/route.ts`
- `app/api/games/[id]/reviews/route.ts`
- `app/api/genres/route.ts`
- `app/api/platforms/route.ts`
- `app/api/themes/route.ts`
- `app/api/notification-records/route.ts`
- `app/api/preferred-themes/route.ts`
- `app/api/reviews/member/route.ts`
- `app/api/reviews/member/[memberId]/route.ts`
- `app/api/member/arenas/route.ts`
- `app/api/member/arenas/[id]/route.ts`
- `app/api/member/arenas/[id]/chattings/route.ts`
- `app/api/member/arenas/[id]/votes/route.ts`
- `app/api/member/attend/route.ts`
- `app/api/member/games/[gameId]/reviews/route.ts`
- `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts`
- `app/api/member/notification-records/route.ts`
- `app/api/member/notification-records/[id]/route.ts`
- `app/api/member/profile/route.ts`
- `app/api/member/profile/[nickname]/route.ts`
- `app/api/member/review-likes/[reviewId]/route.ts`
- `app/api/member/wishlists/route.ts`
- `app/api/member/wishlists/[id]/route.ts`
- `app/api/member/scores/route.ts`

---

## Task 1: Install pino and create lib/logger.ts

**Files:**

- Create: `lib/logger.ts`

- [ ] **Step 1: Install pino and pino-pretty**

```bash
npm install pino
npm install --save-dev pino-pretty
```

Expected: `added N packages` — no errors.

- [ ] **Step 2: Create lib/logger.ts**

```typescript
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

const logger = pino({
    level: isDev ? "debug" : "info",
    transport: isDev
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
});

export default logger;
```

- [ ] **Step 3: Verify TypeScript sees the module**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors about `pino` or `lib/logger`.

- [ ] **Step 4: Commit**

```bash
git add lib/logger.ts package.json package-lock.json
git commit -m "feat: pino logger singleton 추가"
```

---

## Task 2: Remove try-catch-rethrow from 7 use cases and 1 repository

Each file wraps its entire method body in `try { ... } catch (error) { console.error(...); throw new Error(...) }`. Remove the outer try-catch so the method body is at the top level. Prisma errors bubble with full stack.

**Files:**

- Modify: `backend/arena/application/usecase/GetArenaUsecase.ts`
- Modify: `backend/chatting/application/usecase/CreateChattingUsecase.ts`
- Modify: `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts`
- Modify: `backend/notification-type/application/usecase/GetNotificationTypeUsecase.ts`
- Modify: `backend/score-record/application/usecase/GetScoreRecordUsecase.ts`
- Modify: `backend/score-policy/application/usecase/GetScorePolicyUsecase.ts`
- Modify: `backend/review/infra/repositories/prisma/PrismaReviewRepository.ts`

- [ ] **Step 1: Fix GetArenaUsecase.ts**

Replace the entire `execute` method body. Remove `try {` and the closing `} catch (error) { console.error(...); throw new Error(...) }`. The method becomes:

```typescript
async execute(getArenaDto: GetArenaDto): Promise<ArenaListDto> {
    const pageSize: number = getArenaDto.pageSize;
    const currentPage: number =
        getArenaDto.queryString.currentPage || 1;
    const viewerMemberId: string | null = getArenaDto.memberId;
    const offset: number = (currentPage - 1) * pageSize;
    const limit: number = pageSize;

    const filterMemberId =
        getArenaDto.queryString.targetMemberId ??
        (getArenaDto.queryString.mine ? viewerMemberId : null) ??
        null;

    const filter = new ArenaFilter(
        getArenaDto.queryString.status,
        filterMemberId,
        getArenaDto.sortField,
        getArenaDto.ascending,
        offset,
        limit
    );

    const arenas = await this.arenaRepository.findAll(filter);

    const arenaIds = arenas.map((a) => a.id);
    const voteCounts: Record<
        number,
        { totalCount: number; leftCount: number; rightCount: number }
    > = {};

    if (arenaIds.length > 0) {
        const voteStats = await this.voteRepository.countByArenaIds(arenaIds);
        voteStats.forEach((stat) => {
            voteCounts[stat.arenaId] = {
                totalCount: stat.totalCount,
                leftCount: stat.leftCount,
                rightCount: stat.rightCount,
            };
        });
    }

    const arenaDto: ArenaDto[] = arenas.map((arena) => {
        const { debateEndDate, voteEndDate } = GetArenaDates(arena.startDate);

        const voteData = voteCounts[arena.id] || {
            totalCount: 0,
            leftCount: 0,
            rightCount: 0,
        };

        const creatorNickname = arena.creator?.nickname || "";
        const creatorScore = arena.creator?.score || 0;
        const creatorProfileImageUrl =
            arena.creator?.imageUrl || "icons/arena2.svg";

        const challengerNickname = arena.challenger?.nickname || null;
        const challengerScore = arena.challenger?.score || null;
        const challengerProfileImageUrl = arena.challenger?.imageUrl || null;

        const leftPercent: number =
            voteData.totalCount === 0
                ? 0
                : Math.round((voteData.leftCount / voteData.totalCount) * 100);
        const rightPercent: number =
            voteData.totalCount === 0
                ? 0
                : Math.round((voteData.rightCount / voteData.totalCount) * 100);

        return {
            id: arena.id,
            creatorId: arena.creatorId,
            challengerId: arena.challengerId,
            title: arena.title,
            description: arena.description,
            status: arena.status,
            startDate: arena.startDate,
            debateEndDate,
            voteEndDate,
            creatorNickname,
            creatorProfileImageUrl,
            creatorScore,
            challengerNickname,
            challengerProfileImageUrl,
            challengerScore,
            voteCount: voteData.totalCount,
            leftCount: voteData.leftCount,
            rightCount: voteData.rightCount,
            leftPercent,
            rightPercent,
        };
    });

    const totalCount: number = await this.arenaRepository.count(filter);

    const startPage =
        Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
    const endPage = Math.ceil(totalCount / pageSize);
    const pages = Array.from(
        { length: pageSize },
        (_, i) => i + startPage
    ).filter((pageNumber) => pageNumber <= endPage);

    return {
        arenas: arenaDto,
        totalCount,
        currentPage,
        pages,
        endPage,
    };
}
```

- [ ] **Step 2: Fix CreateChattingUsecase.ts**

Replace the `execute` method body (remove outer try-catch):

```typescript
async execute(createChattingDto: CreateChattingDto): Promise<Chatting> {
    const { arenaId, memberId, content } = createChattingDto;
    const arena = await this.arenaRepository.findById(arenaId);
    if (!arena) {
        throw new Error("존재하지 않는 아레나입니다.");
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
        throw new Error(
            `메시지 길이가 너무 깁니다. (${MAX_MESSAGE_LENGTH}자 제한)`
        );
    }

    const isParticipant =
        memberId === arena.creatorId || memberId === arena.challengerId;
    if (!isParticipant) {
        throw new Error("아레나 참가자만 메시지를 보낼 수 있습니다.");
    }
    const filter = new ChattingFilter(arenaId, memberId);
    const sentCount = await this.chattingRepository.count(filter);
    if (sentCount >= MAX_SEND_COUNT) {
        throw new Error(
            `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
        );
    }
    const chatting: CreateChattingInput = {
        memberId,
        arenaId,
        content,
        createdAt: new Date(),
    };
    const newChatting = await this.chattingRepository.save(chatting);

    return newChatting;
}
```

- [ ] **Step 3: Fix GetNotificationRecordUsecase.ts**

Replace the `execute` method body (remove outer try-catch). The body is everything that was inside `try { ... }`:

```typescript
async execute(
    getNotificationRecordDto: GetNotificationRecordDto
): Promise<NotificationRecordListDto> {
    // page setup
    const pageSize: number = 5;
    const currentPage: number =
        getNotificationRecordDto.currentPage || 1;
    const memberId: string = getNotificationRecordDto.memberId;
    const offset: number = (currentPage - 1) * pageSize;
    const limit: number = pageSize;

    // data query
    const filter = new NotificationRecordFilter(
        memberId,
        null,
        null,
        "createdAt",
        false,
        offset,
        limit
    );

    const records: NotificationRecord[] =
        await this.notificationRecordRepository.findAll(filter);
    const recordDto: NotificationRecordDto[] = await Promise.all(
        records.map(async (record) => {
            const type: NotificationType | null =
                await this.notificationTypeRepository.findById(
                    record.typeId
                );

            return {
                id: record.id,
                memberId: record.memberId,
                typeId: record.typeId,
                description: record.description,
                createdAt: record.createdAt,
                typeName: type?.name || "기타",
                typeImageUrl:
                    type?.imageUrl ||
                    "@/public/icons/defaultTypeImage.ico",
            };
        })
    );
    const totalCount: number =
        await this.notificationRecordRepository.count(filter);
    const startPage =
        Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
    const endPage = Math.ceil(totalCount / pageSize);
    const pages = Array.from(
        { length: 5 },
        (_, i) => i + startPage
    ).filter((pageNumber) => pageNumber <= endPage);

    const recordListDto: NotificationRecordListDto = {
        records: recordDto,
        totalCount,
        currentPage,
        pages,
        endPage,
    };

    return recordListDto;
}
```

- [ ] **Step 4: Fix GetNotificationTypeUsecase.ts**

Replace the `execute` method body:

```typescript
async execute(): Promise<NotificationType[]> {
    const notificationTypes: NotificationType[] =
        await this.notificationTypeRepository.findAll();
    return notificationTypes;
}
```

- [ ] **Step 5: Fix GetScoreRecordUsecase.ts**

Replace the `execute` method body (remove outer try-catch):

```typescript
async execute(
    getScoreRecordDto: GetScoreRecordDto
): Promise<ScoreRecordListDto> {
    // page setup
    const pageSize: number = getScoreRecordDto.pageSize;
    const currentPage: number =
        getScoreRecordDto.queryString.currentPage || 1;
    const offset: number = (currentPage - 1) * pageSize;
    const limit: number = pageSize;

    // data query
    const filter = new ScoreRecordFilter(
        getScoreRecordDto.queryString.policyId,
        getScoreRecordDto.memberId,
        getScoreRecordDto.sortField,
        getScoreRecordDto.ascending,
        offset,
        limit
    );

    const scoreRecords: ScoreRecord[] =
        await this.scoreRecordRepository.findAll(filter);
    const scoreRecordDto: ScoreRecordDto[] = await Promise.all(
        scoreRecords.map(async (scoreRecord) => {
            const scorePolicy: ScorePolicy | null =
                await this.scorePolicyRepository.findById(
                    scoreRecord.policyId
                );

            return {
                id: scoreRecord.id,
                memberId: scoreRecord.memberId,
                policyId: scoreRecord.policyId,
                createdAt: scoreRecord.createdAt,
                actualScore: scoreRecord.actualScore,

                policyName: scorePolicy ? scorePolicy.name : "",
                description: scorePolicy ? scorePolicy.description : "",
                score: scorePolicy ? scorePolicy.score : 0,
                imageUrl: scorePolicy ? scorePolicy.imageUrl : "",
            };
        })
    );

    const totalCount: number =
        await this.scoreRecordRepository.count(filter);
    const startPage =
        Math.floor((currentPage - 1) / pageSize) * pageSize + 1;
    const endPage = Math.ceil(totalCount / pageSize);
    const pages = Array.from(
        { length: pageSize },
        (_, i) => i + startPage
    ).filter((pageNumber) => pageNumber <= endPage);

    const scoreRecordListDto: ScoreRecordListDto = {
        records: scoreRecordDto,
        totalCount,
        currentPage,
        pages,
        endPage,
    };
    return scoreRecordListDto;
}
```

- [ ] **Step 6: Fix GetScorePolicyUsecase.ts**

Replace the `execute` method body:

```typescript
async execute(): Promise<ScorePolicy[]> {
    const scorePolicies: ScorePolicy[] =
        await this.scorePolicyRepository.findAll();

    return scorePolicies;
}
```

- [ ] **Step 7: Fix PrismaReviewRepository.ts — delete method**

Replace the `delete` method body (remove try-catch, keep the two await calls):

```typescript
async delete(reviewId: number): Promise<void> {
    await this.prisma.reviewLike.deleteMany({
        where: { reviewId },
    });

    await this.prisma.review.delete({
        where: { id: reviewId },
    });
}
```

- [ ] **Step 8: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. No TypeScript errors in modified files.

- [ ] **Step 9: Commit**

```bash
git add backend/arena/application/usecase/GetArenaUsecase.ts \
  backend/chatting/application/usecase/CreateChattingUsecase.ts \
  backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts \
  backend/notification-type/application/usecase/GetNotificationTypeUsecase.ts \
  backend/score-record/application/usecase/GetScoreRecordUsecase.ts \
  backend/score-policy/application/usecase/GetScorePolicyUsecase.ts \
  backend/review/infra/repositories/prisma/PrismaReviewRepository.ts
git commit -m "refactor: 유스케이스 try-catch-rethrow 패턴 제거 (에러 원본 보존)"
```

---

## Task 3: Migrate lib/withCache.ts and lib/RateLimiter.ts

Replace `console.error`/`console.warn` with `logger.warn` — these are graceful degradation sites.

**Files:**

- Modify: `lib/withCache.ts`
- Modify: `lib/RateLimiter.ts`

- [ ] **Step 1: Rewrite lib/withCache.ts**

```typescript
import redis from "@/lib/redis";
import logger from "@/lib/logger";

export async function withCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;
    } catch {
        logger.warn({ key }, "캐시 읽기 실패 — DB로 폴백");
    }

    const data = await fn();

    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch {
        logger.warn({ key }, "캐시 쓰기 실패");
    }

    return data;
}
```

- [ ] **Step 2: Update lib/RateLimiter.ts — replace console calls**

In `RateLimiter.ts`, make two replacements:

Replace (around line 44):

```typescript
console.warn(`[RateLimiter] ${this.prefix} limit exceeded for ${key}`);
```

With:

```typescript
logger.warn({ prefix: this.prefix, key }, "레이트 리밋 초과");
```

Replace (around line 56-58 in the catch block):

```typescript
console.error(`[RateLimiter] Redis error for ${this.prefix}:`, error);
```

With:

```typescript
logger.warn(
    { prefix: this.prefix, err: error },
    "레이트 리미터 Redis 오류 — 요청 허용"
);
```

Also add the import at the top of `lib/RateLimiter.ts`:

```typescript
import logger from "@/lib/logger";
```

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/withCache.ts lib/RateLimiter.ts
git commit -m "refactor: withCache/RateLimiter console → pino warn (graceful degradation)"
```

---

## Task 4: Migrate public API routes

14 route files. Pattern for each: add `import logger`, add `const log = logger.child(...)` at the top of the handler (before try), replace `console.error` with `log.error`, move `getAuthUserId()` before the try block when needed.

**Files:**

- Modify: `app/api/arenas/route.ts`
- Modify: `app/api/arenas/[id]/route.ts`
- Modify: `app/api/arenas/[id]/chattings/route.ts`
- Modify: `app/api/arenas/[id]/votes/route.ts`
- Modify: `app/api/games/route.ts`
- Modify: `app/api/games/[id]/route.ts`
- Modify: `app/api/games/[id]/reviews/route.ts`
- Modify: `app/api/genres/route.ts`
- Modify: `app/api/platforms/route.ts`
- Modify: `app/api/themes/route.ts`
- Modify: `app/api/notification-records/route.ts`
- Modify: `app/api/preferred-themes/route.ts`
- Modify: `app/api/reviews/member/route.ts`
- Modify: `app/api/reviews/member/[memberId]/route.ts`

- [ ] **Step 1: app/api/arenas/route.ts**

Add import at top:

```typescript
import logger from "@/lib/logger";
```

Rewrite the `GET` handler. Move `memberId` before the outer try block and add the child logger:

```typescript
export async function GET(request: Request) {
    const log = logger.child({ route: "/api/arenas", method: "GET" });
    const memberId = await getAuthUserId();
    try {
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

        if (!memberId && mine) {
            return NextResponse.json(
                { message: "멤버 투기장 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        let effectiveMemberId: string | undefined;
        if (targetMemberId) {
            effectiveMemberId = targetMemberId;
        } else if (mine && memberId) {
            effectiveMemberId = memberId;
        } else {
            effectiveMemberId = undefined;
        }

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const memberRepository: MemberRepository = new PrismaMemberRepository();
        const voteRepository: VoteRepository = new PrismaVoteRepository();

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

        let version = "0";
        try {
            version = (await redis.get(ARENA_LIST_VERSION_KEY)) ?? "0";
        } catch {
            log.warn({}, "아레나 버전 키 캐시 읽기 실패");
        }
        const key = arenaListKey(version, {
            currentPage,
            status,
            targetMemberId: effectiveMemberId,
            pageSize,
        });

        const arenaListDto: ArenaListDto = await withCache(key, 60, () =>
            getArenaUsecase.execute(getArenaDto)
        );

        return NextResponse.json(arenaListDto);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "아레나 목록 조회 실패");

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

- [ ] **Step 2: app/api/arenas/[id]/route.ts — PATCH handler**

Add import:

```typescript
import logger from "@/lib/logger";
```

In the PATCH handler, add child logger at the top of the function (before existing code):

```typescript
export async function PATCH(req: NextRequest, { params }: RequestParams) {
    const log = logger.child({ route: "/api/arenas/[id]", method: "PATCH" })
    // ... existing code ...
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 수정 실패")
        if (error instanceof Error) {
```

In the DELETE handler, add child logger:

```typescript
export async function DELETE(request: Request, { params }: RequestParams) {
    const log = logger.child({ route: "/api/arenas/[id]", method: "DELETE" })
    // ... existing code ...
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 삭제 실패")
        if (error instanceof Error) {
```

Remove the two `console.error` lines.

- [ ] **Step 3: app/api/arenas/[id]/chattings/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

`memberId` is already declared before the try block (line 16). Add child logger and replace console.error:

```typescript
export async function GET(req: Request, { params }: RequestParams) {
    const { id } = await params;
    const memberId: string | null = await getAuthUserId();
    const log = logger.child({
        route: "/api/arenas/[id]/chattings",
        method: "GET",
    });

    // ... existing validation ...

    try {
        // ... existing code ...
    } catch (error) {
        log.error({ userId: memberId, err: error }, "채팅 조회 실패");
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

- [ ] **Step 4: app/api/arenas/[id]/votes/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

`memberId` is already before the try block. Add child logger and replace console.error:

```typescript
export async function GET(request: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const { id } = await params;
    const log = logger.child({
        route: "/api/arenas/[id]/votes",
        method: "GET",
    });

    // ... existing validation ...

    try {
        // ... existing code ...
    } catch (error) {
        log.error({ userId: memberId, err: error }, "투표 정보 조회 실패");
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

- [ ] **Step 5: app/api/games/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

In the GET handler, add child logger at the top. Collapse the two `console.error` branches into one `log.error` before the if/else:

```typescript
export async function GET(req: NextRequest) {
    const log = logger.child({ route: "/api/games", method: "GET" });
    try {
        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ err: error }, "게임 목록 조회 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: "게임 목록 조회 중 오류가 발생했습니다." },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                {
                    message:
                        "게임 목록 조회 중 알 수 없는 오류가 발생했습니다.",
                },
                { status: 500 }
            );
        }
    }
}
```

(Remove both `console.error` lines; add `log.error` once before the if/else.)

- [ ] **Step 6: app/api/games/[id]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Add child logger and replace console.error:

```typescript
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const log = logger.child({ route: "/api/games/[id]", method: "GET" });
    // ... existing code ...
    try {
        // ...
    } catch (err) {
        log.error({ err }, "게임 상세 조회 실패");
        return NextResponse.json(
            { message: "Game not found" },
            { status: 404 }
        );
    }
}
```

- [ ] **Step 7: app/api/games/[id]/reviews/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

`viewerId` is available inside the try block (line 20). No need to move it since we won't log it (it's not the authenticated user per se). Add child logger at the top of GET:

```typescript
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const log = logger.child({
        route: "/api/games/[id]/reviews",
        method: "GET",
    });
    try {
        // ... existing code ...
    } catch (error: unknown) {
        log.error({ err: error }, "게임 리뷰 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 8: app/api/genres/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Replace:

```typescript
export async function GET() {
    const log = logger.child({ route: "/api/genres", method: "GET" });
    try {
        // ... existing code ...
    } catch (e) {
        log.error({ err: e }, "장르 조회 실패");
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

- [ ] **Step 9: app/api/platforms/route.ts**

Same pattern as genres:

```typescript
export async function GET() {
    const log = logger.child({ route: "/api/platforms", method: "GET" });
    try {
        // ... existing code ...
    } catch (e) {
        log.error({ err: e }, "플랫폼 조회 실패");
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

Add `import logger from "@/lib/logger"`.

- [ ] **Step 10: app/api/themes/route.ts**

Same pattern:

```typescript
export async function GET() {
    const log = logger.child({ route: "/api/themes", method: "GET" });
    try {
        // ... existing code ...
    } catch (e) {
        log.error({ err: e }, "테마 조회 실패");
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

Add `import logger from "@/lib/logger"`.

- [ ] **Step 11: app/api/notification-records/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Add child logger and replace:

```typescript
export async function POST(request: Request) {
    const log = logger.child({
        route: "/api/notification-records",
        method: "POST",
    });
    try {
        // ... existing code ...
    } catch (error: unknown) {
        log.error({ err: error }, "알림 기록 생성 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 생성 실패" },
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

- [ ] **Step 12: app/api/preferred-themes/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try and add child logger:

```typescript
export async function POST(req: NextRequest) {
    const log = logger.child({
        route: "/api/preferred-themes",
        method: "POST",
    });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { themeIds } = await req.json();
        const dto = new CreatePreferredThemesDto(memberId, themeIds);

        const repo = new PrismaPreferredThemeRepository();
        const usecase = new CreatePreferredThemesUsecase(repo);
        await usecase.execute(dto);

        return NextResponse.json(
            { message: "선호 테마 저장 완료" },
            { status: 200 }
        );
    } catch (err) {
        log.error({ userId: memberId, err }, "선호 테마 저장 실패");
        const message =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
```

- [ ] **Step 13: app/api/reviews/member/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function GET() {
    const log = logger.child({ route: "/api/reviews/member", method: "GET" });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return errorResponse("Unauthorized", 401);
        }

        const usecase = new GetReviewsByMemberIdUsecase(
            new PrismaReviewRepository()
        );
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "본인 리뷰 목록 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 14: app/api/reviews/member/[memberId]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Add child logger (no userId here — memberId is a path param, not auth):

```typescript
export async function GET(
    request: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const log = logger.child({
        route: "/api/reviews/member/[memberId]",
        method: "GET",
    });
    try {
        // ... existing code ...
    } catch (error: unknown) {
        log.error({ err: error }, "회원 리뷰 목록 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 15: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 16: Commit**

```bash
git add app/api/arenas/route.ts \
  "app/api/arenas/[id]/route.ts" \
  "app/api/arenas/[id]/chattings/route.ts" \
  "app/api/arenas/[id]/votes/route.ts" \
  app/api/games/route.ts \
  "app/api/games/[id]/route.ts" \
  "app/api/games/[id]/reviews/route.ts" \
  app/api/genres/route.ts \
  app/api/platforms/route.ts \
  app/api/themes/route.ts \
  app/api/notification-records/route.ts \
  app/api/preferred-themes/route.ts \
  app/api/reviews/member/route.ts \
  "app/api/reviews/member/[memberId]/route.ts"
git commit -m "refactor: public API 라우트 console.error → pino logger"
```

---

## Task 5: Migrate member API routes

15 route files. Same pattern as Task 4.

**Files:**

- Modify: `app/api/member/arenas/route.ts`
- Modify: `app/api/member/arenas/[id]/route.ts`
- Modify: `app/api/member/arenas/[id]/chattings/route.ts`
- Modify: `app/api/member/arenas/[id]/votes/route.ts`
- Modify: `app/api/member/attend/route.ts`
- Modify: `app/api/member/games/[gameId]/reviews/route.ts`
- Modify: `app/api/member/games/[gameId]/reviews/[reviewId]/route.ts`
- Modify: `app/api/member/notification-records/route.ts`
- Modify: `app/api/member/notification-records/[id]/route.ts`
- Modify: `app/api/member/profile/route.ts`
- Modify: `app/api/member/profile/[nickname]/route.ts`
- Modify: `app/api/member/review-likes/[reviewId]/route.ts`
- Modify: `app/api/member/wishlists/route.ts`
- Modify: `app/api/member/wishlists/[id]/route.ts`
- Modify: `app/api/member/scores/route.ts`

- [ ] **Step 1: app/api/member/arenas/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function POST(request: Request) {
    const log = logger.child({ route: "/api/member/arenas", method: "POST" });
    const memberId: string | null = await getAuthUserId();
    try {
        // member validation
        if (!memberId) {
            return NextResponse.json(
                { message: "투기장 작성 권한이 없습니다." },
                { status: 401 }
            );
        }

        // body validation
        const body = await request.json();
        const validated = validate(CreateArenaSchema, body);
        if (!validated.success) return validated.response;

        // score validation
        const memberRepository = new PrismaMemberRepository();
        const member = await memberRepository.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { message: "회원 정보를 찾을 수 없습니다." },
                { status: 404 }
            );
        }
        if (member.score < 100) {
            return NextResponse.json(
                {
                    message:
                        "투기장 작성을 위해서는 최소 100점 이상의 점수가 필요합니다.",
                },
                { status: 403 }
            );
        }

        // execute usecase
        const createArenaDto: CreateArenaDto = new CreateArenaDto(
            memberId,
            validated.data.title,
            validated.data.description,
            new Date(validated.data.startDate)
        );
        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const createArenaUsecase: CreateArenaUsecase = new CreateArenaUsecase(
            arenaRepository
        );
        const newArena: Arena =
            await createArenaUsecase.execute(createArenaDto);

        return NextResponse.json(newArena, { status: 201 });
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "아레나 생성 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 생성 실패" },
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

- [ ] **Step 2: app/api/member/arenas/[id]/route.ts — DELETE handler**

Add import:

```typescript
import logger from "@/lib/logger";
```

The DELETE handler has `console.error("Error deleting arenas:", error)`. The `memberId` is declared inside the try block (line 95), so it's not accessible at catch time. Add child logger at the top of DELETE and replace:

```typescript
export async function DELETE(request: Request, { params }: RequestParams) {
    const log = logger.child({
        route: "/api/member/arenas/[id]",
        method: "DELETE",
    });
    try {
        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ err: error }, "아레나 삭제 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 삭제 실패" },
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

(The PATCH handler has no `console.error` — leave it unchanged.)

- [ ] **Step 3: app/api/member/arenas/[id]/chattings/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

`memberId` is already before the try block (line 21). Add child logger after memberId and replace the multi-line console.error:

```typescript
export async function POST(req: NextRequest, { params }: RequestParams) {
    const { id } = await params;
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/arenas/[id]/chattings",
        method: "POST",
    });

    // ... existing auth/validation unchanged ...

    try {
        // ... existing code ...
    } catch (error: unknown) {
        log.error(
            { userId: memberId, arenaId, err: error },
            "채팅 메시지 전송 실패"
        );
        // ... existing response logic unchanged (the if/typeof checks) ...
    }
}
```

Note: `arenaId` is declared before the try block (line 37), so it is accessible in the catch.

- [ ] **Step 4: app/api/member/arenas/[id]/votes/route.ts — PATCH handler**

Add import:

```typescript
import logger from "@/lib/logger";
```

The PATCH handler has `console.error("🔥 PATCH vote error:", error)`. `memberId` is inside the try block (line 51), so it's not accessible at catch. Add child logger:

```typescript
export async function PATCH(req: NextRequest) {
    const log = logger.child({
        route: "/api/member/arenas/[id]/votes",
        method: "PATCH",
    });
    try {
        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ err: error }, "투표 수정 실패");
        const errorMessage =
            error instanceof Error ? error.message : "서버 오류";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
```

(The POST handler has no `console.error` — leave unchanged.)

- [ ] **Step 5: app/api/member/attend/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function POST() {
    const log = logger.child({ route: "/api/member/attend", method: "POST" });
    const memberId = await getAuthUserId();
    try {
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
        log.error({ userId: memberId, err: error }, "출석 체크 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 6: app/api/member/games/[gameId]/reviews/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

`memberId` is already before the try block (line 14). Add child logger and replace:

```typescript
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    const memberId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/games/[gameId]/reviews",
        method: "POST",
    });

    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ... existing validation code unchanged ...

    try {
        const result = await usecase.execute(memberId, {
            gameId: gameIdValidated.data,
            ...validated.data,
        });
        return NextResponse.json(result);
    } catch (err) {
        log.error({ userId: memberId, err }, "리뷰 작성 실패");
        return NextResponse.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Internal Server Error",
            },
            { status: 400 }
        );
    }
}
```

- [ ] **Step 7: app/api/member/games/[gameId]/reviews/[reviewId]/route.ts — PATCH handler**

Add import:

```typescript
import logger from "@/lib/logger";
```

`userId` is already before the try block in PATCH (line 20). Add child logger and replace:

```typescript
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ gameId: string; reviewId: string }> }
) {
    const userId = await getAuthUserId();
    const log = logger.child({
        route: "/api/member/games/[gameId]/reviews/[reviewId]",
        method: "PATCH",
    });
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ... existing code unchanged ...

    try {
        const result = await updateReviewUsecase.execute(
            reviewIdValidated.data,
            validated.data
        );
        return NextResponse.json(result);
    } catch (err) {
        log.error({ userId, err }, "리뷰 수정 실패");
        return NextResponse.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "Internal Server Error",
            },
            { status: 400 }
        );
    }
}
```

(The DELETE handler has no `console.error` — leave unchanged.)

- [ ] **Step 8: app/api/member/notification-records/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function GET(request: Request) {
    const log = logger.child({
        route: "/api/member/notification-records",
        method: "GET",
    });
    const memberId: string | null = await getAuthUserId();
    try {
        // member validation
        if (!memberId) {
            return NextResponse.json(
                { message: "알림 조회 권한이 없습니다." },
                { status: 401 }
            );
        }

        // get query parameters from URL
        const url = new URL(request.url);
        const parsed = validate(
            GetNotificationRecordSchema,
            Object.fromEntries(url.searchParams)
        );
        if (!parsed.success) return parsed.response;

        const { currentPage } = parsed.data;

        // set up usecase
        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const notificationTypeRepository: NotificationTypeRepository =
            new PrismaNotificationTypeRepository();

        const getNotificationRecordUsecase = new GetNotificationRecordUsecase(
            notificationRecordRepository,
            notificationTypeRepository
        );

        // set up query Dto
        const getNotificationRecordDto = new GetNotificationRecordDto(
            currentPage,
            memberId
        );

        const notificationRecordListDto: NotificationRecordListDto =
            await getNotificationRecordUsecase.execute(
                getNotificationRecordDto
            );

        return NextResponse.json(notificationRecordListDto);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 기록 조회 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 조회 실패" },
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

- [ ] **Step 9: app/api/member/notification-records/[id]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function DELETE(request: Request, { params }: RequestParams) {
    const log = logger.child({
        route: "/api/member/notification-records/[id]",
        method: "DELETE",
    });
    const memberId: string | null = await getAuthUserId();
    try {
        // member validation
        if (!memberId) {
            return errorResponse("멤버가 아닙니다.", 401);
        }

        const { id }: { id: string } = await params;

        const notificationRecordRepository: NotificationRecordRepository =
            new PrismaNotificationRecordRepository();
        const deleteNotificationRecordUsecase: DeleteNotificationRecordUsecase =
            new DeleteNotificationRecordUsecase(notificationRecordRepository);

        // validation of notification record
        const notificationRecord: NotificationRecord | null =
            await notificationRecordRepository.findById(Number(id));

        if (!notificationRecord) {
            return errorResponse("알림이 존재하지 않습니다.", 404);
        }
        if (notificationRecord.memberId !== memberId) {
            return errorResponse("알림 삭제 권한이 없습니다.", 403);
        }

        // execute usecase
        await deleteNotificationRecordUsecase.execute(Number(id));
        return NextResponse.json(
            {
                message: "알림 삭제 성공",
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "알림 기록 삭제 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "알림 삭제 실패" },
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

- [ ] **Step 10: app/api/member/profile/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

For GET: move session/memberId before try, add child logger:

```typescript
export async function GET() {
    const log = logger.child({ route: "/api/member/profile", method: "GET" });
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        const getUsecase = new GetMemberProfileUsecase(
            new PrismaMemberRepository()
        );
        const profile = await getUsecase.execute(memberId);
        if (!profile) return errorResponse("Not found", 404);

        return NextResponse.json(profile);
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "프로필 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

For PUT: move session/memberId before try, add child logger:

```typescript
export async function PUT(req: Request) {
    const log = logger.child({ route: "/api/member/profile", method: "PUT" });
    const session = await getServerSession(authOptions);
    const memberId = session?.user?.id;
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        const body = await req.json();

        const validated = validate(UpdateProfileSchema, body);
        if (!validated.success) return validated.response;

        const updateUsecase = new UpdateMemberProfileUseCase(
            new PrismaMemberRepository()
        );

        const dto = new UpdateProfileRequestDto({
            memberId,
            nickname: validated.data.nickname,
            isMale: validated.data.isMale,
            birthDate: validated.data.birthDate,
            imageUrl: validated.data.imageUrl,
        });

        await updateUsecase.execute(dto);

        return NextResponse.json({
            message: "프로필이 성공적으로 수정되었습니다.",
        });
    } catch (err: unknown) {
        log.error({ userId: memberId, err }, "프로필 수정 실패");
        const message = err instanceof Error ? err.message : "프로필 수정 실패";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 11: app/api/member/profile/[nickname]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Add child logger (no userId — public nickname lookup):

```typescript
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    const log = logger.child({
        route: "/api/member/profile/[nickname]",
        method: "GET",
    });
    try {
        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ err: error }, "닉네임 프로필 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 12: app/api/member/review-likes/[reviewId]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `userId` before try, add child logger:

```typescript
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    const log = logger.child({
        route: "/api/member/review-likes/[reviewId]",
        method: "POST",
    });
    const userId = await getAuthUserId();
    try {
        if (!userId) return errorResponse("Unauthorized", 401);

        // ... existing code unchanged ...
    } catch (err: unknown) {
        log.error({ userId, err }, "리뷰 좋아요 토글 실패");
        const message =
            err instanceof Error ? err.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 13: app/api/member/wishlists/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

For GET: move `memberId` before try, add child logger:

```typescript
export async function GET(req: NextRequest) {
    const log = logger.child({ route: "/api/member/wishlists", method: "GET" });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "위시리스트 조회 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

For POST: move `memberId` before try, add child logger:

```typescript
export async function POST(req: NextRequest) {
    const log = logger.child({
        route: "/api/member/wishlists",
        method: "POST",
    });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) return errorResponse("Unauthorized", 401);

        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ userId: memberId, err: error }, "위시리스트 추가 실패");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

- [ ] **Step 14: app/api/member/wishlists/[id]/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

Move `memberId` before try, add child logger:

```typescript
export async function DELETE(req: NextRequest, { params }: RequestParams) {
    const log = logger.child({
        route: "/api/member/wishlists/[id]",
        method: "DELETE",
    });
    const memberId = await getAuthUserId();
    try {
        if (!memberId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // ... existing code unchanged ...
    } catch (error) {
        log.error({ userId: memberId, err: error }, "위시리스트 삭제 실패");
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "삭제 실패" },
            { status: 400 }
        );
    }
}
```

- [ ] **Step 15: app/api/member/scores/route.ts**

Add import:

```typescript
import logger from "@/lib/logger";
```

For GET: `memberId` is already before the try block (line 12). Add child logger, replace console.error:

```typescript
export async function GET() {
    const memberId = await getAuthUserId();
    const log = logger.child({ route: "/api/member/scores", method: "GET" });

    if (!memberId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const repo = new PrismaScoreRecordRepository();
    const usecase = new GetScoreRecordsUsecase(repo);

    try {
        const result = await usecase.execute(memberId);
        return NextResponse.json(result);
    } catch (error) {
        log.error({ userId: memberId, err: error }, "점수 기록 조회 실패");
        return NextResponse.json(
            { message: "스코어 기록 조회 실패" },
            { status: 500 }
        );
    }
}
```

For POST: `memberId` is inside the try block (line 52). Add child logger and replace console.error, memberId not accessible at catch:

```typescript
export async function POST(request: Request) {
    const log = logger.child({ route: "/api/member/scores", method: "POST" });
    try {
        // ... existing code unchanged ...
    } catch (error: unknown) {
        log.error({ err: error }, "점수 기록 생성 실패");
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "점수 기록 생성 실패" },
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

- [ ] **Step 16: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 17: Run unit tests**

```bash
npm test 2>&1 | tail -20
```

Expected: all 182 tests pass. (No test changes needed — no tests spy on console.error.)

- [ ] **Step 18: Commit**

```bash
git add app/api/member/
git commit -m "refactor: member API 라우트 console.error → pino logger"
```

---

## Task 6: Final verification

- [ ] **Step 1: Confirm no console.error/warn remain in migrated files**

```bash
grep -r "console\.error\|console\.warn" app/api/ backend/arena/application/usecase/GetArenaUsecase.ts backend/chatting/application/usecase/CreateChattingUsecase.ts backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts backend/notification-type/application/usecase/GetNotificationTypeUsecase.ts backend/score-record/application/usecase/GetScoreRecordUsecase.ts backend/score-policy/application/usecase/GetScorePolicyUsecase.ts backend/review/infra/repositories/prisma/PrismaReviewRepository.ts lib/withCache.ts lib/RateLimiter.ts
```

Expected: no output (zero matches).

- [ ] **Step 2: Confirm lib/logger.ts is imported where needed**

```bash
grep -r "console\.error\|console\.warn" app/ lib/ backend/ --include="*.ts" | grep -v "node_modules" | grep -v ".next"
```

Expected: either zero results or only matches in files intentionally outside scope.

- [ ] **Step 3: Full build**

```bash
npm run build
```

Expected: `Route (app)` table prints with no errors, build completes.

- [ ] **Step 4: Full test suite**

```bash
npm test
```

Expected: all tests pass.

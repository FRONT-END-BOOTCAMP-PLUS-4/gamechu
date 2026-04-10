# Redis Cache Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Redis caching to all uncached read endpoints and refactor arena cache from a dedicated service class to a unified `withCache` utility with version-based list invalidation.

**Architecture:** A single generic `withCache<T>(key, ttl, fn)` utility handles all read caching with graceful Redis error degradation. Arena list invalidation uses a Redis version counter (`INCR`) instead of SCAN-based pattern deletion, eliminating `ArenaCacheService` entirely and moving cache logic out of usecases into route handlers.

**Tech Stack:** Next.js 15 App Router, ioredis (via `@/lib/redis`), TypeScript, Vitest

---

## File Map

| Action | File                                                                        | Responsibility                                                 |
| ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Create | `lib/withCache.ts`                                                          | Generic `withCache<T>` utility                                 |
| Create | `lib/__tests__/withCache.test.ts`                                           | Unit tests for withCache                                       |
| Modify | `lib/cacheKey.ts`                                                           | Remove arena-specific generators; add new key functions        |
| Modify | `app/api/genres/route.ts`                                                   | Add withCache                                                  |
| Modify | `app/api/platforms/route.ts`                                                | Add withCache                                                  |
| Modify | `app/api/themes/route.ts`                                                   | Add withCache                                                  |
| Modify | `app/api/games/[id]/route.ts`                                               | Add withCache                                                  |
| Modify | `app/api/games/__tests__/route.test.ts`                                     | Add gameMetaKey cache miss test                                |
| Modify | `app/api/games/route.ts`                                                    | Add meta caching; refactor inline list cache → withCache       |
| Modify | `app/api/member/profile/[nickname]/route.ts`                                | Add withCache                                                  |
| Modify | `app/api/member/profile/[nickname]/__tests__/route.test.ts`                 | Add redis mock                                                 |
| Modify | `backend/arena/application/usecase/GetArenaUsecase.ts`                      | Remove cache calls                                             |
| Modify | `backend/arena/application/usecase/GetArenaDetailUsecase.ts`                | Remove cache calls                                             |
| Modify | `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts` | Remove cache mocks                                             |
| Modify | `app/api/arenas/route.ts`                                                   | Add version-fetch + withCache                                  |
| Modify | `app/api/arenas/__tests__/route.test.ts`                                    | Add redis mock                                                 |
| Modify | `app/api/arenas/[id]/route.ts`                                              | Add withCache for GET; replace ArenaCacheService with del+incr |
| Create | `app/api/arenas/[id]/__tests__/route.test.ts`                               | Cache invalidation tests for PATCH/DELETE                      |
| Delete | `backend/arena/infra/cache/ArenaCacheService.ts`                            | No longer needed                                               |

---

## Task 1: `withCache` utility

**Files:**

- Create: `lib/withCache.ts`
- Create: `lib/__tests__/withCache.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/__tests__/withCache.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockSetex = vi.fn();

vi.mock("@/lib/redis", () => ({
    default: {
        get: mockGet,
        setex: mockSetex,
    },
}));

import { withCache } from "../withCache";

describe("withCache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("cache hit: returns parsed cached value, fn not called", async () => {
        mockGet.mockResolvedValue(JSON.stringify({ name: "cached" }));
        const fn = vi.fn();

        const result = await withCache("test:key", 60, fn);

        expect(result).toEqual({ name: "cached" });
        expect(fn).not.toHaveBeenCalled();
        expect(mockSetex).not.toHaveBeenCalled();
    });

    it("cache miss: calls fn, writes to cache with correct key and TTL", async () => {
        mockGet.mockResolvedValue(null);
        const data = { name: "fresh" };
        const fn = vi.fn().mockResolvedValue(data);

        const result = await withCache("test:key", 300, fn);

        expect(fn).toHaveBeenCalledOnce();
        expect(result).toEqual(data);
        expect(mockSetex).toHaveBeenCalledWith(
            "test:key",
            300,
            JSON.stringify(data)
        );
    });

    it("redis read error: fn still called, result returned without throwing", async () => {
        mockGet.mockRejectedValue(new Error("Redis down"));
        const data = { name: "fresh" };
        const fn = vi.fn().mockResolvedValue(data);

        const result = await withCache("test:key", 60, fn);

        expect(fn).toHaveBeenCalledOnce();
        expect(result).toEqual(data);
    });

    it("redis write error: result still returned without throwing", async () => {
        mockGet.mockResolvedValue(null);
        mockSetex.mockRejectedValue(new Error("Redis down"));
        const fn = vi.fn().mockResolvedValue({ name: "fresh" });

        await expect(withCache("test:key", 60, fn)).resolves.toEqual({
            name: "fresh",
        });
    });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run lib/__tests__/withCache.test.ts
```

Expected: FAIL — `Cannot find module '../withCache'`

- [ ] **Step 3: Implement `lib/withCache.ts`**

```ts
import redis from "@/lib/redis";

export async function withCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;
    } catch {
        console.error(`[cache] read error: ${key}`);
    }

    const data = await fn();

    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch {
        console.error(`[cache] write error: ${key}`);
    }

    return data;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run lib/__tests__/withCache.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/withCache.ts lib/__tests__/withCache.test.ts
git commit -m "feat: add withCache utility"
```

---

## Task 2: Update `lib/cacheKey.ts`

**Files:**

- Modify: `lib/cacheKey.ts`

- [ ] **Step 1: Replace the file content**

Replace the full contents of `lib/cacheKey.ts` with:

```ts
export type SortType = "latest" | "popular" | "rating";

export interface CacheKeyParams {
    genreId?: string;
    themeId?: string;
    platformId?: string;
    keyword?: string;
    sort: SortType;
    page: string;
    size: string;
}

/**
 * Game list cache key (existing — unchanged)
 */
export function generateCacheKey(params: CacheKeyParams): string {
    const {
        genreId = "",
        themeId = "",
        platformId = "",
        keyword = "",
        sort = "popular",
        page = "1",
        size = "6",
    } = params;

    return `games:${sort}:${genreId}:${themeId}:${platformId}:${keyword}:${page}:${size}`;
}

// ─── New key generators ────────────────────────────────────────────────────

export function gameDetailKey(id: number): string {
    return `game:detail:${id}`;
}

export function genreListKey(): string {
    return "genre:list";
}

export function platformListKey(): string {
    return "platform:list";
}

export function themeListKey(): string {
    return "theme:list";
}

export function gameMetaKey(): string {
    return "game:meta";
}

export function memberProfileKey(nickname: string): string {
    return `member:profile:${nickname}`;
}

// ─── Arena keys (version-based) ───────────────────────────────────────────

export const ARENA_LIST_VERSION_KEY = "arena:list:version";

export interface ArenaListKeyParams {
    currentPage: number;
    status?: number;
    targetMemberId?: string;
    pageSize: number;
}

export function arenaListKey(
    version: string,
    params: ArenaListKeyParams
): string {
    const { currentPage, status, targetMemberId, pageSize } = params;
    return `arena:list:v${version}:${status ?? ""}:${targetMemberId ?? ""}:${pageSize}:${currentPage}`;
}

export function arenaDetailKey(id: number): string {
    return `arena:detail:${id}`;
}
```

- [ ] **Step 2: Run full test suite to check for breakage**

```bash
npm test
```

Expected: All existing tests pass. If any test imports `generateArenaCacheKey` or `getArenaCachePatterns`, it will fail — fix those imports before proceeding (they will be removed from their consumers in later tasks).

- [ ] **Step 3: Commit**

```bash
git add lib/cacheKey.ts
git commit -m "feat: update cacheKey with new generators, version-aware arena keys"
```

---

## Task 3: Cache genres, platforms, themes routes

**Files:**

- Modify: `app/api/genres/route.ts`
- Modify: `app/api/platforms/route.ts`
- Modify: `app/api/themes/route.ts`

No existing tests for these three routes. The `withCache` utility is already tested — no additional route tests needed here.

- [ ] **Step 1: Update `app/api/genres/route.ts`**

```ts
import { NextResponse } from "next/server";
import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { GetAllGenresUsecase } from "@/backend/genre/application/usecase/GetAllGenresUsecase";
import { withCache } from "@/lib/withCache";
import { genreListKey } from "@/lib/cacheKey";

export async function GET() {
    try {
        const repo = new PrismaGenreRepository();
        const usecase = new GetAllGenresUsecase(repo);
        const genres = await withCache(genreListKey(), 3600, () =>
            usecase.execute()
        );
        return NextResponse.json(genres);
    } catch (e) {
        console.error("[GET /genres] 장르 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

- [ ] **Step 2: Update `app/api/platforms/route.ts`**

```ts
import { NextResponse } from "next/server";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { GetAllPlatformsUsecase } from "@/backend/platform/application/usecase/GetAllPlatformsUsecase";
import { withCache } from "@/lib/withCache";
import { platformListKey } from "@/lib/cacheKey";

export async function GET() {
    try {
        const repo = new PrismaPlatformRepository();
        const usecase = new GetAllPlatformsUsecase(repo);
        const platforms = await withCache(platformListKey(), 3600, () =>
            usecase.execute()
        );
        return NextResponse.json(platforms);
    } catch (e) {
        console.error("[GET /platforms] 플랫폼 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

- [ ] **Step 3: Update `app/api/themes/route.ts`**

```ts
import { NextResponse } from "next/server";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { GetAllThemesUsecase } from "@/backend/theme/application/usecase/GetAllThemesUsecase";
import { withCache } from "@/lib/withCache";
import { themeListKey } from "@/lib/cacheKey";

export async function GET() {
    try {
        const repo = new PrismaThemeRepository();
        const usecase = new GetAllThemesUsecase(repo);
        const themes = await withCache(themeListKey(), 3600, () =>
            usecase.execute()
        );
        return NextResponse.json(themes);
    } catch (e) {
        console.error("[GET /themes] 테마 조회 실패:", e);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All existing tests pass (no tests for these routes exist).

- [ ] **Step 5: Commit**

```bash
git add app/api/genres/route.ts app/api/platforms/route.ts app/api/themes/route.ts
git commit -m "feat: add Redis caching to genres, platforms, themes routes"
```

---

## Task 4: Cache game detail route

**Files:**

- Modify: `app/api/games/[id]/route.ts`

- [ ] **Step 1: Update `app/api/games/[id]/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import { withCache } from "@/lib/withCache";
import { gameDetailKey } from "@/lib/cacheKey";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const gameId = Number(id);

    if (isNaN(gameId)) {
        return NextResponse.json(
            { message: "Invalid game ID" },
            { status: 400 }
        );
    }

    const usecase = new GetGameDetailUsecase(
        new GamePrismaRepository(),
        new PrismaReviewRepository()
    );

    try {
        const gameDetail = await withCache(gameDetailKey(gameId), 600, () =>
            usecase.execute(gameId)
        );
        return NextResponse.json(gameDetail);
    } catch (err) {
        console.error("게임 조회 실패:", err);
        return NextResponse.json(
            { message: "Game not found" },
            { status: 404 }
        );
    }
}
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add app/api/games/[id]/route.ts
git commit -m "feat: add Redis caching to game detail route"
```

---

## Task 5: Cache game meta + refactor game list

**Files:**

- Modify: `app/api/games/route.ts`
- Modify: `app/api/games/__tests__/route.test.ts`

The game list route has two caching changes:

1. The `?meta=true` branch gets `withCache` added (new)
2. The inline list caching is replaced with `withCache` (refactor — TTL unchanged at 24h)

After the refactor the direct `redis` import in this route is no longer needed (withCache handles it internally), so it's removed.

- [ ] **Step 1: Update `app/api/games/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";

import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { GetFilteredGamesUsecase } from "@/backend/game/application/usecase/GetFilteredGamesUsecase";
import { GetGameMetaDataUsecase } from "@/backend/game/application/usecase/GetGameMetaDataUsecase";
import { GetFilteredGamesSchema } from "@/backend/game/application/usecase/dto/GetFilteredGamesRequestDto";

import { PrismaGenreRepository } from "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository";
import { PrismaThemeRepository } from "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository";
import { PrismaPlatformRepository } from "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

import { withCache } from "@/lib/withCache";
import { generateCacheKey, gameMetaKey } from "@/lib/cacheKey";
import type { CacheKeyParams } from "@/lib/cacheKey";
import { validate } from "@/utils/validation";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        const meta = params.get("meta") === "true";

        if (meta) {
            const metaUsecase = new GetGameMetaDataUsecase(
                new PrismaGenreRepository(),
                new PrismaThemeRepository(),
                new PrismaPlatformRepository()
            );
            const metadata = await withCache(gameMetaKey(), 3600, () =>
                metaUsecase.execute()
            );
            return NextResponse.json(metadata, { status: 200 });
        }

        const validation = validate(
            GetFilteredGamesSchema,
            Object.fromEntries(params)
        );
        if (!validation.success) {
            return validation.response;
        }

        const { sort, page, size, genreId, themeId, platformId, keyword } =
            validation.data;
        const offset = (page - 1) * size;
        const limit = size;

        const cacheKeyParams: CacheKeyParams = {
            genreId: genreId?.toString(),
            themeId: themeId?.toString(),
            platformId: platformId?.toString(),
            keyword,
            sort,
            page: page.toString(),
            size: size.toString(),
        };

        const cacheKey = generateCacheKey(cacheKeyParams);

        const gameRepo = new GamePrismaRepository();
        const reviewRepo = new PrismaReviewRepository();
        const getFilteredGamesUsecase = new GetFilteredGamesUsecase(
            gameRepo,
            reviewRepo
        );

        const response = await withCache(cacheKey, 60 * 60 * 24, async () => {
            const { data, totalCount } = await getFilteredGamesUsecase.execute({
                genreId,
                themeId,
                platformId,
                keyword,
                sort,
                offset,
                limit,
            });
            return { games: data, totalCount };
        });

        return NextResponse.json(response, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("[GET /api/games] 에러:", error.message, error.stack);
            return NextResponse.json(
                { message: "게임 목록 조회 중 오류가 발생했습니다." },
                { status: 500 }
            );
        } else {
            console.error("[GET /api/games] 알 수 없는 에러:", error);
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

- [ ] **Step 2: Update `app/api/games/__tests__/route.test.ts`**

The existing test mocks `redis.get`/`redis.set`. After the refactor, the route no longer imports `redis` directly — `withCache` does. Update the mock to also include `setex` (used by `withCache` instead of `set`):

```ts
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue("OK"),
    },
}));

const mockGames = [{ id: 1, title: "Game 1" }];

vi.mock("@/backend/game/application/usecase/GetFilteredGamesUsecase", () => ({
    GetFilteredGamesUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi
            .fn()
            .mockResolvedValue({ data: mockGames, totalCount: 1 });
    }),
}));

vi.mock("@/backend/game/application/usecase/GetGameMetaDataUsecase", () => ({
    GetGameMetaDataUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi
            .fn()
            .mockResolvedValue({ genres: [], themes: [], platforms: [] });
    }),
}));

vi.mock(
    "@/backend/game/infra/repositories/prisma/GamePrismaRepository",
    () => ({
        GamePrismaRepository: vi.fn(function () {}),
    })
);
vi.mock(
    "@/backend/review/infra/repositories/prisma/PrismaReviewRepository",
    () => ({
        PrismaReviewRepository: vi.fn(function () {}),
    })
);
vi.mock(
    "@/backend/genre/infra/repositories/prisma/PrismaGenreRepository",
    () => ({
        PrismaGenreRepository: vi.fn(function () {}),
    })
);
vi.mock(
    "@/backend/theme/infra/repositories/prisma/PrismaThemeRepository",
    () => ({
        PrismaThemeRepository: vi.fn(function () {}),
    })
);
vi.mock(
    "@/backend/platform/infra/repositories/prisma/PrismaPlatformRepository",
    () => ({
        PrismaPlatformRepository: vi.fn(function () {}),
    })
);

import { GET } from "../route";

describe("GET /api/games", () => {
    it("returns 200 with games array", async () => {
        const req = new NextRequest("http://localhost/api/games");
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.games).toHaveLength(1);
        expect(data.totalCount).toBe(1);
    });

    it("GET with invalid sort value returns 400", async () => {
        const req = new NextRequest("http://localhost/api/games?sort=invalid");
        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("GET with page=0 returns 400", async () => {
        const req = new NextRequest("http://localhost/api/games?page=0");
        const response = await GET(req);
        expect(response.status).toBe(400);
    });

    it("GET with meta=true returns metadata", async () => {
        const req = new NextRequest("http://localhost/api/games?meta=true");
        const response = await GET(req);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty("genres");
        expect(data).toHaveProperty("themes");
        expect(data).toHaveProperty("platforms");
    });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run app/api/games/__tests__/route.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 4: Commit**

```bash
git add app/api/games/route.ts app/api/games/__tests__/route.test.ts
git commit -m "feat: add meta caching, refactor game list inline cache to withCache"
```

---

## Task 6: Cache member profile route

**Files:**

- Modify: `app/api/member/profile/[nickname]/route.ts`
- Modify: `app/api/member/profile/[nickname]/__tests__/route.test.ts`

Note: `withCache` caches `null` (profile not found) as `"null"` in Redis. On cache hit, `JSON.parse("null") === null`, which correctly returns 404. This is acceptable for a 120s TTL.

- [ ] **Step 1: Update `app/api/member/profile/[nickname]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { GetMemberProfileByNicknameUsecase } from "@/backend/member/application/usecase/GetMemberProfileByNicknameUsecase";
import { errorResponse } from "@/utils/apiResponse";
import { withCache } from "@/lib/withCache";
import { memberProfileKey } from "@/lib/cacheKey";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    try {
        const { nickname } = await params;
        const usecase = new GetMemberProfileByNicknameUsecase(
            new PrismaMemberRepository()
        );
        const profile = await withCache(memberProfileKey(nickname), 120, () =>
            usecase.execute(nickname)
        );

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

- [ ] **Step 2: Update `app/api/member/profile/[nickname]/__tests__/route.test.ts`**

Add `redis` mock at the top (the route now uses `withCache` which calls redis internally):

```ts
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue("OK"),
    },
}));

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

- [ ] **Step 3: Run tests**

```bash
npx vitest run "app/api/member/profile/\[nickname\]/__tests__/route.test.ts"
```

Expected: PASS — 2 tests

- [ ] **Step 4: Commit**

```bash
git add "app/api/member/profile/[nickname]/route.ts" "app/api/member/profile/[nickname]/__tests__/route.test.ts"
git commit -m "feat: add Redis caching to member profile route"
```

---

## Task 7: Refactor arena usecases — remove cache logic

**Files:**

- Modify: `backend/arena/application/usecase/GetArenaUsecase.ts`
- Modify: `backend/arena/application/usecase/GetArenaDetailUsecase.ts`
- Modify: `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts`

After this task the usecases contain zero Redis references. Cache logic moves to routes in Task 8.

- [ ] **Step 1: Update `backend/arena/application/usecase/GetArenaDetailUsecase.ts`**

Remove: `ArenaCacheService` import, `cacheService` field, constructor assignment, cache get at start, cache set at end.

```ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { ArenaStatus } from "@/types/arena-status";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDetailDto } from "./dto/GetArenaDetailDto";

export class GetArenaDetailUsecase {
    private arenaRepository: ArenaRepository;
    private memberRepository: MemberRepository;
    private voteRepository: VoteRepository;

    constructor(
        arenaRepository: ArenaRepository,
        memberRepository: MemberRepository,
        voteRepository: VoteRepository
    ) {
        this.arenaRepository = arenaRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
    }

    async execute(
        getArenaDetailDto: GetArenaDetailDto
    ): Promise<ArenaDetailDto> {
        const { arenaId } = getArenaDetailDto;

        const ArenaDetail = await this.arenaRepository.getArenaById(arenaId);

        const creatorName = ArenaDetail.creator?.nickname || "";
        const creatorScore = ArenaDetail.creator?.score || 0;
        const creatorImageUrl = ArenaDetail.creator?.imageUrl || "";
        const challengerName = ArenaDetail.challenger?.nickname || "";
        const challengerScore = ArenaDetail.challenger?.score || null;
        const challengerImageUrl = ArenaDetail.challenger?.imageUrl || null;

        const startDate = ArenaDetail.startDate;
        const endChatting = new Date(startDate.getTime() + 30 * 60 * 1000);
        const endVote = new Date(endChatting.getTime() + 24 * 60 * 60 * 1000);

        const voteStats = await this.voteRepository.countByArenaIds([arenaId]);
        const voteData = voteStats[0] || {
            arenaId,
            totalCount: 0,
            leftCount: 0,
            rightCount: 0,
        };

        const voteTotalCount = voteData.totalCount;
        const voteLeftCount = voteData.leftCount;
        const voteRightCount = voteData.rightCount;

        const leftPercent: number =
            voteTotalCount === 0
                ? 0
                : Math.round((voteLeftCount / voteTotalCount) * 100);
        const rightPercent: number =
            voteTotalCount === 0
                ? 0
                : Math.round((voteRightCount / voteTotalCount) * 100);

        return new ArenaDetailDto(
            ArenaDetail.id,
            ArenaDetail.creatorId,
            creatorName,
            creatorScore,
            creatorImageUrl,
            ArenaDetail.challengerId,
            challengerName,
            challengerScore,
            challengerImageUrl,
            ArenaDetail.title,
            ArenaDetail.description,
            ArenaDetail.startDate,
            endChatting,
            endVote,
            ArenaDetail.status as ArenaStatus,
            voteTotalCount,
            voteLeftCount,
            voteRightCount,
            leftPercent,
            rightPercent
        );
    }
}
```

- [ ] **Step 2: Update `backend/arena/application/usecase/GetArenaUsecase.ts`**

Remove: `ArenaCacheService` import, `cacheService` field, constructor assignment, cache get block, cache set call.

```ts
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { GetArenaDto } from "./dto/GetArenaDto";
import { ArenaListDto } from "./dto/ArenaListDto";
import { ArenaFilter } from "../../domain/repositories/filters/ArenaFilter";
import { ArenaDto } from "./dto/ArenaDto";
import { GetArenaDates } from "@/utils/GetArenaDates";

export class GetArenaUsecase {
    private arenaRepository: ArenaRepository;
    private memberRepository: MemberRepository;
    private voteRepository: VoteRepository;

    constructor(
        arenaRepository: ArenaRepository,
        memberRepository: MemberRepository,
        voteRepository: VoteRepository
    ) {
        this.arenaRepository = arenaRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
    }

    async execute(getArenaDto: GetArenaDto): Promise<ArenaListDto> {
        try {
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
                const voteStats =
                    await this.voteRepository.countByArenaIds(arenaIds);
                voteStats.forEach((stat) => {
                    voteCounts[stat.arenaId] = {
                        totalCount: stat.totalCount,
                        leftCount: stat.leftCount,
                        rightCount: stat.rightCount,
                    };
                });
            }

            const arenaDto: ArenaDto[] = arenas.map((arena) => {
                const { debateEndDate, voteEndDate } = GetArenaDates(
                    arena.startDate
                );

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
                const challengerProfileImageUrl =
                    arena.challenger?.imageUrl || null;

                const leftPercent: number =
                    voteData.totalCount === 0
                        ? 0
                        : Math.round(
                              (voteData.leftCount / voteData.totalCount) * 100
                          );
                const rightPercent: number =
                    voteData.totalCount === 0
                        ? 0
                        : Math.round(
                              (voteData.rightCount / voteData.totalCount) * 100
                          );

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
        } catch (error) {
            console.error("Error retrieving arenas", error);
            throw new Error("Error retrieving arenas");
        }
    }
}
```

- [ ] **Step 3: Update `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts`**

Remove: `ArenaCacheService` mock, redis mock, cache-specific mock variables. Remove the "cache hit" test — it's no longer valid. The remaining tests cover business logic only.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {},
}));

import { GetArenaDetailUsecase } from "../GetArenaDetailUsecase";
import { MockArenaRepository } from "@/tests/mocks/MockArenaRepository";
import { MockMemberRepository } from "@/tests/mocks/MockMemberRepository";
import { MockVoteRepository } from "@/tests/mocks/MockVoteRepository";

const startDate = new Date("2026-04-01T10:00:00.000Z");
const mockArenaWithRelations = {
    id: 42,
    creatorId: "creator-1",
    challengerId: "challenger-1",
    title: "Test Arena",
    description: "A test arena",
    startDate,
    status: 2,
    creator: {
        id: "creator-1",
        nickname: "Creator",
        imageUrl: null,
        score: 100,
    },
    challenger: {
        id: "challenger-1",
        nickname: "Challenger",
        imageUrl: null,
        score: 80,
    },
};

describe("GetArenaDetailUsecase", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("executes business logic: calls getArenaById and builds ArenaDetailDto", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 10, leftCount: 7, rightCount: 3 },
        ]);

        const usecase = new GetArenaDetailUsecase(
            arenaRepo,
            memberRepo,
            voteRepo
        );
        const result = await usecase.execute({ arenaId: 42 });

        expect(arenaRepo.getArenaById).toHaveBeenCalledWith(42);
        expect(result.id).toBe(42);
        expect(result.title).toBe("Test Arena");
    });

    it("vote percentage: totalCount > 0 computes leftPercent and rightPercent correctly", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 10, leftCount: 3, rightCount: 7 },
        ]);

        const usecase = new GetArenaDetailUsecase(
            arenaRepo,
            memberRepo,
            voteRepo
        );
        const result = await usecase.execute({ arenaId: 42 });

        expect(result.leftPercent).toBe(30);
        expect(result.rightPercent).toBe(70);
    });

    it("zero-vote edge case: totalCount === 0 → both percents are 0", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 0, leftCount: 0, rightCount: 0 },
        ]);

        const usecase = new GetArenaDetailUsecase(
            arenaRepo,
            memberRepo,
            voteRepo
        );
        const result = await usecase.execute({ arenaId: 42 });

        expect(result.leftPercent).toBe(0);
        expect(result.rightPercent).toBe(0);
    });

    it("time calculations: endChatting = startDate + 30min, endVote = endChatting + 24h", async () => {
        const arenaRepo = MockArenaRepository();
        const memberRepo = MockMemberRepository();
        const voteRepo = MockVoteRepository();

        vi.mocked(arenaRepo.getArenaById).mockResolvedValue(
            mockArenaWithRelations as never
        );
        vi.mocked(voteRepo.countByArenaIds).mockResolvedValue([
            { arenaId: 42, totalCount: 0, leftCount: 0, rightCount: 0 },
        ]);

        const usecase = new GetArenaDetailUsecase(
            arenaRepo,
            memberRepo,
            voteRepo
        );
        const result = await usecase.execute({ arenaId: 42 });

        const expectedEndChatting = new Date(
            startDate.getTime() + 30 * 60 * 1000
        );
        const expectedEndVote = new Date(
            expectedEndChatting.getTime() + 24 * 60 * 60 * 1000
        );

        expect(result.endChatting.getTime()).toBe(
            expectedEndChatting.getTime()
        );
        expect(result.endVote.getTime()).toBe(expectedEndVote.getTime());
    });
});
```

- [ ] **Step 4: Run usecase tests**

```bash
npx vitest run backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: All tests pass. If any test imports `ArenaCacheService`, it will fail — those are fixed in Task 8.

- [ ] **Step 6: Commit**

```bash
git add backend/arena/application/usecase/GetArenaUsecase.ts backend/arena/application/usecase/GetArenaDetailUsecase.ts "backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts"
git commit -m "refactor: remove cache logic from arena usecases"
```

---

## Task 8: Refactor arena routes + delete ArenaCacheService

**Files:**

- Modify: `app/api/arenas/route.ts`
- Modify: `app/api/arenas/__tests__/route.test.ts`
- Modify: `app/api/arenas/[id]/route.ts`
- Create: `app/api/arenas/[id]/__tests__/route.test.ts`
- Delete: `backend/arena/infra/cache/ArenaCacheService.ts`

- [ ] **Step 1: Update `app/api/arenas/route.ts`**

```ts
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";
import {
    GetArenaDto,
    GetArenaSchema,
} from "@/backend/arena/application/usecase/dto/GetArenaDto";
import { GetArenaUsecase } from "@/backend/arena/application/usecase/GetArenaUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { MemberRepository } from "@/backend/member/domain/repositories/MemberRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { VoteRepository } from "@/backend/vote/domain/repositories/VoteRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { validate } from "@/utils/validation";
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { withCache } from "@/lib/withCache";
import { ARENA_LIST_VERSION_KEY, arenaListKey } from "@/lib/cacheKey";

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

        const version = (await redis.get(ARENA_LIST_VERSION_KEY)) ?? "0";
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

- [ ] **Step 2: Update `app/api/arenas/__tests__/route.test.ts`**

Add redis mock (needed because route now calls `redis.get` for version fetch and `withCache` calls `redis.get`/`redis.setex`):

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn().mockResolvedValue("OK"),
    },
}));

vi.mock("@/utils/GetAuthUserId.server", () => ({
    getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

const mockArenaListDto = {
    arenas: [{ id: 1, title: "Arena 1" }],
    totalCount: 1,
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

vi.mock("@/backend/arena/application/usecase/GetArenaUsecase", () => ({
    GetArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(mockArenaListDto);
    }),
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function () {}),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function () {}),
    })
);

vi.mock(
    "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository",
    () => ({
        PrismaVoteRepository: vi.fn(function () {}),
    })
);

import { GET } from "../route";

describe("GET /api/arenas", () => {
    it("returns 200 with arena list", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=10&status=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.arenas).toHaveLength(1);
    });

    it("GET without pageSize param: still calls usecase (not 0 crash)", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&status=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
    });

    it("GET with status filter: forwards status to usecase", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=10&status=2"
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
    });

    it("GET with invalid currentPage returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=0&pageSize=10"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });

    it("GET with invalid pageSize returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&pageSize=0"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });

    it("GET with invalid mine value returns 400", async () => {
        const request = new Request(
            "http://localhost/api/arenas?currentPage=1&mine=yes"
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });
});
```

- [ ] **Step 3: Update `app/api/arenas/[id]/route.ts`**

Replace `ArenaCacheService` usage with direct `redis.del` + `redis.incr`. Add `withCache` to GET. Full file:

```ts
import { DeleteArenaUsecase } from "@/backend/arena/application/usecase/DeleteArenaUsecase";
import { GetArenaDetailDto } from "@/backend/arena/application/usecase/dto/GetArenaDetailDto";
import { UpdateArenaDetailDto } from "@/backend/arena/application/usecase/dto/UpdateArenaDetailDto";
import { UpdateArenaAdminSchema } from "@/backend/arena/application/usecase/dto/UpdateArenaDto";
import { EndArenaUsecase } from "@/backend/arena/application/usecase/EndArenaUsecase";
import { GetArenaDetailUsecase } from "@/backend/arena/application/usecase/GetArenaDetailUsecase";
import { UpdateArenaStatusUsecase } from "@/backend/arena/application/usecase/UpdateArenaStatusUsecase";
import { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";
import { PrismaArenaRepository } from "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository";
import { PrismaMemberRepository } from "@/backend/member/infra/repositories/prisma/PrismaMemberRepository";
import { ApplyArenaScoreUsecase } from "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase";
import { ScorePolicy } from "@/backend/score-policy/domain/ScorePolicy";
import { PrismaScoreRecordRepository } from "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository";
import { PrismaVoteRepository } from "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository";
import { Arena } from "@/prisma/generated";
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { withCache } from "@/lib/withCache";
import { arenaDetailKey, ARENA_LIST_VERSION_KEY } from "@/lib/cacheKey";
import { validate, IdSchema } from "@/utils/validation";
import type { ArenaStatus } from "@/types/arena-status";
import { errorResponse } from "@/utils/apiResponse";

type RequestParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const arenaId = idValidated.data;

    const arenaRepository = new PrismaArenaRepository();
    const memberRepository = new PrismaMemberRepository();
    const voteRepository = new PrismaVoteRepository();
    const getArenaDetailusecase = new GetArenaDetailUsecase(
        arenaRepository,
        memberRepository,
        voteRepository
    );
    const getArenaDetailDto = new GetArenaDetailDto(arenaId);
    try {
        const result = await withCache(arenaDetailKey(arenaId), 120, () =>
            getArenaDetailusecase.execute(getArenaDetailDto)
        );
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message.includes("Arena not found")
        ) {
            return errorResponse("투기장이 존재하지 않습니다.", 404);
        }
        return errorResponse(`Failed to fetch participants: ${error}`, 500);
    }
}

export async function PATCH(req: NextRequest, { params }: RequestParams) {
    const { id } = await params;
    const idValidated = validate(IdSchema, id);
    if (!idValidated.success) return idValidated.response;
    const arenaId = idValidated.data;

    const body = await req.json();
    const validated = validate(UpdateArenaAdminSchema, body);
    if (!validated.success) return validated.response;

    const { status, challengerId } = validated.data;

    const scorePolicy = new ScorePolicy();
    const memberRepository = new PrismaMemberRepository();
    const scoreRecordRepository = new PrismaScoreRecordRepository();
    const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
        scorePolicy,
        memberRepository,
        scoreRecordRepository
    );
    const arenaRepository = new PrismaArenaRepository();
    const voteRepository = new PrismaVoteRepository();
    const updateArenaStatusUsecase = new UpdateArenaStatusUsecase(
        arenaRepository,
        applyArenaScoreUsecase
    );
    const endArenaUsecase = new EndArenaUsecase(
        arenaRepository,
        applyArenaScoreUsecase,
        voteRepository
    );

    const updateArenaDetailDto = new UpdateArenaDetailDto(
        arenaId,
        status as ArenaStatus,
        challengerId
    );
    try {
        if (status === 2) {
            if (!challengerId) {
                return errorResponse("참여자 정보를 찾을 수 없습니다.", 400);
            }

            const challenger = await memberRepository.findById(challengerId);
            if (!challenger) {
                return errorResponse("회원 정보를 찾을 수 없습니다.", 404);
            }

            if (challenger.score < 100) {
                return errorResponse(
                    "투기장 참여를 위해서는 최소 100점 이상의 점수가 필요합니다.",
                    403
                );
            }
        }

        await updateArenaStatusUsecase.execute(updateArenaDetailDto);
        if (status === 5) {
            await endArenaUsecase.execute(arenaId);
        }

        await redis.del(arenaDetailKey(arenaId));
        await redis.incr(ARENA_LIST_VERSION_KEY);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error updating arenas:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || "투기장 수정 실패" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RequestParams) {
    try {
        const { id } = await params;
        const idValidated = validate(IdSchema, id);
        if (!idValidated.success) return idValidated.response;
        const arenaId = idValidated.data;

        const arenaRepository: ArenaRepository = new PrismaArenaRepository();
        const voteRepository = new PrismaVoteRepository();
        const scorePolicy = new ScorePolicy();
        const memberRepository = new PrismaMemberRepository();
        const scoreRecordRepository = new PrismaScoreRecordRepository();
        const applyArenaScoreUsecase = new ApplyArenaScoreUsecase(
            scorePolicy,
            memberRepository,
            scoreRecordRepository
        );

        const endArenaUsecase = new EndArenaUsecase(
            arenaRepository,
            applyArenaScoreUsecase,
            voteRepository
        );

        const deleteArenaUsecase: DeleteArenaUsecase = new DeleteArenaUsecase(
            arenaRepository
        );

        const arena: Arena | null = await arenaRepository.findById(arenaId);

        if (!arena) {
            return errorResponse("투기장이 존재하지 않습니다.", 404);
        }

        await endArenaUsecase.execute(arenaId);
        await deleteArenaUsecase.execute(arenaId);

        await redis.del(arenaDetailKey(arenaId));
        await redis.incr(ARENA_LIST_VERSION_KEY);

        return NextResponse.json(
            { message: "투기장 삭제 성공" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting arenas:", error);
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

- [ ] **Step 4: Create `app/api/arenas/[id]/__tests__/route.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDel = vi.fn().mockResolvedValue(1);
const mockIncr = vi.fn().mockResolvedValue(1);
const mockGet = vi.fn().mockResolvedValue(null);
const mockSetex = vi.fn().mockResolvedValue("OK");

vi.mock("@/lib/redis", () => ({
    default: {
        del: mockDel,
        incr: mockIncr,
        get: mockGet,
        setex: mockSetex,
    },
}));

vi.mock("@/backend/arena/application/usecase/GetArenaDetailUsecase", () => ({
    GetArenaDetailUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi
            .fn()
            .mockResolvedValue({ id: 1, title: "Test Arena" });
    }),
}));

vi.mock("@/backend/arena/application/usecase/UpdateArenaStatusUsecase", () => ({
    UpdateArenaStatusUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/application/usecase/EndArenaUsecase", () => ({
    EndArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock("@/backend/arena/application/usecase/DeleteArenaUsecase", () => ({
    DeleteArenaUsecase: vi.fn(function (this: Record<string, unknown>) {
        this.execute = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock(
    "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository",
    () => ({
        PrismaArenaRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi.fn().mockResolvedValue({ id: 1 });
            this.getArenaById = vi.fn().mockResolvedValue({ id: 1 });
        }),
    })
);

vi.mock(
    "@/backend/member/infra/repositories/prisma/PrismaMemberRepository",
    () => ({
        PrismaMemberRepository: vi.fn(function (this: Record<string, unknown>) {
            this.findById = vi
                .fn()
                .mockResolvedValue({ id: "member-1", score: 200 });
        }),
    })
);

vi.mock(
    "@/backend/vote/infra/repositories/prisma/PrismaVoteRepository",
    () => ({
        PrismaVoteRepository: vi.fn(function () {}),
    })
);

vi.mock(
    "@/backend/score-policy/application/usecase/ApplyArenaScoreUsecase",
    () => ({
        ApplyArenaScoreUsecase: vi.fn(function () {}),
    })
);

vi.mock("@/backend/score-policy/domain/ScorePolicy", () => ({
    ScorePolicy: vi.fn(function () {}),
}));

vi.mock(
    "@/backend/score-record/infra/repositories/prisma/PrismaScoreRecordRepository",
    () => ({
        PrismaScoreRecordRepository: vi.fn(function () {}),
    })
);

import { PATCH, DELETE } from "../route";

const makeParams = (id = "1") => ({ params: Promise.resolve({ id }) });

describe("PATCH /api/arenas/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("status update: calls redis.del and redis.incr for cache invalidation", async () => {
        const req = new Request("http://localhost/api/arenas/1", {
            method: "PATCH",
            body: JSON.stringify({ status: 2, challengerId: "member-1" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req as never, makeParams("1"));
        expect(response.status).toBe(200);
        expect(mockDel).toHaveBeenCalledWith("arena:detail:1");
        expect(mockIncr).toHaveBeenCalledWith("arena:list:version");
    });

    it("invalid id returns 400, no cache calls made", async () => {
        const req = new Request("http://localhost/api/arenas/abc", {
            method: "PATCH",
            body: JSON.stringify({ status: 2 }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req as never, makeParams("abc"));
        expect(response.status).toBe(400);
        expect(mockDel).not.toHaveBeenCalled();
        expect(mockIncr).not.toHaveBeenCalled();
    });
});

describe("DELETE /api/arenas/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("deletion: calls redis.del and redis.incr for cache invalidation", async () => {
        const req = new Request("http://localhost/api/arenas/1", {
            method: "DELETE",
        });

        const response = await DELETE(req as never, makeParams("1"));
        expect(response.status).toBe(200);
        expect(mockDel).toHaveBeenCalledWith("arena:detail:1");
        expect(mockIncr).toHaveBeenCalledWith("arena:list:version");
    });

    it("arena not found: returns 404, no cache calls made", async () => {
        const { PrismaArenaRepository } = await import(
            "@/backend/arena/infra/repositories/prisma/PrismaArenaRepository"
        );
        vi.mocked(PrismaArenaRepository).mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            this.findById = vi.fn().mockResolvedValue(null);
        } as unknown as typeof PrismaArenaRepository);

        const req = new Request("http://localhost/api/arenas/1", {
            method: "DELETE",
        });

        const response = await DELETE(req as never, makeParams("1"));
        expect(response.status).toBe(404);
        expect(mockDel).not.toHaveBeenCalled();
        expect(mockIncr).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 5: Run arena route tests**

```bash
npx vitest run app/api/arenas/__tests__/route.test.ts "app/api/arenas/\[id\]/__tests__/route.test.ts"
```

Expected: PASS — all tests

- [ ] **Step 6: Delete `ArenaCacheService.ts`**

```bash
rm backend/arena/infra/cache/ArenaCacheService.ts
```

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: All tests pass. Count should be at least equal to the previous run (minus the removed "cache hit" test from usecase tests).

- [ ] **Step 8: Commit**

```bash
git add app/api/arenas/route.ts "app/api/arenas/__tests__/route.test.ts" "app/api/arenas/[id]/route.ts" "app/api/arenas/[id]/__tests__/route.test.ts"
git rm backend/arena/infra/cache/ArenaCacheService.ts
git commit -m "refactor: replace ArenaCacheService with withCache + version-based arena invalidation"
```

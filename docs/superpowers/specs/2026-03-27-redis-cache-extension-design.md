# Redis Cache Extension Design

**Date**: 2026-03-27
**Status**: Approved

## Overview

Extend Redis caching to all uncached read endpoints and refactor the existing arena cache from a dedicated service class to a unified `withCache` utility. The arena refactor introduces version-based list invalidation, removing the SCAN-based pattern deletion and the `ArenaCacheService` class entirely.

## Background

Current state:

- `GET /api/games` (list): cached inline in route handler, 24h TTL — left as-is
- `GET /api/arenas` (list): cached inside `GetArenaUsecase`, 60s TTL, invalidated via SCAN
- `GET /api/arenas/[id]` (detail): cached inside `GetArenaDetailUsecase`, 120s TTL, invalidated on write
- All other read endpoints: uncached

Problems with the arena cache:

- Cache logic lives in usecases (application layer), violating Clean Architecture
- `ArenaCacheService` is a stateless class wrapping Redis — unnecessary abstraction
- `invalidateUserArenaCache` is dead code (never called)
- Two competing patterns exist with no clear rule for when to use which

## Scope

### New caching (TTL-only via `withCache`)

| Endpoint                             | Cache key                   | TTL   |
| ------------------------------------ | --------------------------- | ----- |
| `GET /api/games/[id]`                | `game:detail:{id}`          | 600s  |
| `GET /api/games?meta=true`           | `game:meta`                 | 3600s |
| `GET /api/genres`                    | `genre:list`                | 3600s |
| `GET /api/platforms`                 | `platform:list`             | 3600s |
| `GET /api/themes`                    | `theme:list`                | 3600s |
| `GET /api/member/profile/[nickname]` | `member:profile:{nickname}` | 120s  |

### Refactored (arena — version-based invalidation)

| Endpoint               | Cache key                                                   | TTL  | Invalidation                   |
| ---------------------- | ----------------------------------------------------------- | ---- | ------------------------------ |
| `GET /api/arenas`      | `arena:list:v{version}:{status}:{userId}:{pageSize}:{page}` | 60s  | Version increment              |
| `GET /api/arenas/[id]` | `arena:detail:{id}`                                         | 120s | Explicit `del` on PATCH/DELETE |

### Refactored (game list — inline → `withCache`)

`GET /api/games` existing inline caching migrated to `withCache`. TTL and key format unchanged.

### Out of scope

- `GET /api/games` TTL change (remains 24h)
- Member profile invalidation on write (120s TTL staleness is acceptable for profile data including score)
- Arena cache service (`ArenaCacheService.ts`) — deleted entirely

## Architecture

```
lib/
  withCache.ts          ← new: generic withCache<T>(key, ttl, fn)
  cacheKey.ts           ← updated: new key generators, version-aware arena keys

app/api/
  games/route.ts                       ← refactor: inline → withCache
  games/[id]/route.ts                  ← add: withCache (600s)
  genres/route.ts                      ← add: withCache (3600s)
  platforms/route.ts                   ← add: withCache (3600s)
  themes/route.ts                      ← add: withCache (3600s)
  arenas/route.ts                      ← add: version-fetch + withCache (60s)
  arenas/[id]/route.ts                 ← add: withCache (120s), del+incr on PATCH/DELETE
  member/profile/[nickname]/route.ts   ← add: withCache (120s)

backend/arena/
  application/usecase/
    GetArenaUsecase.ts        ← remove: cache calls, ArenaCacheService import
    GetArenaDetailUsecase.ts  ← remove: cache calls, ArenaCacheService import
  infra/cache/
    ArenaCacheService.ts      ← delete
```

## Components

### `lib/withCache.ts`

```ts
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

Errors on both read and write are caught and logged. Redis failure never propagates to the caller — the app degrades to direct DB queries silently.

### `lib/cacheKey.ts` additions

Removed: `generateArenaCacheKey`, `generateArenaDetailCacheKey`, `getArenaCachePatterns` (arena-specific, replaced below).
Kept: `generateCacheKey`, `CacheKeyParams`, `SortType` (game list key generation unchanged).

New exports:

```ts
export const ARENA_LIST_VERSION_KEY = "arena:list:version";

interface ArenaListKeyParams {
    currentPage: number;
    status?: number;
    targetMemberId?: string;
    pageSize: number;
}

export function gameDetailKey(id: number): string;
export function genreListKey(): string;
export function platformListKey(): string;
export function themeListKey(): string;
export function gameMetaKey(): string;
export function memberProfileKey(nickname: string): string;
export function arenaListKey(
    version: string,
    params: ArenaListKeyParams
): string;
export function arenaDetailKey(id: number): string;
```

`arenaListKey` accepts the version as a parameter — the caller fetches it from Redis. This keeps `cacheKey.ts` free of Redis imports and synchronous/pure.

## Data Flow

### Simple TTL endpoints (genres, platforms, themes, game detail, profile)

```ts
// Route handler — entire handler becomes:
const data = await withCache(genreListKey(), 3600, () => usecase.execute());
return NextResponse.json(data);
```

### Arena list GET

```ts
const version = (await redis.get(ARENA_LIST_VERSION_KEY)) ?? "0";
const key = arenaListKey(version, {
    currentPage,
    status,
    targetMemberId: effectiveMemberId,
    pageSize,
});
const result = await withCache(key, 60, () =>
    getArenaUsecase.execute(getArenaDto)
);
return NextResponse.json(result);
```

### Arena write (PATCH / DELETE)

```ts
// After DB write succeeds:
await redis.del(arenaDetailKey(arenaId));
await redis.incr(ARENA_LIST_VERSION_KEY);
```

Old `arena:list:v{n}:*` keys are orphaned — they expire naturally via their 60s TTL. All reads after the increment generate `v{n+1}` keys, guaranteeing a cache miss and fresh data on first access.

### Arena usecases (after refactor)

`GetArenaUsecase.execute()` and `GetArenaDetailUsecase.execute()` become pure business logic — no Redis imports, no cache get/set calls. The `cacheService` constructor field and all associated calls are removed.

## Error Handling

**Redis unavailable**: `withCache` catches errors on both read and write paths. Read failure → `fn()` executes as cache miss. Write failure → data is returned without caching, next request retries. No 500s from cache failures.

**Version key absent**: `redis.get(ARENA_LIST_VERSION_KEY)` returns `null` on first deploy or after Redis flush. Defaults to `"0"`. Keys are valid and behaviour is correct with no special handling.

**Arena write + cache failure**: DB write succeeds but `redis.del` or `redis.incr` fails. Stale detail data served for up to 120s, stale list data for up to 60s. Same bound as TTL-only behaviour — acceptable.

## Testing

### New: `lib/__tests__/withCache.test.ts`

- Cache hit: `redis.get` returns data → `fn` not called, cached value returned
- Cache miss: `redis.get` returns null → `fn` called, `redis.setex` called with correct key and TTL
- Redis read error: `redis.get` throws → `fn` called anyway, result returned without error
- Redis write error: `redis.setex` throws → result still returned without error

### Updated: arena usecase tests

`GetArenaUsecase.test.ts` and `GetArenaDetailUsecase.test.ts` remove all `ArenaCacheService` mock setup. Tests focus purely on business logic.

### Updated: arena route tests

`app/api/arenas/__tests__/route.test.ts`: mock `redis` at module level (same pattern as game route tests). PATCH and DELETE tests assert `redis.del` and `redis.incr` are called with correct arguments after a successful write.

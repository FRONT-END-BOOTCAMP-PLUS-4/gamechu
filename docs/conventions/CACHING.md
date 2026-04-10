# Caching Conventions

> Cache layer: **Redis** (ioredis) — singleton at `lib/redis.ts`

## Where caching lives

Cache logic belongs in the **route handler layer** — never in usecases or repositories.

```typescript
// ✅ — cache in route handler
export async function GET(request: Request) {
    const data = await withCache(arenaDetailKey(id), 120, () => usecase.execute(id));
    return NextResponse.json(data);
}

// ❌ — do not cache inside usecases
async execute(dto: GetArenaDto) {
    const cached = await redis.get(...); // wrong layer
}
```

## `withCache` helper

```typescript
import { withCache } from "@/lib/withCache";
import { arenaDetailKey } from "@/lib/cacheKey";

const data = await withCache(arenaDetailKey(id), 120, async () => {
    return usecase.execute(id);
});
```

`withCache<T>(key, ttlSeconds, fn)` — gracefully degrades on Redis failure (logs warn, falls through to `fn()`).

## Cache key generators

All keys live in `lib/cacheKey.ts` — pure functions, no Redis imports:

```typescript
import {
    arenaDetailKey,
    arenaListKey,
    ARENA_LIST_VERSION_KEY,
    gameDetailKey,
    genreListKey,
    platformListKey,
    themeListKey,
    memberProfileKey,
} from "@/lib/cacheKey";
```

Never inline cache key strings — always use these functions.

## TTL guidelines

| Data                           | TTL                         |
| ------------------------------ | --------------------------- |
| Genre / platform / theme lists | 3600s (1 hour)              |
| Game detail                    | 600s (10 min)               |
| Arena detail                   | 120s (2 min)                |
| Arena list                     | 60s (1 min) via version key |
| Member profile                 | 120s                        |

## Arena list invalidation (version-based)

Arena list keys embed a version number. On any write (create/update/delete), increment the version key so stale list caches are naturally bypassed:

```typescript
import redis from "@/lib/redis";
import { ARENA_LIST_VERSION_KEY, arenaDetailKey } from "@/lib/cacheKey";

// After PATCH or DELETE:
await redis.del(arenaDetailKey(id));
await redis.incr(ARENA_LIST_VERSION_KEY);
```

## No cache service classes

Do not create cache service classes (e.g., `ArenaCacheService`). Use `withCache` directly in route handlers.

```typescript
// ❌ — do not create wrapper classes
class ArenaCacheService { ... }

// ✅ — use withCache inline
const data = await withCache(arenaDetailKey(id), 120, () => usecase.execute(id));
```

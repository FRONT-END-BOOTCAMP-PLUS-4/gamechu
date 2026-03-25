# TanStack Query Data Fetching Layer — Design Spec

> **Status:** Draft — 2026-03-26

## Goal

Replace the manual `useState + useEffect + fetch` pattern used across `hooks/` and several components with TanStack Query (`@tanstack/react-query`). The result is a consistent data-fetching layer with automatic caching, deduplication, background revalidation, and first-class mutation support.

---

## Context

### Problem

Every data-fetching hook and several components implement the same boilerplate:

```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
useEffect(() => {
    fetch(url).then(...).catch(...).finally(...)
}, [deps])
```

Symptoms:
- No caching — same endpoint re-fetched on every mount
- No deduplication — multiple components mounting simultaneously issue duplicate requests
- No background revalidation
- Mutations (vote, wishlist, review delete) each manage their own `loading`/`error` state manually
- Inline fetch logic in components (`NotificationModal`, `WishlistButtonClient`, `ClientContentWrapper`) bypasses the hooks layer entirely
- Cache invalidation after mutations is done by re-calling `fetchData()` — no shared cache to invalidate

### Scope

- **Migrate** 4 existing data-fetching hooks to TanStack Query
- **Extract** inline fetch logic from 3 components into new hooks
- **Rewrite** 6 existing hook tests; add 3 new hook test files
- **Leave untouched**: `useArenaSocket`, `useArenaChatManagement`, `useArenaAutoStatus`, `useArenaAutoStatusDetail` (not data-fetching)

---

## Architecture

### Infrastructure (3 new files)

#### `lib/fetcher.ts`

Shared GET fetcher used as `queryFn` in all read queries. Throws on non-OK responses using the `{ message }` shape the API already returns. All API routes return same-origin responses — the browser sends session cookies automatically; no explicit `credentials` option is needed.

```typescript
export async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url)
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `HTTP ${res.status}`)
    }
    return res.json()
}
```

Mutations call `fetch` directly — `fetcher` is GET-only.

#### `lib/queryKeys.ts`

Typed key factories — single source of truth for all cache keys. All hooks and mutation `invalidateQueries` calls import from here, eliminating key typo bugs.

`FetchArenasParams` is defined inline here (not imported from `hooks/`) to keep the dependency direction clean (`lib/` must not import from `hooks/`).

```typescript
export type ArenasQueryParams = {
    currentPage?: number
    status: number
    mine: boolean
    pageSize: number
    targetMemberId?: string
}

export const queryKeys = {
    arenas: (params: ArenasQueryParams) => ['arenas', params] as const,
    // 'arenaList' is a distinct key from 'arenas' — used by useArenaList
    // which expects ArenaDetailDto[] from resData.data, not the paginated ArenaListDto
    arenaList: () => ['arenaList'] as const,
    // arenaVotes prefix-matches arenaVotesMine:
    // invalidateQueries({ queryKey: arenaVotes(id) }) invalidates BOTH variants
    arenaVotes: (arenaId: number) => ['arenas', arenaId, 'votes'] as const,
    arenaVotesMine: (arenaId: number) => ['arenas', arenaId, 'votes', 'mine'] as const,
    // arenaIds are sorted before building the key so [1,2] and [2,1] share the same entry.
    // Callers must stabilise the array with useMemo to avoid unnecessary re-fetches.
    voteList: (sortedArenaIds: number[]) => ['votes', sortedArenaIds] as const,
    reviews: (gameId: number) => ['reviews', gameId] as const,
    wishlist: (gameId: number) => ['wishlist', gameId] as const,
    notifications: (currentPage: number) => ['notifications', currentPage] as const,
}
```

#### `app/components/QueryProvider.tsx`

Thin `"use client"` wrapper that provides `QueryClientProvider` without forcing `app/layout.tsx` to become a Client Component. Children passed through remain Server Components — the `"use client"` boundary applies only to `QueryProvider` itself, not to its `children` prop (children are passed as already-rendered server output and slotted in).

`gcTime` is set to match `staleTime` (60 s) to prevent stale auth-gated data (wishlist, notifications, my votes) from persisting in the cache across sessions on a shared browser.

```typescript
"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                gcTime: 60_000,
                retry: 1,
            },
        },
    }))
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

> Follow-up: devtools can be added to `QueryProvider` behind `process.env.NODE_ENV !== 'production'` when needed.

`app/layout.tsx` wraps its children:
```typescript
// app/layout.tsx (Server Component — no "use client" needed)
import QueryProvider from "@/app/components/QueryProvider"

export default function RootLayout({ children }) {
    return (
        <html className={...}>
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    )
}
```

---

## Hook Migration

### Existing hooks (4 migrated)

#### `hooks/useArenas.ts`
- **Type:** query only
- **Signature:** unchanged — consumers see no diff. `FetchArenasParams` is renamed to `ArenasQueryParams`, re-exported from `lib/queryKeys.ts`.
- `queryKey`: `queryKeys.arenas(params)`
- `queryFn`: `fetcher('/api/arenas?...')`
- `refetchOnWindowFocus`: default (`true`) — arena status changes frequently, refetch on focus is desirable.

#### `hooks/useArenaList.ts`
- **Type:** query only
- **Signature:** unchanged
- `queryKey`: `queryKeys.arenaList()` — **distinct from `queryKeys.arenas()`** because this hook expects `ArenaDetailDto[]` from `resData.data`, while `useArenas` expects the full paginated `ArenaListDto`. Sharing a key would cause shape mismatches.
- `queryFn`: fetches `/api/arenas`, reads `data.data` array

#### `hooks/useVote.ts`
- **Type:** query + mutation
- **Signature:** `submitVote` changes to an **object parameter** form: `submitVote({ arenaId, votedTo, existingVote })`. This is more explicit and consistent with TanStack Query's `mutationFn` convention. Update all call sites.
- Query key when `mine === true`: `queryKeys.arenaVotesMine(arenaId)` → `['arenas', arenaId, 'votes', 'mine']`
- Query key when `mine === false`: `queryKeys.arenaVotes(arenaId)` → `['arenas', arenaId, 'votes']`
- Mutation `onSuccess`: `invalidateQueries({ queryKey: queryKeys.arenaVotes(arenaId) })`
  - **Prefix-match behaviour:** TanStack Query's `invalidateQueries` matches all keys whose prefix equals the given key. `['arenas', arenaId, 'votes']` is a prefix of `['arenas', arenaId, 'votes', 'mine']`, so a single `invalidateQueries` call refreshes both the aggregate vote counts and the user's own vote — this is intentional.
- `loading` combines `isLoading || isPending`
- `error` remains `string | null` (`.message` from TQ error)
- Return shape: `{ voteData, existingVote, loading, error, submitVote }`

#### `hooks/useVoteList.ts`
- **Type:** query only
- `queryKey`: `queryKeys.voteList(sortedIds)` — IDs are sorted ascending inside the hook before building the key, matching the existing `[...arenaIds].sort()` behaviour. Callers must wrap `arenaIds` in `useMemo` to avoid creating a new array reference on every render (otherwise the sort produces a new array each time, defeating the deduplication).
- `enabled`: `arenaIds.length > 0`
- `refetchOnWindowFocus`: `false` — vote list is used in profile pages where repeated refetches on window focus would be noisy.

---

### New hooks extracted from components (3 created)

#### `hooks/useNotifications.ts`
- Extracted from: `app/(base)/components/NotificationModal.tsx`
- **Type:** query only
- **Endpoint:** `GET /api/member/notification-records?currentPage={page}` (param name is `currentPage`, not `page` — confirmed in route handler)
- `queryKey`: `queryKeys.notifications(currentPage)`
- `queryFn`: `fetcher('/api/member/notification-records?currentPage=...')`
- `enabled`: `true` — `NotificationModal` is only rendered when the user is authenticated (guarded by `useModalStore` + header auth check upstream)
- `refetchOnWindowFocus`: `false` — notifications are fetched on modal open; window focus refetch is unnecessary.
- Returns: `{ data: NotificationRecordListDto | undefined, isLoading }`

#### `hooks/useGameReviews.ts`
- Extracted from: `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx`
- **Type:** query + delete mutation
- **Endpoint (query):** `GET /api/games/${gameId}/reviews`
- `queryKey`: `queryKeys.reviews(gameId)`
- `queryFn`: `fetcher(...)` + client-side enrichment (date formatting, profile image fallback, rating halving) — same logic as current `fetchComments`, moved into hook
- **Delete mutation:** `DELETE /api/member/games/${gameId}/reviews/${reviewId}`
  - `onSuccess`: `queryClient.invalidateQueries({ queryKey: queryKeys.reviews(gameId) })`
- `refetchOnWindowFocus`: `false` — review content is heavy (Lexical JSON); window focus refetch is unnecessary.
- Returns: `{ reviews: Review[], isLoading, refetch, deleteReview }`
  - `refetch` is exposed because `Comment`'s `onSuccess` callback (called after create/edit) currently calls `fetchComments()` directly. After migration it will call `queryClient.invalidateQueries({ queryKey: queryKeys.reviews(gameId) })` instead — `refetch` on the return value is therefore **not needed** and will be omitted. `Comment` receives `onSuccess` as a prop; the prop implementation in `ClientContentWrapper` will call `invalidateQueries` directly using `useQueryClient()`.

#### `hooks/useWishlist.ts`
- Extracted from: `app/(base)/games/[gameId]/components/WishlistButtonClient.tsx`
- **Type:** query + toggle mutation
- **Endpoint (query):** `GET /api/member/wishlists?gameId=${gameId}`
- `queryKey`: `queryKeys.wishlist(gameId)`
- `queryFn`: `fetcher('/api/member/wishlists?gameId=...')`
- **`enabled` flag:** `enabled: !!viewerId` — the wishlist endpoint returns 401 for unauthenticated users. Without this guard the query fires on every unauthenticated game detail page load. The hook accepts `viewerId: string | null` as a second parameter.
- **`wishlistId` threading (avoiding the DELETE race):** The `wishlistId` required for `DELETE /api/member/wishlists/${wishlistId}` is read synchronously from the current query cache data (`data?.wishlistId`) at mutation time. Because the mutation is disabled while `isWished === null` (loading state), `data` is always populated before the user can trigger a toggle. After a successful POST the server returns `{ wishlistId }` — this is stored in the mutation's `onSuccess` by calling `queryClient.setQueryData(queryKeys.wishlist(gameId), (old) => ({ ...old, wishlistId: newId, exists: true }))` for an immediate synchronous update before the invalidation re-fetch completes. This prevents the race condition where a second toggle fires before the refetch resolves.
- `refetchOnWindowFocus`: `false` — wishlist status is only toggled explicitly by the user.
- Returns: `{ isWished: boolean | null, toggle: () => void, isLoading: boolean }`

---

## Component Changes

| Component | Change |
|---|---|
| `app/layout.tsx` | Wrap children in `<QueryProvider>` |
| `NotificationModal.tsx` | Replace `useState + useEffect + fetch` with `useNotifications(currentPage)` |
| `WishlistButtonClient.tsx` | Replace ~140 lines of fetch/state with `useWishlist(gameId, viewerId)` |
| `ClientContentWrapper.tsx` | Replace `fetchComments` + `useEffect` with `useGameReviews(gameId)`; `Comment.onSuccess` calls `queryClient.invalidateQueries` directly via `useQueryClient()` |

---

## Testing

### Shared test utility

`tests/utils/createQueryWrapper.tsx` — **called once per test (inside each `it` block or in `beforeEach`), never at `describe` level** to prevent cache state from leaking between tests.

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export function createWrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
}
```

### Pattern

`vi.stubGlobal("fetch", vi.fn())` stays — only `renderHook` gets `{ wrapper: createWrapper() }`. Mutation tests wrap `mutateAsync` calls in `act()`.

```typescript
// Query test — inside it() block
it("returns arenaListDto on successful fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArenaListDto),
    }))

    const { result } = renderHook(
        () => useFetchArenas({ status: 1, mine: false, pageSize: 10 }),
        { wrapper: createWrapper() }   // createWrapper() called inside test
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.arenaListDto).toEqual(mockArenaListDto)
})

// Mutation test — object-param form for submitVote
it("submitVote calls POST when no existingVote", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
    }))

    const { result } = renderHook(
        () => useVote({ arenaId: 1, mine: true }),
        { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
        await result.current.submitVote({ arenaId: 1, votedTo: "A", existingVote: null })
    })

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/member/arenas/1/votes"),
        expect.objectContaining({ method: "POST" })
    )
})
```

### Test file inventory

| File | Status |
|---|---|
| `hooks/__tests__/useArenas.test.ts` | Rewrite |
| `hooks/__tests__/useArenaList.test.ts` | Rewrite |
| `hooks/__tests__/useVote.test.ts` | Rewrite |
| `hooks/__tests__/useVoteList.test.ts` | Rewrite |
| `hooks/__tests__/useArenaAutoStatus.test.ts` | No change |
| `hooks/__tests__/useArenaAutoStatusDetail.test.ts` | No change |
| `hooks/__tests__/useNotifications.test.ts` | Create |
| `hooks/__tests__/useGameReviews.test.ts` | Create |
| `hooks/__tests__/useWishlist.test.ts` | Create |

---

## Full File Map

| File | Action |
|---|---|
| `lib/fetcher.ts` | Create |
| `lib/queryKeys.ts` | Create |
| `app/components/QueryProvider.tsx` | Create |
| `app/layout.tsx` | Modify |
| `hooks/useArenas.ts` | Migrate |
| `hooks/useArenaList.ts` | Migrate |
| `hooks/useVote.ts` | Migrate — `submitVote` signature changes to object params |
| `hooks/useVoteList.ts` | Migrate |
| `hooks/useNotifications.ts` | Create |
| `hooks/useGameReviews.ts` | Create |
| `hooks/useWishlist.ts` | Create |
| `app/(base)/components/NotificationModal.tsx` | Modify |
| `app/(base)/games/[gameId]/components/WishlistButtonClient.tsx` | Modify |
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` | Modify |
| `hooks/__tests__/useArenas.test.ts` | Rewrite |
| `hooks/__tests__/useArenaList.test.ts` | Rewrite |
| `hooks/__tests__/useVote.test.ts` | Rewrite |
| `hooks/__tests__/useVoteList.test.ts` | Rewrite |
| `hooks/__tests__/useNotifications.test.ts` | Create |
| `hooks/__tests__/useGameReviews.test.ts` | Create |
| `hooks/__tests__/useWishlist.test.ts` | Create |
| `tests/utils/createQueryWrapper.tsx` | Create |

---

## What Is Not Changing

- `useArenaSocket.ts` — Socket.IO real-time connection
- `useArenaChatManagement.ts` — Socket.IO chat management
- `useArenaAutoStatus.ts` — timer-based arena status
- `useArenaAutoStatusDetail.ts` — timer-based status (detail page)
- All Zustand stores (`AuthStore`, `loadingStore`, `modalStore`, `useArenaStore`)
- `useLoadingStore` usage in components — global loading overlay stays as-is

---

## Dependencies

```bash
npm install @tanstack/react-query
```

No additional packages required. `@tanstack/react-query-devtools` is optional for development and is not included in scope.

# TanStack Query Data Fetching Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual `useState + useEffect + fetch` in all data-fetching hooks and three components with TanStack Query, adding caching, deduplication, and consistent mutation handling.

**Architecture:** Install `@tanstack/react-query`, create shared infrastructure (`lib/fetcher.ts`, `lib/queryKeys.ts`, `app/components/QueryProvider.tsx`), migrate 4 existing hooks, extract 3 new hooks from components, rewrite all affected tests with a `createQueryWrapper` helper.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `@tanstack/react-query` v5, Vitest 4, Testing Library

---

## File Map

| File | Action |
|---|---|
| `lib/fetcher.ts` | Create — shared GET fetcher for all `queryFn`s |
| `lib/queryKeys.ts` | Create — typed cache key factories, `ArenasQueryParams` type |
| `app/components/QueryProvider.tsx` | Create — `"use client"` wrapper for `QueryClientProvider` |
| `app/layout.tsx` | Modify — wrap children in `<QueryProvider>` |
| `tests/utils/createQueryWrapper.tsx` | Create — shared test utility for all hook tests |
| `hooks/useArenas.ts` | Migrate to `useQuery` |
| `hooks/useArenaList.ts` | Migrate to `useQuery` |
| `hooks/useVote.ts` | Migrate to `useQuery + useMutation`; `submitVote` signature → object params |
| `hooks/useVoteList.ts` | Migrate to `useQuery` |
| `hooks/useNotifications.ts` | Create — extracted from `NotificationModal.tsx` |
| `hooks/useGameReviews.ts` | Create — extracted from `ClientContentWrapper.tsx` |
| `hooks/useWishlist.ts` | Create — extracted from `WishlistButtonClient.tsx` |
| `app/(base)/components/NotificationModal.tsx` | Modify — use `useNotifications` |
| `app/(base)/games/[gameId]/components/WishlistButtonClient.tsx` | Modify — use `useWishlist` |
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` | Modify — use `useGameReviews` |
| `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` | Modify — update `submitVote` call site |
| `hooks/__tests__/useArenas.test.ts` | Rewrite |
| `hooks/__tests__/useArenaList.test.ts` | Rewrite |
| `hooks/__tests__/useVote.test.ts` | Rewrite |
| `hooks/__tests__/useVoteList.test.ts` | Rewrite |
| `hooks/__tests__/useNotifications.test.ts` | Create |
| `hooks/__tests__/useGameReviews.test.ts` | Create |
| `hooks/__tests__/useWishlist.test.ts` | Create |

---

## Task 1: Install dependency + test utility

**Files:**
- Modify: `package.json` (via npm install)
- Create: `tests/utils/createQueryWrapper.tsx`

- [ ] **Step 1: Install TanStack Query**

```bash
cd ../refactor-282
npm install @tanstack/react-query
```

Expected: `@tanstack/react-query` appears in `package.json` dependencies.

- [ ] **Step 2: Create `tests/utils/createQueryWrapper.tsx`**

```tsx
// tests/utils/createQueryWrapper.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Call createWrapper() INSIDE each test (not at describe level).
 * Each call creates a fresh QueryClient so cache doesn't leak between tests.
 */
export function createWrapper() {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        );
    };
}
```

- [ ] **Step 3: Commit**

```bash
cd ../refactor-282
git add package.json package-lock.json tests/utils/createQueryWrapper.tsx
git commit -m "[refactor/#282] @tanstack/react-query 설치, createQueryWrapper 테스트 유틸 추가"
```

---

## Task 2: Create `lib/fetcher.ts`

**Files:**
- Create: `lib/fetcher.ts`

- [ ] **Step 1: Write failing test**

Create `lib/__tests__/fetcher.test.ts`:

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetcher } from "../fetcher";

describe("fetcher", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns parsed JSON on ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 1 }),
        } as unknown as Response);

        const result = await fetcher<{ id: number }>("/api/test");
        expect(result).toEqual({ id: 1 });
    });

    it("throws Error with message from body on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: "권한 없음" }),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("권한 없음");
    });

    it("throws fallback message when body has no message field", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("HTTP 500");
    });

    it("throws when body JSON parse fails", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 503,
            json: () => Promise.reject(new Error("invalid json")),
        } as unknown as Response);

        await expect(fetcher("/api/test")).rejects.toThrow("HTTP 503");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- lib/__tests__/fetcher.test.ts --run
```

Expected: FAIL — `Cannot find module '../fetcher'`

- [ ] **Step 3: Implement `lib/fetcher.ts`**

```typescript
// lib/fetcher.ts

/**
 * Shared GET fetcher for TanStack Query queryFn calls.
 * All API routes are same-origin — the browser sends session cookies automatically.
 * Mutations (POST/PATCH/DELETE) call fetch() directly, not this utility.
 */
export async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- lib/__tests__/fetcher.test.ts --run
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
cd ../refactor-282
git add lib/fetcher.ts lib/__tests__/fetcher.test.ts
git commit -m "[refactor/#282] lib/fetcher.ts 추가 — 공통 GET fetcher"
```

---

## Task 3: Create `lib/queryKeys.ts`

**Files:**
- Create: `lib/queryKeys.ts`

No unit tests needed — pure type definitions and key factory functions. Correctness is verified by TypeScript and by the hook tests that use them.

- [ ] **Step 1: Create `lib/queryKeys.ts`**

```typescript
// lib/queryKeys.ts

/**
 * Typed cache key factories — single source of truth.
 * Import from here in all hooks and mutation onSuccess invalidateQueries calls.
 *
 * NOTE: ArenasQueryParams is defined here (not imported from hooks/) to keep
 * the dependency direction clean: lib/ must not import from hooks/.
 */

export type ArenasQueryParams = {
    currentPage?: number;
    status: number;
    mine: boolean;
    pageSize: number;
    targetMemberId?: string;
};

export const queryKeys = {
    /**
     * Paginated arena list — used by useArenas.
     * Returns ArenaListDto (paginated object with arenas[], totalCount, etc.)
     */
    arenas: (params: ArenasQueryParams) => ["arenas", params] as const,

    /**
     * Flat arena array — used by useArenaList.
     * Returns ArenaDetailDto[] from resData.data.
     * DISTINCT from queryKeys.arenas() — response shapes differ.
     */
    arenaList: () => ["arenaList"] as const,

    /**
     * Aggregate vote counts for an arena.
     * Prefix-matches arenaVotesMine: invalidateQueries({ queryKey: arenaVotes(id) })
     * invalidates BOTH arenaVotes and arenaVotesMine in one call. This is intentional.
     */
    arenaVotes: (arenaId: number) => ["arenas", arenaId, "votes"] as const,

    /**
     * The current user's own vote for an arena (mine=true query).
     */
    arenaVotesMine: (arenaId: number) =>
        ["arenas", arenaId, "votes", "mine"] as const,

    /**
     * Vote results for a list of arenas.
     * IDs are sorted ascending inside useVoteList before building this key.
     * Callers must stabilise the arenaIds array with useMemo to avoid
     * unnecessary re-fetches from new array references on each render.
     */
    voteList: (sortedArenaIds: number[]) => ["votes", sortedArenaIds] as const,

    /** Reviews for a game page. */
    reviews: (gameId: number) => ["reviews", gameId] as const,

    /**
     * Wishlist status for a game.
     * Query is disabled when viewerId is falsy (unauthenticated).
     */
    wishlist: (gameId: number) => ["wishlist", gameId] as const,

    /**
     * Paginated notification records.
     * Param name is currentPage (matches /api/member/notification-records route).
     */
    notifications: (currentPage: number) =>
        ["notifications", currentPage] as const,
};
```

- [ ] **Step 2: Commit**

```bash
cd ../refactor-282
git add lib/queryKeys.ts
git commit -m "[refactor/#282] lib/queryKeys.ts 추가 — 타입 안전 캐시 키 팩토리"
```

---

## Task 4: QueryProvider + layout

**Files:**
- Create: `app/components/QueryProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `app/components/QueryProvider.tsx`**

```tsx
// app/components/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

/**
 * "use client" wrapper so app/layout.tsx stays a Server Component.
 * Children passed as props remain server-rendered — the "use client" boundary
 * applies only to QueryProvider itself, not to its children prop.
 *
 * gcTime matches staleTime (60s) to prevent auth-gated data (wishlist,
 * notifications, my votes) from persisting in cache across sessions.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        gcTime: 60_000,
                        retry: 1,
                    },
                },
            })
    );
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
}
```

- [ ] **Step 2: Modify `app/layout.tsx`**

Current `app/layout.tsx`:
```tsx
import { Press_Start_2P } from "next/font/google";
import Modals from "./components/Modals";
import "./globals.css";
export { viewport } from "./viewport";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={pressStart2P.variable}>
            <body className="bg-background-400 font-sans text-font-100">
                <Modals />
                {children}
            </body>
        </html>
    );
}
```

Replace with:
```tsx
import { Press_Start_2P } from "next/font/google";
import Modals from "./components/Modals";
import QueryProvider from "./components/QueryProvider";
import "./globals.css";
export { viewport } from "./viewport";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={pressStart2P.variable}>
            <body className="bg-background-400 font-sans text-font-100">
                <QueryProvider>
                    <Modals />
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
```

- [ ] **Step 3: Run build to verify no errors**

```bash
cd ../refactor-282
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
cd ../refactor-282
git add app/components/QueryProvider.tsx app/layout.tsx
git commit -m "[refactor/#282] QueryProvider 추가, layout.tsx에 QueryClientProvider 래핑"
```

---

## Task 5: Migrate `hooks/useArenas.ts`

**Files:**
- Modify: `hooks/useArenas.ts`
- Modify: `hooks/__tests__/useArenas.test.ts`

- [ ] **Step 1: Rewrite `hooks/__tests__/useArenas.test.ts` (failing)**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchArenas from "../useArenas";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockArenaListDto = {
    arenas: [{ id: 1, title: "Arena 1" }],
    totalCount: 1,
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

describe("useFetchArenas", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns arenaListDto on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 1, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaListDto).toEqual(mockArenaListDto);
        expect(result.current.error).toBeNull();
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "서버 오류" }),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 1, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).not.toBeNull();
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 0, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("builds correct URL params", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(
            () =>
                useFetchArenas({
                    status: 2,
                    mine: true,
                    pageSize: 20,
                    currentPage: 2,
                }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("status=2")
            );
        });
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("pageSize=20")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("currentPage=2")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("mine=true")
        );
    });

    it("uses memberId param when targetMemberId is provided", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(
            () =>
                useFetchArenas({
                    status: 1,
                    mine: false,
                    pageSize: 10,
                    targetMemberId: "target-123",
                }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("memberId=target-123")
            );
        });
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useArenas.test.ts --run
```

Expected: FAIL — hook still uses old implementation

- [ ] **Step 3: Implement migrated `hooks/useArenas.ts`**

```typescript
// hooks/useArenas.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys, type ArenasQueryParams } from "@/lib/queryKeys";
import type { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

export type { ArenasQueryParams };

export default function useFetchArenas({
    currentPage = 1,
    status,
    mine = false,
    pageSize = 10,
    targetMemberId,
}: ArenasQueryParams) {
    const params = new URLSearchParams({
        currentPage: currentPage.toString(),
        pageSize: pageSize.toString(),
        status: status.toString(),
    });

    if (targetMemberId) {
        params.set("memberId", targetMemberId);
    } else {
        params.set("mine", mine.toString());
    }

    const { data, error, isLoading } = useQuery<ArenaListDto>({
        queryKey: queryKeys.arenas({ currentPage, status, mine, pageSize, targetMemberId }),
        queryFn: () => fetcher<ArenaListDto>(`/api/arenas?${params.toString()}`),
    });

    return {
        arenaListDto: data ?? null,
        setArenaListDto: () => {}, // retained for API compatibility — no-op after migration
        loading: isLoading,
        error: error ?? null,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useArenas.test.ts --run
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
cd ../refactor-282
git add hooks/useArenas.ts hooks/__tests__/useArenas.test.ts
git commit -m "[refactor/#282] useArenas — TanStack Query useQuery로 마이그레이션"
```

---

## Task 6: Migrate `hooks/useArenaList.ts`

**Files:**
- Modify: `hooks/useArenaList.ts`
- Modify: `hooks/__tests__/useArenaList.test.ts`

- [ ] **Step 1: Rewrite `hooks/__tests__/useArenaList.test.ts` (failing)**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useArenaList } from "../useArenaList";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockData = [{ id: 1, title: "Arena 1" }];

describe("useArenaList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns arenaList on successful fetch with success:true", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockData }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it("returns empty array when success is false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: false }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("returns empty array when data is not an array", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: null }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaList).toEqual([]);
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "서버 오류" }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] }),
        } as unknown as Response);

        const { result } = renderHook(() => useArenaList(), {
            wrapper: createWrapper(),
        });
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useArenaList.test.ts --run
```

Expected: FAIL

- [ ] **Step 3: Implement migrated `hooks/useArenaList.ts`**

```typescript
// hooks/useArenaList.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetcher } from "@/lib/fetcher";
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

type ArenaListResponse = { success: boolean; data?: ArenaDetailDto[] };

export function useArenaList() {
    const { data, error, isLoading } = useQuery<ArenaDetailDto[]>({
        queryKey: queryKeys.arenaList(),
        queryFn: async () => {
            // Use fetcher so non-ok responses throw (consistent error handling)
            const json = await fetcher<ArenaListResponse>("/api/arenas");
            return json.success && Array.isArray(json.data) ? json.data : [];
        },
    });

    return {
        arenaList: data ?? [],
        setArenaList: () => {}, // retained for API compatibility — no-op
        loading: isLoading,
        error: error ?? null,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useArenaList.test.ts --run
```

Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
cd ../refactor-282
git add hooks/useArenaList.ts hooks/__tests__/useArenaList.test.ts
git commit -m "[refactor/#282] useArenaList — TanStack Query useQuery로 마이그레이션"
```

---

## Task 7: Migrate `hooks/useVote.ts` + update call site

**Files:**
- Modify: `hooks/useVote.ts`
- Modify: `hooks/__tests__/useVote.test.ts`
- Modify: `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx`

`submitVote` changes signature from positional `(arenaId, votedTo, existingVote)` to object `{ arenaId, votedTo, existingVote }`. The only call site is `ArenaDetailVote.tsx:62`.

- [ ] **Step 1: Rewrite `hooks/__tests__/useVote.test.ts` (failing)**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useVote } from "../useVote";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockVoteDto = {
    votes: [{ votedTo: "host-id" }],
    totalCount: 1,
};

describe("useVote", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns voteData on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: false }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.voteData).toEqual(mockVoteDto);
        expect(result.current.error).toBeNull();
    });

    it("returns existingVote from votes[0].votedTo when mine=true", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.existingVote).toBe("host-id");
    });

    it("returns null existingVote when mine=false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVoteDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: false }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.existingVote).toBeNull();
    });

    it("submitVote calls POST when existingVote is null (object params)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote({
                arenaId: 1,
                votedTo: "challenger",
                existingVote: null,
            });
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/arenas/1/votes"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("submitVote calls PATCH when existingVote is set (object params)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVote({ arenaId: 1, mine: true }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.submitVote({
                arenaId: 1,
                votedTo: "host",
                existingVote: "challenger",
            });
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/arenas/1/votes"),
            expect.objectContaining({ method: "PATCH" })
        );
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useVote.test.ts --run
```

Expected: FAIL

- [ ] **Step 3: Implement migrated `hooks/useVote.ts`**

```typescript
// hooks/useVote.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";
import type { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";

type GetVoteParams = {
    arenaId: number;
    votedTo?: string;
    mine: boolean;
};

type SubmitVoteParams = {
    arenaId: number;
    votedTo: string;
    existingVote: string | null;
};

export function useVote({ arenaId, votedTo, mine }: GetVoteParams) {
    const queryClient = useQueryClient();

    const queryKey = mine
        ? queryKeys.arenaVotesMine(arenaId)
        : queryKeys.arenaVotes(arenaId);

    const query = new URLSearchParams({
        ...(votedTo !== undefined ? { votedTo } : {}),
        ...(mine ? { mine: "true" } : {}),
    }).toString();

    const { data, isLoading, error } = useQuery<VoteDto>({
        queryKey,
        queryFn: () =>
            fetcher<VoteDto>(`/api/arenas/${arenaId}/votes?${query}`),
        enabled: !!arenaId,
    });

    const { mutateAsync: submitVote, isPending } = useMutation<
        unknown,
        Error,
        SubmitVoteParams
    >({
        mutationFn: ({ arenaId, votedTo, existingVote }) =>
            fetch(`/api/member/arenas/${arenaId}/votes`, {
                method: existingVote ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ arenaId, votedTo }),
            }).then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ??
                            "투표에 실패했습니다."
                    );
                }
                return res.json();
            }),
        // Prefix-match: invalidates both arenaVotes and arenaVotesMine in one call
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.arenaVotes(arenaId),
            }),
    });

    return {
        voteData: data ?? null,
        existingVote: mine ? (data?.votes?.[0]?.votedTo ?? null) : null,
        loading: isLoading || isPending,
        error: error?.message ?? null,
        submitVote,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useVote.test.ts --run
```

Expected: 5 passed

- [ ] **Step 5: Update call site in `ArenaDetailVote.tsx`**

In `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx`:

Change the destructuring (line 12-21):
```typescript
// Before
const {
    existingVote,
    loading,
    error,
    refetch: refetchVoteData,
    submitVote,
} = useVote({
    arenaId: arenaDetail?.id || 0,
    mine: true,
});
```
```typescript
// After — refetch removed; onSuccess invalidation handles cache refresh
const { existingVote, loading, error, submitVote } = useVote({
    arenaId: arenaDetail?.id || 0,
    mine: true,
});
```

Change `handleVote` (line 58-71):
```typescript
// Before
const handleVote = async (votedTo: string | null) => {
    if (!arenaDetail?.id || !votedTo || loading) return;
    setPersistentError("");
    try {
        await submitVote(arenaDetail.id, votedTo, existingVote);
        refetchVoteData();
    } catch (err: unknown) {
        if (err instanceof Error) {
            setPersistentError(err.message);
        } else {
            setPersistentError("알 수 없는 오류가 발생했습니다.");
        }
    }
};
```
```typescript
// After
const handleVote = async (votedTo: string | null) => {
    if (!arenaDetail?.id || !votedTo || loading) return;
    setPersistentError("");
    try {
        await submitVote({
            arenaId: arenaDetail.id,
            votedTo,
            existingVote,
        });
        // refetch removed — useMutation onSuccess calls invalidateQueries
    } catch (err: unknown) {
        if (err instanceof Error) {
            setPersistentError(err.message);
        } else {
            setPersistentError("알 수 없는 오류가 발생했습니다.");
        }
    }
};
```

- [ ] **Step 6: Run full test suite**

```bash
cd ../refactor-282
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
cd ../refactor-282
git add hooks/useVote.ts hooks/__tests__/useVote.test.ts \
  "app/(base)/arenas/[id]/components/ArenaDetailVote.tsx"
git commit -m "[refactor/#282] useVote — useQuery + useMutation 마이그레이션, submitVote 시그니처 객체 파라미터로 변경"
```

---

## Task 8: Migrate `hooks/useVoteList.ts`

**Files:**
- Modify: `hooks/useVoteList.ts`
- Modify: `hooks/__tests__/useVoteList.test.ts`

- [ ] **Step 1: Rewrite `hooks/__tests__/useVoteList.test.ts` (failing)**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useVoteList from "../useVoteList";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockVote = { votes: [], totalCount: 0 };

describe("useVoteList", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("fetches votes for each arenaId", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVote),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVoteList({ arenaIds: [1, 2] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(result.current.voteResult).toHaveLength(2);
    });

    it("returns empty array and loading=false when arenaIds is empty", async () => {
        const { result } = renderHook(
            () => useVoteList({ arenaIds: [] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.voteResult).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "오류" }),
        } as unknown as Response);

        const { result } = renderHook(
            () => useVoteList({ arenaIds: [1] }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it("sorts arenaIds for stable cache key", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockVote),
        } as unknown as Response);

        // [3,1,2] and [1,2,3] should produce the same sorted key
        const { result: r1 } = renderHook(
            () => useVoteList({ arenaIds: [3, 1, 2] }),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(r1.current.loading).toBe(false));

        // fetch called for IDs 1, 2, 3 regardless of input order
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/1/votes")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/2/votes")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/arenas/3/votes")
        );
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useVoteList.test.ts --run
```

Expected: FAIL

- [ ] **Step 3: Implement migrated `hooks/useVoteList.ts`**

```typescript
// hooks/useVoteList.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";
import type { VoteDto } from "@/backend/vote/application/usecase/dto/VoteDto";

type UseVoteListProps = {
    arenaIds: number[];
};

export default function useVoteList({ arenaIds }: UseVoteListProps) {
    // Sort for a stable cache key — callers should wrap arenaIds in useMemo
    // to avoid new array references triggering re-fetches on each render.
    const sortedIds = [...arenaIds].sort((a, b) => a - b);

    const { data, isLoading, error } = useQuery<VoteDto[]>({
        queryKey: queryKeys.voteList(sortedIds),
        queryFn: async () => {
            const results = await Promise.all(
                sortedIds.map((id) =>
                    fetcher<VoteDto>(`/api/arenas/${id}/votes`)
                )
            );
            return results;
        },
        enabled: arenaIds.length > 0,
        refetchOnWindowFocus: false,
    });

    return {
        voteResult: data ?? [],
        loading: isLoading,
        error: error ?? null,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useVoteList.test.ts --run
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
cd ../refactor-282
git add hooks/useVoteList.ts hooks/__tests__/useVoteList.test.ts
git commit -m "[refactor/#282] useVoteList — TanStack Query useQuery로 마이그레이션"
```

---

## Task 9: New `hooks/useNotifications.ts` + update `NotificationModal`

**Files:**
- Create: `hooks/useNotifications.ts`
- Create: `hooks/__tests__/useNotifications.test.ts`
- Modify: `app/(base)/components/NotificationModal.tsx`

Endpoint: `GET /api/member/notification-records?currentPage={n}` — param name is `currentPage` (not `page`).

- [ ] **Step 1: Write failing test**

Create `hooks/__tests__/useNotifications.test.ts`:

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNotifications } from "../useNotifications";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockDto = {
    records: [{ id: 1, message: "알림" }],
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

describe("useNotifications", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns notification data on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        const { result } = renderHook(() => useNotifications(1), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(mockDto);
    });

    it("uses currentPage param (not page)", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        renderHook(() => useNotifications(3), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("currentPage=3")
            );
        });
        // Must NOT use 'page=' — the route only reads 'currentPage'
        expect(fetch).not.toHaveBeenCalledWith(
            expect.stringContaining("page=3")
        );
    });

    it("isLoading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockDto),
        } as unknown as Response);

        const { result } = renderHook(() => useNotifications(1), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useNotifications.test.ts --run
```

Expected: FAIL — `Cannot find module '../useNotifications'`

- [ ] **Step 3: Create `hooks/useNotifications.ts`**

```typescript
// hooks/useNotifications.ts
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";
import type { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";

/**
 * Extracted from NotificationModal.tsx.
 * Endpoint param is 'currentPage' (matches /api/member/notification-records route).
 * refetchOnWindowFocus disabled — notifications fetched on modal open; focus refetch is noisy.
 */
export function useNotifications(currentPage: number = 1) {
    return useQuery<NotificationRecordListDto>({
        queryKey: queryKeys.notifications(currentPage),
        queryFn: () =>
            fetcher<NotificationRecordListDto>(
                `/api/member/notification-records?currentPage=${currentPage}`
            ),
        refetchOnWindowFocus: false,
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useNotifications.test.ts --run
```

Expected: 3 passed

- [ ] **Step 5: Update `NotificationModal.tsx`**

Replace the entire file content:

```tsx
// app/(base)/components/NotificationModal.tsx
"use client";

import React, { useState } from "react";
import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import Pager from "@/app/components/Pager";
import NotificationRecordList from "./NotificationRecordList";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationModal() {
    const { isOpen, closeModal } = useModalStore();
    const [currentPage, setCurrentPage] = useState(1);
    const { data } = useNotifications(currentPage);

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <div className="w-[480px] max-h-[80vh] flex flex-col gap-4">
                {data && (
                    <div>
                        <NotificationRecordList
                            notificationRecords={data.records}
                        />
                        {data.records.length > 0 && (
                            <Pager
                                currentPage={data.currentPage}
                                pages={data.pages}
                                endPage={data.endPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}
```

- [ ] **Step 6: Run full test suite**

```bash
cd ../refactor-282
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
cd ../refactor-282
git add hooks/useNotifications.ts hooks/__tests__/useNotifications.test.ts \
  "app/(base)/components/NotificationModal.tsx"
git commit -m "[refactor/#282] useNotifications 추가, NotificationModal 인라인 fetch 분리"
```

---

## Task 10: New `hooks/useGameReviews.ts` + update `ClientContentWrapper`

**Files:**
- Create: `hooks/useGameReviews.ts`
- Create: `hooks/__tests__/useGameReviews.test.ts`
- Modify: `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx`

Note: `Comment`'s `onSuccess` prop currently calls `fetchComments()`. After migration it must call `queryClient.invalidateQueries` directly — `ClientContentWrapper` uses `useQueryClient()` for this.

- [ ] **Step 1: Write failing test**

Create `hooks/__tests__/useGameReviews.test.ts`:

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useGameReviews } from "../useGameReviews";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

const mockRawReview = {
    id: 1,
    memberId: "user-1",
    imageUrl: "/icons/profile.svg",
    nickname: "테스터",
    createdAt: "2026-01-01T00:00:00Z",
    score: 1000,
    rating: 8,
    content: "좋아요",
    likeCount: 3,
    isLiked: false,
};

describe("useGameReviews", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns enriched reviews on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([mockRawReview]),
        } as unknown as Response);

        const { result } = renderHook(() => useGameReviews(115), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.reviews).toHaveLength(1);
        // rating is halved (8 / 2 = 4)
        expect(result.current.reviews[0].rating).toBe(4);
    });

    it("deleteReview calls DELETE endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([mockRawReview]),
        } as unknown as Response);

        const { result } = renderHook(() => useGameReviews(115), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);

        await act(async () => {
            await result.current.deleteReview(42);
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(
                "/api/member/games/115/reviews/42"
            ),
            expect.objectContaining({ method: "DELETE" })
        );
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useGameReviews.test.ts --run
```

Expected: FAIL

- [ ] **Step 3: Create `hooks/useGameReviews.ts`**

```typescript
// hooks/useGameReviews.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";

export type Review = {
    id: number;
    memberId: string;
    profileImage: string;
    nickname: string;
    date: string;
    tier: string;
    rating: number;
    comment: string;
    likes: number;
    isLiked: boolean;
    score: number;
};

type RawReview = {
    id: number;
    memberId: string;
    imageUrl?: string;
    nickname?: string;
    createdAt: string;
    score: number;
    rating: number;
    content: string;
    likeCount?: number;
    isLiked?: boolean;
};

function enrichReview(r: RawReview): Review {
    return {
        id: r.id,
        memberId: r.memberId,
        profileImage:
            r.imageUrl && r.imageUrl.startsWith("data:")
                ? r.imageUrl
                : r.imageUrl || "/icons/profile.svg",
        nickname: r.nickname ?? "유저",
        date: new Date(r.createdAt).toLocaleDateString("ko-KR"),
        tier: String(r.score),
        rating: r.rating / 2,
        comment: r.content,
        likes: r.likeCount ?? 0,
        isLiked: r.isLiked ?? false,
        score: r.score ?? 0,
    };
}

/**
 * Extracted from ClientContentWrapper.tsx.
 * refetchOnWindowFocus disabled — review content is heavy (Lexical JSON).
 * No 'refetch' in return: Comment.onSuccess should call invalidateQueries directly.
 */
export function useGameReviews(gameId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<Review[]>({
        queryKey: queryKeys.reviews(gameId),
        queryFn: async () => {
            const raw = await fetcher<RawReview[]>(`/api/games/${gameId}/reviews`);
            return raw.map(enrichReview);
        },
        refetchOnWindowFocus: false,
    });

    const { mutateAsync: deleteReview } = useMutation({
        mutationFn: (reviewId: number) =>
            fetch(`/api/member/games/${gameId}/reviews/${reviewId}`, {
                method: "DELETE",
            }).then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ?? "댓글 삭제 실패"
                    );
                }
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews(gameId),
            }),
    });

    return {
        reviews: data ?? [],
        isLoading,
        deleteReview,
        // No 'refetch' or 'invalidateReviews' exposed — Comment.onSuccess calls
        // queryClient.invalidateQueries directly via useQueryClient() in the component.
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useGameReviews.test.ts --run
```

Expected: 2 passed

- [ ] **Step 5: Update `ClientContentWrapper.tsx`**

Replace the file:

```tsx
// app/(base)/games/[gameId]/components/ClientContentWrapper.tsx
"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReviewSelector from "./ReviewSelector";
import Comment from "./Comment";
import CommentCard from "./CommentCard";
import Pager from "@/app/components/Pager";
import { useGameReviews } from "@/hooks/useGameReviews";
import { queryKeys } from "@/lib/queryKeys";

interface Props {
    gameId: number;
    viewerId: string | null;
}

export default function ClientContentWrapper({ gameId, viewerId }: Props) {
    const commentRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReviewType, setSelectedReviewType] = useState<
        "expert" | "user"
    >("expert");
    const [editingId, setEditingId] = useState<number | null>(null);

    const { reviews: allComments, deleteReview } = useGameReviews(gameId);

    const isExpertTier = (score: number) => score >= 3000;

    const handleDelete = async (reviewId: number) => {
        const confirm = window.confirm("정말 삭제하시겠습니까?");
        if (!confirm) return;
        try {
            await deleteReview(reviewId);
        } catch {
            alert("댓글 삭제 실패");
        }
    };

    const handleReviewSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(gameId) });
    };

    const myComment = allComments.find(
        (c) => String(c.memberId) === String(viewerId)
    );
    const expertComments = allComments.filter((c) => isExpertTier(c.score));
    const userComments = allComments.filter((c) => !isExpertTier(c.score));
    const currentComments =
        selectedReviewType === "expert" ? expertComments : userComments;

    const totalItems = currentComments.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);
    const commentsForPage = currentComments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex w-full flex-col items-start gap-10 lg:flex-row">
            <div className="flex w-full flex-shrink-0 flex-col lg:w-[300px]">
                <ReviewSelector
                    selected={selectedReviewType}
                    onSelect={(type) => {
                        setSelectedReviewType(type);
                        handleReviewSuccess();
                    }}
                    expertReviewCount={expertComments.length}
                    expertAvgRating={
                        expertComments.length > 0
                            ? expertComments.reduce((a, b) => a + b.rating, 0) /
                              expertComments.length
                            : 0
                    }
                    userReviewCount={userComments.length}
                    userAvgRating={
                        userComments.length > 0
                            ? userComments.reduce((a, b) => a + b.rating, 0) /
                              userComments.length
                            : 0
                    }
                />
            </div>

            <div className="w-full max-w-full flex-1 space-y-10 px-4 lg:px-0">
                {typeof gameId === "number" &&
                    (editingId !== null ? (
                        <div ref={commentRef}>
                            <Comment
                                gameId={String(gameId)}
                                editingReviewId={editingId}
                                defaultValue={myComment?.comment ?? ""}
                                defaultRating={myComment?.rating ?? 0}
                                onSuccess={() => {
                                    handleReviewSuccess();
                                    setEditingId(null);
                                }}
                                viewerId={viewerId}
                            />
                        </div>
                    ) : myComment ? (
                        <div className="glow-border w-full">
                            <div className="glow-border-inner">
                                <CommentCard
                                    id={myComment.id}
                                    profileImage={myComment.profileImage}
                                    nickname={myComment.nickname}
                                    date={myComment.date}
                                    score={myComment.score}
                                    rating={myComment.rating}
                                    comment={myComment.comment}
                                    likes={myComment.likes}
                                    isLiked={myComment.isLiked}
                                    viewerId={viewerId ?? ""}
                                    memberId={myComment.memberId}
                                    onEdit={(id) => {
                                        setEditingId(id);
                                        setTimeout(() => {
                                            commentRef.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }, 100);
                                    }}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    ) : (
                        <Comment
                            gameId={String(gameId)}
                            onSuccess={handleReviewSuccess}
                            viewerId={viewerId}
                        />
                    ))}

                {commentsForPage.map((c) => (
                    <CommentCard
                        key={c.id}
                        id={c.id}
                        profileImage={c.profileImage}
                        nickname={c.nickname}
                        date={c.date}
                        rating={c.rating}
                        score={c.score}
                        comment={c.comment}
                        likes={c.likes}
                        isLiked={c.isLiked}
                        viewerId={viewerId ?? ""}
                        memberId={c.memberId}
                        onDelete={handleDelete}
                        onEdit={(id) => setEditingId(id)}
                    />
                ))}

                {commentsForPage.length > 0 && (
                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 6: Run full test suite**

```bash
cd ../refactor-282
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
cd ../refactor-282
git add hooks/useGameReviews.ts hooks/__tests__/useGameReviews.test.ts \
  "app/(base)/games/[gameId]/components/ClientContentWrapper.tsx"
git commit -m "[refactor/#282] useGameReviews 추가, ClientContentWrapper 인라인 fetch 분리"
```

---

## Task 11: New `hooks/useWishlist.ts` + update `WishlistButtonClient`

**Files:**
- Create: `hooks/useWishlist.ts`
- Create: `hooks/__tests__/useWishlist.test.ts`
- Modify: `app/(base)/games/[gameId]/components/WishlistButtonClient.tsx`

Key notes:
- `enabled: !!viewerId` — endpoint returns 401 for unauthenticated users
- `viewerId` param type is `string` (caller passes `""` when unauthenticated, which is falsy — `!!""` = `false`)
- `wishlistId` for DELETE is read synchronously from current cache data before mutation fires
- After successful POST, `setQueryData` applies an optimistic update before invalidation refetch completes

- [ ] **Step 1: Write failing test**

Create `hooks/__tests__/useWishlist.test.ts`:

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWishlist } from "../useWishlist";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

describe("useWishlist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("fetches wishlist status when viewerId is set", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ exists: true, wishlistId: 10 }),
        } as unknown as Response);

        const { result } = renderHook(
            () => useWishlist(1, "user-abc"),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.isWished).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/wishlists?gameId=1")
        );
    });

    it("does NOT fetch when viewerId is empty string", async () => {
        const { result } = renderHook(
            () => useWishlist(1, ""),
            { wrapper: createWrapper() }
        );

        // enabled=false — TQ skips fetching, isLoading stays false
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(fetch).not.toHaveBeenCalled();
        expect(result.current.isWished).toBe(false);
    });

    it("toggle calls POST when not wished", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ exists: false, wishlistId: null }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ wishlistId: 99 }),
            } as unknown as Response);

        const { result } = renderHook(
            () => useWishlist(1, "user-abc"),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggle();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/member/wishlists",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("toggle calls DELETE when already wished", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ exists: true, wishlistId: 10 }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            } as unknown as Response);

        const { result } = renderHook(
            () => useWishlist(1, "user-abc"),
            { wrapper: createWrapper() }
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggle();
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/wishlists/10"),
            expect.objectContaining({ method: "DELETE" })
        );
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useWishlist.test.ts --run
```

Expected: FAIL

- [ ] **Step 3: Create `hooks/useWishlist.ts`**

```typescript
// hooks/useWishlist.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { queryKeys } from "@/lib/queryKeys";

type WishlistStatus = {
    exists: boolean;
    wishlistId: number | null;
};

/**
 * Extracted from WishlistButtonClient.tsx.
 *
 * viewerId: string — caller passes "" when unauthenticated (!!'' = false disables query).
 *
 * wishlistId threading: read synchronously from cache data at mutation time.
 * After POST, setQueryData applies an optimistic update before invalidation refetch.
 */
export function useWishlist(gameId: number, viewerId: string) {
    const queryClient = useQueryClient();
    const key = queryKeys.wishlist(gameId);

    const { data, isLoading } = useQuery<WishlistStatus>({
        queryKey: key,
        queryFn: () =>
            fetcher<WishlistStatus>(`/api/member/wishlists?gameId=${gameId}`),
        enabled: !!viewerId,
        refetchOnWindowFocus: false,
    });

    const { mutateAsync: toggle, isPending } = useMutation({
        mutationFn: async () => {
            const current = queryClient.getQueryData<WishlistStatus>(key);
            if (current?.exists && current.wishlistId !== null) {
                await fetch(`/api/member/wishlists/${current.wishlistId}`, {
                    method: "DELETE",
                }).then(async (res) => {
                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(
                            (body as { message?: string }).message ??
                                "위시리스트 삭제 실패"
                        );
                    }
                });
                return { exists: false, wishlistId: null } as WishlistStatus;
            } else {
                const res = await fetch("/api/member/wishlists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gameId }),
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        (body as { message?: string }).message ??
                            "위시리스트 등록 실패"
                    );
                }
                const { wishlistId } = await res.json();
                return { exists: true, wishlistId } as WishlistStatus;
            }
        },
        onSuccess: (newStatus) => {
            // Optimistic cache update before invalidation refetch completes
            queryClient.setQueryData<WishlistStatus>(key, newStatus);
            queryClient.invalidateQueries({ queryKey: key });
        },
    });

    return {
        isWished: data?.exists ?? false,
        isLoading: isLoading || isPending,
        toggle,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ../refactor-282
npm test -- hooks/__tests__/useWishlist.test.ts --run
```

Expected: 4 passed

- [ ] **Step 5: Update `WishlistButtonClient.tsx`**

Replace the file:

```tsx
// app/(base)/games/[gameId]/components/WishlistButtonClient.tsx
"use client";

import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistButtonClient({
    gameId,
    viewerId,
}: {
    gameId: number;
    viewerId: string;
}) {
    // Hook must be called before any early return (Rules of Hooks).
    // viewerId="" when unauthenticated — !!'' is false, so useWishlist disables its query.
    const { isWished, isLoading, toggle } = useWishlist(gameId, viewerId);

    if (!viewerId) return null;

    const handleToggle = async () => {
        try {
            await toggle();
        } catch {
            alert("처리에 실패했습니다.");
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`group relative flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 sm:px-8 sm:py-3 sm:text-sm ${
                isWished
                    ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-500"
                    : "border-gray-600 bg-gray-800/40 text-gray-300 backdrop-blur-sm hover:border-purple-500/50 hover:bg-gray-800/60 hover:text-purple-400"
            } min-w-[120px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80 sm:min-w-[140px]`}
        >
            <div className="relative flex h-4 w-4 items-center justify-center">
                {isLoading ? (
                    <svg
                        className="h-4 w-4 animate-spin text-current"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                        {isWished ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4"
                            >
                                <path d="M5.25 5.625c0-1.036.84-1.875 1.875-1.875h10.5c1.036 0 1.875.84 1.875 1.875v16.875a.375.375 0 01-.584.312l-7.166-4.777-7.166 4.777a.375.375 0 01-.584-.312V5.625z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                                />
                            </svg>
                        )}
                    </span>
                )}
            </div>
            <span className="inline-block text-center">
                {isLoading
                    ? "처리 중..."
                    : isWished
                      ? "위시리스트 삭제"
                      : "위시리스트 담기"}
            </span>
        </button>
    );
}
```

- [ ] **Step 6: Run full test suite**

```bash
cd ../refactor-282
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Run build**

```bash
cd ../refactor-282
npm run build 2>&1 | tail -5
```

Expected: `✓ Generating static pages`

- [ ] **Step 8: Commit**

```bash
cd ../refactor-282
git add hooks/useWishlist.ts hooks/__tests__/useWishlist.test.ts \
  "app/(base)/games/[gameId]/components/WishlistButtonClient.tsx"
git commit -m "[refactor/#282] useWishlist 추가, WishlistButtonClient 인라인 fetch 분리"
```

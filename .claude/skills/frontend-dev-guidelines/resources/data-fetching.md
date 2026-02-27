# Data Fetching Patterns

Data fetching in GameChu using Server Components, client-side `fetch`, Zustand stores, and custom hooks.

---

## Two Fetching Approaches

### 1. Server Components (for initial page data)

Server Components can fetch data directly — no API route needed:

```typescript
// app/(base)/games/page.tsx — Server Component
export default async function GamesPage() {
    const res = await fetch("https://api.igdb.com/v4/games", {
        headers: { ... },
        next: { revalidate: 3600 },  // ISR: revalidate every hour
    });
    const games = await res.json();

    return (
        <div className="px-4 py-10">
            {games.map((game) => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    );
}
```

### 2. Client Components (for interactive data)

Client components fetch from `/api/...` routes using `useEffect` + `fetch`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useLoadingStore } from "@/stores/loadingStore";

export default function ArenaList() {
    const { setLoading } = useLoadingStore();
    const [arenas, setArenas] = useState<ArenaDetailDto[]>([]);

    useEffect(() => {
        const fetchArenas = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/arenas");
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setArenas(json.data);
                }
            } catch (err) {
                console.error("Error fetching arenas:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArenas();
    }, [setLoading]);

    return (
        <div>
            {arenas.map((arena) => (
                <ArenaCard key={arena.id} arena={arena} />
            ))}
        </div>
    );
}
```

---

## Custom Data-Fetching Hooks

### Basic Pattern (from useArenaList.ts)

```typescript
// hooks/useArenaList.ts
import { useEffect, useState } from "react";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

export function useArenaList() {
    const [arenaList, setArenaList] = useState<ArenaDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch("/api/arenas")
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success && Array.isArray(resData.data)) {
                    setArenaList(resData.data);
                } else {
                    setArenaList([]);
                }
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { arenaList, setArenaList, loading, error };
}
```

### Usage in Component

```typescript
"use client";

import { useArenaList } from "@/hooks/useArenaList";

export default function ArenaListPage() {
    const { arenaList, loading, error } = useArenaList();

    if (loading) return null; // LottieLoaderWrapper handles global loading
    if (error) return <div>오류가 발생했습니다.</div>;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {arenaList.map((arena) => (
                <ArenaCard key={arena.id} arena={arena} />
            ))}
        </div>
    );
}
```

---

## Fetching with Zustand Store

For data that needs to be shared across components (e.g., arena detail):

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useArenaStore from "@/stores/useArenaStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

export default function ArenaDetailPage() {
    const setGlobalArenaData = useArenaStore((state) => state.setArenaData);
    const clearGlobalArenaData = useArenaStore((state) => state.clearArenaData);
    const { setLoading } = useLoadingStore();
    const { id } = useParams();
    const arenaId = Number(id);

    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchArenaDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/arenas/${arenaId}`, {
                    method: "GET",
                    cache: "no-store",
                });
                if (!res.ok) {
                    setNotFound(true);
                    return;
                }
                const data: ArenaDetailDto = await res.json();
                setGlobalArenaData(data);
            } catch (error) {
                console.error("Error fetching arena detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArenaDetail();

        return () => {
            clearGlobalArenaData();
        };
    }, [arenaId, setGlobalArenaData, clearGlobalArenaData, setLoading]);

    if (notFound) return <div>존재하지 않는 투기장입니다.</div>;

    return <ArenaDetailContent />;
}
```

---

## API Route Format

### Correct Format

```typescript
// Client-side fetch — always use /api/ prefix
await fetch("/api/arenas");
await fetch(`/api/arenas/${id}`);
await fetch("/api/games/search?q=keyword");

// POST/PUT/DELETE
await fetch("/api/arenas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
});
```

### API Response Pattern

GameChu API routes return a consistent format:

```typescript
// Success
{ success: true, data: [...] }

// Error
{ success: false, error: "Error message" }

// Or just direct data for simple endpoints
{ id: 1, title: "...", ... }
```

---

## Mutations (POST/PUT/DELETE)

### Basic Mutation Pattern

```typescript
"use client";

import { useState } from "react";
import { useLoadingStore } from "@/stores/loadingStore";

export default function CreateArenaForm() {
    const { setLoading } = useLoadingStore();
    const [title, setTitle] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/arenas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            if (!res.ok) throw new Error("Failed to create arena");

            const data = await res.json();
            // Handle success (navigate, show toast, etc.)
        } catch (error) {
            console.error("Error creating arena:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-line-100 bg-background-300 px-4 py-2 text-font-100"
            />
            <button type="submit" className="rounded-md bg-primary-purple-200 px-4 py-2">
                생성
            </button>
        </form>
    );
}
```

---

## SSG / SSR / ISR

### Static Generation (SSG)

```typescript
// app/(base)/page.tsx
export const dynamic = "force-static"; // SSG

export default function Home() {
    return <div>...</div>;
}
```

### Server-Side Rendering (SSR)

```typescript
// No cache — fresh on every request
export const dynamic = "force-dynamic";

export default async function Page() {
    const data = await fetch("...", { cache: "no-store" });
    return <div>...</div>;
}
```

### Incremental Static Regeneration (ISR)

```typescript
export default async function Page() {
    const data = await fetch("...", { next: { revalidate: 60 } }); // Revalidate every 60s
    return <div>...</div>;
}
```

---

## Error Handling in Fetches

```typescript
useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`/api/arenas/${id}`);

            if (!res.ok) {
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            setData(data);
        } catch (error) {
            console.error("Fetch error:", error);
            setError(error as Error);
        }
    };
    fetchData();
}, [id]);
```

---

## Summary

**Data Fetching Recipe:**

1. **Server Components**: Direct fetch for initial data (SSG/SSR/ISR)
2. **Client Components**: `useEffect` + `fetch("/api/...")` + `useState`
3. **Custom Hooks**: Extract repeated fetch patterns into `hooks/` directory
4. **Zustand Stores**: Share fetched data across components
5. **useLoadingStore**: Global loading state for `LottieLoaderWrapper`
6. **API Format**: Always `/api/[feature]` paths
7. **Error Handling**: Try/catch with console.error, conditional not-found rendering

**See Also:**
- [component-patterns.md](component-patterns.md) - Server vs Client Components
- [loading-and-error-states.md](loading-and-error-states.md) - Loading/error UI
- [complete-examples.md](complete-examples.md) - Full working examples

# Performance Optimization

Patterns for optimizing React component performance in GameChu's Next.js 15 application.

---

## Server Components for Zero Client JS

The biggest performance win in Next.js: Server Components send **zero JavaScript** to the client.

```typescript
// ✅ Server Component — no JS sent to browser
// app/(base)/page.tsx
export const dynamic = "force-static";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background-400">
            <h1 className="text-2xl font-bold text-font-100">겜추</h1>
        </div>
    );
}
```

**Rule:** Only add `"use client"` when you actually need hooks, events, or browser APIs.

---

## useMemo for Expensive Computations

```typescript
import { useMemo } from "react";

export default function ArenaList({ arenas, searchTerm }: Props) {
    // ✅ Memoized — only recalculates when dependencies change
    const filteredArenas = useMemo(() => {
        return arenas
            .filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [arenas, searchTerm]);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArenas.map((arena) => (
                <ArenaCard key={arena.id} arena={arena} />
            ))}
        </div>
    );
}
```

**When to use useMemo:**

- Filtering/sorting large arrays
- Complex calculations
- Transforming data structures

**When NOT to use useMemo:**

- Simple string concatenation
- Basic arithmetic
- Small arrays (<50 items)

---

## useCallback for Event Handlers

```typescript
import { useCallback } from "react";

export default function Parent({ items }: Props) {
    // ✅ Stable function reference — Child won't re-render unnecessarily
    const handleSelect = useCallback((id: number) => {
        console.log("Selected:", id);
    }, []);

    return (
        <div>
            {items.map((item) => (
                <ChildCard key={item.id} item={item} onSelect={handleSelect} />
            ))}
        </div>
    );
}
```

**When to use useCallback:**

- Functions passed as props to children
- Functions used as dependencies in useEffect
- Event handlers in lists

**When NOT to use useCallback:**

- Inline handlers not passed to children: `onClick={() => setOpen(true)}`

---

## React.memo for Component Memoization

```typescript
import React from "react";

interface ArenaCardProps {
    arena: ArenaData;
    onSelect: (id: number) => void;
}

// ✅ Wrap expensive components that receive stable props
const ArenaCard = React.memo<ArenaCardProps>(function ArenaCard({ arena, onSelect }) {
    return (
        <div
            onClick={() => onSelect(arena.id)}
            className="cursor-pointer rounded-lg bg-background-300 p-4 transition hover:bg-background-200"
        >
            <h3 className="font-bold text-font-100">{arena.title}</h3>
            <p className="text-sm text-font-200">{arena.description}</p>
        </div>
    );
});

export default ArenaCard;
```

**When to use React.memo:**

- List items that re-render frequently
- Components with expensive rendering
- Props don't change often

---

## Debounced Search

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";

export default function GameSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");

    // Debounce search input — 300ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch only when debounced term changes
    useEffect(() => {
        if (!debouncedTerm) return;

        fetch(`/api/games/search?q=${encodeURIComponent(debouncedTerm)}`)
            .then((res) => res.json())
            .then((data) => setResults(data));
    }, [debouncedTerm]);

    return (
        <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="게임 검색..."
            className="rounded-md border border-line-100 bg-background-300 px-4 py-2 text-font-100"
        />
    );
}
```

**Optimal Debounce Timing:**

- **300ms**: Search/filtering
- **1000ms**: Auto-save
- **100ms**: Real-time validation

---

## Memory Leak Prevention

### Cleanup Timeouts/Intervals

```typescript
useEffect(() => {
    const intervalId = setInterval(() => {
        // periodic action
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup!
}, []);
```

### Cleanup Event Listeners

```typescript
useEffect(() => {
    const handleResize = () => {
        /* ... */
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize); // Cleanup!
}, []);
```

### Abort Fetch on Unmount

```typescript
useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/arenas/${id}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => {
            if (err.name !== "AbortError") console.error(err);
        });

    return () => controller.abort(); // Cancel fetch on unmount
}, [id]);
```

---

## Next.js Image Optimization

```typescript
import Image from "next/image";

// ✅ Use Next.js Image for automatic optimization
<Image
    src="/images/game-bg.png"
    alt="게임 배경"
    width={800}
    height={400}
    className="rounded-lg object-cover"
    priority  // For above-the-fold images
/>

// For external images, configure next.config.js domains
<Image
    src={game.coverUrl}
    alt={game.title}
    width={264}
    height={374}
    className="rounded-md"
/>
```

---

## Lazy Loading Heavy Components

```typescript
import dynamic from "next/dynamic";

// ✅ Dynamic import for heavy components
const ArenaChat = dynamic(() => import("./components/ArenaChat"), {
    loading: () => <div className="h-96 animate-pulse bg-background-300" />,
    ssr: false,  // Skip server-side rendering for client-only components
});

export default function ArenaDetailPage() {
    return (
        <div>
            <ArenaDetailHeader />
            <ArenaChat />
        </div>
    );
}
```

---

## List Rendering Optimization

### Stable Keys

```typescript
// ✅ CORRECT — Unique stable keys
{arenas.map((arena) => (
    <ArenaCard key={arena.id} arena={arena} />
))}

// ❌ AVOID — Index as key
{arenas.map((arena, index) => (
    <ArenaCard key={index} arena={arena} />  // Unstable if list reorders
))}
```

### Memoized List Items

```typescript
const ArenaCard = React.memo(function ArenaCard({ arena, onSelect }: Props) {
    return <div onClick={() => onSelect(arena.id)}>{arena.title}</div>;
});

export default function ArenaList({ arenas }: Props) {
    const handleSelect = useCallback((id: number) => {
        router.push(`/arenas/${id}`);
    }, [router]);

    return (
        <div>
            {arenas.map((arena) => (
                <ArenaCard key={arena.id} arena={arena} onSelect={handleSelect} />
            ))}
        </div>
    );
}
```

---

## Summary

**Performance Checklist:**

- Server Components by default (zero client JS)
- `useMemo` for expensive computations
- `useCallback` for functions passed to children
- `React.memo` for expensive list items
- Debounce search (300ms)
- Cleanup timeouts/intervals/listeners in useEffect
- Next.js `Image` for optimized images
- `dynamic()` import for heavy client-only components
- Stable keys in lists

**See Also:**

- [component-patterns.md](component-patterns.md) - Server vs Client Components
- [data-fetching.md](data-fetching.md) - Fetch optimization
- [complete-examples.md](complete-examples.md) - Full examples

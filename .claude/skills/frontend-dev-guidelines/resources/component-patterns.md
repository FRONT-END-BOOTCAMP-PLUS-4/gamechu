# Component Patterns

Component architecture for GameChu's Next.js 15 App Router application with React 19, TailwindCSS, and Zustand.

---

## Server vs Client Components

### Server Components (Default)

Pages and components are Server Components by default in Next.js App Router. No directive needed.

```typescript
// app/(base)/games/page.tsx — Server Component (default)
import Link from "next/link";

export default function GamesPage() {
    return (
        <div className="px-4 py-10">
            <h1 className="text-2xl font-bold text-font-100">게임 탐색</h1>
            <Link href="/games/123" className="text-primary-purple-200 hover:underline">
                게임 상세
            </Link>
        </div>
    );
}
```

**Use Server Components when:**
- Rendering static content
- Fetching data directly (no user interaction needed)
- No hooks, event handlers, or browser APIs

### Client Components

Add `"use client"` when using hooks, event handlers, or browser APIs.

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useArenaStore from "@/stores/useArenaStore";

export default function ArenaDetail() {
    const { id } = useParams();
    const arenaData = useArenaStore((state) => state.arenaData);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // fetch data...
    }, [id]);

    if (notFound) return <div>존재하지 않는 투기장입니다.</div>;

    return <div>{arenaData?.title}</div>;
}
```

**Use Client Components when:**
- Using React hooks (`useState`, `useEffect`, etc.)
- Using event handlers (`onClick`, `onChange`, etc.)
- Using browser APIs (`window`, `document`)
- Using Zustand stores
- Using Next.js client hooks (`useRouter`, `useParams`)

---

## Component Structure Pattern

### Recommended Order

```typescript
"use client";

// 1. REACT IMPORTS
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";

// 2. STORE & HOOK IMPORTS
import { useAuthStore } from "@/stores/AuthStore";
import { useLoadingStore } from "@/stores/loadingStore";

// 3. UTILITY IMPORTS
import { cn } from "@/utils/tailwindUtil";

// 4. TYPE IMPORTS
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

// 5. COMPONENT IMPORTS
import Button from "@/app/components/Button";

// 6. PROPS INTERFACE
interface MyComponentProps {
    /** 엔티티 ID */
    entityId: number;
    /** 완료 시 콜백 */
    onComplete?: () => void;
}

// 7. COMPONENT DEFINITION
export default function MyComponent({ entityId, onComplete }: MyComponentProps) {
    // 8. HOOKS (in this order)
    // - Store hooks
    const user = useAuthStore((state) => state.user);
    const { setLoading } = useLoadingStore();

    // - Local state
    const [data, setData] = useState<MyData | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // - Effects
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/entities/${entityId}`);
                const json = await res.json();
                setData(json.data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [entityId, setLoading]);

    // 9. EVENT HANDLERS
    const handleAction = useCallback(() => {
        onComplete?.();
    }, [onComplete]);

    // 10. RENDER
    if (!data) return null;

    return (
        <div className="rounded-lg bg-background-300 p-4">
            <h2 className="text-lg font-bold text-font-100">{data.title}</h2>
            <Button label="확인" onClick={handleAction} />
        </div>
    );
}
```

---

## Component Separation

### When to Split Components

**Split into page-specific `components/` subdirectory when:**
- Component exceeds 300 lines
- Multiple distinct responsibilities
- Reusable within the page

**Example from arena detail page:**

```
app/(base)/arenas/[id]/
  page.tsx                     # Main page component
  components/
    ArenaDetailHeader.tsx      # Header section
    ArenaDetailInfo.tsx        # Info panel
    ArenaDetailVote.tsx        # Vote section
    ArenaDetailContainer.tsx   # Chat container
```

```typescript
// page.tsx
"use client";

import ArenaDetailVote from "./components/ArenaDetailVote";
import ArenaDetailHeader from "./components/ArenaDetailHeader";
import ArenaDetailInfo from "./components/ArenaDetailInfo";
import ArenaDetailContainer from "./components/ArenaDetailContainer";

export default function ArenaDetailPage() {
    return (
        <div className="px-4 py-10 sm:px-8 md:px-12 lg:px-16">
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex w-full flex-1 flex-col lg:flex-[3]">
                    <ArenaDetailHeader />
                    <ArenaDetailContainer />
                    <ArenaDetailVote />
                </div>
                <div className="mt-16 hidden flex-[1] lg:block">
                    <ArenaDetailInfo />
                </div>
            </div>
        </div>
    );
}
```

### When to Put in Shared Components

**Put in `app/components/` when:**
- Used across 3+ pages
- Generic, no feature-specific logic
- Pure UI primitive

**Examples:** `Button.tsx`, `Header.tsx`, `Footer.tsx`, `Toast.tsx`, `Pager.tsx`, `TierBadge.tsx`

---

## Shared Button Component Pattern

GameChu uses a custom `Button` component with size/type variants:

```typescript
import Button from "@/app/components/Button";

// Sizes: "xs" | "small" | "medium" | "large" | "send"
// Types: "purple" | "blue" | "black" | "red"

<Button label="생성하기" size="medium" type="purple" onClick={handleCreate} />
<Button label="취소" size="small" type="black" onClick={handleCancel} />
<Button label="삭제" size="small" type="red" onClick={handleDelete} />
```

---

## Conditional Class Names with `cn()`

```typescript
import { cn } from "@/utils/tailwindUtil";

export default function Card({ active, disabled }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border p-4 transition duration-200",
                active && "border-primary-purple-200 bg-background-300",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
        >
            Content
        </div>
    );
}
```

---

## Export Patterns

### Default Export (PREFERRED for pages and components)

```typescript
// Pages — always default export
export default function ArenaListPage() { ... }

// Components — default export
export default function ArenaCard({ arena }: ArenaCardProps) { ... }
```

### Named Export (for stores and hooks)

```typescript
// Stores
export const useAuthStore = create<AuthStore>((set) => ({ ... }));

// Hooks
export function useArenaList() { ... }
```

---

## Component Communication

### Props Down, Events Up

```typescript
// Parent
"use client";
import { useState } from "react";
import ChildCard from "./ChildCard";

export default function Parent() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return <ChildCard data={data} onSelect={setSelectedId} />;
}

// Child
interface ChildCardProps {
    data: ArenaData;
    onSelect: (id: number) => void;
}

export default function ChildCard({ data, onSelect }: ChildCardProps) {
    return (
        <div onClick={() => onSelect(data.id)} className="cursor-pointer rounded-lg p-4">
            {data.title}
        </div>
    );
}
```

### Avoid Prop Drilling — Use Zustand

```typescript
// Instead of passing through 5+ levels, use a Zustand store
import useArenaStore from "@/stores/useArenaStore";

function DeepChild() {
    const arenaData = useArenaStore((state) => state.arenaData);
    return <div>{arenaData?.title}</div>;
}
```

---

## Summary

**Component Recipe:**
1. Server Component by default; add `"use client"` only when needed
2. TailwindCSS utility classes for styling
3. `cn()` for conditional classes
4. Zustand stores for shared state
5. `fetch("/api/...")` for data in client components
6. Default export for pages and components
7. Korean UI strings

**See Also:**
- [data-fetching.md](data-fetching.md) - fetch patterns
- [loading-and-error-states.md](loading-and-error-states.md) - Loading/error handling
- [complete-examples.md](complete-examples.md) - Full working examples

# Loading & Error States

Loading and error handling patterns in GameChu using Zustand's `useLoadingStore`, `LottieLoaderWrapper`, and `Toast`.

---

## Global Loading: useLoadingStore + LottieLoaderWrapper

### How It Works

1. `useLoadingStore` manages a global `loading` boolean
2. `LottieLoaderWrapper` in the base layout watches this store
3. When `loading` is `true`, a Lottie animation overlay appears

### Pattern

```typescript
"use client";

import { useEffect, useState } from "react";
import { useLoadingStore } from "@/stores/loadingStore";

export default function MyPage() {
    const { setLoading } = useLoadingStore();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);  // Show global loader
            try {
                const res = await fetch("/api/my-data");
                const json = await res.json();
                setData(json.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);  // Hide global loader
            }
        };
        fetchData();
    }, [setLoading]);

    if (!data) return null;  // LottieLoaderWrapper handles the loading UI

    return <div>{/* render data */}</div>;
}
```

### Layout Setup

The `LottieLoaderWrapper` is already included in the base layout:

```typescript
// app/(base)/layout.tsx
export default function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
                <LottieLoaderWrapper />  {/* Global loading overlay */}
                {children}
            </main>
            <Footer />
        </>
    );
}
```

---

## Custom Hook Loading

For hooks that manage their own loading state (not global):

```typescript
// hooks/useArenaList.ts
export function useArenaList() {
    const [arenaList, setArenaList] = useState<ArenaDetailDto[]>([]);
    const [loading, setLoading] = useState(true); // Local loading
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch("/api/arenas")
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success) setArenaList(resData.data);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { arenaList, loading, error };
}
```

---

## Not-Found Handling

### Pattern: Conditional Rendering

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArenaDetailPage() {
    const { id } = useParams();
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/arenas/${id}`);
            if (!res.ok) {
                setNotFound(true);
                return;
            }
            // ... process data
        };
        fetchData();
    }, [id]);

    if (notFound) {
        return (
            <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-background-400">
                존재하지 않는 투기장입니다.
            </div>
        );
    }

    return <div>{/* content */}</div>;
}
```

### Pattern: Using NotFoundLottie

```typescript
import NotFoundLottie from "@/app/components/NotFoundLottie";
import ClientNotFoundView from "@/app/components/ClientNotFoundView";

if (notFound) {
    return <ClientNotFoundView />;
}
```

---

## Error Handling

### Toast Notifications

```typescript
"use client";

import { useState } from "react";
import Toast from "@/app/components/Toast";

export default function MyComponent() {
    const [toast, setToast] = useState({
        show: false,
        status: "info" as "success" | "error" | "info",
        message: "",
    });

    const handleAction = async () => {
        try {
            const res = await fetch("/api/action", { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            setToast({ show: true, status: "success", message: "성공적으로 처리되었습니다." });
        } catch {
            setToast({ show: true, status: "error", message: "처리 중 오류가 발생했습니다." });
        }
    };

    return (
        <>
            <button onClick={handleAction}>실행</button>
            <Toast show={toast.show} status={toast.status} message={toast.message} />
        </>
    );
}
```

### Error in Fetch Hooks

```typescript
export function useArenaList() {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch("/api/arenas")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setArenaList(data.data))
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { arenaList, loading, error };
}

// Usage:
const { arenaList, loading, error } = useArenaList();

if (error) {
    return <div className="text-center text-red-400">오류가 발생했습니다.</div>;
}
```

---

## Loading State Patterns Summary

| Pattern       | When to Use              | How                                       |
| ------------- | ------------------------ | ----------------------------------------- |
| Global loader | Page-level data fetching | `useLoadingStore` + `LottieLoaderWrapper` |
| Local loading | Hook-level, non-blocking | `useState(true)` in custom hook           |
| Null render   | Data not yet available   | `if (!data) return null;`                 |
| Not-found     | API returns 404          | `setNotFound(true)` + conditional render  |

---

## Error Handling Patterns Summary

| Pattern        | When to Use                        | How                                        |
| -------------- | ---------------------------------- | ------------------------------------------ |
| Toast          | User-facing success/error messages | `Toast` component with state               |
| Console.error  | Debugging, non-user-facing         | `console.error("Error:", error)`           |
| Error state    | Display error UI                   | `useState<Error \| null>(null)`            |
| Not-found page | Resource doesn't exist             | Conditional render or `ClientNotFoundView` |

---

## Anti-Patterns

```typescript
// ❌ AVOID — Forgetting to set loading false on error
setLoading(true);
const res = await fetch(...);  // If this throws, loading stays true forever!
setData(res);
setLoading(false);

// ✅ CORRECT — Always use try/finally
setLoading(true);
try {
    const res = await fetch(...);
    setData(res);
} catch (error) {
    console.error(error);
} finally {
    setLoading(false);  // Always runs
}
```

```typescript
// ❌ AVOID — Using alert() for errors
alert("Error occurred!");

// ✅ CORRECT — Use Toast component
setToast({ show: true, status: "error", message: "오류가 발생했습니다." });
```

---

## Summary

**Loading:**

- Global: `useLoadingStore` → `LottieLoaderWrapper` (in layout)
- Local: `useState` in custom hooks
- Always use `try/finally` to ensure loading is cleared

**Errors:**

- Toast for user-facing messages
- `console.error` for debugging
- Not-found conditional rendering for 404s

**See Also:**

- [data-fetching.md](data-fetching.md) - Fetch patterns with loading
- [common-patterns.md](common-patterns.md) - Toast and store patterns
- [complete-examples.md](complete-examples.md) - Full working examples

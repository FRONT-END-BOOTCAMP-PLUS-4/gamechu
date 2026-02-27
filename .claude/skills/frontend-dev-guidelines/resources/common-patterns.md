# Common Patterns

Frequently used patterns for Zustand stores, hooks, modals, toasts, and forms in GameChu.

---

## Zustand Store Patterns

### Auth Store

```typescript
// stores/AuthStore.ts
import { create } from "zustand";

interface AuthUser {
    id: string;
}

interface AuthStore {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
```

**Usage:**
```typescript
"use client";
import { useAuthStore } from "@/stores/AuthStore";

export default function ProfileButton() {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Link href="/login">로그인</Link>;
    return <span>ID: {user.id}</span>;
}
```

### Loading Store

```typescript
// stores/loadingStore.ts
import { create } from "zustand";

export const useLoadingStore = create<{
    loading: boolean;
    setLoading: (v: boolean) => void;
}>((set) => ({
    loading: false,
    setLoading: (v) => set({ loading: v }),
}));
```

**Usage:**
```typescript
const { setLoading } = useLoadingStore();

const fetchData = async () => {
    setLoading(true);
    try {
        // ... fetch
    } finally {
        setLoading(false);
    }
};
```

### Modal Store

```typescript
// stores/modalStore.ts
import { create } from "zustand";

type ModalType = "notification" | "createArena" | null;
type ModalPosition = "center" | "anchor-bottom" | null;

interface ModalStore {
    modalType: ModalType;
    modalPosition: ModalPosition;
    isOpen: boolean;
    openModal: (type: ModalType, position: ModalPosition) => void;
    closeModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
    modalType: null,
    modalPosition: null,
    isOpen: false,
    openModal: (type, position) => set({ modalType: type, modalPosition: position, isOpen: true }),
    closeModal: () => set({ modalType: null, modalPosition: null, isOpen: false }),
}));

export default useModalStore;
```

**Usage:**
```typescript
import useModalStore from "@/stores/modalStore";

export default function CreateArenaButton() {
    const openModal = useModalStore((state) => state.openModal);

    return (
        <button onClick={() => openModal("createArena", "center")}>
            투기장 생성
        </button>
    );
}
```

### Arena Store (Feature-Specific)

```typescript
// stores/useArenaStore.ts
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { create } from "zustand";

interface ArenaState {
    arenaData: ArenaDetailDto | null;
    setArenaData: (data: ArenaDetailDto) => void;
    clearArenaData: () => void;
}

const useArenaStore = create<ArenaState>((set) => ({
    arenaData: null,
    setArenaData: (data) => set({ arenaData: data }),
    clearArenaData: () => set({ arenaData: null }),
}));

export default useArenaStore;
```

---

## Zustand Best Practices

### Selector Pattern (Prevent Unnecessary Re-renders)

```typescript
// ✅ CORRECT — Select only what you need
const user = useAuthStore((state) => state.user);
const setLoading = useLoadingStore((state) => state.setLoading);

// ❌ AVOID — Destructuring causes re-render on any store change
const { user, setUser, clearUser } = useAuthStore();
```

### Creating New Stores

Follow the existing pattern:

```typescript
import { create } from "zustand";

interface MyFeatureState {
    data: MyData | null;
    setData: (data: MyData) => void;
    clearData: () => void;
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
    data: null,
    setData: (data) => set({ data }),
    clearData: () => set({ data: null }),
}));
```

---

## Toast Notifications

### Toast Component

```typescript
import Toast from "@/app/components/Toast";

// In JSX:
<Toast
    show={showToast}
    status="success"     // "success" | "error" | "info"
    message="투기장이 생성되었습니다."
    duration={3000}      // Optional, default 3000ms
/>
```

### Toast Pattern in Components

```typescript
"use client";

import { useState } from "react";
import Toast from "@/app/components/Toast";

export default function MyComponent() {
    const [toast, setToast] = useState({ show: false, status: "info" as const, message: "" });

    const handleAction = async () => {
        try {
            await fetch("/api/some-action", { method: "POST" });
            setToast({ show: true, status: "success", message: "성공!" });
        } catch {
            setToast({ show: true, status: "error", message: "실패했습니다." });
        }
    };

    return (
        <div>
            <button onClick={handleAction}>실행</button>
            <Toast show={toast.show} status={toast.status} message={toast.message} />
        </div>
    );
}
```

---

## Modal System

### Opening Modals

```typescript
import useModalStore from "@/stores/modalStore";

// Open modal
const openModal = useModalStore((state) => state.openModal);
openModal("createArena", "center");
openModal("notification", "anchor-bottom");

// Close modal
const closeModal = useModalStore((state) => state.closeModal);
closeModal();
```

### Modal Rendering (in Modals.tsx)

The `app/components/Modals.tsx` component reads `modalType` and renders the appropriate modal content.

---

## Custom Hook Patterns

### Data-Fetching Hook

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

### Socket Hook

```typescript
// hooks/useArenaSocket.ts — Socket.IO connection for real-time arena chat
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useArenaSocket(arenaId: number) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io("/arena", { query: { arenaId } });
        socketRef.current = socket;

        socket.on("connect", () => { /* connected */ });
        socket.on("message", (msg) => { /* handle message */ });

        return () => {
            socket.disconnect();
        };
    }, [arenaId]);

    return socketRef;
}
```

---

## Form Handling

### Basic Form (useState)

```typescript
"use client";

import { useState } from "react";
import Button from "@/app/components/Button";

export default function CreateArenaForm({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/arenas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
        });

        if (res.ok) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="rounded-md border border-line-100 bg-background-300 px-4 py-2 text-font-100"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명"
                className="rounded-md border border-line-100 bg-background-300 px-4 py-2 text-font-100"
                rows={4}
            />
            <Button label="생성하기" type="purple" htmlType="submit" />
        </form>
    );
}
```

---

## State Management Decision

| State Type | Solution | Example |
|-----------|----------|---------|
| Server data (fetched) | `useState` + `useEffect` + `fetch` | Arena list, game details |
| Shared across pages | Zustand store | Auth user, modal state, loading |
| Local UI state | `useState` | Form inputs, toggles, selected tab |
| Real-time data | Socket.IO + `useRef` | Arena chat messages |

---

## Summary

**Common Patterns:**
- Zustand stores: auth, loading, modal, arena (use selectors)
- Toast for user notifications (success/error/info)
- Modal system via `useModalStore`
- Custom hooks in `hooks/` for data fetching
- `useState` for forms (no form library needed for simple forms)
- Socket.IO for real-time features

**See Also:**
- [data-fetching.md](data-fetching.md) - Fetch patterns
- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full examples

# Complete Examples

Full working examples combining GameChu's patterns: Next.js App Router, TailwindCSS, Zustand, fetch API, and custom hooks.

---

## Example 1: Client Component with Data Fetching

Arena detail page pattern — fetch + Zustand store + loading state:

```typescript
// app/(base)/arenas/[id]/page.tsx
"use client";

import ArenaDetailVote from "./components/ArenaDetailVote";
import ArenaDetailHeader from "./components/ArenaDetailHeader";
import ArenaDetailInfo from "./components/ArenaDetailInfo";
import ArenaDetailContainer from "./components/ArenaDetailContainer";
import React, { useEffect, useState } from "react";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import useArenaStore from "@/stores/useArenaStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { useParams } from "next/navigation";

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

    if (notFound) {
        return (
            <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-background-400">
                존재하지 않는 투기장입니다.
            </div>
        );
    }

    return (
        <div className="px-4 py-10 sm:px-8 md:px-12 lg:px-16">
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex w-full flex-1 flex-col lg:flex-[3]">
                    <ArenaDetailHeader />
                    <div className="mt-6 block lg:hidden">
                        <ArenaDetailInfo />
                    </div>
                    <ArenaDetailContainer />
                    <ArenaDetailVote />
                </div>
                <div className="mt-16 hidden flex-[1] lg:block">
                    <div className="sticky top-6">
                        <ArenaDetailInfo />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

---

## Example 2: Static Landing Page (Server Component)

```typescript
// app/(base)/page.tsx
import LandingCard from "../components/LandingCard";

export const dynamic = "force-static";

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background-400 px-4 pb-20">
            <div className="flex w-full max-w-7xl flex-col items-center gap-12 pt-12 lg:gap-20">
                <div className="flex w-full flex-col px-2 text-center lg:px-6">
                    <h1 className="mb-4 text-2xl font-bold lg:text-5xl">
                        게임 추천과 토론의 장
                    </h1>
                    <p className="text-sm leading-relaxed text-font-200 lg:text-lg">
                        원하는 서비스를 선택하여 게임에 대한 열정을 함께 나눠보세요!
                    </p>
                </div>
                <div className="flex w-full flex-col gap-8 lg:flex-row">
                    <LandingCard
                        href="/games"
                        iconSrc="/icons/gamesearch.svg"
                        iconAlt="게임 탐색"
                        title="게임 탐색"
                        description="다양한 장르와 플랫폼의 게임을 탐색하고 자세한 정보를 확인해보세요."
                        backgroundSrc="/images/game-bg.png"
                    />
                    <LandingCard
                        href="/arenas"
                        iconSrc="/icons/arena.svg"
                        iconAlt="투기장"
                        title="투기장"
                        description="게임에 대한 열띤 토론에 참여하세요."
                        backgroundSrc="/images/arena-bg.png"
                    />
                </div>
            </div>
        </div>
    );
}
```

---

## Example 3: Custom Data-Fetching Hook

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

// Usage in component:
"use client";

import { useArenaList } from "@/hooks/useArenaList";

export default function ArenaListPage() {
    const { arenaList, loading, error } = useArenaList();

    if (error) return <div className="text-red-400">오류가 발생했습니다.</div>;

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

## Example 4: Zustand Store

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

// Usage — always use selectors:
const arenaData = useArenaStore((state) => state.arenaData);
const setArenaData = useArenaStore((state) => state.setArenaData);
```

---

## Example 5: Shared UI Component (Button)

```typescript
// app/components/Button.tsx
"use client";

import React, { ReactNode } from "react";
import { cn } from "@/utils/tailwindUtil";

type ButtonSize = "xs" | "small" | "medium" | "large" | "send";
type ButtonType = "purple" | "blue" | "black" | "red";

interface ButtonProps {
    label?: string;
    size?: ButtonSize;
    type?: ButtonType;
    onClick?: () => void;
    htmlType?: "button" | "submit" | "reset";
    disabled?: boolean;
    icon?: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
    xs: "w-[32px] h-[32px]",
    send: "w-[50px] h-[50px]",
    small: "w-[90px] h-[35px]",
    medium: "w-[150px] h-[50px]",
    large: "w-[250px] h-[40px]",
};

const typeClasses: Record<ButtonType, string> = {
    purple: "bg-primary-purple-200 text-font-100 hover:bg-primary-purple-300",
    blue: "bg-primary-blue-200 text-font-100 hover:bg-primary-blue-300",
    black: "bg-background-400 text-font-100 border border-line-100 hover:border-primary-purple-200",
    red: "bg-red-400 text-white hover:bg-red-500",
};

export default function Button({
    label,
    size = "medium",
    type = "purple",
    onClick,
    htmlType = "button",
    disabled = false,
    icon,
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-1 rounded-[8px] text-button font-medium transition duration-200",
                sizeClasses[size],
                typeClasses[type],
                disabled && "pointer-events-none cursor-not-allowed opacity-50"
            )}
            onClick={onClick}
            disabled={disabled}
            type={htmlType}
        >
            {icon}
            {label}
        </button>
    );
}
```

---

## Example 6: Layout with Header + Footer

```typescript
// app/(base)/layout.tsx
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LottieLoaderWrapper from "../components/LottieLoaderWrapper";
import GlobalAttendanceToast from "./components/GlobalAttendanceToast";
import "../globals.css";

export const metadata: Metadata = {
    title: { default: "GameChu", template: "%s | GameChu" },
    description: "GameChu에서 게임 리뷰, 위시리스트, 포인트 기록, 아레나 전적을 한눈에 확인하세요.",
};

export default function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
                <LottieLoaderWrapper />
                <GlobalAttendanceToast />
                {children}
            </main>
            <Footer />
        </>
    );
}
```

---

## Example 7: Toast Notification Component

```typescript
// app/components/Toast.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface GlobalToastProps {
    show: boolean;
    status: "success" | "error" | "info";
    message: string;
    duration?: number;
}

export default function Toast({ show, status, message, duration = 3000 }: GlobalToastProps) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [show, duration]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-xl",
                        status === "success" && "bg-green-500",
                        status === "error" && "bg-red-500",
                        status === "info" && "bg-blue-500"
                    )}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
```

---

## Summary

**Key Takeaways:**

1. **Pages**: Server Components by default, `"use client"` for interactive pages
2. **Data Fetching**: `useEffect` + `fetch("/api/...")` + `useState` (or custom hook)
3. **Global State**: Zustand stores with selector pattern
4. **Styling**: TailwindCSS utility classes + `cn()` for conditionals
5. **Components**: Custom `Button`, `Toast`, `Modals` in `app/components/`
6. **Layout**: `Header` + `main` + `Footer` in `(base)` layout
7. **Loading**: `useLoadingStore` + `LottieLoaderWrapper`
8. **Korean UI**: All user-facing text in Korean

**See other resources for detailed explanations of each pattern.**

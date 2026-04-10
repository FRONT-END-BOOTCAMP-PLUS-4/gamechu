# Routing Guide

Next.js 15 App Router routing patterns for GameChu.

---

## App Router Overview

GameChu uses Next.js App Router with **route groups** and **directory-based routing**:

- `app/(base)/` — Main app pages (with Header + Footer)
- `app/(auth)/` — Auth pages (minimal layout)
- `app/api/` — API route handlers

---

## Directory-Based Routing

### Structure → URL Mapping

```
app/(base)/page.tsx                    → /
app/(base)/arenas/page.tsx             → /arenas
app/(base)/arenas/[id]/page.tsx        → /arenas/:id
app/(base)/games/page.tsx              → /games
app/(base)/games/[gameId]/page.tsx     → /games/:gameId
app/(base)/profile/page.tsx            → /profile
app/(base)/profile/[nickname]/page.tsx → /profile/:nickname
```

**Key Points:**

- Route groups `(base)` and `(auth)` don't appear in the URL
- `[id]` folders = dynamic parameters
- `page.tsx` = the route component

---

## Basic Page Pattern

### Static Page

```typescript
// app/(base)/page.tsx — Landing page
import LandingCard from "../components/LandingCard";

export const dynamic = "force-static"; // SSG

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background-400">
            <LandingCard href="/games" title="게임 탐색" />
            <LandingCard href="/arenas" title="투기장" />
        </div>
    );
}
```

### Dynamic Page (Client Component)

```typescript
// app/(base)/arenas/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useArenaStore from "@/stores/useArenaStore";

export default function ArenaDetailPage() {
    const { id } = useParams();
    const arenaId = Number(id);
    const setArenaData = useArenaStore((state) => state.setArenaData);

    useEffect(() => {
        fetch(`/api/arenas/${arenaId}`)
            .then((res) => res.json())
            .then((data) => setArenaData(data));
    }, [arenaId, setArenaData]);

    return <ArenaDetailContent />;
}
```

---

## Dynamic Routes

### Single Parameter

```typescript
// app/(base)/arenas/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

export default function ArenaDetailPage() {
    const { id } = useParams();  // string
    const arenaId = Number(id);

    return <div>Arena #{arenaId}</div>;
}
```

### String Parameter

```typescript
// app/(base)/profile/[nickname]/page.tsx
"use client";

import { useParams } from "next/navigation";

export default function UserProfilePage() {
    const { nickname } = useParams();  // string

    return <div>{nickname}님의 프로필</div>;
}
```

---

## Navigation

### Link Component (PREFERRED)

```typescript
import Link from "next/link";

export default function ArenaCard({ arena }: { arena: ArenaData }) {
    return (
        <Link
            href={`/arenas/${arena.id}`}
            className="block rounded-lg bg-background-300 p-4 transition hover:bg-background-200"
        >
            <h3 className="font-bold text-font-100">{arena.title}</h3>
        </Link>
    );
}
```

### Programmatic Navigation

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function CreateArenaButton() {
    const router = useRouter();

    const handleCreate = async () => {
        const res = await fetch("/api/arenas", { method: "POST", ... });
        const data = await res.json();
        router.push(`/arenas/${data.id}`);
    };

    return <button onClick={handleCreate}>투기장 생성</button>;
}
```

### Back Navigation

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <button onClick={() => router.back()} className="text-font-200 hover:text-font-100">
            ← 뒤로가기
        </button>
    );
}
```

---

## Layouts

### Base Layout (with Header + Footer)

```typescript
// app/(base)/layout.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import LottieLoaderWrapper from "../components/LottieLoaderWrapper";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
                <LottieLoaderWrapper />
                {children}
            </main>
            <Footer />
        </>
    );
}
```

### Auth Layout (minimal)

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background-400">
            {children}
        </div>
    );
}
```

---

## Metadata

### Static Metadata

```typescript
// app/(base)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "GameChu",
        template: "%s | GameChu",
    },
    description:
        "GameChu에서 게임 리뷰, 위시리스트, 포인트 기록, 아레나 전적을 한눈에 확인하세요.",
};
```

### Per-Page Metadata

```typescript
// app/(base)/arenas/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "투기장",
    description: "게임 토론 투기장 목록",
};

export default function ArenasPage() { ... }
```

---

## Not Found Handling

```typescript
"use client";

import { useState, useEffect } from "react";

export default function ArenaDetailPage() {
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(`/api/arenas/${id}`).then((res) => {
            if (!res.ok) setNotFound(true);
        });
    }, [id]);

    if (notFound) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-background-400">
                존재하지 않는 투기장입니다.
            </div>
        );
    }

    return <ArenaContent />;
}
```

---

## Summary

**Routing Checklist:**

- `app/(base)/[feature]/page.tsx` for pages
- `[param]` directories for dynamic routes
- `useParams()` from `next/navigation` for route params
- `Link` from `next/link` for navigation (preferred)
- `useRouter()` for programmatic navigation
- Route groups `(base)` / `(auth)` for layout separation
- Metadata exports for SEO

**See Also:**

- [component-patterns.md](component-patterns.md) - Server vs Client Components
- [file-organization.md](file-organization.md) - Directory structure
- [complete-examples.md](complete-examples.md) - Full page examples

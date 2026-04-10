---
name: frontend-dev-guidelines
description: Frontend development guidelines for GameChu's Next.js 15 App Router application. Covers TailwindCSS styling, Next.js routing, data fetching with fetch + Zustand, component patterns, file organization, and TypeScript best practices. Use when creating components, pages, hooks, stores, styling, routing, or working with frontend code.
---

# Frontend Development Guidelines

## Purpose

Comprehensive guide for GameChu's frontend development using Next.js 15 App Router, React 19, TailwindCSS 3, and Zustand.

## When to Use This Skill

- Creating new components or pages
- Building new features
- Fetching data (Server Components or client-side fetch)
- Setting up routes with Next.js App Router
- Styling components with TailwindCSS
- Managing global state with Zustand
- Organizing frontend code
- TypeScript best practices

---

## Quick Start

### New Component Checklist

Creating a component? Follow this checklist:

- [ ] Use `interface Props` + function component pattern
- [ ] Add `"use client"` directive if using hooks, event handlers, or browser APIs
- [ ] Use TailwindCSS utility classes for styling
- [ ] Use `cn()` from `@/utils/tailwindUtil` for conditional classes
- [ ] Import alias: `@/` for project root
- [ ] Use `fetch("/api/...")` for data fetching in client components
- [ ] Use Zustand stores for shared client state
- [ ] Default export at bottom
- [ ] Korean UI strings where appropriate

### New Page Checklist

Creating a page? Set up this structure:

- [ ] Create `app/(base)/[feature]/page.tsx` (or `app/(auth)/` for auth pages)
- [ ] Server Component by default (no `"use client"`)
- [ ] Extract client interactivity into `components/` subdirectory
- [ ] Use `useParams()` from `next/navigation` for dynamic routes
- [ ] Use `Link` from `next/link` for navigation
- [ ] Use `useLoadingStore` for loading states
- [ ] Add metadata export if needed

---

## Import Alias Quick Reference

| Alias | Resolves To  | Example                                     |
| ----- | ------------ | ------------------------------------------- |
| `@/`  | Project root | `import { cn } from '@/utils/tailwindUtil'` |

Defined in: `tsconfig.json` paths configuration

---

## Common Imports Cheatsheet

```typescript
// React hooks (client components only)
"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";

// Next.js
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";

// Zustand stores
import { useAuthStore } from "@/stores/AuthStore";
import { useLoadingStore } from "@/stores/loadingStore";
import useModalStore from "@/stores/modalStore";
import useArenaStore from "@/stores/useArenaStore";

// Utilities
import { cn } from "@/utils/tailwindUtil";

// Types
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

// Shared components
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
```

---

## Topic Guides

### Component Patterns

**GameChu components use:**

- Function components with TypeScript interfaces
- `"use client"` directive for interactive components
- `cn()` utility for conditional TailwindCSS classes
- Default export pattern

**Key Concepts:**

- Server Components by default (no directive needed)
- Add `"use client"` only when using hooks, events, or browser APIs
- Component structure: Interface → Component → Export

**[Complete Guide: resources/component-patterns.md](resources/component-patterns.md)**

---

### Data Fetching

**Two patterns based on context:**

1. **Server Components**: Direct `fetch()` or Prisma queries
2. **Client Components**: `useEffect` + `fetch("/api/...")` + `useState`

**API Route Layer:**

- Routes live in `app/api/[feature]/route.ts`
- Client fetches from `/api/...` paths
- Use `useLoadingStore` for global loading state

**[Complete Guide: resources/data-fetching.md](resources/data-fetching.md)**

---

### File Organization

**GameChu directory structure:**

- `app/(base)/`: Main app pages (arenas, games, profile)
- `app/(auth)/`: Authentication pages
- `app/api/`: API route handlers
- `app/components/`: Shared UI components
- `hooks/`: Custom React hooks
- `stores/`: Zustand global state
- `types/`: Shared TypeScript types

**[Complete Guide: resources/file-organization.md](resources/file-organization.md)**

---

### Styling

**Primary Method: TailwindCSS utility classes**

- All styling via className with Tailwind utilities
- Use `cn()` from `@/utils/tailwindUtil` for conditional classes
- Custom design tokens in `tailwind.config.ts` (colors, fonts)
- Responsive: `sm:`, `md:`, `lg:` prefixes

**[Complete Guide: resources/styling-guide.md](resources/styling-guide.md)**

---

### Routing

**Next.js App Router — Directory-Based:**

- `app/(base)/[feature]/page.tsx` for pages
- `app/(base)/[feature]/[id]/page.tsx` for dynamic routes
- `app/(base)/[feature]/components/` for page-specific components
- `Link` from `next/link` for navigation
- `useRouter` / `useParams` from `next/navigation`

**[Complete Guide: resources/routing-guide.md](resources/routing-guide.md)**

---

### Loading & Error States

**Loading: Zustand `useLoadingStore`**

- Set `setLoading(true)` before fetch, `setLoading(false)` in finally
- `LottieLoaderWrapper` in layout shows global loader

**Error Handling:**

- `Toast` component for user feedback
- Try/catch in fetch calls
- Not-found states with conditional rendering

**[Complete Guide: resources/loading-and-error-states.md](resources/loading-and-error-states.md)**

---

### Performance

**Optimization Patterns:**

- `useMemo`: Expensive computations (filter, sort, map)
- `useCallback`: Event handlers passed to children
- `React.memo`: Expensive components
- Debounced search (300-500ms)
- Memory leak prevention (cleanup in useEffect)
- Next.js `Image` for optimized images

**[Complete Guide: resources/performance.md](resources/performance.md)**

---

### TypeScript

**Standards:**

- Strict mode, avoid `any` type
- Explicit return types on functions
- Type imports: `import type { ... } from '...'`
- Component prop interfaces

**[Complete Guide: resources/typescript-standards.md](resources/typescript-standards.md)**

---

### Common Patterns

**Covered Topics:**

- Zustand store patterns (auth, modal, loading, arena)
- Custom hooks for data fetching
- Toast notifications
- Modal system with `useModalStore`
- Form handling

**[Complete Guide: resources/common-patterns.md](resources/common-patterns.md)**

---

### Complete Examples

**Full working examples:**

- Client component with fetch + Zustand
- Server Component page
- Custom data-fetching hook
- Zustand store
- Page with dynamic route

**[Complete Guide: resources/complete-examples.md](resources/complete-examples.md)**

---

## Navigation Guide

| Need to...             | Read this resource                                                   |
| ---------------------- | -------------------------------------------------------------------- |
| Create a component     | [component-patterns.md](resources/component-patterns.md)             |
| Fetch data             | [data-fetching.md](resources/data-fetching.md)                       |
| Organize files/folders | [file-organization.md](resources/file-organization.md)               |
| Style components       | [styling-guide.md](resources/styling-guide.md)                       |
| Set up routing         | [routing-guide.md](resources/routing-guide.md)                       |
| Handle loading/errors  | [loading-and-error-states.md](resources/loading-and-error-states.md) |
| Optimize performance   | [performance.md](resources/performance.md)                           |
| TypeScript types       | [typescript-standards.md](resources/typescript-standards.md)         |
| Stores/Modals/Hooks    | [common-patterns.md](resources/common-patterns.md)                   |
| See full examples      | [complete-examples.md](resources/complete-examples.md)               |

---

## Core Principles

1. **Server Components by Default**: Only add `"use client"` when needed
2. **TailwindCSS for Styling**: Utility classes, `cn()` for conditionals
3. **Zustand for Global State**: Minimal stores for auth, modal, loading, arena
4. **fetch API for Data**: `useEffect` + `fetch("/api/...")` in client components
5. **@/ Import Alias**: All imports from project root
6. **Korean UI Strings**: User-facing text in Korean
7. **useLoadingStore for Loading**: Global loading state via Zustand
8. **Toast for Notifications**: Custom Toast component for user feedback

---

## Quick Reference: File Structure

```
app/
  (auth)/                     # Auth pages (login, signup)
  (base)/                     # Main app pages
    arenas/
      page.tsx                # Arena list page
      [id]/
        page.tsx              # Arena detail page
        components/           # Page-specific components
    games/
      page.tsx                # Game list page
      [gameId]/
        page.tsx              # Game detail page
    profile/
      page.tsx                # My profile
      [nickname]/
        page.tsx              # Other user profile
    components/               # Route group shared components

  api/                        # API route handlers
    arenas/
      route.ts                # GET /api/arenas
      [id]/
        route.ts              # GET /api/arenas/:id

  components/                 # Shared UI components
    Button.tsx
    Header.tsx
    Footer.tsx
    Toast.tsx
    LottieLoaderWrapper.tsx
    Modals.tsx

hooks/                        # Custom React hooks
  useArenaList.ts
  useArenaSocket.ts
  useVote.ts

stores/                       # Zustand global state
  AuthStore.ts
  loadingStore.ts
  modalStore.ts
  useArenaStore.ts

types/                        # Shared TypeScript types
utils/                        # Pure utility functions
```

---

## Modern Component Template (Quick Copy)

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils/tailwindUtil";
import { useLoadingStore } from "@/stores/loadingStore";

interface MyComponentProps {
    id: number;
    onAction?: () => void;
}

export default function MyComponent({ id, onAction }: MyComponentProps) {
    const { setLoading } = useLoadingStore();
    const [data, setData] = useState<MyData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/my-feature/${id}`);
                const json = await res.json();
                setData(json.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, setLoading]);

    if (!data) return null;

    return (
        <div className="rounded-lg bg-background-300 p-4">
            <h2 className="text-lg font-bold text-font-100">{data.title}</h2>
            <button
                onClick={onAction}
                className="mt-2 rounded-md bg-primary-purple-200 px-4 py-2 text-font-100 hover:bg-primary-purple-300"
            >
                Action
            </button>
        </div>
    );
}
```

For complete examples, see [resources/complete-examples.md](resources/complete-examples.md)

---

## Related Skills

- **backend-dev-guidelines**: Backend API patterns that frontend consumes

---

**Skill Status**: Modular structure with progressive loading for optimal context management

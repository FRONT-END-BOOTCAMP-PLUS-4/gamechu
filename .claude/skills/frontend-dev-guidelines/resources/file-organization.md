# File Organization

Directory structure and file organization conventions for GameChu's Next.js 15 App Router application.

---

## Top-Level Directory Structure

```
app/                          # Next.js App Router
  (auth)/                     # Auth route group (login, signup)
  (base)/                     # Main app route group
  api/                        # API route handlers
  components/                 # Shared UI components
  globals.css                 # Global styles + Tailwind

backend/                      # Business logic — Clean Architecture
  [feature]/
    application/usecase/      # Use cases + DTOs
    domain/repositories/      # Repository interfaces
    infra/repositories/       # Prisma implementations
    infra/cache/              # Redis cache services

hooks/                        # Custom React hooks
stores/                       # Zustand global state
types/                        # Shared TypeScript types
utils/                        # Pure utility functions
lib/                          # Singletons (Prisma, Redis, auth config)
prisma/                       # schema.prisma + migrations
public/                       # Static assets (icons, images)
```

---

## app/ Directory (Next.js App Router)

### Route Groups

**`app/(base)/`** — Main application pages (with Header + Footer layout):

```
app/(base)/
  layout.tsx                  # Layout: Header + main + Footer
  page.tsx                    # Landing page (/)
  arenas/
    page.tsx                  # Arena list (/arenas)
    [id]/
      page.tsx                # Arena detail (/arenas/:id)
      components/             # Page-specific components
        ArenaDetailHeader.tsx
        ArenaDetailInfo.tsx
        ArenaDetailVote.tsx
        ArenaDetailContainer.tsx
  games/
    page.tsx                  # Game list (/games)
    [gameId]/
      page.tsx                # Game detail (/games/:gameId)
  profile/
    page.tsx                  # My profile (/profile)
    [nickname]/
      page.tsx                # User profile (/profile/:nickname)
```

**`app/(auth)/`** — Authentication pages (no Header/Footer):

```
app/(auth)/
  layout.tsx                  # Minimal auth layout
  login/page.tsx
  signup/page.tsx
```

### API Routes

```
app/api/
  arenas/
    route.ts                  # GET /api/arenas (list)
    [id]/
      route.ts                # GET /api/arenas/:id (detail)
  games/
    route.ts
    search/route.ts
  auth/
    [...nextauth]/route.ts    # NextAuth.js handler
```

### Shared UI Components

```
app/components/               # Used across multiple pages
  Button.tsx                  # Custom button with size/type variants
  Header.tsx                  # App header
  HeaderWrapper.tsx           # Client wrapper for header
  Footer.tsx                  # App footer
  Toast.tsx                   # Notification toast
  Input.tsx                   # Custom input
  Modals.tsx                  # Modal system
  ModalWrapper.tsx            # Modal animation wrapper
  Pager.tsx                   # Pagination
  TierBadge.tsx               # User tier display
  LottieLoader.tsx            # Lottie animation loader
  LottieLoaderWrapper.tsx     # Global loading overlay
  LandingCard.tsx             # Landing page card
  NotFoundLottie.tsx          # 404 animation
  ClientNotFoundView.tsx      # Client-side 404 view
```

---

## Page-Specific Components

When a page has multiple sections, create a `components/` subdirectory:

```
app/(base)/arenas/[id]/
  page.tsx                    # Main page (imports sub-components)
  components/
    ArenaDetailHeader.tsx     # Header with title, creator info
    ArenaDetailInfo.tsx       # Sidebar info panel
    ArenaDetailVote.tsx       # Vote section
    ArenaDetailContainer.tsx  # Chat + content area
```

**When to create page-specific components:**

- Page exceeds 200 lines
- Multiple distinct sections
- Components only used by this page

---

## hooks/ Directory

Custom React hooks for data fetching and shared behavior:

```
hooks/
  useArenaList.ts             # Fetch arena list
  useArenas.ts                # Arena utilities
  useArenaSocket.ts           # Socket.IO for arena chat
  useArenaChatManagement.ts   # Chat message management
  useArenaAutoStatus.ts       # Auto-update arena status (list)
  useArenaAutoStatusDetail.ts # Auto-update arena status (detail)
  useVote.ts                  # Vote submission
  useVoteList.ts              # Vote list fetching
```

**Naming Convention:**

- `use` prefix + feature name (camelCase)
- `.ts` extension (not `.tsx` unless returning JSX)

---

## stores/ Directory

Zustand global state stores:

```
stores/
  AuthStore.ts                # Current user auth state
  loadingStore.ts             # Global loading state
  modalStore.ts               # Modal open/close state
  useArenaStore.ts            # Current arena detail data
```

**Naming Convention:**

- PascalCase or camelCase + `Store.ts`
- Export `use[Name]Store` or `use[Name]`

---

## types/ Directory

Shared TypeScript types used across the project:

```
types/
  arena.ts                    # Arena-related types
  game.ts                     # Game-related types
  user.ts                     # User-related types
```

---

## Import Alias

| Alias | Resolves To  | Example                                        |
| ----- | ------------ | ---------------------------------------------- |
| `@/`  | Project root | `import Button from "@/app/components/Button"` |

```typescript
// ✅ PREFERRED — Use @/ alias for absolute imports
import Button from "@/app/components/Button";
import { useArenaList } from "@/hooks/useArenaList";
import { useAuthStore } from "@/stores/AuthStore";
import { cn } from "@/utils/tailwindUtil";
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

// ✅ OK — Relative imports for page-specific components
import ArenaDetailHeader from "./components/ArenaDetailHeader";

// ❌ AVOID — Deep relative paths
import Button from "../../../../app/components/Button";
```

---

## File Naming Conventions

### Pages

- `page.tsx` (Next.js convention)
- `layout.tsx` (Next.js convention)

### Components

- **PascalCase** with `.tsx`: `Button.tsx`, `ArenaDetailHeader.tsx`

### Hooks

- **camelCase** with `use` prefix, `.ts`: `useArenaList.ts`, `useVote.ts`

### Stores

- **camelCase or PascalCase** + `Store.ts`: `AuthStore.ts`, `loadingStore.ts`

### Utilities

- **camelCase** `.ts`: `tailwindUtil.ts`, `GetAuthUserId.server.ts`

### Types

- **camelCase** `.ts`: `arena.ts`, `game.ts`

---

## When to Create What

### New Page → `app/(base)/[feature]/page.tsx`

- New route in the app
- May need `components/` subdirectory for sub-sections

### New Shared Component → `app/components/`

- Used across 3+ pages
- Generic UI primitive (no feature logic)

### New Hook → `hooks/`

- Reusable data-fetching or behavior logic
- Used across multiple components

### New Store → `stores/`

- Global state shared across unrelated components
- Keep stores minimal and focused

### New API Route → `app/api/[feature]/route.ts`

- Backend endpoint for client-side fetching

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. React and Next.js
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

// 2. Third-party libraries
import { motion, AnimatePresence } from "framer-motion";
import { create } from "zustand";

// 3. Stores and hooks (@/ imports)
import { useAuthStore } from "@/stores/AuthStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { useArenaList } from "@/hooks/useArenaList";

// 4. Utilities and libs
import { cn } from "@/utils/tailwindUtil";

// 5. Types
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

// 6. Components
import Button from "@/app/components/Button";

// 7. Relative imports (page-specific)
import ArenaCard from "./components/ArenaCard";
```

---

## Summary

**Key Principles:**

1. **app/(base)/**: Pages with Header + Footer layout
2. **app/(auth)/**: Auth pages with minimal layout
3. **app/components/**: Shared UI components
4. **Page `components/`**: Page-specific sub-components
5. **hooks/**: Custom React hooks for data fetching
6. **stores/**: Zustand global state (minimal, focused)
7. **@/ alias**: Always use for absolute imports

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [routing-guide.md](routing-guide.md) - Next.js App Router routing
- [complete-examples.md](complete-examples.md) - Full examples

## 겜추(GameChu)

Korean game recommendation and community platform live at gamechu.com

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run start      # Run production server on port 3035
npx prisma migrate dev    # Run DB migrations
npx prisma generate       # Regenerate Prisma client after schema changes
```

```bash
npm test           # Run unit tests (Vitest, 126 tests)
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm run test:e2e   # Run Playwright E2E tests
```

## Architecture

**Next.js 15 full-stack app** (App Router) using **Clean Architecture + DDD** in the backend layer.

## Tech Stack

- Frontend: Next.js 15 (App Router), TypeScript, TailwindCSS, Zustand
- Backend: PostgreSQL, Prisma, Redis, Socket.io

## Git Workflow (overrides skill defaults)

- whenever commit, issue, PR: read 'Git & Collaboration' Section on `docs/CODE_CONVENTIONS.md`.

## Key Rules

- **Prisma singleton**: Always `import prisma from "@/lib/prisma"` — never `new PrismaClient()`
- **Per-request instantiation**: Repositories and use cases must be created _inside_ each handler function, not at module level
- **Error response shape**: Use `{ message }` key, never `{ error }`
- **Keep project directory**: Never access outside project directory (ex. /tmp, /temp)

### Directory layout

```
app/              # Next.js App Router: pages + API routes
  (auth)/         # Login, signup pages
  (base)/         # Main app pages (arenas, games, profile, etc.)
  api/            # API route handlers (Next.js serverless)
  components/     # Shared UI components

backend/          # Business logic — Clean Architecture per feature
  [feature]/
    application/usecase/   # Use case classes + DTOs
    domain/repositories/   # Repository interfaces + query filters
    infra/repositories/    # Prisma implementations
    infra/cache/           # Redis cache services (arena only)

lib/              # Singletons: Prisma client, Redis client, auth config, cache keys
hooks/            # Custom React hooks (data fetching, sockets, arenas)
stores/           # Zustand global state (auth, modal, loading, arena)
utils/            # Pure utility functions
types/            # Shared TypeScript types
prisma/           # schema.prisma + migrations
docs/             # core conventions for the project - refer whenever needed
```

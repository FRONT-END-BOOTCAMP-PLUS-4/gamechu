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

There are no test scripts — the project has no testing framework configured.
ESLint is configured but there is no `lint` script in `package.json`. Run directly:

```bash
npx eslint .
npx prettier --write .
```

## Architecture

**Next.js 15 full-stack app** (App Router) using **Clean Architecture + DDD** in the backend layer.

## Tech Stack

- Frontend: Next.js 15 (App Router), TypeScript, TailwindCSS, Zustand
- Backend: PostgreSQL, Prisma, Redis, Socket.io

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

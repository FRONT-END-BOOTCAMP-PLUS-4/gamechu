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

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 3, Zustand 5, Framer Motion, Lexical (rich text editor)
- **Backend**: PostgreSQL, Prisma 6, Redis (ioredis), Socket.io 4, NextAuth.js v4, Zod 4
- **Testing**: Vitest 4, Playwright, Testing Library
- **Tooling**: ESLint, Prettier, Husky

## Git Workflow (overrides skill defaults)

- Whenever deals with git(include git, gh, and GitHub mcp), Read `docs/conventions/GIT_COLLABORATION.md`

## Conventions

Full code conventions: `docs/conventions/README.md`

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
    infra/cache/           # (removed — withCache() used directly in route handlers)

lib/              # Singletons: Prisma client, Redis client, auth config, cache keys
hooks/            # Custom React hooks (data fetching, sockets, arenas)
stores/           # Zustand global state (auth, modal, loading, arena)
utils/            # Pure utility functions
types/            # Shared TypeScript types
prisma/           # schema.prisma + migrations
docs/
  CODE_CONVENTIONS.md          # redirect → conventions/README.md
  conventions/
    README.md                  # index of all conventions
    GIT_COLLABORATION.md       # git workflow, issue/PR/worktree conventions
    NAMING.md                  # naming rules (case, variables, React components)
    BACKEND_ARCHITECTURE.md    # repository, DTO, usecase, API route conventions
    ERROR_HANDLING.md          # error response shape, catch block, errorResponse helper
    VALIDATION.md              # Zod schemas, validate() helper, IdSchema
    LOGGING.md                 # Pino logger, child logger per route, log levels
    CACHING.md                 # Redis withCache pattern, cacheKey.ts, TTL guidelines
    FRONTEND.md                # React components, TanStack Query, Zustand
    TESTING_VITEST.md          # Vitest unit testing conventions
    TESTING_PLAYWRIGHT.md      # Playwright E2E testing conventions
    CSS_STYLING.md             # color tokens, typography, animations
    DEVELOPMENT_ENVIRONMENT.md # file system, DB access rules
  superpowers/
    plans/                     # implementation plans
    specs/                     # design specs
```

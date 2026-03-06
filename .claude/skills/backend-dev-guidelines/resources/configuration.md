# Configuration Management - Next.js Environment Variables

Guide to managing configuration in GameChu's Next.js backend.

## Table of Contents

- [Environment Variables Overview](#environment-variables-overview)
- [Access Patterns](#access-patterns)
- [Environment Files](#environment-files)
- [Secrets Management](#secrets-management)

---

## Environment Variables Overview

Next.js has built-in support for environment variables via `.env*` files. Variables are available on the server side via `process.env`.

### Key Variable Categories (GameChu)

- **Database**: PostgreSQL connection string
- **Auth**: NextAuth.js URL and secret
- **Redis**: Redis connection URL
- **External APIs**: Twitch/IGDB credentials

**Important:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never prefix secrets with `NEXT_PUBLIC_`.

Refer to `.env` or `.env.local` for actual variable names and values.

---

## Access Patterns

### Server-side (API Routes, Use Cases)

```typescript
// ✅ Direct access in server-side code
const databaseUrl = process.env.DATABASE_URL;
```

### Singleton Clients

GameChu centralizes client creation in `lib/` singletons:

```typescript
// lib/prisma.ts — Prisma client singleton
import { PrismaClient } from '@/prisma/generated';

const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
export default prisma;
```

```typescript
// lib/redis.ts — Redis client singleton
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
export default redis;
```

```typescript
// lib/auth/authOptions.ts — NextAuth configuration
// Reads auth-related env vars internally
```

### Client-side (React Components)

```typescript
// ✅ Only NEXT_PUBLIC_ vars available
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ NEVER — server secrets not available in browser
const secret = process.env.NEXTAUTH_SECRET; // undefined!
```

---

## Environment Files

### File Precedence (highest → lowest)

1. `.env.local` — Local overrides, secrets
2. `.env` — Base configuration

Both files are gitignored (`.gitignore` has `.env*` rule). Each developer maintains their own copies locally.

---

## Secrets Management

### DO NOT Commit Secrets

All `.env*` files are gitignored. The pre-commit hook also blocks staging of `.env*` files and `docs/server/`.

### Validation

Check required variables at startup in critical singletons:

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured');
}
```

### Production

Set environment variables directly on the server. See `docs/server/SERVER_REFERENCE.md` for details (gitignored).

---

**Related Files:**
- [SKILL.md](SKILL.md)
- `lib/prisma.ts` — Prisma singleton
- `lib/redis.ts` — Redis singleton
- `lib/auth/authOptions.ts` — NextAuth config

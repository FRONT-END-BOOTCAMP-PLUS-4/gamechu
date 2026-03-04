# Middleware Guide - Next.js Middleware & Auth Patterns

Complete guide to middleware and authentication patterns in GameChu's Next.js backend.

## Table of Contents

- [Next.js Middleware](#nextjs-middleware)
- [Authentication with NextAuth.js](#authentication-with-nextauthjs)
- [Auth Helper Pattern](#auth-helper-pattern)
- [Error Handling Patterns](#error-handling-patterns)
- [Composable Patterns](#composable-patterns)

---

## Next.js Middleware

### Route-Level Middleware (`middleware.ts`)

Next.js middleware runs before route handlers for matching paths:

```typescript
// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Runs before matched route handlers
    // Can redirect, rewrite, or add headers
    return NextResponse.next();
}

export const config = {
    matcher: ["/api/protected/:path*"],
};
```

**Note:** GameChu primarily handles auth per-handler with `getAuthUserId()` rather than via global middleware.

---

## Authentication with NextAuth.js

### NextAuth Configuration

**File:** `lib/auth/authOptions.ts`

GameChu uses NextAuth.js v4 with Credentials provider + JWT sessions:

```typescript
// lib/auth/authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            // Credentials configuration
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Add user ID to token
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add user ID to session
            session.user.id = token.id;
            return session;
        },
    },
};
```

### Auth API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Auth Helper Pattern

### Server-Side Auth Helper

**File:** `utils/GetAuthUserId.server.ts`

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function getAuthUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
}
```

### Usage in Route Handlers

```typescript
// ✅ Standard auth check pattern
export async function GET(request: Request) {
    try {
        const memberId = await getAuthUserId();

        // Optional auth: allow unauthenticated access
        // (memberId can be null)

        // Required auth: reject unauthenticated
        if (!memberId) {
            return NextResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        // ... proceed with authenticated request
    } catch (error: unknown) {
        // error handling
    }
}
```

### Client-Side Auth Helper

**File:** `utils/GetAuthUserId.client.ts`

```typescript
import { useSession } from "next-auth/react";

export function useAuthUserId(): string | null {
    const { data: session } = useSession();
    return session?.user?.id ?? null;
}
```

---

## Error Handling Patterns

### Unified Error Response

Every route handler follows the same error pattern:

```typescript
catch (error: unknown) {
    console.error("Error message:", error);
    if (error instanceof Error) {
        return NextResponse.json(
            { message: error.message || "fallback message" },
            { status: 400 }
        );
    }
    return NextResponse.json(
        { message: "알 수 없는 오류 발생" },
        { status: 500 }
    );
}
```

### Custom Error Classes (Optional)

```typescript
// types/errors.ts
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) { super(message, 404); }
}

export class ForbiddenError extends AppError {
    constructor(message: string) { super(message, 403); }
}

// Usage in catch block
catch (error: unknown) {
    if (error instanceof AppError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.statusCode }
        );
    }
    // fallback
}
```

---

## Composable Patterns

### Auth Guard Helper

```typescript
// utils/apiHelpers.ts
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { NextResponse } from "next/server";

export async function requireAuth(): Promise<string> {
    const memberId = await getAuthUserId();
    if (!memberId) {
        throw new Error("로그인이 필요합니다.");
    }
    return memberId;
}
```

### Response Helpers

```typescript
// utils/apiHelpers.ts
export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ message }, { status });
}

// Usage
export async function GET(request: Request) {
    try {
        const result = await usecase.execute(dto);
        return successResponse(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return errorResponse(error.message);
        }
        return errorResponse("알 수 없는 오류 발생", 500);
    }
}
```

---

**Related Files:**
- [SKILL.md](SKILL.md)
- [routing-and-controllers.md](routing-and-controllers.md)
- [async-and-errors.md](async-and-errors.md)

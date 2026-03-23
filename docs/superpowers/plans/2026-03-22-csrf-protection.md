# CSRF Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Origin-header CSRF protection to all mutation routes under `/api/member/*` via `middleware.ts`.

**Architecture:** Extend the existing `middleware.ts` to check the `Origin` header on every POST/PUT/PATCH/DELETE request to `/api/member/*`. If Origin is present and its host doesn't match the `Host` header, return 403 `{ message: "Forbidden" }` before any route handler executes. Absent Origin is allowed (same-origin browser requests and curl both omit it). Two E2E tests using Playwright's `request` fixture verify the behaviour.

**Tech Stack:** Next.js 15 App Router, TypeScript, Playwright (E2E)

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `middleware.ts` | Add CSRF origin check block + extend `config.matcher` |
| Create | `e2e/csrf.spec.ts` | Two E2E tests: cross-origin blocked (403), same-origin passed (not 403) |

No other files change. No new dependencies.

---

## Task 1: Create GitHub issue and branch

**Files:** none

- [ ] **Step 1: Create GitHub issue**

```bash
gh issue create \
  --title "CSRF protection for /api/member/* mutation routes" \
  --body "Add Origin-header check in middleware.ts to reject cross-origin POST/PUT/PATCH/DELETE requests to /api/member/* routes." \
  --label "fix"
```

Note the issue number printed (e.g. `#271`).

- [ ] **Step 2: Create branch**

```bash
git checkout dev
git pull origin dev
git checkout -b fix/#271   # replace 271 with actual issue number
```

---

## Task 2: Write failing E2E tests (TDD)

**Files:**
- Create: `e2e/csrf.spec.ts`

The `request` fixture used here is Playwright's Node.js HTTP client — NOT `page.evaluate(fetch(...))`. This distinction matters: browsers silently drop manually-set `Origin` headers (Fetch spec forbidden header), which would make the cross-origin test pass vacuously. The `request` fixture has no such restriction.

- [ ] **Step 1: Create `e2e/csrf.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("POST /api/member/attend with cross-origin Origin → 403", async ({ request }) => {
    const response = await request.post("/api/member/attend", {
        headers: { origin: "https://evil.com" },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toBe("Forbidden");
});

test("POST /api/member/attend with same-origin Origin → not 403", async ({ request }) => {
    const response = await request.post("/api/member/attend", {
        headers: { origin: "http://localhost:3000" },
    });
    expect(response.status()).not.toBe(403);
    // Expect 401 (unauthenticated) — confirms CSRF check passed and auth check ran
    expect(response.status()).toBe(401);
});
```

> **Note:** `app/api/member/attend/route.ts` line 11 has a pre-existing convention violation — it returns `{ error: "Unauthorized" }` instead of `{ message: "Unauthorized" }`. The tests below don't read the 401 body so this won't affect them, but if you inspect the response body during debugging expect `error` not `message`. This is out of scope for this task.

- [ ] **Step 2: Run tests to confirm they fail as expected**

Make sure the dev server is running first (`npm run dev` in a separate terminal), then:

```bash
npx playwright test e2e/csrf.spec.ts --project=unauthenticated
```

Expected output:
```
✗ POST /api/member/attend with cross-origin Origin → 403
  Error: expect(received).toBe(expected)
  Expected: 403
  Received: 401       ← no CSRF check yet, falls through to auth check
✓ POST /api/member/attend with same-origin Origin → not 403
  (this one passes already — it's a regression guard)
```

One failure is correct. The failing test is the TDD driver.

---

## Task 3: Implement CSRF check in middleware

**Files:**
- Modify: `middleware.ts`

Current file (for reference):
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isLoggedIn = !!token;

    const { pathname } = req.nextUrl;

    const isProtectedPath = pathname.startsWith("/profile");
    const isAuthPage = pathname === "/log-in" || pathname === "/sign-up";

    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/log-in", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile", "/log-in", "/sign-up"],
};
```

- [ ] **Step 1: Add CSRF check and extend matcher**

Replace the entire file with:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // CSRF: reject cross-origin mutations on /api/member/*
    const method = req.method;
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const isMemberApi = pathname.startsWith("/api/member");

    if (isMutation && isMemberApi) {
        const origin = req.headers.get("origin");
        if (origin !== null) {
            try {
                const originHost = new URL(origin).host;
                const requestHost = req.headers.get("host") ?? "";
                if (originHost !== requestHost) {
                    return NextResponse.json(
                        { message: "Forbidden" },
                        { status: 403 }
                    );
                }
            } catch {
                return NextResponse.json(
                    { message: "Forbidden" },
                    { status: 403 }
                );
            }
        }
    }

    // Auth: redirect unauthenticated users away from protected pages
    const token = await getToken({ req });
    const isLoggedIn = !!token;

    const isProtectedPath = pathname.startsWith("/profile");
    const isAuthPage = pathname === "/log-in" || pathname === "/sign-up";

    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/log-in", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile", "/log-in", "/sign-up", "/api/member/:path*"],
};
```

Key decisions in this code:
- CSRF check runs **before** `getToken()` — cross-origin requests are rejected without touching the JWT. This is intentional: no reason to do expensive JWT verification if the origin is wrong.
- `origin === null` (header absent) → allowed. Covers curl, server-to-server, and most same-origin browser requests.
- `"null"` string (sandboxed iframe null-origin) → `new URL("null")` throws → caught → 403.
- `try/catch` around `new URL(origin)` handles any malformed Origin value.

---

## Task 4: Verify tests pass

**Files:** none

- [ ] **Step 1: Run the CSRF E2E tests**

```bash
npx playwright test e2e/csrf.spec.ts --project=unauthenticated
```

Expected output:
```
✓ POST /api/member/attend with cross-origin Origin → 403
✓ POST /api/member/attend with same-origin Origin → not 403

2 passed
```

- [ ] **Step 2: Run the full E2E suite to check for regressions**

```bash
npm run test:e2e
```

Expected: all previously passing tests still pass. The CSRF check only fires when `Origin` is present and mismatches host — Playwright's `request` fixture in existing tests sends no `Origin` header, so they are unaffected.

- [ ] **Step 3: Run the Vitest unit tests**

```bash
npm test
```

Expected: all 147 tests pass. Route handler tests construct `NextRequest` without an `Origin` header and call handlers directly — they bypass middleware entirely.

---

## Task 5: Commit and PR

**Files:** `middleware.ts`, `e2e/csrf.spec.ts`

- [ ] **Step 1: Stage files**

```bash
git add middleware.ts e2e/csrf.spec.ts
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
fix: CSRF origin-check middleware for /api/member/* mutations

Adds Origin header validation in middleware.ts for POST/PUT/PATCH/DELETE
requests to /api/member/*. Cross-origin or malformed Origin returns 403.
Absent Origin (curl, same-origin) is allowed. Covered by E2E tests.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Rebase onto dev**

```bash
git fetch origin
git rebase origin/dev
```

If conflicts arise, resolve and `git rebase --continue`.

- [ ] **Step 4: Create PR**

```bash
gh pr create --base dev --title "fix: CSRF origin-check middleware for /api/member/* mutations" --body "$(cat <<'EOF'
## Summary

- Extends `middleware.ts` to reject cross-origin `POST`/`PUT`/`PATCH`/`DELETE` requests to `/api/member/*` with 403
- Checks `Origin` header host against `Host` header; absent Origin is allowed (curl/same-origin)
- Adds `e2e/csrf.spec.ts` with 2 tests using Playwright `request` fixture (not browser fetch — Origin is a forbidden header in browser context)
- Zero changes to route handlers, existing Vitest tests, or existing E2E tests

## Test plan

- [ ] `npx playwright test e2e/csrf.spec.ts` — 2 tests pass
- [ ] `npm run test:e2e` — full suite passes (no regressions)
- [ ] `npm test` — 147 Vitest tests pass
- [ ] `npm run build` — build succeeds (pre-commit hook)

Closes #271

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes

- The pre-commit hook runs `npm run lint` + `next build`. Both should pass — the new code has no lint issues and `middleware.ts` is valid Next.js middleware.
- Update `dev/MASTER_PLAN.md` §9 execution order to mark item 6 (CSRF protection) as done after the PR is merged.

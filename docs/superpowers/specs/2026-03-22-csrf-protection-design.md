# CSRF Protection Design

**Date**: 2026-03-22
**Branch pattern**: `fix/#[issue]`
**Scope**: REST API mutation routes under `/api/member/*`

---

## Problem

Every `POST`, `PUT`, `PATCH`, and `DELETE` endpoint under `/api/member/*` has no CSRF protection. The only gate is a JWT cookie lookup via `getAuthUserId()`. Because NextAuth v4 with Credentials provider does not automatically protect custom API routes, a malicious page on another origin can trigger authenticated mutations on behalf of a logged-in user by exploiting the browser's automatic cookie attachment behaviour.

**Affected endpoints** (13 mutation routes):

| Route | Methods |
|---|---|
| `/api/member/wishlists` | POST |
| `/api/member/wishlists/[id]` | DELETE |
| `/api/member/arenas` | POST |
| `/api/member/arenas/[id]` | PATCH, DELETE |
| `/api/member/arenas/[id]/votes` | POST, PATCH, DELETE |
| `/api/member/arenas/[id]/chattings` | POST |
| `/api/member/games/[gameId]/reviews` | POST |
| `/api/member/games/[gameId]/reviews/[reviewId]` | PATCH, DELETE |
| `/api/member/review-likes/[reviewId]` | POST |
| `/api/member/attend` | POST |
| `/api/member/profile` | PUT |
| `/api/member/notification-records` | PATCH |
| `/api/member/scores` | POST |

---

## Decisions

| Question | Decision | Rationale |
|---|---|---|
| Scope | REST API only (`/api/member/*`) | Socket.IO is a separate concern |
| Placement | `middleware.ts` | Zero handler changes; new routes auto-protected; `attend` route stays parameterless |
| Mechanism | Origin header check | Standard OWASP pattern; no frontend changes; no test changes |
| SameSite cookie | Not changed | Marginal gain doesn't justify logged-out UX for community platform |
| CSRF token (Option B) | Not used | Breaks all 12 route handler test files (147 total tests); requires two-step curl flow |

---

## Architecture

Single file change: `middleware.ts`.

The existing middleware handles page-level auth redirects. The CSRF check is added before the existing logic and applies only to mutation requests on `/api/member/*`. The matcher config is extended to include the new path pattern.

**Request flow:**

```
Incoming request
    ↓
middleware.ts
    ├─ CSRF check (POST/PUT/PATCH/DELETE on /api/member/*)
    │       ↓ mismatch or malformed Origin → 403 { message: "Forbidden" }, stop
    │       ↓ passes
    └─ Auth redirect (existing: /profile, /log-in, /sign-up)
            ↓
    Route handler executes
```

No changes to:
- `authOptions.ts`
- `GetAuthUserId.server.ts`
- Any route handler
- Any existing test

---

## Implementation

### `middleware.ts` — matcher update

```ts
export const config = {
    matcher: ["/profile", "/log-in", "/sign-up", "/api/member/:path*"],
};
```

### `middleware.ts` — CSRF check logic

Added at the top of the `middleware()` function, before the existing auth redirect block:

```ts
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
```

### Decision table

| Condition | Outcome |
|---|---|
| Method is GET, HEAD, OPTIONS | Skip check entirely |
| Method is PUT/POST/PATCH/DELETE, path is not `/api/member/*` | Skip check |
| `Origin` header entirely absent (JS `null`) | Allow — same-origin browser requests and curl/server-to-server calls omit Origin |
| `Origin` is the literal string `"null"` (sandboxed iframe null-origin) | 403 — `new URL("null")` throws → caught → rejected |
| `Origin` present, host matches `Host` header | Allow |
| `Origin` present, host does not match `Host` header | 403 Forbidden |
| `Origin` present but malformed (any non-URL value) | 403 Forbidden — caught by try/catch |

> **Deployment assumption**: The `Host` header comparison is only reliable when the reverse proxy (Nginx in production) strips client-supplied `Host` values and sets it to the canonical hostname. Do not run without a proxy in a configuration that forwards `Host` from the client.

---

## Error Response

```json
{ "message": "Forbidden" }
```

Status: `403`. Follows the existing `{ message }` shape used across all `/api/member/*` routes per project conventions.

---

## Testing

### Existing tests — no changes

All 147 existing Vitest tests construct `NextRequest` without an `Origin` header. The `origin === null` branch allows these through unchanged.

All existing Playwright E2E tests run same-origin (`localhost:3000` → `localhost:3000`). Origin matches host; all pass unchanged.

### New: `e2e/csrf.spec.ts`

Two tests using Playwright's **`request` fixture** (Node.js HTTP client, not browser context). This is required because `Origin` is a [Fetch spec forbidden header name](https://fetch.spec.whatwg.org/#forbidden-header-name) — browsers silently drop manually-set `Origin` headers in `page.evaluate(fetch(...))`, which would cause the cross-origin test to receive a 401 (absent Origin → allowed) instead of 403, giving a false positive. The `request` fixture runs outside the browser and has no such restriction.

| Test | Request | Expected |
|---|---|---|
| Cross-origin mutation is blocked | `request.post("/api/member/attend", { headers: { origin: "https://evil.com" } })` | Response status 403 |
| Same-origin mutation passes CSRF check | `request.post("/api/member/attend", { headers: { origin: "http://localhost:3000" } })` | Response status is NOT 403 (401 — unauthenticated, but CSRF check passed) |

The E2E tests confirm the middleware fires correctly in the actual Next.js request pipeline.

---

## Out of Scope

- Socket.IO arena chat CSRF protection (separate issue)
- Arena descriptions sanitization (separate issue)
- `SameSite` cookie configuration changes
- Any changes to existing route handlers or tests

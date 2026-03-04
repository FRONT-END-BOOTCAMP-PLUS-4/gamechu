---
name: route-tester
description: Test authenticated routes in GameChu using NextAuth.js session-based authentication. Use this skill when testing API endpoints, validating route functionality, or debugging authentication issues. Includes patterns for curl testing with session cookies and browser-based testing.
---

# GameChu Route Tester Skill

## Purpose
This skill provides patterns for testing API routes in GameChu's Next.js 15 App Router backend with NextAuth.js session-based authentication.

## When to Use This Skill
- Testing new API endpoints
- Validating route functionality after changes
- Debugging authentication issues
- Testing POST/PATCH/DELETE operations
- Verifying request/response data

## GameChu Authentication Overview

GameChu uses:
- **NextAuth.js v4** with Credentials provider
- **JWT session strategy** (session stored in cookie, not DB)
- **Session cookie name**: `next-auth.session-token` (dev) / `__Secure-next-auth.session-token` (prod)
- **Auth config**: `lib/auth/authOptions.ts`
- **Server auth helper**: `utils/GetAuthUserId.server.ts`

## Testing Methods

### Method 1: Browser DevTools (RECOMMENDED for quick tests)

1. Log in to GameChu in the browser
2. Open DevTools → Network tab
3. Navigate to trigger the API call
4. Right-click request → Copy as cURL
5. Modify and replay in terminal

### Method 2: curl with Session Cookie

```bash
# 1. First, get a session cookie by logging in via NextAuth
# The session cookie is set after successful authentication

# 2. Use the cookie in subsequent requests
curl -b "next-auth.session-token=<YOUR_SESSION_TOKEN>" \
     http://localhost:3000/api/arenas

# POST request with JSON body
curl -X POST \
     -H "Content-Type: application/json" \
     -b "next-auth.session-token=<YOUR_SESSION_TOKEN>" \
     -d '{"title":"테스트 투기장","gameId":123}' \
     http://localhost:3000/api/arenas
```

### Method 3: Test Without Auth (Public Endpoints)

Some endpoints allow unauthenticated access (`getAuthUserId()` returns null):

```bash
# Public GET (e.g., arena list)
curl http://localhost:3000/api/arenas?currentPage=1&status=0

# Public GET (e.g., game detail)
curl http://localhost:3000/api/games/123
```

### Method 4: NextAuth Credentials Login via API

```bash
# Get CSRF token
CSRF=$(curl -s http://localhost:3000/api/auth/csrf | jq -r '.csrfToken')

# Login and capture session cookie
curl -c cookies.txt \
     -X POST http://localhost:3000/api/auth/callback/credentials \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "csrfToken=${CSRF}&email=test@example.com&password=testpassword"

# Use saved cookie for subsequent requests
curl -b cookies.txt http://localhost:3000/api/arenas
```

## Route Structure

### Next.js App Router API Routes

```
app/api/
  arenas/
    route.ts          # GET (list), POST (create)
    [id]/route.ts     # GET (detail), PATCH (update), DELETE
  games/
    route.ts          # GET (list/search)
    [id]/route.ts     # GET (detail)
  members/
    route.ts          # GET
  auth/
    [...nextauth]/route.ts  # NextAuth handlers (DO NOT test manually)
```

**Full URL** = `http://localhost:<PORT>/api/<feature>[/<id>]`

Example:
- List arenas: `GET http://localhost:3000/api/arenas?currentPage=1`
- Get arena: `GET http://localhost:3000/api/arenas/42`
- Create arena: `POST http://localhost:3000/api/arenas`

## Common Testing Patterns

### Test Arena List

```bash
curl "http://localhost:3000/api/arenas?currentPage=1&status=0&pageSize=9"
```

### Test Arena Detail

```bash
curl "http://localhost:3000/api/arenas/42"
```

### Test Authenticated Create

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"title":"새 투기장","description":"설명","gameId":1}' \
     http://localhost:3000/api/arenas
```

### Test PATCH Update

```bash
curl -X PATCH \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"title":"수정된 제목"}' \
     http://localhost:3000/api/arenas/42
```

### Test DELETE

```bash
curl -X DELETE \
     -b cookies.txt \
     http://localhost:3000/api/arenas/42
```

## Testing Checklist

Before testing a route:

- [ ] Identify the API route path under `app/api/`
- [ ] Check the exported HTTP method (GET, POST, PATCH, DELETE)
- [ ] Check if auth is required (`getAuthUserId()` call)
- [ ] Prepare request body (if POST/PATCH)
- [ ] Run the test
- [ ] Verify response status and data
- [ ] Check database changes if applicable

## Verifying Database Changes

After testing routes that modify data:

```bash
# Connect to PostgreSQL via Prisma Studio
npx prisma studio

# Or via psql (if available)
psql -h localhost -U <user> -d <database>
SELECT * FROM "Arena" WHERE id = 42;
```

## Debugging Failed Tests

### 401 Unauthorized

**Possible causes**:
1. Session cookie expired or missing
2. `getAuthUserId()` returning null
3. NextAuth not properly configured

**Solutions**:
1. Re-login to get fresh session cookie
2. Check `lib/auth/authOptions.ts` configuration
3. Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `.env`

### 403 Forbidden

**Possible causes**:
1. User lacks required permissions/score
2. Route checks specific conditions (e.g., arena creator only)

**Solutions**:
1. Check the route handler for permission checks
2. Check the usecase for business rule validations
3. Test with a user that meets requirements

### 404 Not Found

**Possible causes**:
1. Incorrect URL path
2. Missing `route.ts` file
3. Missing HTTP method export
4. Dynamic route param mismatch

**Solutions**:
1. Verify file exists: `ls app/api/<feature>/route.ts`
2. Check exported function name matches HTTP method
3. Check Next.js App Router conventions

### 500 Internal Server Error

**Possible causes**:
1. Database connection issue
2. Prisma query error
3. Missing required fields in body
4. Usecase throwing unhandled error

**Solutions**:
1. Check dev server terminal for error stack trace
2. Verify request body matches expected DTO structure
3. Check Prisma schema matches database
4. Run `npx prisma generate` if schema changed

## Key Files

- `lib/auth/authOptions.ts` — NextAuth configuration
- `utils/GetAuthUserId.server.ts` — Server-side auth helper
- `utils/GetAuthUserId.client.ts` — Client-side auth helper
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API handler
- `lib/prisma.ts` — Prisma client singleton
- `lib/redis.ts` — Redis client singleton

## Related Skills

- Use **backend-dev-guidelines** for API route patterns and architecture
- Use **auth-route-debugger** agent for complex auth debugging

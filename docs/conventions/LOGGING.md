# Logging Conventions

> Logger: **Pino** — singleton at `lib/logger.ts`

## Logger singleton

```typescript
import logger from "@/lib/Logger";
```

Never instantiate Pino directly — always import the singleton.

## Child logger per route

Create a child logger at the top of each route handler with `route` and `method` context:

```typescript
export async function GET(request: Request) {
    const log = logger.child({ route: "/api/arenas", method: "GET" });
    // use log.info / log.warn / log.error throughout this handler
}
```

## Log levels

| Level   | When to use                                                                     |
| ------- | ------------------------------------------------------------------------------- |
| `error` | Unhandled exceptions in catch blocks                                            |
| `warn`  | Graceful degradation — cache miss, rate limit Redis failure, recoverable errors |
| `info`  | Significant business events (optional, production only)                         |
| `debug` | Development detail — removed or gated before commit                             |

Level config: `debug` in development, `info` in production (set via `NODE_ENV` in `lib/logger.ts`).

## Usage examples

```typescript
// error — always include err and enough context to reproduce
log.error({ userId, arenaId, err: error }, "투기장 상세 조회 실패");

// warn — graceful degradation (service continues without crashing)
log.warn({ key }, "캐시 읽기 실패 — DB로 폴백");
log.warn({ ip }, "rate limit Redis 실패 — 요청 허용");

// info — business event
log.info({ userId, arenaId }, "투기장 생성 완료");
```

## Banned patterns

**API routes and backend code** — never use `console.error` or `console.log`. Use the logger.

**Client components** — never use `console.error` or `console.log`:

- User-facing errors (failed API call, form validation) → Toast notification
- Debug logs → remove entirely before commit

```typescript
// ❌ — banned in routes, usecases, and components
console.error("Something failed:", error);
console.log("Debug value:", data);

// ✅ — use logger in routes/backend
log.error({ err: error }, "Something failed");

// ✅ — use Toast in components
toast.error("요청에 실패했습니다");
```

# Structured Logging Design

**Date**: 2026-03-28
**Status**: Approved

---

## Problem

42 `console.error` calls are scattered across 29 API route files, plus 2 more in `lib/withCache.ts` and `lib/RateLimiter.ts`. No log levels, no structured output, no production filtering. Additionally, 7 use case files contain log-and-rethrow patterns that silently discard the original Prisma error before it reaches the route.

---

## Decisions

- **Library**: pino + pino-pretty (devDependency)
- **Output**: stdout only — PM2 captures to `~/.pm2/logs/`, `pm2-logrotate` handles rotation
- **Log level**: `debug` in development, `info` in production — determined by `NODE_ENV`, no env var needed
- **Context enrichment**: child logger per route handler (explicit, no AsyncLocalStorage)
- **Scope**: all 44 logging sites — 35 API routes + `lib/withCache.ts` + `lib/RateLimiter.ts` + use case cleanup

---

## Architecture

### 1. Logger singleton (`lib/logger.ts`)

Single pino instance exported as default. `pino-pretty` transport activates only in development via `NODE_ENV`.

```ts
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

const globalForLogger = global as unknown as { logger: pino.Logger };

const logger =
    globalForLogger.logger ??
    pino({
        level: isDev ? "debug" : "info",
        timestamp: pino.stdTimeFunctions.isoTime, // epoch ms 대신 ISO 8601 — 가독성 및 로그 파서 호환성
        transport: isDev
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
    });

// HMR(hot module replacement)에서 모듈이 재평가될 때 중복 인스턴스 생성 방지
// production은 Node.js 모듈 캐시로 보장되므로 global 저장 불필요
if (process.env.NODE_ENV !== "production") globalForLogger.logger = logger;

export default logger;
```

`pino-pretty` is a devDependency — the transport branch is never reached in production.

### 2. Route handler pattern

Each route handler creates a child logger at the top of the handler with route context baked in. `userId` is added per call since it is only available after `getAuthUserId()`.

```ts
import logger from "@/lib/logger";

export async function GET(request: Request) {
    const log = logger.child({ route: "/api/arenas", method: "GET" });
    const userId = await getAuthUserId();

    try {
        // ...
        return NextResponse.json(result);
    } catch (error) {
        log.error({ userId, err: error }, "아레나 목록 조회 실패");
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

- `err` is pino's standard key for error objects — serializes `message` and `stack` automatically
- Korean log messages preserved (consistent with codebase style)
- Existing response logic (`instanceof Error` checks, status codes) is unchanged

### 3. Use case and repository cleanup

Use cases and repositories with try-catch-rethrow patterns have the try-catch removed. Errors bubble to the route with full Prisma stack intact.

```ts
// before
async execute(dto: GetArenaDto): Promise<ArenaListDto> {
  try {
    // ...
  } catch (error) {
    console.error("Error retrieving arenas", error) // swallows original error
    throw new Error("Error retrieving arenas")       // loses Prisma stack
  }
}

// after
async execute(dto: GetArenaDto): Promise<ArenaListDto> {
  // no try-catch — error bubbles with full context intact
  // ...
}
```

Affected files (7 total):

- `backend/arena/application/usecase/GetArenaUsecase.ts`
- `backend/chatting/application/usecase/CreateChattingUsecase.ts`
- `backend/notification-record/application/usecase/GetNotificationRecordUsecase.ts`
- `backend/notification-type/application/usecase/GetNotificationTypeUsecase.ts`
- `backend/score-record/application/usecase/GetScoreRecordUsecase.ts`
- `backend/score-policy/application/usecase/GetScorePolicyUsecase.ts`
- `backend/review/infra/repositories/prisma/PrismaReviewRepository.ts`

### 4. `withCache` and `RateLimiter` upgrades

These are graceful degradation sites — failures are expected and recovered from. Upgraded from `error` to `warn`.

```ts
// lib/withCache.ts
logger.warn({ key }, "캐시 읽기 실패 — DB로 폴백");
logger.warn({ key }, "캐시 쓰기 실패");

// lib/RateLimiter.ts
logger.warn({ ip }, "레이트 리미터 Redis 오류 — 요청 허용");
```

Level distinction: `warn` = degraded but recovered; `error` = broke and could not recover.

---

## Log level guide

| Level   | Use for                                                |
| ------- | ------------------------------------------------------ |
| `error` | Unhandled exception, DB query failed, use case threw   |
| `warn`  | Graceful degradation — Redis failure, rate limit hit   |
| `info`  | Significant business events (future use)               |
| `debug` | Developer detail — query params, cache keys (dev only) |

---

## Installation

```bash
npm install pino
npm install --save-dev pino-pretty
```

---

## Testing

No test changes required. No existing tests spy on `console.error`. Pino's `pino-pretty` transport does not activate during `npm test` (Vitest does not set `NODE_ENV=development`).

---

## Out of scope

- Request ID tracing — add later if log correlation becomes a pain point
- External log aggregator (Datadog, Grafana Loki) — not justified at current scale
- Log rotation — handled by `pm2-logrotate` on the server, no code changes needed

# Testing Conventions — Vitest

> Framework: **Vitest 4.x** + `@testing-library/react` + `@testing-library/jest-dom`
> Run: `npm test` (vitest run) / `npm run test:watch` (watch mode)

## File location & naming

- Co-locate test files in a `__tests__/` directory next to the source file
- Name: `PascalCase.test.ts` (or `.test.tsx` for React components)

```
backend/arena/application/usecase/
  GetArenaListUsecase.ts
  __tests__/
    GetArenaListUsecase.test.ts
```

## Environment setup

Default environment is `node`. For hooks and React components that need a DOM, add a docblock at the top of the file:

```ts
// @vitest-environment jsdom
```

> **Why docblock, not config**: `environmentMatchGlobs` in `vitest.config.ts` requires exact path matching; the docblock is more reliable.

## Mocking repositories

Mock factories live in `tests/mocks/`. Each factory returns an object implementing the repository interface with all methods stubbed as `vi.fn()`. Use `vi.mocked()` at assertion sites to access mock-specific methods.

File naming: `createMockXxx.ts` (camelCase factory). Function naming: `createMockXxx()`.

```ts
// tests/mocks/createMockArenaRepository.ts
import { vi } from "vitest";
import type { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

export function createMockArenaRepository(): ArenaRepository {
    return {
        count: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
    };
}
```

Use in tests with `vi.mocked()` for mock assertions:

```ts
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";

const mockRepo = createMockArenaRepository();
vi.mocked(mockRepo.findAll).mockResolvedValue([/* ... */]);
const usecase = new GetArenaListUsecase(mockRepo);
```

## Constructor mock gotcha

**Do NOT** use arrow functions when mocking classes that are called with `new`:

```ts
// ❌ Silently breaks — `this` is undefined inside arrow function
vi.fn().mockImplementation(() => ({ method: vi.fn() }));

// ✅ Use function keyword so `this` is bound correctly
vi.fn(function (this: any) {
    this.method = vi.fn();
});

// ✅ Or use a class
vi.fn(
    class {
        method = vi.fn();
    }
);
```

## Mocking modules

Use `vi.mock()` at the top of the file (hoisted automatically by Vitest):

```ts
vi.mock("@/lib/redis", () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue("OK"),
        del: vi.fn().mockResolvedValue(1),
    },
}));
```

> Routes that import `redis` at module scope (e.g. `app/api/games/route.ts`) **must** have this mock or the test file will crash on import.

## Zustand store tests

Do not use `renderHook` — call store methods directly via `getState()`:

```ts
import { useAuthStore } from "@/stores/authStore";

beforeEach(() => useAuthStore.setState({ memberId: null, isLoggedIn: false }));

it("sets memberId on login", () => {
    useAuthStore.getState().login("member-123");
    expect(useAuthStore.getState().memberId).toBe("member-123");
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
});
```

## Timer-based hooks

Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` + `act` for hooks with `setInterval`/`setTimeout`:

```ts
// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("polls every 30s", async () => {
    const { result } = renderHook(() => useArenaAutoStatus(1));

    await act(async () => {
        vi.advanceTimersByTime(30_000);
        await vi.runAllTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2); // initial + 1 tick
});
```

## API route tests

Instantiate the handler function directly — no HTTP server needed:

```ts
import { GET } from "@/app/api/arenas/route";

it("returns 200 with arena list", async () => {
    mockRepo.findAll.mockResolvedValue([
        /* arenas */
    ]);
    const req = new Request("http://localhost/api/arenas?currentPage=1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.arenas).toHaveLength(1);
});
```

## Global setup

`tests/setup.ts` runs before all tests (configured in `vitest.config.ts`):

```ts
import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

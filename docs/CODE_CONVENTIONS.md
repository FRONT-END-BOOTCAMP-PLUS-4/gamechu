# Code Conventions

## Naming

| Target                | Case                                        | Example                                        |
| --------------------- | ------------------------------------------- | ---------------------------------------------- |
| DB tables & columns   | snake_case                                  | `member_id`                                    |
| Folders               | kebab-case                                  | `folder-name`                                  |
| Files                 | PascalCase (exceptions for framework files) | `FileName.ts` (but `.env.local`, `layout.tsx`) |
| Variables & functions | camelCase                                   | `const camelCase = {}`                         |
| React components      | PascalCase, declared with `function`        | `function ExComp() {}`                         |

### Variable naming rules

- Strings use double quotes: `const s: string = "example"`
- Indentation: tab, 4 spaces (unified via linter)
- Arrays: plural names (`const data: number[] = []`)
- Event handlers: prefix `handle` (`handleClick`, `handleChange`)
- Booleans: prefix `is` (`isLoading`)

### React components

- Do NOT use `React.FC`
- Define props with `type` (not `interface`)

```typescript
type ExCompProps = {
    // ...
};

function ExComp(props: ExCompProps) {
    // ...
}
```

---

## Repository Layer

### Filter

Define a filter class when filtering is needed:

```typescript
export class ArenaFilter {
    constructor(
        // 1. Filtering columns
        public status: number | null,
        public memberId: string | null,
        // 2. Sorting (set defaults even if unused)
        public sortField: string = "startDate",
        public ascending: boolean = false,
        // 3. Pagination
        public offset: number = 0,
        public limit: number = 9
    ) {}
}
```

### Repository interface

- Import entities from `@/prisma/generated` (not `@prisma/client`)
- Import filters from `./filters/`
- Define `Omit<Entity, "id">` type for `save()`
- Use `UpdateDto` for `update()`
- Only implement CRUD methods that are needed — no speculative methods

```typescript
import { Arena } from "@/prisma/generated";
import { ArenaFilter } from "./filters/ArenaFilters";
import { UpdateArenaDto } from "../usecase/dto/UpdateArenaDto";

export type CreateArenaInput = Omit<Arena, "id">;

export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>; // Count by filter
    findAll(filter: ArenaFilter): Promise<Arena[]>; // Find by filter with pagination
    findById(id: number): Promise<Arena | null>; // Find single by ID
    save(arena: CreateArenaInput): Promise<Arena>; // Create
    update(arena: UpdateArenaDto): Promise<Arena>; // Update
    deleteAll(filter: ArenaFilter): Promise<void>; // Bulk delete (only if needed)
    deleteById(id: number): Promise<void>; // Delete by ID
}
```

### PrismaRepository implementation

- Import the shared Prisma singleton — do NOT instantiate `new PrismaClient()` directly
- Extract `getWhereClause(filter)` for reuse across `count`, `findAll`, etc.
- Use spread + conditional for optional filter fields

```typescript
import prisma from "@/lib/prisma";
```

```typescript
private getWhereClause(filter: ArenaFilter): Prisma.ArenaWhereInput {
    const { status, memberId } = filter;
    return {
        ...(status && { status }),
        ...(memberId && {
            OR: [{ creatorId: memberId }, { challengerId: memberId }],
        }),
    };
}
```

---

## DTO Layer

### Base DTO

Include all fields from the entity, derived fields, and fields from related tables:

```typescript
export class ArenaDto {
    constructor(
        // 1. All fields from the original table
        public id: number,
        public creatorId: string,
        // ...

        // 2. Derived/computed fields
        public debateEndDate: Date,
        public voteEndDate: Date,

        // 3. Fields from related tables (via FK)
        public creatorNickname: string,
        public creatorProfileImageUrl: string,
        public voteCount: number,
        public leftPercent: number
    ) {}
}
```

### List DTO (with pagination)

```typescript
export class ArenaListDto {
    constructor(
        public arenas: ArenaDto[],
        public totalCount: number,
        public currentPage: number,
        public pages: number[],
        public endPage: number
    ) {}
}
```

### Get DTO (query input)

```typescript
export class GetArenaDto {
    constructor(
        public queryString: {
            currentPage: number;
            status: number;
            mine: boolean;
        },
        public memberId: string | null,
        public pageSize: number,
        public sortField: string = "startDate",
        public ascending: boolean = false
    ) {}
}
```

### Create/Update DTO

- **Create**: Only fields the user provides (no `id`, no auto-generated fields like `createdAt`)
- **Update**: `id` is required (non-nullable), changeable fields are optional

```typescript
export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}

export class UpdateArenaDto {
    constructor(
        public id: number,
        public challengerId?: string,
        public title?: string,
        public description?: string,
        public status?: number,
        public startDate?: Date
    ) {}
}
```

---

## Usecase Layer

- Inject all needed repositories via constructor
- Use the repository's CRUD methods — no raw queries in usecases
- Call utility functions for derived data (e.g., `GetArenaDates()`)
- For pagination, build the `ListDto` with page calculations
- Separate usecases for different update operations (e.g., `UpdateArenaStatusUsecase`)

---

## API Route Layer

### Request params & query strings

```typescript
type RequestParams = {
    params: Promise<{
        id: string; // Next.js always provides slug as string
    }>;
};

export async function GET(request: Request, { params }: RequestParams) {
    const memberId = await getAuthUserId();
    const { id } = await params;
    const arenaId: number = Number(id);
    const url = new URL(request.url);
    const votedTo: string = url.searchParams.get("votedTo") || "";
    // ...
}
```

### Instance creation

**Always instantiate repositories and use cases inside the handler function** — never at module level. Module-level instances share state across requests and can cause stale connection issues.

```typescript
// ❌ Module level — breaks between requests
const repo = new PrismaArenaRepository();
const usecase = new GetArenaListUsecase(repo);

export async function GET(request: Request) { ... }

// ✅ Per-request — instantiate inside handler
export async function GET(request: Request) {
    const repo = new PrismaArenaRepository();
    const usecase = new GetArenaListUsecase(repo);
    // ...
}
```

### Structure per HTTP method

1. **GET**: Parse query params -> validate auth if needed -> instantiate repos & usecase -> execute -> return JSON
2. **POST**: Validate body -> validate auth -> build CreateDto -> execute usecase -> return `201`
3. **PATCH**: Parse params + body -> validate auth + ownership -> build UpdateDto -> execute usecase -> return JSON
4. **PUT**: Parse params + body -> validate auth + ownership -> build UpdateDto -> execute usecase -> return JSON
5. **DELETE**: Parse params -> validate existence -> validate auth + ownership -> execute usecase -> return `200`

### Error handling (unified)

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

---

## Testing

> Framework: **Vitest 4.x** + `@testing-library/react` + `@testing-library/jest-dom`
> Run: `npm test` (vitest run) / `npm run test:watch` (watch mode)

### File location & naming

- Co-locate test files in a `__tests__/` directory next to the source file
- Name: `PascalCase.test.ts` (or `.test.tsx` for React components)

```
backend/arena/application/usecase/
  GetArenaListUsecase.ts
  __tests__/
    GetArenaListUsecase.test.ts
```

### Environment setup

Default environment is `node`. For hooks and React components that need a DOM, add a docblock at the top of the file:

```ts
// @vitest-environment jsdom
```

> **Why docblock, not config**: `environmentMatchGlobs` in `vitest.config.ts` requires exact path matching; the docblock is more reliable.

### Mocking repositories

Mock factories live in `tests/mocks/`. Each factory returns a fully-typed mock object with all methods stubbed as `vi.fn()`:

```ts
// tests/mocks/createMockArenaRepository.ts
import type { ArenaRepository } from "@/backend/arena/domain/repositories/ArenaRepository";

export function createMockArenaRepository(): jest.Mocked<ArenaRepository> {
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

Use in tests:

```ts
import { createMockArenaRepository } from "@/tests/mocks/createMockArenaRepository";

const mockRepo = createMockArenaRepository();
mockRepo.findAll.mockResolvedValue([/* ... */]);
const usecase = new GetArenaListUsecase(mockRepo);
```

### Constructor mock gotcha

**Do NOT** use arrow functions when mocking classes that are called with `new`:

```ts
// ❌ Silently breaks — `this` is undefined inside arrow function
vi.fn().mockImplementation(() => ({ method: vi.fn() }))

// ✅ Use function keyword so `this` is bound correctly
vi.fn(function(this: any) {
    this.method = vi.fn();
})

// ✅ Or use a class
vi.fn(class {
    method = vi.fn();
})
```

### Mocking modules

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

### Zustand store tests

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

### Timer-based hooks

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

### API route tests

Instantiate the handler function directly — no HTTP server needed:

```ts
import { GET } from "@/app/api/arenas/route";

it("returns 200 with arena list", async () => {
    mockRepo.findAll.mockResolvedValue([/* arenas */]);
    const req = new Request("http://localhost/api/arenas?currentPage=1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.arenas).toHaveLength(1);
});
```

### Global setup

`tests/setup.ts` runs before all tests (configured in `vitest.config.ts`):

```ts
import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

---

## E2E Testing (Playwright)

> Framework: **Playwright** (`@playwright/test`)
> Config: `playwright.config.ts` (root)
> Run: `npm run test:e2e`

### Purpose

E2E tests catch issues that unit tests cannot: broken routes, hydration errors, missing UI elements, and API crashes in the real Next.js runtime. They are **not** a replacement for unit tests — they sit on top as a regression safety net.

| Layer | Tool | When | Role |
| ----- | ---- | ---- | ---- |
| Unit | Vitest | Every commit (pre-commit hook) | Business logic correctness |
| E2E | Playwright | Every PR (CI) | Route health, page rendering, API status |

### File location & naming

- All spec files live in `e2e/` at the project root
- Name: `kebab-case.spec.ts`

```
e2e/
  smoke.spec.ts        # Homepage load + zero console errors
  auth.spec.ts         # Login page form fields
  games.spec.ts        # Games page renders without 500/404
  arenas.spec.ts       # Arenas page renders without 500/404
  api-health.spec.ts   # Key API routes respond (not 500)
```

### Config

`playwright.config.ts` starts the dev server automatically when not in CI:

```typescript
export default defineConfig({
    testDir: "./e2e",
    use: {
        baseURL: process.env.BASE_URL ?? "http://localhost:3000",
        headless: true,
    },
    timeout: 30_000,
    reporter: process.env.CI ? "list" : "html",
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI, // reuse local dev server
        timeout: 120_000,
    },
});
```

### Dev server lifecycle

`reuseExistingServer: true` (local default) means:

- If **no** dev server is running → Playwright starts one and **stops it** when tests finish.
- If a dev server is **already running** → Playwright reuses it and leaves it running after tests.

**Rule:** Do not run `npm run dev` before `npm run test:e2e`. Let Playwright manage the server lifecycle so it is automatically stopped after tests end. If a server is already running on port 3000, kill it first:

```bash
npx kill-port 3000
npm run test:e2e
```

### Examples

**Page rendering** — verify page loads without error and key elements are visible:

```typescript
import { test, expect } from "@playwright/test";

test("/log-in 페이지 폼 렌더링", async ({ page }) => {
    await page.goto("/log-in");

    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
});
```

**Console error detection** — assert zero console errors on page load:

```typescript
test("홈페이지 로드 및 콘솔 에러 없음", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
    expect(consoleErrors).toHaveLength(0);
});
```

**API health check** — use `request` fixture to call API routes directly (no browser needed):

```typescript
test("GET /api/games — 500 아님", async ({ request }) => {
    const response = await request.get("/api/games");
    expect(response.status()).not.toBe(500);
});
```

### Scope

**Write E2E tests for:**

- Smoke: homepage loads, title present, no console errors
- Page rendering: route returns 2xx, critical UI visible (form fields, list containers)
- API health: key endpoints do not return 500

**Do NOT write E2E tests for:**

- Authenticated flows requiring a real session (NextAuth sessions can't be easily seeded in CI without a live DB)
- Business logic — that belongs in Vitest unit tests
- Visual regression — there is no baseline snapshot setup

---

## Development Environment

### File system access

- **Only read/write files under the project root directory.** Never access `/tmp`, `/temp`, system directories, or any path outside the project.
- If a new directory is needed (e.g., for scripts, temporary outputs), create it inside the project root.

### Database access

- **Do NOT access the database directly** (e.g., via Prisma `$queryRaw`, Prisma Studio, or psql).
- If database inspection is needed, ask the user to run the query manually on the server and share the result.

---

## Git & Collaboration

### Branch types

| Prefix      | Purpose                           |
| ----------- | --------------------------------- |
| `feat/`     | New feature                       |
| `fix/`      | Bug fix                           |
| `refactor/` | Code refactoring                  |
| `build/`    | Build-related changes             |
| `chore/`    | Miscellaneous small changes       |
| `docs/`     | Documentation                     |
| `style/`    | Non-functional code style changes |
| `test/`     | Test code                         |
| `API/`      | API integration                   |
| `file/`     | File/folder changes               |

### Branch naming

```
<type>/#<issue-number>
e.g. feat/#12
```

### Commit messages

```
[<type>/#<issue-number>] message
e.g. [API/#35] 글 작성 API 연동
```

### Workflow

1. Pull latest `dev` branch
2. Create issue -> create branch from issue
3. Work on branch -> commit
4. Before push: switch to `dev`, pull latest, switch back, `git rebase dev`
   - **Exception**: If the current branch depends on a previous unmerged branch that only contains Claude-related settings (`.claude/`, skill files, `CLAUDE.md`), skip rebasing onto `dev`. The assignee will handle the merge order manually. (e.g., `chore/#259` depends on `chore/#257` which updated Claude commands — no rebase needed)
5. Resolve conflicts if any, then push
6. If `dev` changed after your branch (other PRs merged), rebase and `--force` push
7. Create PR: branch -> `dev`
8. Get teammate approval -> approver rebases into `dev`
9. Close issue (use `close #` in PR), delete branch
10. If ready, rebase `main` to `dev`, then GitHub Actions will run automatically (build -> test -> deploy)

### Issue template

> 템플릿 파일: `.github/ISSUE_TEMPLATE/feature_request.md`

| Field     | How to set                                        |
| --------- | ------------------------------------------------- |
| Assignees | 본인을 선택                                       |
| Labels    | 이슈 타입에 맞는 라벨 선택 (e.g. `docs`, `feat`)  |
| Projects  | `Gamechu` 프로젝트 선택                            |

### PR template

> 템플릿 파일: `.github/PULL_REQUEST_TEMPLATE.md`

> **PR의 Assignees, Labels, Projects는 연결된 Issue와 동일하게 설정한다.**
> PR 본문만 실제 작업 내용에 맞게 작성하되, 메타 필드는 Issue에서 그대로 가져온다.

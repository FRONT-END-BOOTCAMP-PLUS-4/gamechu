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

export type CreateArenaInput = Omit<Arena, "id">;

export interface ArenaRepository {
    count(filter: ArenaFilter): Promise<number>; // Count by filter
    findAll(filter: ArenaFilter): Promise<Arena[]>; // Find by filter with pagination
    findById(id: number): Promise<Arena | null>; // Find single by ID
    save(arena: CreateArenaInput): Promise<Arena>; // Create
    update(arena: Arena): Promise<Arena>; // Update
    deleteAll(filter: ArenaFilter): Promise<void>; // Bulk delete (only if needed)
    deleteById(id: number): Promise<void>; // Delete by ID
}
```

### PrismaRepository implementation

- Accept `PrismaClient` or instantiate internally
- Extract `getWhereClause(filter)` for reuse across `count`, `findAll`, etc.
- Use spread + conditional for optional filter fields

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

### Structure per HTTP method

1. **GET**: Parse query params -> validate auth if needed -> instantiate repos & usecase -> execute -> return JSON
2. **POST**: Validate body -> validate auth -> build CreateDto -> execute usecase -> return `201`
3. **PATCH**: Parse params + body -> validate auth + ownership -> build UpdateDto -> execute usecase -> return JSON
4. **DELETE**: Parse params -> validate existence -> validate auth + ownership -> execute usecase -> return `200`

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

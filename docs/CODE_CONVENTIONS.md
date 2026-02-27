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
5. Resolve conflicts if any, then push
6. If `dev` changed after your branch (other PRs merged), rebase and `--force` push
7. Create PR: branch -> `dev`
8. Get teammate approval -> approver rebases into `dev`
9. Close issue (use `close #` in PR), delete branch
10. If ready, rebase `main` to `dev`, then GitHub Actions will run automatically (build -> test -> deploy)

### Issue template

```
Title: [<type>]: summary

## 어떤 기능인가요?
> description

## 작업 상세 내용
- [ ] todo

## 참고자료(선택)

Assignee: select yourself
```

### PR template

```
Title: [<type>/#<issue>]: summary

## ✨ 작업 개요
## ✅ 상세 내용
- [ ] what files changed, what features added/modified
## 📸 스크린샷 (선택)
## 🧪 확인 사항
- [ ] 정상적으로 동작하는지 직접 테스트해봤나요?
- [ ] 기능 추가/수정 후 UI나 비즈니스 로직에 영향은 없나요?
- [ ] PR 리뷰어가 중점적으로 확인하면 좋을 부분은?
## 🙏 기타 참고 사항
close #
```

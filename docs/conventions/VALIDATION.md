# Validation Conventions

> Framework: **Zod v4** — import with `import { z } from "zod"`

## Schema co-location

Define Zod schemas in the same DTO file they validate, exported as `[ClassName without Dto]Schema`:

```typescript
// backend/arena/application/usecase/dto/CreateArenaDto.ts
import { z } from "zod";

export const CreateArenaSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    description: z.string().min(1, "설명을 입력해주세요"),
    startDate: z.string().datetime(),
});

export class CreateArenaDto {
    constructor(
        public creatorId: string,
        public title: string,
        public description: string,
        public startDate: Date
    ) {}
}
```

## `validate()` helper

Use `validate<T>()` from `utils/validation.ts` for all body and param validation:

```typescript
import { validate, IdSchema } from "@/utils/Validation";
import { CreateArenaSchema } from "@/backend/arena/application/usecase/dto/CreateArenaDto";

export async function POST(request: Request) {
    const body = await request.json();
    const v = validate(CreateArenaSchema, body);
    if (!v.success) return v.response; // returns 400 NextResponse automatically
    const { title, description, startDate } = v.data;
    // ...
}
```

The helper returns `{ success: true, data: T }` or `{ success: false, response: NextResponse<{ message: string }> }`.

## `IdSchema` for path params

```typescript
import { validate, IdSchema } from "@/utils/Validation";

const { id } = await params;
const v = validate(IdSchema, id);
if (!v.success) return v.response; // 400 if not a positive integer
const arenaId = v.data; // typed as number
```

## Query param schemas

Use `z.coerce` for type coercion from strings, `.default()` for optional params, `.transform()` for booleans:

```typescript
const GetArenaListSchema = z.object({
    currentPage: z.coerce.number().int().positive().default(1),
    status: z.coerce.number().int().default(0),
    mine: z
        .string()
        .default("false")
        .transform((v) => v === "true"),
    pageSize: z.coerce.number().int().positive().default(9),
});
```

## Inline schema exception

Simple single-field checks (e.g., email-check) may define the schema inline in the route file:

```typescript
// intentional inline — schema too simple for a DTO file
const schema = z.object({ email: z.string().email() });
const v = validate(schema, body);
```

## Zod v4 gotchas

- `z.record()` requires **two** arguments: `z.record(z.string(), z.unknown())`. The single-arg form silently fails with a runtime error.
- Import from `"zod"` directly — `import { z } from "zod"` works in v4.

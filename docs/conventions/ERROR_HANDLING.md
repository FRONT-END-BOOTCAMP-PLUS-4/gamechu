# Error Handling Conventions

## Response shape

Always use `{ message }` — never `{ error }`:

```typescript
// ✅
return NextResponse.json({ message: "Not found" }, { status: 404 });

// ❌ — do not use { error }
return NextResponse.json({ error: "Not found" }, { status: 404 });
```

## `errorResponse` helper

Use `errorResponse` from `utils/ApiResponse.ts` for all error returns:

```typescript
import { errorResponse } from "@/utils/ApiResponse";

return errorResponse("리소스를 찾을 수 없습니다", 404);
return errorResponse("권한이 없습니다", 401);
```

For success responses, use `NextResponse.json(data, { status })` directly — there is no `successResponse` helper.

## Standard catch block

```typescript
import logger from "@/lib/Logger";
import { errorResponse } from "@/utils/ApiResponse";

export async function POST(request: Request) {
    const log = logger.child({ route: "/api/...", method: "POST" });

    try {
        // handler logic
    } catch (error: unknown) {
        log.error({ err: error }, "operation failed");
        const message =
            error instanceof Error ? error.message : "알 수 없는 오류 발생";
        return errorResponse(message, 500);
    }
}
```

## Early returns (no try-catch needed)

Use `errorResponse` directly for guard conditions — no try-catch required:

```typescript
const userId = await getAuthUserId();
if (!userId) return errorResponse("로그인이 필요합니다", 401);

const arena = await usecase.execute(id);
if (!arena) return errorResponse("투기장을 찾을 수 없습니다", 404);
```

## Usecase layer: no try-catch

Usecases do **not** catch errors — they bubble up to the route handler:

```typescript
// ✅ — no try-catch in usecases
async execute(dto: GetArenaDto): Promise<ArenaDto> {
    const arena = await this.repository.findById(dto.id);
    if (!arena) throw new Error("투기장을 찾을 수 없습니다");
    return new ArenaDto(arena);
}
```

## Status code reference

| Status | When                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| `200`  | Successful GET, PATCH, PUT, DELETE; check-only POSTs (email-check, nickname-check) |
| `201`  | POST that creates a DB row                                                         |
| `400`  | Validation failure, bad input                                                      |
| `401`  | Not authenticated                                                                  |
| `403`  | Authenticated but not authorized                                                   |
| `404`  | Resource not found                                                                 |
| `500`  | Unhandled server error                                                             |

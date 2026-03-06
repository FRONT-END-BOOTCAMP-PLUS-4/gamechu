# Async Patterns and Error Handling

Complete guide to async/await patterns and error handling in GameChu's Next.js backend.

## Table of Contents

- [Async/Await Best Practices](#asyncawait-best-practices)
- [Promise Error Handling](#promise-error-handling)
- [Custom Error Types](#custom-error-types)
- [Error Propagation](#error-propagation)
- [Common Async Pitfalls](#common-async-pitfalls)

---

## Async/Await Best Practices

### Always Use Try-Catch in Route Handlers

```typescript
// ❌ NEVER: Unhandled async errors
export async function GET(request: Request) {
    const data = await usecase.execute(dto); // If throws, unhandled!
    return NextResponse.json(data);
}

// ✅ ALWAYS: Wrap in try-catch
export async function GET(request: Request) {
    try {
        const data = await usecase.execute(dto);
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "알 수 없는 오류 발생" },
            { status: 500 }
        );
    }
}
```

### Avoid .then() Chains

```typescript
// ❌ AVOID: Promise chains
function processData() {
    return fetchData()
        .then(data => transform(data))
        .then(transformed => save(transformed))
        .catch(error => console.error(error));
}

// ✅ PREFER: Async/await
async function processData() {
    try {
        const data = await fetchData();
        const transformed = await transform(data);
        return await save(transformed);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
```

---

## Promise Error Handling

### Parallel Operations

```typescript
// ✅ Handle errors in Promise.all
try {
    const [arenas, members, votes] = await Promise.all([
        arenaRepository.findAll(filter),
        memberRepository.findActive(),
        voteRepository.countByArena(arenaId),
    ]);
} catch (error) {
    // One failure fails all
    console.error("Parallel operation failed:", error);
    throw error;
}

// ✅ Handle errors individually with Promise.allSettled
const results = await Promise.allSettled([
    arenaRepository.findAll(filter),
    memberRepository.findActive(),
]);

results.forEach((result, index) => {
    if (result.status === 'rejected') {
        console.error(`Operation ${index} failed:`, result.reason);
    }
});
```

---

## Custom Error Types

### Define Custom Errors

```typescript
// types/errors.ts
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) { super(message, 404); }
}

export class ForbiddenError extends AppError {
    constructor(message: string) { super(message, 403); }
}

export class ConflictError extends AppError {
    constructor(message: string) { super(message, 409); }
}
```

### Usage

```typescript
// In usecase — throw specific errors
if (!arena) {
    throw new NotFoundError("투기장을 찾을 수 없습니다.");
}

if (member.score < 100) {
    throw new ForbiddenError("점수가 부족합니다.");
}

// In route handler — catch and respond
catch (error: unknown) {
    if (error instanceof AppError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.statusCode }
        );
    }
    if (error instanceof Error) {
        return NextResponse.json(
            { message: error.message },
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

## Error Propagation

### Proper Error Chains

```typescript
// ✅ Propagate errors up the stack

// Repository — let Prisma errors bubble up
async findById(id: number): Promise<Arena | null> {
    return this.prisma.arena.findUnique({ where: { id } });
    // Prisma errors propagate naturally
}

// Usecase — throw business errors, let others propagate
async execute(dto: GetArenaDto): Promise<Arena> {
    const arena = await this.arenaRepository.findById(dto.arenaId);
    if (!arena) {
        throw new NotFoundError("투기장을 찾을 수 없습니다.");
    }
    return arena;
}

// Route handler — final catch-all
export async function GET(request: Request, { params }) {
    try {
        const { id } = await params;
        // ...
        const result = await usecase.execute(dto);
        return NextResponse.json(result);
    } catch (error: unknown) {
        // Final handler — all errors caught here
        console.error("Error:", error);
        // Return appropriate response
    }
}
```

---

## Common Async Pitfalls

### Fire and Forget (Bad)

```typescript
// ❌ NEVER: Fire and forget
export async function POST(request: Request) {
    const result = await usecase.execute(dto);
    sendNotification(result); // Fires async, errors unhandled!
    return NextResponse.json(result);
}

// ✅ ALWAYS: Await or handle
export async function POST(request: Request) {
    const result = await usecase.execute(dto);
    await sendNotification(result);
    return NextResponse.json(result);
}

// ✅ OR: Intentional background task with error handling
export async function POST(request: Request) {
    const result = await usecase.execute(dto);
    sendNotification(result).catch(error => {
        console.error("Notification failed:", error);
    });
    return NextResponse.json(result);
}
```

### Missing Await

```typescript
// ❌ BAD: Missing await on async function
export async function DELETE(request: Request, { params }) {
    const { id } = await params;
    usecase.execute(id); // Missing await!
    return NextResponse.json({ message: "삭제 완료" });
}

// ✅ GOOD
export async function DELETE(request: Request, { params }) {
    const { id } = await params;
    await usecase.execute(id);
    return NextResponse.json({ message: "삭제 완료" });
}
```

---

**Related Files:**
- [SKILL.md](SKILL.md)
- [routing-and-controllers.md](routing-and-controllers.md)
- [complete-examples.md](complete-examples.md)

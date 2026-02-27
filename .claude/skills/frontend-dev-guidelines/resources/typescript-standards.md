# TypeScript Standards

TypeScript best practices for GameChu's Next.js frontend.

---

## Strict Mode

TypeScript strict mode is enabled:

```json
// tsconfig.json
{
    "compilerOptions": {
        "strict": true
    }
}
```

**This means:**
- No implicit `any` types
- Null/undefined must be handled explicitly
- Type safety enforced throughout

---

## No `any` Type

```typescript
// ❌ NEVER use any
function handleData(data: any) {
    return data.something;
}

// ✅ Use specific types
interface ArenaData {
    id: number;
    title: string;
    status: number;
}

function handleData(data: ArenaData) {
    return data.title;
}

// ✅ Or use unknown for truly unknown data
function handleUnknown(data: unknown) {
    if (typeof data === "object" && data !== null && "title" in data) {
        return (data as ArenaData).title;
    }
}
```

---

## Component Prop Interfaces

```typescript
interface ArenaCardProps {
    /** 아레나 데이터 */
    arena: ArenaDetailDto;
    /** 선택 시 콜백 */
    onSelect?: (id: number) => void;
    /** 표시 모드 */
    mode?: "compact" | "full";
}

export default function ArenaCard({
    arena,
    onSelect,
    mode = "full",
}: ArenaCardProps) {
    return <div>{arena.title}</div>;
}
```

**Key Points:**
- Separate interface for props
- Optional props use `?`
- Provide defaults in destructuring

### Props with Children

```typescript
interface ContainerProps {
    children: React.ReactNode;
    title: string;
}

export default function Container({ children, title }: ContainerProps) {
    return (
        <div>
            <h2 className="text-lg font-bold text-font-100">{title}</h2>
            {children}
        </div>
    );
}
```

---

## Type Imports

```typescript
// ✅ CORRECT — Use 'import type' for type-only imports
import type { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import type { Metadata } from "next";

// ✅ OK — Mixed value + type import when both needed
import { create } from "zustand";
```

**Benefits:**
- Clearly separates types from values
- Better tree-shaking
- Prevents circular dependencies

---

## Function Return Types

```typescript
// ✅ CORRECT — Explicit return types on non-trivial functions
function parseArenaStatus(status: number): string {
    switch (status) {
        case 2: return "대기 중";
        case 3: return "진행 중";
        case 5: return "종료";
        default: return "알 수 없음";
    }
}

// ✅ OK — React components (return type is implicit JSX.Element)
export default function ArenaCard({ arena }: ArenaCardProps) {
    return <div>{arena.title}</div>;
}

// ✅ CORRECT — Async functions
async function fetchArena(id: number): Promise<ArenaDetailDto> {
    const res = await fetch(`/api/arenas/${id}`);
    return res.json();
}
```

---

## Zustand Store Types

```typescript
import { create } from "zustand";

// Define the state interface
interface ArenaState {
    arenaData: ArenaDetailDto | null;
    setArenaData: (data: ArenaDetailDto) => void;
    clearArenaData: () => void;
}

// Pass interface as generic to create()
const useArenaStore = create<ArenaState>((set) => ({
    arenaData: null,
    setArenaData: (data) => set({ arenaData: data }),
    clearArenaData: () => set({ arenaData: null }),
}));
```

---

## Hook Return Types

```typescript
// ✅ Return type is inferred, but can be explicit for clarity
export function useArenaList(): {
    arenaList: ArenaDetailDto[];
    loading: boolean;
    error: Error | null;
} {
    const [arenaList, setArenaList] = useState<ArenaDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // ...

    return { arenaList, loading, error };
}
```

---

## Utility Types

### Partial<T>

```typescript
type ArenaUpdate = Partial<ArenaDetailDto>;

async function updateArena(id: number, updates: Partial<ArenaDetailDto>) {
    await fetch(`/api/arenas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}
```

### Pick<T, K> and Omit<T, K>

```typescript
// Only specific fields
type ArenaPreview = Pick<ArenaDetailDto, "id" | "title" | "status">;

// Exclude specific fields
type ArenaCreatePayload = Omit<ArenaDetailDto, "id" | "createdAt">;
```

### Record<K, V>

```typescript
// Type-safe object maps
const statusLabels: Record<number, string> = {
    2: "대기 중",
    3: "진행 중",
    5: "종료",
};

// For component size/type maps
const sizeClasses: Record<ButtonSize, string> = {
    xs: "w-[32px] h-[32px]",
    small: "w-[90px] h-[35px]",
    medium: "w-[150px] h-[50px]",
    large: "w-[250px] h-[40px]",
};
```

---

## Type Guards

```typescript
function isArenaDetailDto(data: unknown): data is ArenaDetailDto {
    return (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        "title" in data &&
        "status" in data
    );
}

// Usage
const json = await res.json();
if (isArenaDetailDto(json)) {
    setArenaData(json);
}
```

---

## Null/Undefined Handling

### Optional Chaining

```typescript
const creatorName = arenaData?.creatorName;
const firstArena = arenaList?.[0]?.title;
```

### Nullish Coalescing

```typescript
const displayName = user?.nickname ?? "익명";
const score = arena?.creatorScore ?? 0;
```

### Non-Null Assertion (Use Sparingly)

```typescript
// Only when you KNOW it's not null (e.g., after a null check)
const id = useParams().id!;  // OK if route guarantees id exists
```

---

## Event Handler Types

```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
};

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
};

// Click events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ...
};

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
};
```

---

## Summary

**TypeScript Checklist:**
- Strict mode enabled
- No `any` type (use `unknown` if needed)
- Explicit return types on non-trivial functions
- `import type` for type-only imports
- Interface for component props
- Typed Zustand stores with generics
- Utility types: Partial, Pick, Omit, Record
- Optional chaining + nullish coalescing
- Proper React event handler types

**See Also:**
- [component-patterns.md](component-patterns.md) - Component typing
- [common-patterns.md](common-patterns.md) - Store typing patterns
- [data-fetching.md](data-fetching.md) - API response typing

# Frontend Conventions

## React components

### Props

Always use `type`, never `interface`:

```typescript
// ✅
type ArenaCardProps = {
    id: number;
    title: string;
    isActive: boolean;
};

// ❌
interface ArenaCardProps { ... }
```

### Declaration

Use `function` declaration — never `const` + arrow function or `React.FC`:

```typescript
// ✅
function ArenaCard({ id, title }: ArenaCardProps) {
    return <div>{title}</div>;
}

// ❌
const ArenaCard: React.FC<ArenaCardProps> = ({ id, title }) => <div>{title}</div>;
const ArenaCard = ({ id, title }: ArenaCardProps) => <div>{title}</div>;
```

### Client components

Add `"use client"` at the top of any component that uses hooks, browser APIs, or event handlers:

```typescript
"use client";

import { useState } from "react";
```

### Class composition

Use `cn()` from `utils/TailwindUtil.ts` for any conditional or merged class strings:

```typescript
import { cn } from "@/utils/TailwindUtil";

<div className={cn("base-class", isActive && "active-class", variant === "primary" && "primary-class")} />
```

Class order: **base → variant → conditional (state-dependent)**

## TanStack Query

### Data fetching

Use `useQuery` for reads and `useMutation` for writes — no direct `fetch` calls in components.

### Query keys

Always import from `lib/QueryKeys.ts` — never inline string arrays:

```typescript
import { queryKeys } from "@/lib/QueryKeys";

const { data } = useQuery({
    queryKey: queryKeys.reviews(gameId),
    queryFn: () => fetcher(`/api/games/${gameId}/reviews`),
});
```

### Fetcher

Use `lib/Fetcher.ts` for all `queryFn` GET calls:

```typescript
import { fetcher } from "@/lib/Fetcher";

queryFn: () => fetcher<ReviewDto[]>(`/api/games/${gameId}/reviews`);
```

### Auth-gated queries

Use `enabled` flag when the query requires authentication:

```typescript
const { data } = useQuery({
    queryKey: queryKeys.wishlist(gameId),
    queryFn: () => fetcher(`/api/games/${gameId}/wishlists`),
    enabled: !!viewerId,
});
```

### Cache invalidation after mutations

```typescript
const queryClient = useQueryClient();

useMutation({
    mutationFn: (id: number) => fetch(`/api/arenas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.arenas({ ... }) });
    },
});
```

### QueryClient config

```typescript
new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 60_000,
            retry: 1,
        },
    },
});
```

## Zustand stores

Store pattern:

```typescript
import { create } from "zustand";

type AuthStore = {
    memberId: string | null;
    isLoggedIn: boolean;
    login: (id: string) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    memberId: null,
    isLoggedIn: false,
    login: (id) => set({ memberId: id, isLoggedIn: true }),
    logout: () => set({ memberId: null, isLoggedIn: false }),
}));
```

In tests, access state directly — no `renderHook`:

```typescript
useAuthStore.getState().login("member-123");
expect(useAuthStore.getState().isLoggedIn).toBe(true);
```

## Client-side error handling

Never use `console.error` or `console.log` in components:

```typescript
// ❌
console.error("API call failed:", error);

// ✅ — user-facing errors → Toast
toast.error("요청에 실패했습니다");

// ✅ — debug logs → remove before commit (do not commit console.log)
```

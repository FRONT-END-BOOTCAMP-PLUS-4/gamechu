# Global Error Boundary — Design Spec

**Feature**: §5.4 Global Error Boundary
**Date**: 2026-03-24
**Status**: Approved
**Effort**: 1–2 hours

---

## Problem

No React error boundary exists in the app. Any unhandled client-side JavaScript error results in a white screen with no recovery path.

---

## Scope

Two new Next.js App Router boundary files + one shared UI component:

```
app/
├── components/
│   └── ErrorView.tsx          # Shared "use client" UI component
├── (base)/
│   └── error.tsx              # Catches errors within (base) route segment
└── global-error.tsx           # Catches crashes in root layout itself
```

No existing files are modified.

---

## Architecture

### Approach: Shared component (Option B)

`ErrorView.tsx` contains all UI and behaviour logic. Both `error.tsx` and `global-error.tsx` are thin wrappers that pass the `reset` prop through.

**Why not inline (Option A)**: ~80% code duplication; any design change requires editing two files.
**Why not hook abstraction (Option C)**: Over-engineering for a 1–2 hour task; `useErrorBoundary` has no other consumers.

---

## Component Design

### `app/components/ErrorView.tsx`

- **Type**: `"use client"` component
- **Props**: `reset: () => void`
- **Behaviour**:
  - `useEffect` + `setTimeout(5000)` → `router.push("/")`
  - `clearTimeout` on unmount (matches `ClientNotFoundView.tsx` pattern)
  - "다시 시도" button → calls `reset()` to retry the failed render
  - "홈으로" button → `router.push("/")`
- **Style**: GameChu gaming aesthetic (dark theme, `bg-background-400`)
  - `Press Start 2P` pixel font badge: **SYSTEM ERROR** with red glow pulse
  - 🎮 icon with shake animation + double ring pulse
  - Terminal log box showing error boundary catch confirmation
  - 5-second countdown progress bar (gradient `accent2 → accent`)
  - Two buttons: primary (purple gradient) "다시 시도", secondary "홈으로"
  - CRT scanline overlay + grid background + floating orbs

### `app/(base)/error.tsx`

```tsx
"use client";
import ErrorView from "../components/ErrorView";

export default function Error({ reset }: { reset: () => void }) {
  return <ErrorView reset={reset} />;
}
```

### `app/global-error.tsx`

```tsx
"use client";
import ErrorView from "./components/ErrorView";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ko">
      <body className="bg-background-400 font-sans text-font-100">
        <ErrorView reset={reset} />
      </body>
    </html>
  );
}
```

**Note on `global-error.tsx` navigation**: `useRouter` requires Next.js context which may not be available when the root layout crashes. Use `window.location.href = "/"` as fallback for the timer redirect and "홈으로" button.

---

## Animations

`@keyframes` that exceed Tailwind arbitrary value limits are added to `app/globals.css`:

- `countdown`: `width 100% → 0%` over 5s linear (timer bar)
- `pulse-badge`, `ring-pulse`, `icon-shake`, `drift`: decorative effects

---

## Relationship with `not-found.tsx`

`error.tsx` does **not** interfere with `not-found.tsx`. Next.js App Router treats these as separate mechanisms:

- Routing-level 404s and `notFound()` calls → `app/not-found.tsx`
- JavaScript runtime errors in React components → `app/(base)/error.tsx`

Next.js internally re-throws errors with `digest: 'NEXT_NOT_FOUND'` and `digest: 'NEXT_REDIRECT'`, so the error boundary never swallows them.

> ⚠️ **Edge case**: If user code wraps a `notFound()` call inside a `try-catch`, the special error will be swallowed *before* reaching the error boundary — this is a code-level issue unrelated to our boundary. All current routes use standardised try-catch patterns (from `refactor/#277`) that do not catch `notFound()`.

---

## Testing

### E2E — `e2e/error-boundary.spec.ts`

Strategy: inject a client-side error via `page.evaluate()` or navigate to a dedicated test page (`app/(base)/test-error/page.tsx`) that throws unconditionally.

**Assertions**:
1. SYSTEM ERROR badge is visible
2. "다시 시도" and "홈으로" buttons are present
3. Clicking "다시 시도" resets the boundary (page recovers)
4. Clicking "홈으로" navigates to `/`
5. After 5 seconds without interaction, page redirects to `/`

---

## Files Changed

| File | Action |
|------|--------|
| `app/components/ErrorView.tsx` | Create |
| `app/(base)/error.tsx` | Create |
| `app/global-error.tsx` | Create |
| `app/globals.css` | Modify — add `@keyframes` |
| `e2e/error-boundary.spec.ts` | Create |

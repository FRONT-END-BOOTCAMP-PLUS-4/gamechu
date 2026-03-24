# Global Error Boundary — Design Spec

**Feature**: Global Error Boundary
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

Additional files modified or created:

```
app/globals.css                        # Add @keyframes
app/layout.tsx                         # Add Press Start 2P font via next/font/google
e2e/error-boundary.spec.ts             # Playwright E2E tests
app/(base)/test-error/page.tsx         # Dedicated page that throws during render (E2E use only)
```

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
- **Navigation strategy**: Always use `window.location.href = "/"` (not `useRouter`). This works safely in both `(base)/error.tsx` (standard Next.js context) and `global-error.tsx` (root layout crashed — Next.js context may be unavailable). The minor loss of client-side soft-navigation is acceptable for an error recovery path.
- **Behaviour**:
  - `useEffect` + `setTimeout(5000)` → `window.location.href = "/"`
  - `clearTimeout` on unmount (matches `ClientNotFoundView.tsx` pattern)
  - "다시 시도" button → calls `reset()` to retry the failed render
  - "홈으로" button → `window.location.href = "/"`
- **Font**: `Press Start 2P` added to `app/layout.tsx` via `next/font/google` (same pattern as existing global font) and exposed as a CSS variable (e.g. `--font-press-start`). `ErrorView` references it via inline `style` or a Tailwind `fontFamily` config entry. Loading via `next/font/google` inside a `"use client"` component is not supported in Next.js 15 and will throw a build error.
- **Style**: GameChu gaming aesthetic (dark theme, `bg-background-400`)
  - `Press Start 2P` pixel font badge: **SYSTEM ERROR** with red glow pulse
  - 🎮 icon with shake animation + double ring pulse
  - Terminal log box showing error boundary catch confirmation
  - 5-second countdown progress bar (gradient `accent2 → accent`) — CSS animation syncs with the JS timer; if `reset()` fires before 5s the bar may still be animating visually (cosmetic-only, acceptable)
  - Two buttons: primary (purple gradient) "다시 시도", secondary "홈으로"
  - CRT scanline overlay + grid background + floating orbs
- **Unused prop note**: Next.js also passes `error: Error & { digest?: string }` to `error.tsx`. It is intentionally unused since we show a fixed friendly message rather than raw error details.

### `app/(base)/error.tsx`

```tsx
"use client";
import ErrorView from "../components/ErrorView";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
```

### `app/global-error.tsx`

```tsx
"use client";
import "./globals.css";   // Required: root layout is bypassed, so styles must be imported here
import ErrorView from "./components/ErrorView";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body className="bg-background-400 font-sans text-font-100">
        <ErrorView reset={reset} />
      </body>
    </html>
  );
}
```

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

**Strategy**: Navigate to `app/(base)/test-error/page.tsx`, a dedicated page that throws unconditionally during render. This reliably triggers React's error boundary (unlike `page.evaluate()` which injects errors after hydration and does not trigger the boundary).

`app/(base)/test-error/page.tsx` must call `notFound()` when `process.env.NODE_ENV === 'production'` to avoid exposing a deliberate crash page on gamechu.com.

**Timer testing**: Use `page.clock.install()` (Playwright's fake timer API) to advance time by 5 seconds without real-time waiting. This avoids a slow, flaky 5s `waitForTimeout`. **Call order matters**: `page.clock.install()` must be called *before* `page.goto("/test-error")`; otherwise `setTimeout` is already registered against the real clock and fast-forwarding has no effect. After navigation, call `page.clock.fastForward(5000)` to trigger the redirect.

**Assertions**:
1. SYSTEM ERROR badge is visible after navigating to `/test-error`
2. "다시 시도" and "홈으로" buttons are present
3. Clicking "다시 시도" — boundary re-renders; since `test-error/page.tsx` throws unconditionally, the error UI reappears immediately. Assert the badge is still visible (boundary re-triggered, not that the page recovered)
4. Clicking "홈으로" navigates to `/`
5. After advancing clock by 5s via `page.clock.fastForward(5000)`, page redirects to `/`

---

## Files Changed

| File | Action |
|------|--------|
| `app/components/ErrorView.tsx` | Create |
| `app/(base)/error.tsx` | Create |
| `app/global-error.tsx` | Create |
| `app/globals.css` | Modify — add `@keyframes` |
| `app/layout.tsx` | Modify — add `Press Start 2P` via `next/font/google` + CSS variable |
| `e2e/error-boundary.spec.ts` | Create |
| `app/(base)/test-error/page.tsx` | Create — E2E test target only (returns `notFound()` in production) |

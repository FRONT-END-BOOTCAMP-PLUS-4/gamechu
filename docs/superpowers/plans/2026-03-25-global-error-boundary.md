# Global Error Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add React error boundaries so unhandled client errors show a gaming-styled recovery UI instead of a white screen.

**Architecture:** `ErrorView.tsx` holds all UI and behaviour; `app/(base)/error.tsx` and `app/global-error.tsx` are thin wrappers. Navigation uses `window.location.href` (no `useRouter`) so the component is safe in both Next.js context and root-layout-crash context.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS 3, `next/font/google`, Playwright E2E

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/layout.tsx` | Modify | Add `Press Start 2P` font variable |
| `app/globals.css` | Modify | Add `@keyframes` for ErrorView animations |
| `app/components/ErrorView.tsx` | Create | Shared gaming-aesthetic error UI + 5s countdown |
| `app/(base)/error.tsx` | Create | Thin wrapper for (base) route segment |
| `app/global-error.tsx` | Create | Thin wrapper for root layout crash, owns `<html><body>` |
| `app/(base)/test-error/page.tsx` | Create | Server component: production guard + mounts client thrower |
| `app/(base)/test-error/TestErrorClient.tsx` | Create | Client component that throws during render (triggers boundary) |
| `e2e/error-boundary.spec.ts` | Create | Playwright assertions for error UI + timer + navigation |

---

## Task 1: Font + Keyframes Foundation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add `Press Start 2P` font to layout**

Open `app/layout.tsx` and replace its content:

```tsx
import { Press_Start_2P } from "next/font/google";
import Modals from "./components/Modals";
import "./globals.css";
export { viewport } from "./viewport";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={pressStart2P.variable}>
            <body className="bg-background-400 font-sans text-font-100">
                <Modals />
                {children}
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Add `@keyframes` to `app/globals.css`**

Append to the end of the file:

```css
/* ── Error Boundary Animations ── */
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes countdown {
    from { width: 100%; }
    to   { width: 0%; }
}
@keyframes pulse-badge {
    0%,  100% { box-shadow: 0 0 8px rgba(255, 59, 92, 0.2); }
    50%        { box-shadow: 0 0 20px rgba(255, 59, 92, 0.5), 0 0 40px rgba(255, 59, 92, 0.2); }
}
@keyframes ring-pulse {
    0%,  100% { transform: scale(1);   opacity: 1; }
    50%        { transform: scale(1.1); opacity: 0.4; }
}
@keyframes icon-shake {
    0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.1) rotate(4deg);   opacity: 1; }
    80%  { transform: scale(0.95) rotate(-2deg); }
    100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
}
@keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.08); }
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd .worktrees/feat-280 && npm run build
```

Expected: `✓ Compiled successfully` — no font-related errors.

- [ ] **Step 4: Commit**

```bash
cd .worktrees/feat-280
git add app/layout.tsx app/globals.css
git commit -m "[feat/#280] Press Start 2P 폰트 + 에러 바운더리 keyframes 추가"
```

---

## Task 2: Test Infrastructure (failing E2E first)

**Files:**
- Create: `app/(base)/test-error/page.tsx`
- Create: `app/(base)/test-error/TestErrorClient.tsx`
- Create: `e2e/error-boundary.spec.ts`

- [ ] **Step 1: Create server-side page with production guard**

Create `app/(base)/test-error/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import TestErrorClient from "./TestErrorClient";

export default function TestErrorPage() {
    if (process.env.NODE_ENV === "production") {
        notFound();
    }
    return <TestErrorClient />;
}
```

- [ ] **Step 2: Create client component that throws during render**

Create `app/(base)/test-error/TestErrorClient.tsx`:

```tsx
"use client";

export default function TestErrorClient(): never {
    throw new Error("테스트용 에러: 에러 바운더리 동작 확인");
}
```

- [ ] **Step 3: Write the E2E spec (currently failing)**

Create `e2e/error-boundary.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("에러 바운더리", () => {
    test("에러 발생 시 SYSTEM ERROR 배지와 버튼이 표시된다", async ({ page }) => {
        await page.goto("/test-error");

        // SYSTEM ERROR 배지
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        // 버튼 두 개
        await expect(page.getByRole("button", { name: /다시 시도/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /홈으로/ })).toBeVisible();
    });

    test("홈으로 버튼 클릭 시 홈으로 이동한다", async ({ page }) => {
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        await page.getByRole("button", { name: /홈으로/ }).click();
        await expect(page).toHaveURL("/");
    });

    test("다시 시도 버튼 클릭 시 에러 바운더리가 재실행된다", async ({ page }) => {
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        // test-error 페이지는 항상 throw하므로 reset 후에도 배지가 다시 표시됨
        await page.getByRole("button", { name: /다시 시도/ }).click();
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();
    });

    test("5초 후 자동으로 홈으로 이동한다", async ({ page }) => {
        // clock.install()은 반드시 goto() 전에 호출해야 setTimeout이 fake clock에 등록됨
        await page.clock.install();
        await page.goto("/test-error");
        await expect(page.getByText("SYSTEM ERROR")).toBeVisible();

        await page.clock.fastForward(5000);
        await expect(page).toHaveURL("/");
    });
});
```

- [ ] **Step 4: Run to confirm tests fail (ErrorView not yet created)**

```bash
cd .worktrees/feat-280 && npm run test:e2e -- --grep "에러 바운더리" 2>&1 | tail -20
```

Expected: tests fail — the `/test-error` route either 404s or shows no error UI yet.

---

## Task 3: ErrorView Component

**Files:**
- Create: `app/components/ErrorView.tsx`

- [ ] **Step 1: Create `ErrorView.tsx`**

Create `app/components/ErrorView.tsx`:

```tsx
"use client";

import { useEffect } from "react";

interface ErrorViewProps {
    reset: () => void;
}

export default function ErrorView({ reset }: ErrorViewProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "/";
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-background-400 font-sans text-font-100 flex items-center justify-center overflow-hidden">
            {/* Scanline overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-[100]"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                }}
            />
            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Vignette */}
            <div
                className="fixed inset-0 pointer-events-none z-[1]"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
                }}
            />
            {/* Purple orb */}
            <div
                className="fixed rounded-full pointer-events-none opacity-15"
                style={{
                    width: 500,
                    height: 500,
                    background: "#7c5cfc",
                    filter: "blur(80px)",
                    top: -100,
                    right: -100,
                    animation: "drift 12s ease-in-out infinite alternate",
                }}
            />
            {/* Red orb */}
            <div
                className="fixed rounded-full pointer-events-none opacity-15"
                style={{
                    width: 350,
                    height: 350,
                    background: "#ff3b5c",
                    filter: "blur(80px)",
                    bottom: -80,
                    left: -60,
                    animation: "drift 9s ease-in-out infinite alternate-reverse",
                }}
            />

            {/* Content */}
            <div
                className="relative z-10 flex flex-col items-center gap-8 px-5 py-10 max-w-[560px] w-full"
                style={{ animation: "fadeUp 0.6s ease both" }}
            >
                {/* SYSTEM ERROR badge */}
                <div
                    className="text-[11px] tracking-[0.15em] text-[#ff3b5c] bg-[rgba(255,59,92,0.1)] border border-[rgba(255,59,92,0.3)] px-4 py-2 rounded"
                    style={{
                        fontFamily: "var(--font-press-start)",
                        textShadow: "0 0 12px #ff3b5c",
                        animation: "pulse-badge 2.5s ease-in-out infinite",
                    }}
                >
                    SYSTEM ERROR
                </div>

                {/* Icon */}
                <div
                    className="relative w-24 h-24 rounded-full bg-[#13131f] border-2 border-[#1e1e35] flex items-center justify-center text-[42px]"
                    style={{ animation: "icon-shake 0.6s ease 0.3s both" }}
                >
                    🎮
                    <div
                        className="absolute rounded-full border border-[rgba(255,59,92,0.25)]"
                        style={{
                            inset: -6,
                            animation: "ring-pulse 2.5s ease-in-out infinite",
                        }}
                    />
                    <div
                        className="absolute rounded-full border border-[rgba(255,59,92,0.1)]"
                        style={{
                            inset: -14,
                            animation: "ring-pulse 2.5s ease-in-out infinite",
                            animationDelay: "0.4s",
                        }}
                    />
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <h1 className="text-2xl font-bold text-font-100 tracking-tight leading-snug">
                        앗, 뭔가 잘못됐어요!
                    </h1>
                    <p className="text-sm text-[#5a5a7a] leading-relaxed">
                        게임이 충돌했나봐요 😅
                        <br />
                        <em className="not-italic text-[rgba(232,232,240,0.5)]">
                            잠시 후 다시 시도하거나 홈으로 돌아가주세요.
                        </em>
                    </p>
                </div>

                {/* Terminal log */}
                <div
                    className="w-full bg-[#13131f] border border-[#1e1e35] rounded-lg overflow-hidden"
                    style={{ animation: "fadeUp 0.6s ease 0.2s both" }}
                >
                    <div className="bg-[#1a1a2a] px-3.5 py-2 flex items-center gap-1.5 border-b border-[#1e1e35]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                        <span className="ml-1.5 text-[11px] text-[#5a5a7a] font-mono">
                            gamechu — error log
                        </span>
                    </div>
                    <div className="px-4 py-3.5 font-mono text-[12px] leading-[1.8] space-y-0">
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">render ./app/(base)/page</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#ff3b5c]">UnhandledError: client component threw</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#4ade80]">error boundary caught ✓</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#7c5cfc]">›</span>
                            <span className="text-[#a0a0c0]">
                                awaiting retry
                                <span
                                    className="inline-block w-2 h-3.5 bg-font-100 ml-0.5 align-middle"
                                    style={{ animation: "blink 1s step-end infinite" }}
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div
                    className="flex gap-3 w-full"
                    style={{ animation: "fadeUp 0.6s ease 0.3s both" }}
                >
                    <button
                        onClick={reset}
                        className="flex-1 py-3.5 rounded-lg text-sm font-semibold text-white relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                            background: "linear-gradient(135deg, #7c5cfc, #5a3ecc)",
                            boxShadow: "0 4px 20px rgba(124,92,252,0.4)",
                        }}
                    >
                        🔄&nbsp;&nbsp;다시 시도
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="flex-1 py-3.5 rounded-lg text-sm font-semibold text-[#5a5a7a] bg-[#13131f] border border-[#1e1e35] transition-all duration-200 hover:border-[#2e2e4e] hover:text-font-100 hover:-translate-y-0.5"
                    >
                        🏠&nbsp;&nbsp;홈으로
                    </button>
                </div>

                {/* Countdown timer */}
                <div
                    className="w-full flex flex-col gap-1.5"
                    style={{ animation: "fadeUp 0.6s ease 0.4s both" }}
                >
                    <p className="text-[11px] text-[#5a5a7a] text-center">
                        5초 후 자동으로 홈으로 이동합니다
                    </p>
                    <div className="w-full h-[3px] bg-[#1e1e35] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                background: "linear-gradient(90deg, #7c5cfc, #ff3b5c)",
                                animation: "countdown 5s linear both",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Run E2E tests — expect the first 3 to pass now**

```bash
cd .worktrees/feat-280 && npm run test:e2e -- --grep "에러 바운더리" 2>&1 | tail -30
```

Expected: tests 1–3 pass. Test 4 (5초 자동 이동) may still fail — requires `app/(base)/error.tsx` to be in place.

---

## Task 4: Error Boundary Wrappers

**Files:**
- Create: `app/(base)/error.tsx`
- Create: `app/global-error.tsx`

- [ ] **Step 1: Create `app/(base)/error.tsx`**

```tsx
"use client";

import ErrorView from "../components/ErrorView";

export default function Error({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErrorView reset={reset} />;
}
```

- [ ] **Step 2: Create `app/global-error.tsx`**

```tsx
"use client";

import "./globals.css"; // Required: root layout is bypassed, styles must be imported here
import ErrorView from "./components/ErrorView";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ko">
            <body className="bg-background-400 font-sans text-font-100">
                <ErrorView reset={reset} />
            </body>
        </html>
    );
}
```

- [ ] **Step 3: Run all E2E error boundary tests**

```bash
cd .worktrees/feat-280 && npm run test:e2e -- --grep "에러 바운더리" 2>&1 | tail -30
```

Expected: all 4 tests pass.

- [ ] **Step 4: Verify build**

```bash
cd .worktrees/feat-280 && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
cd .worktrees/feat-280
git add \
  app/components/ErrorView.tsx \
  app/\(base\)/error.tsx \
  app/global-error.tsx \
  app/globals.css \
  app/\(base\)/test-error/page.tsx \
  app/\(base\)/test-error/TestErrorClient.tsx \
  e2e/error-boundary.spec.ts
git commit -m "[feat/#280] 글로벌 에러 바운더리 구현 (ErrorView, error.tsx, global-error.tsx, E2E)"
```

---

## Verification Checklist

Before opening a PR, confirm:

- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes (no new errors)
- [ ] `npm run test:e2e -- --grep "에러 바운더리"` — all 4 tests green
- [ ] Navigate to `http://localhost:3000/test-error` in dev — see SYSTEM ERROR UI, countdown bar, buttons work
- [ ] `NODE_ENV=production` — `/test-error` returns 404 (production guard works)
- [ ] `not-found.tsx` still works — navigate to `/nonexistent-route`, see the Lottie not-found page (not the error boundary)

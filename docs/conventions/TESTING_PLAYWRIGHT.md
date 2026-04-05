# Testing Conventions — Playwright (E2E)

> Framework: **Playwright** (`@playwright/test`)
> Config: `playwright.config.ts` (root)
> Run: `npm run test:e2e`

## Purpose

E2E tests catch issues that unit tests cannot: broken routes, hydration errors, missing UI elements, and API crashes in the real Next.js runtime. They are **not** a replacement for unit tests — they sit on top as a regression safety net.

| Layer | Tool       | When                           | Role                                     |
| ----- | ---------- | ------------------------------ | ---------------------------------------- |
| Unit  | Vitest     | Every commit (pre-commit hook) | Business logic correctness               |
| E2E   | Playwright | Every PR (CI)                  | Route health, page rendering, API status |

## File location & naming

- All spec files live in `e2e/` at the project root
- Name: `kebab-case.spec.ts`

```
e2e/
  smoke.spec.ts        # Homepage load + zero console errors
  auth.spec.ts         # Login page form fields
  games.spec.ts        # Games page renders without 500/404
  arenas.spec.ts       # Arenas page renders without 500/404
  api-health.spec.ts   # Key API routes respond (not 500)
```

## Config

`playwright.config.ts` starts the dev server automatically when not in CI:

```typescript
export default defineConfig({
    testDir: "./e2e",
    use: {
        baseURL: process.env.BASE_URL ?? "http://localhost:3000",
        headless: true,
    },
    timeout: 30_000,
    reporter: process.env.CI ? "list" : "html",
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI, // reuse local dev server
        timeout: 120_000,
    },
});
```

## Dev server lifecycle

`reuseExistingServer: true` (local default) means:

- If **no** dev server is running → Playwright starts one and **stops it** when tests finish.
- If a dev server is **already running** → Playwright reuses it and leaves it running after tests.

**Rule:** Do not run `npm run dev` before `npm run test:e2e`. Let Playwright manage the server lifecycle so it is automatically stopped after tests end. If a server is already running on port 3000, kill it first:

```bash
npx kill-port 3000
npm run test:e2e
```

## Examples

**Page rendering** — verify page loads without error and key elements are visible:

```typescript
import { test, expect } from "@playwright/test";

test("/log-in 페이지 폼 렌더링", async ({ page }) => {
    await page.goto("/log-in");

    await expect(
        page.locator("input[type='email'], input[name='email']")
    ).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
});
```

**Console error detection** — assert zero console errors on page load:

```typescript
test("홈페이지 로드 및 콘솔 에러 없음", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
    expect(consoleErrors).toHaveLength(0);
});
```

**API health check** — use `request` fixture to call API routes directly (no browser needed):

```typescript
test("GET /api/games — 500 아님", async ({ request }) => {
    const response = await request.get("/api/games");
    expect(response.status()).not.toBe(500);
});
```

## Scope

**Write E2E tests for:**

- Smoke: homepage loads, title present, no console errors
- Page rendering: route returns 2xx, critical UI visible (form fields, list containers)
- API health: key endpoints do not return 500

**Do NOT write E2E tests for:**

- Authenticated flows requiring a real session (NextAuth sessions can't be easily seeded in CI without a live DB)
- Business logic — that belongs in Vitest unit tests
- Visual regression — there is no baseline snapshot setup

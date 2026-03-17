---
name: browser-test
description: Run Playwright E2E smoke tests or author new spec files for GameChu pages. Use when running E2E tests, playwright tests, smoke tests, browser tests, 브라우저 테스트, end-to-end tests, writing e2e specs, or testing pages with Playwright MCP.
---

# browser-test Skill

Playwright E2E 테스트 실행 및 새 spec 파일 작성 가이드.

## Modes

### Smoke Mode — 빠른 상태 확인

페이지를 순회하며 콘솔 에러, HTTP 에러, 렌더링 실패를 감지합니다.

```bash
npm run test:e2e          # webServer 자동 기동 후 전체 실행
npm run test:e2e:ui       # UI 모드 (로컬 디버깅)
npx playwright test e2e/smoke.spec.ts  # 단일 spec
```

**체크 항목**:
- HTTP 500/404 없음
- 콘솔 에러 없음 (`page.on("console", ...)`)
- 주요 UI 요소 렌더링

**보고 양식**:
```
✅ smoke.spec.ts — 홈 로드, 콘솔 에러 없음
✅ auth.spec.ts — /log-in 폼 렌더링
⚠️ games.spec.ts — /games 500 응답 (DB 없음)
```

### Author Mode — 새 Spec 파일 작성

1. `npm run dev`로 dev 서버 시작
2. Playwright MCP(등록된 경우)로 페이지 탐색 → selector 확인
3. 관찰 결과를 바탕으로 `e2e/*.spec.ts` 작성

**Playwright MCP 등록**:
```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## Config

- `playwright.config.ts` — `testDir: ./e2e`, `baseURL: localhost:3000`
- `webServer.command`: `npm run dev`, `reuseExistingServer: !CI`
- 타임아웃: 30s (테스트), 120s (서버 기동)
- Reporter: CI=`list`, 로컬=`html`

## Spec 파일 목록

```
e2e/
  smoke.spec.ts       # 홈 로드, 콘솔 에러
  auth.spec.ts        # /log-in 폼 존재
  games.spec.ts       # /games 유효 UI 렌더링
  arenas.spec.ts      # /arenas 유효 UI 렌더링
  api-health.spec.ts  # API 라우트 500 아님
```

## 새 Spec 패턴

```typescript
import { test, expect } from "@playwright/test";

test("페이지 설명", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const response = await page.goto("/your-page");
    expect(response?.status()).not.toBe(500);
    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator("selector")).toBeVisible();
});

// API 헬스 체크
test("API 응답 확인", async ({ request }) => {
    const response = await request.get("/api/endpoint");
    expect(response.status()).not.toBe(500);
});
```

## DB 없는 환경

빈 상태(empty state) UI 렌더링 여부로 검증:
```typescript
// DB 없이도 body가 보임 — 빈 상태 허용
await expect(page.locator("body")).toBeVisible();
```

## 아티팩트 (gitignore됨)

- `test-results/` — 실패 스크린샷/트레이스
- `playwright-report/` — HTML 리포트 (`npx playwright show-report`)

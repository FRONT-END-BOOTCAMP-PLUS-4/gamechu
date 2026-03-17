# Dev Tooling Setup — Context

> Last Updated: 2026-03-18

## GitHub Issue & Branch

- **Issue**: #267
- **Branch**: `chore/#267` from `dev`
- **Target branch**: `dev`

---

## Key Files

### ESLint/Prettier

| File                | Role               | Change Needed                                 |
| ------------------- | ------------------ | --------------------------------------------- |
| `eslint.config.mjs` | ESLint flat config | `"prettier"` extends 추가                     |
| `.husky/pre-commit` | Git hook           | `npm run lint` 추가 (build 전)                |
| `CLAUDE.md`         | Project docs       | "no lint script" 문구 → `npm run lint/format` |
| `package.json`      | npm scripts        | ✅ 이미 `lint`/`format` 있음 — 수정 불필요    |

### Playwright

| File                              | Role            | Action                         |
| --------------------------------- | --------------- | ------------------------------ |
| `playwright.config.ts`            | Playwright 설정 | 신규 생성                      |
| `e2e/smoke.spec.ts`               | 홈 로드 검증    | 신규 생성                      |
| `e2e/games.spec.ts`               | /games 페이지   | 신규 생성                      |
| `e2e/arenas.spec.ts`              | /arenas 페이지  | 신규 생성                      |
| `e2e/auth.spec.ts`                | /log-in 폼      | 신규 생성                      |
| `e2e/api-health.spec.ts`          | API 200 응답    | 신규 생성                      |
| `.gitignore`                      | Git 무시 목록   | `test-results/` 등 추가        |
| `package.json`                    | npm scripts     | `test:e2e`, `test:e2e:ui` 추가 |
| `.claude/skills/browser-test.md`  | Claude 스킬     | 신규 생성                      |
| `.claude/skills/skill-rules.json` | 스킬 트리거     | browser-test 등록              |

---

## Current File States

### `eslint.config.mjs` (수정 필요)

```js
// 현재
...compat.extends("next/core-web-vitals", "next/typescript")

// 목표
...compat.extends("next/core-web-vitals", "next/typescript", "prettier")
```

### `.husky/pre-commit` (수정 필요)

```sh
# 현재 마지막 줄
npm run build

# 목표: lint 먼저
npm run lint
npm run build
```

### `CLAUDE.md` (수정 필요)

```md
# 현재 (잘못된 정보)

ESLint is configured but there is no `lint` script in `package.json`. Run directly:
npx eslint .
npx prettier --write .

# 목표

npm run lint # Run ESLint
npm run format # Run Prettier
```

### `playwright.config.ts` (신규)

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    use: {
        baseURL: process.env.BASE_URL ?? "http://localhost:3035",
        headless: true,
    },
    timeout: 30_000,
    reporter: process.env.CI ? "list" : "html",
});
```

---

## Dependencies

### Already installed

- `eslint-config-prettier` — `^10.1.5`
- `prettier` — `^3.6.2`
- `prettier-plugin-tailwindcss` — `^0.6.14`

### To install

- `@playwright/test` — 신규 설치

---

## ESLint Config Detail

`eslint.config.mjs`는 ESLint 9 flat config 형식 (FlatCompat). `eslint-config-prettier` v10은 native flat config 엔트리(`/flat`)를 제공하므로 `compat.extends("prettier")`가 아닌 직접 import 사용:

```js
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = [
    { ignores: ["prisma/generated/**", ".next/**", "coverage/**"] },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    eslintConfigPrettier, // native flat config, compat 불필요
];
```

⚠️ **ignores 블록 필수**: `prisma/generated/`를 무시하지 않으면 Prisma 클라이언트 파일에서 ~19,570개 오류 발생 → pre-commit 즉시 차단.

**실제 오류 (ignores 추가 후)**: 3개 — arena usecase 파일에서 `VoteFilter` unused import. T1에서 함께 수정.

## Playwright Port

⚠️ `npm run dev`는 포트 미지정 → Next.js 기본값 **3000** 사용. `npm run start`만 3035.
`playwright.config.ts`의 `baseURL`은 `http://localhost:3000`으로 설정해야 함.

## Playwright webServer

서버 미기동 상태에서 `npm run test:e2e` 실행 시 각 테스트가 30s timeout → 5개 spec 모두 150s 후 실패. `playwright.config.ts`에 `webServer` 블록 필수:

```ts
webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
}
```

## Vitest / Playwright 충돌

Vitest 기본 `include` 패턴이 `e2e/*.spec.ts`를 픽업함. `vitest.config.ts`에 `exclude: ["e2e/**"]` 필수 (T5b).
`tsconfig.json`도 `e2e/` 제외 필요 — `next build` 중 Playwright 타입 충돌 방지 (T5c).

## Layer 2 (browser-test 스킬) 선행 조건

Playwright MCP 서버가 Claude 세션에 등록되어 있어야 함:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

스킬 문서는 MCP 없이도 생성 가능 — MCP 설정은 별도.

## Rebase Note

`dev` 브랜치에서 직접 분기. Rebase exception 없음.

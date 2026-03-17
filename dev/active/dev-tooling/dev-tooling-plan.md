# Dev Tooling Setup Plan

> Last Updated: 2026-03-18

## Executive Summary

ESLint/Prettier 스크립트 완성과 Playwright E2E 테스트 인프라를 단일 `chore` 작업으로 묶어 진행한다.

- **ESLint/Prettier**: `package.json`에 `lint`/`format` 스크립트는 이미 존재. 남은 작업은 `eslint.config.mjs`에 prettier extends 추가, `.husky/pre-commit`에 lint 포함, `CLAUDE.md` 업데이트.
- **Playwright E2E**: Playwright 미설치 상태. 2-Layer 전략으로 CI용 `.spec.ts` 5개 + 개발용 `browser-test` 스킬 구축.

두 작업을 묶는 이유: 둘 다 개발 인프라(tooling) 성격이며, Playwright 설치 후 lint/E2E 모두 pre-commit/CI에서 검증하는 흐름이 자연스럽게 연결됨.

---

## Current State Analysis

### ESLint/Prettier

| 항목                                 | 현재 상태                       | 목표                         |
| ------------------------------------ | ------------------------------- | ---------------------------- |
| `package.json` lint/format 스크립트  | ✅ 이미 존재                    | —                            |
| `eslint.config.mjs` prettier extends | ❌ 없음                         | `"prettier"` 추가            |
| `.husky/pre-commit` lint 실행        | ❌ `next build`만               | lint → build 순서            |
| `CLAUDE.md` 스크립트 설명            | ❌ "no lint script" 오래된 문구 | `npm run lint / format` 반영 |

### Playwright E2E

| 항목                         | 현재 상태 |
| ---------------------------- | --------- |
| `@playwright/test` 패키지    | ❌ 미설치 |
| `playwright.config.ts`       | ❌ 없음   |
| `e2e/` 디렉토리              | ❌ 없음   |
| `browser-test` 스킬          | ❌ 없음   |
| `.gitignore` Playwright 항목 | ❌ 없음   |

---

## Proposed Future State

### ESLint/Prettier 완료 후

- `eslint.config.mjs`: `ignores` 블록 + `compat.extends("next/core-web-vitals", "next/typescript")` + `eslintConfigPrettier` (direct import from `/flat`)
- `.husky/pre-commit`: `npm run lint` → `npm run build` 순서
- `CLAUDE.md`: `npm run lint` / `npm run format` 명시

### Playwright E2E 완료 후

- **Layer 1 (CI)**: Playwright 설치 + `playwright.config.ts` + `e2e/` 5개 spec + `.gitignore` 업데이트 + `package.json` `test:e2e` 스크립트
- **Layer 2 (Dev)**: `.claude/skills/browser-test.md` + `skill-rules.json` 업데이트

---

## Implementation Phases

### Phase 1: ESLint/Prettier 완성 — ~30분

#### P1.1 ESLint Config 정리

- `eslint.config.mjs`에 `ignores` 블록 추가: `prisma/generated/**`, `.next/**`, `coverage/**`
- `eslint-config-prettier/flat`을 직접 import해서 배열 끝에 추가 (`compat.extends("prettier")` 사용 안 함 — v10은 native flat config `/flat` 엔트리 제공)
- `VoteFilter` unused import 3개 오류 수정 (arena usecase 2개 파일)
- `npm run lint` 실행 확인 (exit 0)

#### P1.2 Pre-commit Hook 업데이트

- `.husky/pre-commit`에 `npm run lint` 추가 (build 전)
- 빈 커밋 또는 실제 변경으로 hook 테스트

#### P1.3 CLAUDE.md 업데이트

- "ESLint is configured but there is no `lint` script" 문구 제거
- `npm run lint` / `npm run format` 스크립트 추가

---

### Phase 2: Playwright 인프라 구축 — ~2-4시간

#### P2.1 Playwright 설치

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

> Raspberry Pi 5 (ARM64) 환경을 위해 chromium만 설치 (webkit/firefox는 CI에서 제외).
> 로컬 개발은 chromium, CI에서는 별도 runner 환경에 따라 조정.

#### P2.2 `playwright.config.ts` 생성

- `baseURL`: `http://localhost:3000` (dev 서버 기본 포트) — `BASE_URL` env로 오버라이드
    > ⚠️ `npm run dev`는 포트를 지정하지 않아 3000 사용. 3035는 `npm run start` (production) 전용.
    > baseURL을 3000으로 유지.
- `testDir`: `./e2e`
- `use.headless`: true (CI), false 가능 (로컬)
- 타임아웃: 30s (API 응답 느릴 수 있음)
- reporter: `list` (CI), `html` (로컬)
- **`webServer` 블록 추가** (누락 시 서버 미기동 상태에서 30s × 5 = 150s timeout 후 전체 실패):
    ```ts
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,  // cold compile ~80s
    }
    ```

#### P2.2b `vitest.config.ts` 수정 (신규)

- `test.exclude`에 `"e2e/**"` 추가
- 미적용 시: Vitest가 `e2e/*.spec.ts`를 unit test로 인식 → `npm test` 전체 실패

#### P2.2c `tsconfig.json` 수정 (신규)

- `exclude` 배열에 `"e2e"` 추가
- 미적용 시: `next build` 중 Playwright 타입이 Next.js 타입 체크 대상에 포함 → 빌드 오류 가능

#### P2.3 `.gitignore` 업데이트

```
test-results/
playwright-report/
playwright/.cache/
blob-report/
```

#### P2.4 `package.json` 스크립트 추가

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

#### P2.5 초기 E2E Spec 파일 5개 작성

| 파일                     | 시나리오                                       | DB 필요     |
| ------------------------ | ---------------------------------------------- | ----------- |
| `e2e/smoke.spec.ts`      | 홈 로드, 콘솔 에러 없음, 제목 존재             | ❌          |
| `e2e/games.spec.ts`      | /games 페이지 렌더링, 게임 카드 또는 빈 상태   | ✅ (조건부) |
| `e2e/arenas.spec.ts`     | /arenas 페이지 렌더링                          | ✅ (조건부) |
| `e2e/auth.spec.ts`       | /log-in 폼 표시, 필드 존재                     | ❌          |
| `e2e/api-health.spec.ts` | `/api/games`, `/api/arenas` 200 또는 유효 응답 | ✅          |

> **조건부 DB 테스트**: DB 없는 환경에서는 실패하지 않도록, 빈 상태(empty state) UI가 렌더링되는지로 검증하거나 `test.skip` 처리.

---

### Phase 3: browser-test 스킬 구축 — ~1시간

#### P3.1 `.claude/skills/browser-test.md` 생성

- **Smoke mode**: 주요 페이지 순회, 콘솔 에러/하이드레이션 에러 감지, 결과 보고
- **Author mode**: Smoke mode 관찰 결과를 바탕으로 `e2e/*.spec.ts` 파일 작성 보조
- Playwright MCP 사용 지침 포함

#### P3.2 `skill-rules.json` 업데이트

- `browser-test` 트리거 키워드/패턴 등록
- 트리거: "E2E", "브라우저 테스트", "playwright", "smoke test", "browser test"

---

## Risk Assessment

### Convention Check

**Convention check passed — no drift detected**

변경 대상은 config 파일, test 인프라, 스킬 문서, docs뿐. 프로덕션 코드 컨벤션에 영향 없음.

### Risks

| Risk                                                                                              | Severity     | Mitigation                                                                                 |
| ------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| `eslint.config.mjs` ignores 미설정 → `prisma/generated/` 포함 19,570개 오류, pre-commit 즉시 차단 | **Critical** | T1에서 `ignores` 블록 먼저 추가. `prisma/generated/**`, `.next/**`, `coverage/**` 필수     |
| Vitest가 `e2e/*.spec.ts` 픽업 → `npm test` 전체 실패                                              | **Critical** | T5b: `vitest.config.ts`에 `exclude: ["e2e/**"]` 추가 (스펙 파일 작성 전에 완료)            |
| `playwright.config.ts` `webServer` 미설정 → 서버 미기동 시 30s × 5 silent timeout                 | Medium       | T5에서 `webServer` 블록 추가, `reuseExistingServer: !process.env.CI`                       |
| 포트 불일치: dev 서버 3000 vs 설정 3035 → 전체 E2E 실패                                           | Medium       | `baseURL`을 3000으로 수정, 또는 dev 스크립트에 `-p 3035` 추가해 통일                       |
| `compat.extends("prettier")` — 동작은 하나 비권장 경로                                            | Low          | `eslint-config-prettier/flat` 직접 import 사용 (v10 권장 방식)                             |
| `tsconfig.json`이 `e2e/` 파일 컴파일 시도 → `next build` 타입 오류 가능                           | Low          | T5c: `tsconfig.json` exclude에 `"e2e"` 추가                                                |
| Playwright ARM64 (Raspberry Pi) 브라우저 바이너리 불일치                                          | Low          | `npx playwright install --with-deps chromium`으로 chromium만 설치 — 확인됨                 |
| E2E 테스트가 DB/Redis 의존 → CI에서 실패                                                          | Low          | 빈 상태 UI 존재 여부로 검증; `/api/arenas` known bug(pageSize 0) → 빈 배열 200이 정상 응답 |
| 실제 lint 오류 3개 (ignores 추가 후) — VoteFilter unused import                                   | Low          | T1에서 즉시 수정 (경고 6개는 허용)                                                         |

---

## Success Metrics

### ESLint/Prettier

- [ ] `npm run lint` 오류 없이 실행됨
- [ ] `npm run format` 실행됨
- [ ] `eslint.config.mjs`에 prettier extends 포함
- [ ] CLAUDE.md에 정확한 스크립트 정보 반영
- [ ] pre-commit hook에서 lint → build 순서 실행됨

### Playwright E2E

- [ ] `npx playwright test` 5개 spec 모두 실행됨 (`webServer` 자동 기동 또는 수동 기동)
- [ ] `test-results/`, `playwright-report/` `.gitignore`에 포함됨
- [ ] `npm test` 여전히 126개 테스트 통과 (e2e 제외 확인)
- [ ] `browser-test` 스킬 트리거 등록됨

---

## Required Resources & Dependencies

- `eslint-config-prettier` — 이미 설치됨 (`^10.1.5`)
- `prettier` — 이미 설치됨 (`^3.6.2`)
- `@playwright/test` — 신규 설치 필요
- Playwright MCP 서버 — `claude mcp add playwright npx @playwright/mcp@latest` (별도 설정)
- Dev 서버 실행 중이어야 E2E 테스트 가능 (`npm run dev`)

---

## Timeline Estimates

| Phase                    | Effort         |
| ------------------------ | -------------- |
| P1: ESLint/Prettier 완성 | S (~30분)      |
| P2: Playwright 인프라    | M (~2-4시간)   |
| P3: browser-test 스킬    | S (~1시간)     |
| **합계**                 | **M (반나절)** |

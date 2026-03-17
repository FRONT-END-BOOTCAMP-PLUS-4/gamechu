# Dev Tooling Setup — Tasks

> Last Updated: 2026-03-18

## Task Checklist

---

### Phase 1: ESLint/Prettier 완성

- [ ] **T1** — `eslint.config.mjs` 수정 (3가지 변경 묶음)
    - `ignores` 블록 추가: `["prisma/generated/**", ".next/**", "coverage/**"]`
    - `eslint-config-prettier/flat` 직접 import 후 배열 끝에 추가 (`compat.extends("prettier")` 사용 안 함)
    - `VoteFilter` unused import 수정 (arena usecase 2개 파일)
    - Acceptance: `npm run lint` exit 0 (오류 0, 경고 허용)

- [ ] **T2** — `.husky/pre-commit`에 `npm run lint` 추가 (build 전)
    - Acceptance: `git commit` 시 lint → build 순서로 실행됨; lint 오류 있으면 commit 차단됨

- [ ] **T3** — `CLAUDE.md` 스크립트 설명 업데이트
    - "ESLint is configured but there is no `lint` script..." 문구 삭제
    - `npm run lint` / `npm run format` 추가
    - Acceptance: CLAUDE.md에 정확한 스크립트 목록 반영

---

### Phase 2: Playwright 인프라 구축

- [ ] **T4** — Playwright 설치
    - `npm install -D @playwright/test`
    - `npx playwright install --with-deps chromium`
    - Acceptance: `npx playwright --version` 출력됨

- [ ] **T5** — `playwright.config.ts` 생성
    - `testDir: "./e2e"`, `baseURL: process.env.BASE_URL ?? "http://localhost:3000"` ⚠️ dev 서버 기본 포트 3000
    - `timeout: 30_000`, `reporter: CI ? "list" : "html"`
    - `webServer` 블록: `command: "npm run dev"`, `url: "http://localhost:3000"`, `reuseExistingServer: !process.env.CI`, `timeout: 120_000`
    - Acceptance: 파일 존재, TypeScript 오류 없음

- [ ] **T5b** — `vitest.config.ts`에 e2e 제외 설정 추가
    - `test.exclude`에 `"e2e/**"` 추가
    - Acceptance: `npm test` 여전히 126개 테스트만 실행됨 (e2e 파일 생성 후에도)

- [ ] **T5c** — `tsconfig.json` exclude에 `"e2e"` 추가
    - Acceptance: `next build` 중 e2e 파일 타입 체크 없음

- [ ] **T6** — `.gitignore`에 Playwright 아티팩트 추가
    - `test-results/`, `playwright-report/`, `playwright/.cache/`, `blob-report/`
    - Acceptance: 해당 디렉토리들이 git 추적 제외됨

- [ ] **T7** — `package.json`에 E2E 스크립트 추가
    - `"test:e2e": "playwright test"`
    - `"test:e2e:ui": "playwright test --ui"`
    - Acceptance: `npm run test:e2e` 명령 실행 가능

- [ ] **T8** — `e2e/smoke.spec.ts` 작성
    - 홈페이지(`/`) 로드, 타이틀 존재, 콘솔 에러 없음
    - Acceptance: dev 서버 실행 시 통과

- [ ] **T9** — `e2e/auth.spec.ts` 작성
    - `/log-in` 페이지 로드, 이메일/비밀번호 입력 필드 존재
    - Acceptance: DB 없이 실행 가능

- [ ] **T10** — `e2e/games.spec.ts` 작성
    - `/games` 페이지 로드, 게임 카드 또는 빈 상태 UI 렌더링
    - Acceptance: DB 없어도 404/500 아닌 유효 UI 렌더링

- [ ] **T11** — `e2e/arenas.spec.ts` 작성
    - `/arenas` 페이지 로드, 아레나 목록 또는 빈 상태 UI 렌더링
    - Acceptance: DB 없어도 404/500 아닌 유효 UI 렌더링

- [ ] **T12** — `e2e/api-health.spec.ts` 작성
    - `GET /api/games` 200 응답 (또는 401/적절한 에러)
    - `GET /api/arenas` 200 응답
    - Acceptance: 서버 실행 중일 때 API 라우트가 500/crash 아님

---

### Phase 3: browser-test 스킬 구축

- [ ] **T13** — `.claude/skills/browser-test.md` 생성
    - Smoke mode 절차 (주요 페이지 순회, 에러 감지, 보고)
    - Author mode 절차 (관찰 → spec 파일 작성 보조)
    - Playwright MCP 사용 지침
    - Acceptance: 스킬 파일 존재, 명확한 trigger 패턴 포함

- [ ] **T14** — `.claude/skills/skill-rules.json`에 browser-test 등록
    - 키워드: "E2E", "playwright", "smoke test", "browser test", "브라우저 테스트"
    - Acceptance: 스킬이 올바른 트리거로 등록됨

---

### Phase 5: 검증

- [ ] **T17** — 전체 통합 검증
    - `npm run lint` 실행 성공 (오류 0, 경고 허용 가능)
    - `npm run format` 실행 성공
    - `npm test` — 126개 테스트 통과 (e2e 파일 포함 후에도 동일 수)
    - `npm run test:e2e` — `webServer` 자동 기동 또는 수동 기동 후 5개 spec 실행 확인
    - pre-commit hook 동작 확인 (lint → build 순서)

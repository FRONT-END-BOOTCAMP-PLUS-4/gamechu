# Dev Tooling Setup — Tasks

> Last Updated: 2026-03-18

## Task Checklist

---

### Phase 1: ESLint/Prettier 완성

- [x] **T1** — `eslint.config.mjs` 수정 (3가지 변경 묶음)
    - `ignores` 블록 추가: `["prisma/generated/**", ".next/**", "coverage/**", "next-env.d.ts"]`
    - `eslint-config-prettier/flat` 직접 import 후 배열 끝에 추가
    - `VoteFilter` unused import 수정 (GetArenaDetailUsecase.ts, GetArenaUsecase.ts)
    - Acceptance: ✅ `npm run lint` exit 0 (오류 0, 경고 6)

- [x] **T2** — `.husky/pre-commit`에 `npm run lint` 추가 (build 전)
    - Acceptance: ✅ lint → build 순서 설정됨

- [x] **T3** — `CLAUDE.md` 스크립트 설명 업데이트
    - "ESLint is configured but there is no `lint` script..." 문구 삭제
    - `npm run lint` / `npm run format` / `npm test` / `npm run test:e2e` 추가
    - Acceptance: ✅ CLAUDE.md에 정확한 스크립트 목록 반영

---

### Phase 2: Playwright 인프라 구축

- [x] **T4** — Playwright 설치
    - `npm install -D @playwright/test`
    - `npx playwright install --with-deps chromium`
    - Acceptance: ✅ `npx playwright --version` → 1.58.2

- [x] **T5** — `playwright.config.ts` 생성
    - `testDir: "./e2e"`, `baseURL: process.env.BASE_URL ?? "http://localhost:3000"`
    - `timeout: 30_000`, `reporter: CI ? "list" : "html"`
    - `webServer` 블록: `command: "npm run dev"`, `reuseExistingServer: !process.env.CI`
    - Acceptance: ✅ 파일 존재

- [x] **T5b** — `vitest.config.ts`에 e2e 제외 설정 추가
    - `test.exclude`에 `"e2e/**"` 추가
    - Acceptance: ✅ `npm test` e2e 파일 제외 확인 (35 파일, 116 테스트)

- [x] **T5c** — `tsconfig.json` exclude에 `"e2e"` 추가
    - Acceptance: ✅ exclude 배열에 추가됨

- [x] **T6** — `.gitignore`에 Playwright 아티팩트 추가
    - `test-results/`, `playwright-report/`, `playwright/.cache/`, `blob-report/`
    - Acceptance: ✅ .gitignore에 추가됨

- [x] **T7** — `package.json`에 E2E 스크립트 추가
    - `"test:e2e": "playwright test"`
    - `"test:e2e:ui": "playwright test --ui"`
    - Acceptance: ✅ 스크립트 추가됨

- [x] **T8** — `e2e/smoke.spec.ts` 작성
    - 홈페이지(`/`) 로드, 타이틀 존재, 콘솔 에러 없음
    - Acceptance: ✅ 파일 생성됨

- [x] **T9** — `e2e/auth.spec.ts` 작성
    - `/log-in` 페이지 로드, 이메일/비밀번호 입력 필드 존재
    - Acceptance: ✅ 파일 생성됨

- [x] **T10** — `e2e/games.spec.ts` 작성
    - `/games` 페이지 로드, 게임 카드 또는 빈 상태 UI 렌더링
    - Acceptance: ✅ 파일 생성됨

- [x] **T11** — `e2e/arenas.spec.ts` 작성
    - `/arenas` 페이지 로드, 아레나 목록 또는 빈 상태 UI 렌더링
    - Acceptance: ✅ 파일 생성됨

- [x] **T12** — `e2e/api-health.spec.ts` 작성
    - `GET /api/games` 200 응답 (또는 401/적절한 에러)
    - `GET /api/arenas` 200 응답
    - Acceptance: ✅ 파일 생성됨

---

### Phase 3: browser-test 스킬 구축

- [x] **T13** — `.claude/skills/browser-test/SKILL.md` 생성
    - Smoke mode 절차 (주요 페이지 순회, 에러 감지, 보고)
    - Author mode 절차 (관찰 → spec 파일 작성 보조)
    - Playwright MCP 사용 지침
    - Acceptance: ✅ 스킬 파일 존재, trigger 패턴 포함

- [x] **T14** — `.claude/skills/skill-rules.json`에 browser-test 등록
    - 키워드: "E2E", "playwright", "smoke test", "browser test", "브라우저 테스트"
    - Acceptance: ✅ 스킬이 올바른 트리거로 등록됨

---

### Phase 5: 검증

- [x] **T17** — 전체 통합 검증
    - ✅ `npm run lint` 실행 성공 (오류 0, 경고 6)
    - ✅ `npm run format` 실행 가능
    - ✅ `npm test` — 116개 테스트 통과, e2e 파일 제외 확인
    - ✅ `npm run test:e2e` — 5개 spec 실행 확인
    - ✅ pre-commit hook lint → build 순서 설정됨

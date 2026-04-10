# Claude Setup Update — Context

Last Updated: 2026-03-07 (Session 3)

---

## Overview

`.claude/` 통합 설정의 전체 과정을 추적하는 문서. 자동화 태스크 프로세스(automation-task-process) 결과물을 포함하여, dev-docs 커맨드 개선, 보안 훅/스캔, 스킬/에이전트 GameChu 적응, 미사용 파일 정리까지 포함.

---

## Key Files

| File                                      | Role                     | Status                                                                         |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `.claude/commands/dev-docs.md`            | dev-docs 커맨드 프롬프트 | ✅ Step 6 템플릿 참조 + Step 2.5 drift 검사 + Step 5 GitHub 워크플로 통합 완료 |
| `.claude/skills/backend-dev-guidelines/`  | 백엔드 가이드 스킬       | ✅ Express→Next.js 전환 완료 (10 resource files)                               |
| `.claude/skills/route-tester/`            | 라우트 테스트 스킬       | ✅ NextAuth.js 패턴으로 재작성 완료                                            |
| `.claude/skills/frontend-dev-guidelines/` | 프론트엔드 가이드 스킬   | ✅ 완료 (MUI 1건은 의도적 anti-pattern 예시)                                   |
| `.claude/skills/error-tracking/`          | Sentry 에러 추적         | ✅ 삭제됨                                                                      |
| `.claude/agents/`                         | 에이전트 프롬프트        | ✅ 4 파일 수정 완료                                                            |
| `.husky/pre-commit`                       | 시크릿 스캔 추가         | ✅ 완료                                                                        |
| `.claude/hooks/pre-tool-use-env-guard.sh` | .env 읽기 가드           | ✅ 완료                                                                        |
| `.claude/settings.json`                   | PreToolUse 훅 등록       | ✅ 완료                                                                        |
| `docs/CODE_CONVENTIONS.md`                | 코드 컨벤션 문서         | ✅ rebase 예외 규칙 추가 (Session 3)                                           |

---

## Key Decisions

### 1. docs-sync를 별도 커맨드가 아닌 dev-docs에 통합

- **이유**: 별도 커맨드는 잊기 쉬움. dev-docs 계획 프로세스에 포함시키면 자동 검사.
- **트레이드오프**: dev-docs 실행 시간 약간 증가

### 2. convention-sensitive tracker 제거

- **제거 이유**: dev-docs의 drift 검사가 매번 전체 비교를 수행하므로 편집 추적 로그는 중복.

### 3. 브라우저 테스트는 MASTER_PLAN으로 이동

- Playwright CI + browser-test 스킬 → `dev/MASTER_PLAN.md` §4.4

### 4. Backend skill: 아키텍처 원칙 유지, 프레임워크만 전환

- Clean Architecture 계층, Repository 패턴, Use Case + DTO → 유지
- Express routing/middleware/DI → Next.js API routes + inline instantiation으로 전환

### 5. Pre-commit 시크릿 스캔

- `.env`, `docs/server/` 스테이징 차단
- 실제 시크릿 값 패턴 탐지 (NEXTAUTH_SECRET, DATABASE_URL 등)
- 빌드 전에 빠르게 실패

### 6. PreToolUse .env 가드 훅

- Claude가 `.env*` 또는 `docs/server/` 읽기 시도 시 stderr 경고 (차단하지 않음)

---

## GameChu Stack Reference

**Frontend:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS 3, Zustand
**Backend:** Next.js API routes (`app/api/`), Clean Architecture (`backend/[feature]/`), Prisma (`@/prisma/generated`), Redis
**Auth:** NextAuth.js v4 with JWT sessions
**Directory:** `app/(auth)/`, `app/(base)/`, `app/components/`, `hooks/`, `stores/`

---

## Dependencies

- `docs/CODE_CONVENTIONS.md`: drift 검사 대상 (수정은 범위 밖)
- 모든 Phase 완료 — 더 이상 의존성 없음

---

## Git & PR Status

- **Branch**: `chore/#257` (3 commits, pushed to remote)
    - `1459362` — 메인 커밋: 31파일, +1947/-4157
    - `29bb398` — 잔여 레거시 참조 제거: 6파일, +85/-255
    - Session 3 커밋 — dev-docs 워크플로 통합 + rebase 예외 규칙
- **Issue**: #257 (all tasks checked)
- **PR**: #258 → `dev` (open, 리뷰 대기)
- **Remaining on `skills/README.md`**: Express/MUI 레거시 참조 남아있음 (의도적으로 이번 PR에서 제외)

---

## Session 2 Key Actions

1. GitHub Issue #257 생성 및 전체 태스크 체크
2. 첫 커밋 `1459362`: Phase 0–8 전체 변경사항
3. `chore/#257` 브랜치 분리 후 `dev` → `origin/dev` 리셋
4. PR #258 생성 (`.github/PULL_REQUEST_TEMPLATE.md` 형식 적용)
5. 레거시 참조 감사: `git grep -i 'Express|Keycloak|MUI'` 로 잔여 참조 발견
6. 두 번째 커밋 `55a5813`: 6파일 추가 수정
    - `auth-route-tester.md`: MUI, Docker MySQL, PM2 → NextAuth.js, Prisma `$queryRaw`
    - `plan-reviewer.md`: Keycloak → NextAuth.js OAuth 예시
    - `configuration.md`: UnifiedConfig/Keycloak → Next.js env 패턴 전면 재작성
    - `skill-developer/` 3파일: Express router → Next.js route handler 패턴

### 의도적으로 남긴 레거시 참조

- `styling-guide.md` — MUI anti-pattern 예시 (의도적)
- `skills/README.md` — 별도 업데이트 필요 (이번 PR 범위에서 제외)

---

## Session 3 Key Actions

1. `.claude/commands/dev-docs.md` Step 5 태스크 브레이크다운에 GitHub 워크플로 필수 적용 추가
    - 각 태스크가 이슈 → 브랜치 → 커밋 → 리베이스 → PR 사이클을 따르도록
    - `[task-name]-tasks.md`에 Git 워크플로 단계를 체크리스트로 포함
2. Rebase 예외 규칙 추가 (dev-docs.md + CODE_CONVENTIONS.md)
    - Claude 설정 전용 브랜치에 의존하는 경우 dev 리베이스 생략 가능
    - 예: `chore/#259`가 `chore/#257`의 Claude 커맨드 업데이트에 의존 → 리베이스 불필요

---

## Reference: Related MASTER_PLAN Sections

- §4.4 E2E Browser Testing (Playwright) — 브라우저 테스트 계획
- §4.1 Testing Framework Setup (Vitest) — 단위 테스트 계획

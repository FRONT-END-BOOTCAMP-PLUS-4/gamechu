# Claude Setup Update — Implementation Plan

Last Updated: 2026-03-04

---

## Executive Summary

`.claude/` 통합 설정을 GameChu 프로젝트에 맞게 완성. 모든 Phase가 완료됨.

이 태스크는 기존 `automation-task-process` 태스크(보안 훅, dev-docs 자동화)를 흡수하여 단일 태스크로 추적.

---

## Completed Phases

### Phase 0 ✅ — dev-docs Step 6 Git Workflow 수정

- Step 6의 하드코딩된 이슈/PR body를 `.github/` 템플릿 및 `docs/CODE_CONVENTIONS.md` 참조 방식으로 변경

### Phase 1 ✅ — dev-docs Convention Drift 검사 추가

- `/dev-docs` 커맨드에 Step 2.5 삽입: `docs/CODE_CONVENTIONS.md` drift 검사

### Phase 2 ✅ — 문서 업데이트

- `automation-task-process-summary.md` Task #4 완료 처리

### Phase 3 ✅ — Remove error-tracking Skill

- `error-tracking/SKILL.md` 삭제, `skill-rules.json` 정리, `sentry-and-monitoring.md` 삭제

### Phase 4 ✅ — Backend Skill Rewrite

Express.js 패턴을 Next.js API routes 패턴으로 전환. 6개 리소스 파일 완전 재작성:

| File                         | Changes                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `routing-and-controllers.md` | Express Router → Next.js API route handler 패턴         |
| `complete-examples.md`       | Express MVC → GameChu arena 기반 예시                   |
| `architecture-overview.md`   | MySQL/Express → PostgreSQL/Next.js + Clean Architecture |
| `validation-patterns.md`     | Express middleware validation → route handler + Zod     |
| `middleware-guide.md`        | Express middleware → NextAuth.js + Next.js middleware   |
| `async-and-errors.md`        | Express error boundary → NextResponse 에러 패턴         |

**유지 항목:** Clean Architecture layers, Repository pattern, Use case + DTO, Redis caching, Error handling philosophy

### Phase 5 ✅ — Agent Audit

- `auth-route-debugger.md` — Keycloak/Express → NextAuth.js/Next.js API routes 완전 재작성
- `code-architecture-reviewer.md` — MUI/Express/Docker → Next.js/TailwindCSS/Zustand/Prisma 완전 재작성
- `plan-reviewer.md` — Keycloak 참조 제거
- `README.md` — `~/git/` 경로 제거, `CLAUDE_INTEGRATION_GUIDE.md` 참조 제거

### Phase 6 ✅ — Route-tester Adaptation

- Keycloak/Express `test-auth-route.js` 기반 → NextAuth.js session cookie + curl 패턴으로 완전 재작성

### Phase 7 ✅ — Frontend Skill Verify

- `styling-guide.md` MUI "don't do this" 예시는 의도적 anti-pattern (수정 불필요)

### Phase 8 ✅ — Cleanup

- 삭제: `tsc-check.sh`, `error-handling-reminder.sh`, `error-handling-reminder.ts`, `claude-integration-test-plan.md`
- `CLAUDE_INTEGRATION_GUIDE.md`는 이미 존재하지 않음

---

## Automation Task Process (Merged)

> 기존 `dev/active/automation-task-process/` 태스크의 완료 내역:

### 1. `/dev-docs` Git & GitHub 워크플로 추가 ✅

- `.claude/commands/dev-docs.md` Step 6에 이슈/PR/브랜치/커밋 가이드 추가
- `.github/` 템플릿 참조 방식으로 변경 (Phase 0에서 업데이트)

### 2. Pre-commit 시크릿 스캔 ✅

- `.husky/pre-commit`에 빌드 전 시크릿 스캔 추가
- `.env`, `docs/server/` 스테이징 차단 + 시크릿 값 패턴 탐지

### 3. PreToolUse `.env` 가드 훅 ✅

- `.claude/hooks/pre-tool-use-env-guard.sh` 생성
- `.claude/settings.json`에 `PreToolUse` 훅 등록

### 4. `/docs-sync` 커맨드 ✅ (dev-docs Step 2.5로 통합)

- 별도 커맨드 대신 `/dev-docs` Convention Drift Check로 통합

### 5. `/browser-test` Playwright ⏭️ (MASTER_PLAN §4.4로 이동)

- 독립적 기능으로 별도 계획 필요

---

## Risk Assessment

| Risk                                     | Impact           | Mitigation                              |
| ---------------------------------------- | ---------------- | --------------------------------------- |
| Backend skill 전환 시 아키텍처 원칙 손실 | 가이드 품질 저하 | ✅ 실제 GameChu 코드 참조하여 검증 완료 |
| dev-docs drift 검사 성능                 | 계획 생성 지연   | 검사 범위를 계획 대상 파일로 한정       |

---

## Git & GitHub Workflow

> 브랜치/커밋/PR 규칙은 `docs/CODE_CONVENTIONS.md`의 "Git & Collaboration" 섹션을 따릅니다.
> 이슈/PR body 형식은 `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md`를 참조합니다.

- 브랜치: `chore/#<issue-number>`
- 커밋: `[chore/#<issue-number>] 커밋 메시지`
- PR base: `dev`

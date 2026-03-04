# Claude Setup Update — Context

Last Updated: 2026-03-04

---

## Overview

`.claude/` 통합 설정의 전체 과정을 추적하는 문서. 자동화 태스크 프로세스(automation-task-process) 결과물을 포함하여, dev-docs 커맨드 개선, 보안 훅/스캔, 스킬/에이전트 GameChu 적응, 미사용 파일 정리까지 포함.

---

## Key Files

| File | Role | Status |
|------|------|--------|
| `.claude/commands/dev-docs.md` | dev-docs 커맨드 프롬프트 | ✅ Step 6 템플릿 참조 + Step 2.5 drift 검사 완료 |
| `.claude/skills/backend-dev-guidelines/` | 백엔드 가이드 스킬 | ✅ Express→Next.js 전환 완료 (10 resource files) |
| `.claude/skills/route-tester/` | 라우트 테스트 스킬 | ✅ NextAuth.js 패턴으로 재작성 완료 |
| `.claude/skills/frontend-dev-guidelines/` | 프론트엔드 가이드 스킬 | ✅ 완료 (MUI 1건은 의도적 anti-pattern 예시) |
| `.claude/skills/error-tracking/` | Sentry 에러 추적 | ✅ 삭제됨 |
| `.claude/agents/` | 에이전트 프롬프트 | ✅ 4 파일 수정 완료 |
| `.husky/pre-commit` | 시크릿 스캔 추가 | ✅ 완료 |
| `.claude/hooks/pre-tool-use-env-guard.sh` | .env 읽기 가드 | ✅ 완료 |
| `.claude/settings.json` | PreToolUse 훅 등록 | ✅ 완료 |
| `docs/CODE_CONVENTIONS.md` | 코드 컨벤션 문서 | 읽기 전용 (drift 비교 대상) |

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

## Reference: Related MASTER_PLAN Sections

- §4.4 E2E Browser Testing (Playwright) — 브라우저 테스트 계획
- §4.1 Testing Framework Setup (Vitest) — 단위 테스트 계획

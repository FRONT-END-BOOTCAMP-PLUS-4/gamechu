# Claude Setup Update — Task Checklist

Last Updated: 2026-03-07 (Session 3)

---

## Phase 0: `/dev-docs` Step 6 Git Workflow 수정 ✅

- [x] **0.1** `dev-docs.md` Step 6의 이슈/PR body를 `.github/` 템플릿 참조로 변경
    - 이슈 → `.github/ISSUE_TEMPLATE/feature_request.md` 형식 참조
    - PR → `.github/PULL_REQUEST_TEMPLATE.md` 형식 참조
    - 브랜치/커밋/워크플로 → `docs/CODE_CONVENTIONS.md` "Git & Collaboration" 참조

## Phase 1: `/dev-docs` Convention Drift 검사 추가 ✅

- [x] **1.1** `.claude/commands/dev-docs.md`에 Step 2.5 Convention Drift Check 추가
    - `docs/CODE_CONVENTIONS.md` 읽기 + 계획 대상 코드 비교
    - drift 발견 시 Risk Assessment에 포함 + 태스크로 추가

## Phase 2: 문서 업데이트 ✅

- [x] **2.1** `automation-task-process-summary.md` 업데이트
    - Task #4 완료 처리
    - Task #5는 MASTER_PLAN §4.4로 이동됨을 명시
    - 변경 파일 목록 반영

---

## Phase 3: Remove error-tracking Skill ✅

- [x] **3.1** `.claude/skills/error-tracking/SKILL.md` 삭제
- [x] **3.2** `.claude/skills/skill-rules.json`에서 error-tracking 엔트리 제거
- [x] **3.3** `sentry-and-monitoring.md` 삭제 (Phase 4와 함께)

## Phase 4: Adapt backend-dev-guidelines Skill Content ✅

- [x] **4.1** `SKILL.md` — Express 참조 0건으로 수정
- [x] **4.2** `sentry-and-monitoring.md` — 삭제
- [x] **4.3** `configuration.md` — Express 참조 0건
- [x] **4.4** `services-and-repositories.md` — Express 참조 0건
- [x] **4.5** `routing-and-controllers.md` — Next.js API route 패턴으로 완전 재작성
- [x] **4.6** `complete-examples.md` — GameChu arena 패턴으로 완전 재작성
- [x] **4.7** `architecture-overview.md` — Clean Architecture + DDD + PostgreSQL로 완전 재작성
- [x] **4.8** `validation-patterns.md` — Next.js route handler + Zod 패턴으로 완전 재작성
- [x] **4.9** `middleware-guide.md` — NextAuth.js + Next.js middleware 패턴으로 완전 재작성
- [x] **4.10** `async-and-errors.md` — NextResponse 에러 패턴으로 완전 재작성

## Phase 5: Audit Agents for Hardcoded Paths ✅

- [x] **5.1** `auth-route-debugger.md` — NextAuth.js + Next.js API route 패턴으로 완전 재작성
- [x] **5.2** `code-architecture-reviewer.md` — GameChu tech stack으로 완전 재작성
- [x] **5.3** `plan-reviewer.md` — Keycloak 참조 제거
- [x] **5.4** `README.md` — `~/git/` 경로 제거, CLAUDE_INTEGRATION_GUIDE.md 참조 제거

## Phase 6: Adapt route-tester Skill ✅

- [x] **6.1** `.claude/skills/route-tester/SKILL.md` 읽기 + `lib/auth/authOptions.ts` 비교
- [x] **6.2** Auth testing 패턴을 NextAuth.js session cookies로 완전 재작성
- [x] **6.3** `test-auth-route.js` 참조 제거, curl + NextAuth 패턴으로 교체

## Phase 7: Adapt frontend-dev-guidelines Skill Content ✅

- [x] **7.1** `styling-guide.md` — MUI "don't do this" 예시는 의도적 (line 273, "What NOT to Use" 섹션)

## Phase 8: Cleanup ✅

- [x] **8.1** `.claude/hooks/tsc-check.sh` 삭제
- [x] **8.2** `CLAUDE_INTEGRATION_GUIDE.md` — 이미 존재하지 않음 (이전에 삭제됨)
- [x] **8.3** `.claude/hooks/error-handling-reminder.sh` 삭제
- [x] **8.4** `.claude/hooks/error-handling-reminder.ts` 삭제
- [x] **8.5** `docs/claude-integration-test-plan.md` 삭제

---

## Execution Summary

| Phase     | Description                     | Status  |
| --------- | ------------------------------- | ------- |
| Phase 0–2 | dev-docs 개선                   | ✅ 완료 |
| Phase 3   | error-tracking 제거             | ✅ 완료 |
| Phase 4   | Backend skill rewrite (6 files) | ✅ 완료 |
| Phase 5   | Agent audit (4 files)           | ✅ 완료 |
| Phase 6   | Route-tester adaptation         | ✅ 완료 |
| Phase 7   | Frontend skill verify           | ✅ 완료 |
| Phase 8   | Cleanup (4 files deleted)       | ✅ 완료 |

**All tasks complete.** ✅

---

## Phase 9: Legacy Reference Audit ✅ (Session 2에서 추가)

- [x] **9.1** `agents/auth-route-tester.md` — MUI, Docker MySQL, PM2 참조 제거 → NextAuth.js, Prisma `$queryRaw`
- [x] **9.2** `agents/plan-reviewer.md` — Keycloak 예시 → NextAuth.js OAuth
- [x] **9.3** `backend-dev-guidelines/configuration.md` — UnifiedConfig/Keycloak → Next.js env 패턴 전면 재작성
- [x] **9.4** `skill-developer/SKILL.md` — Express 참조 → Next.js 패턴
- [x] **9.5** `skill-developer/PATTERNS_LIBRARY.md` — Express router → Next.js route handler
- [x] **9.6** `skill-developer/TRIGGER_TYPES.md` — Express router → Next.js route handler
- [ ] **9.7** `skills/README.md` — Express/MUI 참조 다수 (이번 PR 범위 제외, 별도 처리 필요)

## Phase 10: dev-docs 태스크 GitHub 워크플로 통합 + rebase 예외 규칙 (Session 3)

- [x] **10.1** `.claude/commands/dev-docs.md` — 태스크 브레이크다운에 GitHub 워크플로 필수 적용 (이슈 → 브랜치 → 커밋 → 리베이스 → PR)
- [x] **10.2** `.claude/commands/dev-docs.md` + `docs/CODE_CONVENTIONS.md` — Claude 설정 브랜치 의존 시 rebase 예외 규칙 추가

---

## Git Workflow (Session 2-3)

- [x] **G.1** GitHub Issue #257 생성
- [x] **G.2** `chore/#257` 브랜치 생성 + 커밋 2건
- [x] **G.3** PR #258 생성 (dev 대상)
- [x] **G.4** Session 3 커밋: dev-docs 워크플로 통합 + rebase 예외

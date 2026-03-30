# 사용자 리뷰 중복 표시 버그 수정 Plan

> **Status**: ✅ Completed — PR #295 open, branch `fix/#214`

**Goal:** 게임 상세 페이지에서 로그인 사용자의 리뷰가 상단과 목록에 이중으로 표시되는 버그 수정.

**Architecture:** `ClientContentWrapper.tsx`에서 `currentComments` → `listComments` 파생 시 `myComment`를 필터링. API / 서버 레이어 무변경. 2개 파일만 수정.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest 4.x, Testing Library

---

## File Map

| 파일 | 상태 | 역할 |
|------|------|------|
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` | **수정** | `listComments` 필터링 추가 (L53-65) |
| `app/(base)/games/[gameId]/components/__tests__/ClientContentWrapper.test.tsx` | **신규** | 중복 렌더링 방지 회귀 테스트 |

---

## Task 1: Root Cause 조사

**Goal:** 중복 렌더링의 원인 코드 위치 특정.

- [x] **Step 1: 이슈 확인** — GitHub Issue #214 내용 파악
- [x] **Step 2: 렌더링 흐름 추적**
  - `ClientContentWrapper.tsx` 필터링 로직 읽기
  - `myComment` → 상단 렌더링 경로 확인
  - `commentsForPage` → 목록 렌더링 경로 확인
  - `myComment`가 `currentComments`에서 제외되지 않음을 확인

---

## Task 2: 실패 테스트 작성 (RED)

**Goal:** 버그를 재현하는 자동화 테스트.

- [x] **Step 1: 테스트 파일 생성**
  - `ClientContentWrapper.test.tsx` 신규 작성
  - `useGameReviews`, `@tanstack/react-query`, 자식 컴포넌트 mock 설정
  - `CommentCard`를 `data-testid="comment-card-{memberId}"` 형태로 mock

- [x] **Step 2: 테스트 케이스 작성**
  ```ts
  it("내 리뷰가 상단에 표시될 때 목록에는 중복되지 않는다")
  it("내 리뷰가 없으면 목록에 모든 리뷰가 표시된다")
  ```

- [x] **Step 3: RED 검증**
  ```bash
  npx vitest run "ClientContentWrapper"
  ```
  결과: 1번 케이스 실패 — `expected length 1, got 2` ✅

---

## Task 3: 버그 수정 (GREEN)

**Goal:** 최소 변경으로 테스트 통과.

- [x] **Step 1: `ClientContentWrapper.tsx` 수정**

  ```ts
  // 수정 전
  const commentsForPage = currentComments.slice(...)

  // 수정 후
  const listComments = myComment
      ? currentComments.filter((c) => c.id !== myComment.id)
      : currentComments;
  const totalItems = listComments.length;
  const commentsForPage = listComments.slice(...)
  ```

- [x] **Step 2: GREEN 검증**
  ```bash
  npx vitest run "ClientContentWrapper"
  ```
  결과: 2/2 passed ✅

- [x] **Step 3: 전체 회귀 테스트**
  ```bash
  npm test
  ```
  결과: 315/315 passed ✅

---

## Task 4: 커밋 & PR

- [x] **Step 1: 브랜치 생성** — `fix/#214`
- [x] **Step 2: 커밋**
  ```
  [fix/#214] 사용자 리뷰 중복 표시 버그 수정
  ```
  빌드 성공 (pre-commit hook 통과)
- [x] **Step 3: PR 생성** — PR #295 (`fix/#214` → `dev`)

---

## 검증 체크리스트

- [x] `myComment` 있을 때 `comment-card-{memberId}` 정확히 1개 렌더링
- [x] `myComment` 없을 때 작성 폼 표시, 전체 목록 정상 표시
- [x] `ReviewSelector` 리뷰 카운트 변화 없음 (필터는 listComments에만 적용)
- [x] 315 tests passed, 0 failed
- [x] Build success (0 errors)

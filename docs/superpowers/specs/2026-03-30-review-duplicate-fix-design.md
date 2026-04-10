# 사용자 리뷰 중복 표시 버그 수정 Design

**Date**: 2026-03-30
**Status**: Completed
**Branch**: `fix/#214`
**PR**: #295

---

## Problem

게임 상세 페이지(`/games/[gameId]`)에서 로그인한 사용자가 해당 게임에 리뷰를 작성한 경우, 자신의 리뷰가 두 곳에 동시에 표시되는 버그.

1. **상단 고정 영역**: `myComment` 조건부 렌더링 블록 (glow-border 스타일)
2. **페이지네이션 목록**: `commentsForPage` 반복 렌더링 블록

두 블록이 같은 리뷰 데이터를 독립적으로 렌더링하므로 동일한 `CommentCard`가 두 번 표시됨.

---

## Root Cause

`ClientContentWrapper.tsx`의 필터링 로직:

```ts
// myComment: 내 리뷰 추출
const myComment = allComments.find(c => String(c.memberId) === String(viewerId));

// expertComments / userComments: 전체에서 타입별 분류 (myComment 미제외)
const expertComments = allComments.filter(c => isExpertTier(c.score));
const userComments   = allComments.filter(c => !isExpertTier(c.score));

// currentComments: 선택된 탭의 전체 리뷰 (myComment 포함)
const currentComments = selectedReviewType === "expert" ? expertComments : userComments;

// commentsForPage: currentComments 슬라이스 → myComment가 그대로 포함됨
const commentsForPage = currentComments.slice(...);
```

`myComment`를 상단에 별도 렌더링한 이후에도 `currentComments` → `commentsForPage`에서 제거하지 않아 목록에도 동일 리뷰가 다시 표시됨.

---

## Decisions

| 질문                                                   | 결정                                   | 근거                                                        |
| ------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------- |
| 수정 위치                                              | `ClientContentWrapper.tsx` 필터링 로직 | 렌더링 책임을 가진 컴포넌트에서 제어                        |
| `expertComments` / `userComments` 카운트에서 제외 여부 | 제외 안 함                             | `ReviewSelector`의 리뷰 수 표시가 부정확해짐                |
| 별도 유틸 함수 추출 여부                               | 추출 안 함                             | 단일 사용처, 1줄 변경으로 충분                              |
| API 레벨 수정 여부                                     | 수정 안 함                             | 서버는 전체 리뷰를 정확히 반환 중, 문제는 클라이언트 렌더링 |

---

## Architecture

### 변경 전

```
allComments ──► expertComments ──► currentComments ──► commentsForPage (myComment 포함)
           └──► userComments                                   ↑
                                                               └── 상단 myComment와 중복
```

### 변경 후

```
allComments ──► expertComments ──► currentComments ──► listComments (myComment 제외) ──► commentsForPage
           └──► userComments                              ↑
                                                    myComment ? filter : identity
```

### 수정 코드

```ts
// 상단에 별도 표시되는 내 리뷰는 목록에서 제외해 중복 방지
const listComments = myComment
    ? currentComments.filter((c) => c.id !== myComment.id)
    : currentComments;

const totalItems = listComments.length;  // 페이지네이션 계산도 갱신
const commentsForPage = listComments.slice(...);
```

---

## Testing

### 신규 테스트: `ClientContentWrapper.test.tsx`

| 케이스            | 입력                                 | 기대                                 |
| ----------------- | ------------------------------------ | ------------------------------------ |
| 내 리뷰 중복 방지 | viewer의 expert 리뷰 + 타인 리뷰 2개 | `comment-card-{viewerId}` 정확히 1개 |
| 내 리뷰 없음      | viewer 리뷰 없음                     | 타인 리뷰 전부 표시, 작성 폼 노출    |

**RED → GREEN 검증 완료**: 수정 전 1번 케이스 실패(2개), 수정 후 2/2 통과.

### 전체 테스트

315/315 tests passed (npm ci 후 pre-existing 25개 실패도 해소됨).

---

## Out of Scope

- API 응답 구조 변경 (서버는 정확히 동작 중)
- `ReviewSelector` 카운트 표시 로직 변경
- 리뷰 탭 전환 시 페이지 초기화 로직

---

## Affected Files

| 파일                                                                           | 변경                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx`                | `listComments` 필터링 추가 |
| `app/(base)/games/[gameId]/components/__tests__/ClientContentWrapper.test.tsx` | 신규 생성 (2 test cases)   |

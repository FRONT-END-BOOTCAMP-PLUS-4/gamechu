# Code Review: Performance Improvements

**Reviewed**: 2026-04-09  
**Branch**: `temp`  
**Decision**: REQUEST CHANGES

## Summary

16개 파일 변경(성능 최적화)은 전반적으로 올바르게 구현되었으나, `ClientContentWrapper`의 `useMemo` 의존성 배열이 불안정한 참조를 가리켜 최적화가 실제로 동작하지 않는 HIGH 이슈 1건 발견.

---

## Findings

### HIGH

**`ClientContentWrapper.tsx:61–77` — `useMemo` deps on unstable array references**

`expertComments`와 `userComments`는 memoize되지 않은 `.filter()` 호출 결과라 렌더마다 새 배열 참조를 생성한다. 이 배열들을 `useMemo` deps로 사용하면 deps가 항상 달라져 memo가 매 렌더마다 bust된다. `H2-3` 최적화가 실제로 동작하지 않음.

**수정 방법** — `allComments`를 deps로 삼아 filter + reduce를 한 useMemo 안에 통합:

```ts
const expertAvgRating = useMemo(() => {
    const expert = allComments.filter((c) => isExpertTier(c.score));
    return expert.length > 0
        ? expert.reduce((a, b) => a + b.rating, 0) / expert.length
        : 0;
}, [allComments]);

const userAvgRating = useMemo(() => {
    const user = allComments.filter((c) => !isExpertTier(c.score));
    return user.length > 0
        ? user.reduce((a, b) => a + b.rating, 0) / user.length
        : 0;
}, [allComments]);
```

(`expertComments`/`userComments` 변수는 `expertReviewCount`, `userReviewCount`, `currentComments` 등에도 쓰이므로 그대로 유지하거나 별도 useMemo로 추출)

---

### MEDIUM

**`useArenaSocket.ts:28–32` — 다중 재연결 시 `upgrade` 핸들러 누수**

`cleanupUpgrade`는 외부 closure의 `let` 변수. 소켓이 재연결될 때마다 `onConnect`가 재실행되어 새 `handleUpgrade`를 `engine.on`에 등록하고 `cleanupUpgrade`를 덮어쓴다. 이전 `handleUpgrade` 참조가 제거되지 않아 재연결 횟수만큼 리스너가 누적된다. 현재 `handleUpgrade`는 no-op이라 기능상 영향은 없으나 메모리 누수.

**수정 방법** — `onConnect` 내에서 등록 전 이전 핸들러를 먼저 해제하거나, `cleanupUpgrade?.()` 호출 후 재등록:
```ts
function onConnect() {
    cleanupUpgrade?.(); // 이전 핸들러 먼저 해제
    const handleUpgrade = () => {};
    socket.io.engine.on("upgrade", handleUpgrade);
    cleanupUpgrade = () => socket.io.engine.off("upgrade", handleUpgrade);
}
```

---

**`ArenaDetailChatList.tsx:20` — 불필요한 중간 객체 생성**

destructured props를 다시 plain object로 감싸는 `const arenaDetail = { ... }` 패턴. 이후 `arenaDetail?.xxx` 형태의 optional chaining은 object가 항상 존재하므로 불필요. `React.memo`와 함께 사용 시 렌더마다 새 참조를 만들어도 memo 효과에는 영향이 없지만, 코드 명확성이 떨어짐.

**수정 방법** — destructured params를 직접 참조:
```ts
{status === 3 ? "채팅이 아직 없습니다..." : "채팅이 없습니다."}
String(chat.memberId) === String(creatorId)
```

---

### LOW

**`ReadOnlyReview.tsx:26–36` — `config` useMemo는 실질적 효과 없음**

`LexicalComposer`는 `initialConfig`를 mount 시 1회만 읽고 이후 변경을 무시한다. `content`가 바뀌어도 editor가 재초기화되지 않는 기존 동작은 유지되며, memo는 렌더마다 객체 재생성을 방지하는 GC 이점만 있음. 동작 오류는 아니지만 intent가 오해를 유발할 수 있음.

---

**`ArenaDetailChatList.tsx` — `React.memo` 실효성 제한**

`ArenaDetailContainer`가 `useArenaStore`를 구독하므로 arena 데이터 변경 시 re-render되어 새 prop 값들을 전달한다. 채팅 메시지가 오는 대부분의 hot path에서 memo는 skip되지 않음. 구조적으로는 올바른 방향이나 실제 성능 이득은 제한적.

---

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`, 소스 파일) | Pass |
| Lint | Pass (기존 warning 5건은 변경 전부터 존재) |
| Tests | Pass — 321 tests, 75 files |
| Build (`next build`) | Pass |

## Files Reviewed

| File | Change |
|---|---|
| `backend/review-like/domain/repositories/ReviewLikeRepository.ts` | Modified |
| `backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository.ts` | Modified |
| `backend/review/application/usecase/GetReviewsByGameIdUsecase.ts` | Modified |
| `app/(base)/games/page.tsx` | Modified |
| `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` | Modified |
| `app/(base)/games/[gameId]/components/ReviewSelector.tsx` | Modified |
| `app/(base)/games/[gameId]/components/CommentCard.tsx` | Modified |
| `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx` | Modified |
| `app/(base)/arenas/ArenaPage.tsx` | Modified |
| `app/(base)/arenas/[id]/page.tsx` | Modified |
| `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` | Modified |
| `app/(base)/arenas/[id]/components/ArenaDetailContainer.tsx` | Modified |
| `app/(base)/arenas/[id]/loading.tsx` | Added |
| `app/(base)/games/[gameId]/loading.tsx` | Added |
| `hooks/useArenaSocket.ts` | Modified |
| `app/components/Header.tsx` | Modified |
| `tests/mocks/createMockReviewLikeRepository.ts` | Modified |

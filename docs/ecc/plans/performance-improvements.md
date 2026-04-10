# Performance Improvements Plan

ECC 에이전트(refactor-cleaner + typescript-reviewer)가 발견한 성능 이슈를 수정하는 계획.
HIGH 6건, MEDIUM 4건 총 10개 항목, 16개 파일(14 수정, 2 신규).

---

## Phase 1 — Backend N+1 Query Fix

**영향**: 리뷰 N건 기준 `1 + 2N` DB 쿼리 → `3` 쿼리로 고정. 가장 ROI가 높은 수정.

**의존 관계**: H1-1 → H1-2 → H1-3 순서로 진행.

- [ ] **H1-1. `ReviewLikeRepository` 인터페이스에 배치 메서드 추가**
    - File: `backend/review-like/domain/repositories/ReviewLikeRepository.ts`
    - 기존 `count(reviewId)`, `isLiked(reviewId, memberId)` 유지하면서 추가:
        - `countByReviewIds(reviewIds: number[]): Promise<Map<number, number>>`
        - `isLikedByReviewIds(reviewIds: number[], memberId: string): Promise<Set<number>>`

- [ ] **H1-2. `PrismaReviewLikeRepository`에 배치 메서드 구현**
    - File: `backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository.ts`
    - `countByReviewIds`: `groupBy({ by: ["reviewId"], where: { reviewId: { in: reviewIds } }, _count: { reviewId: true } })` → `Map<number, number>`
    - `isLikedByReviewIds`: `findMany({ where: { reviewId: { in: reviewIds }, memberId }, select: { reviewId: true } })` → `Set<number>`

- [ ] **H1-3. `GetReviewsByGameIdUsecase`에서 배치 호출로 교체**
    - File: `backend/review/application/usecase/GetReviewsByGameIdUsecase.ts`
    - `rawReviews` 조회 후 `reviewIds` 추출
    - `countMap`, `likedSet` 각각 1회 호출 (viewerId falsy이면 빈 Set early return)
    - `Promise.all` 루프 제거 → 동기 `map`으로 결과 조합

---

## Phase 2 — React Re-render Fixes

각 항목은 서로 독립적이므로 병렬 작업 가능.

- [ ] **H2-1. `games/page.tsx` — unstable `onSearch` 래퍼 제거**
    - File: `app/(base)/games/page.tsx` (line 148)
    - `onSearch={(val) => setSearchQuery(val)}` → `onSearch={setSearchQuery}`

- [ ] **H2-2. `ClientContentWrapper.tsx` — `onSelect` 콜백 `useCallback`으로 감싸기**
    - File: `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` (line 74)
    - `useCallback` 추가: `const handleSelectReviewType = useCallback((type) => { setSelectedReviewType(type); setCurrentPage(1); }, [])`

- [ ] **H2-3. `ClientContentWrapper.tsx` — 평균 평점 계산 `useMemo`로 감싸기**
    - File: `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx` (lines 80-91)
    - `expertAvgRating`, `userAvgRating` inline `.reduce` → `useMemo` (deps: `[expertComments]`, `[userComments]`)

- [ ] **H3. `ArenaPage.tsx` — 중복 `<Modals />` 제거**
    - File: `app/(base)/arenas/ArenaPage.tsx` (line 50)
    - `app/layout.tsx`에 이미 `<Modals />`가 존재하므로 `ArenaPage`의 import + JSX 제거

- [ ] **H4. `ArenaDetailChatList` — `React.memo` 래핑 + Zustand 의존 제거**
    - File: `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx`
    - 내부 `useArenaStore` 제거 → arena 메타데이터를 props로 수신
    - `React.memo(forwardRef(...))` 적용
    - File (caller): `app/(base)/arenas/[id]/components/ArenaDetailContainer.tsx`
    - caller에서 arena 메타데이터 props 전달

- [ ] **H5. `arenas/[id]/page.tsx` — `ArenaDetailDto` 생성 `useMemo`로 감싸기**
    - File: `app/(base)/arenas/[id]/page.tsx` (lines 39-61)
    - `useMemo(() => data ? new ArenaDetailDto(...) : null, [data])`
    - `useEffect`에서 memo 결과가 존재할 때만 `setGlobalArenaData` 호출

- [ ] **H6. `ReadOnlyReview` — JSON 파싱 `useMemo`로 캐싱**
    - File: `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`
    - `isLexicalJson(content)` 결과 → `useMemo(..., [content])`
    - `config` 객체 → `useMemo(..., [content])`

---

## Phase 3 — Bundle & UX

- [ ] **M1-1. `ReviewSelector.tsx` — Lottie dynamic import**
    - File: `app/(base)/games/[gameId]/components/ReviewSelector.tsx`
    - `import Lottie from "lottie-react"` 제거
    - `const Lottie = dynamic(() => import("lottie-react"), { ssr: false })`
    - 참고: `app/components/ClientNotFoundView.tsx`에 동일 패턴 사용 중

- [ ] **M1-2. `CommentCard.tsx` — Lottie dynamic import**
    - File: `app/(base)/games/[gameId]/components/CommentCard.tsx`
    - 동일 패턴 적용

- [ ] **M2-1. `games/[gameId]/loading.tsx` 신규 생성**
    - File: `app/(base)/games/[gameId]/loading.tsx`
    - App Router Suspense boundary — 스켈레톤 또는 로딩 스피너 반환

- [ ] **M2-2. `arenas/[id]/loading.tsx` 신규 생성**
    - File: `app/(base)/arenas/[id]/loading.tsx`
    - 동일 패턴

---

## Phase 4 — Socket Handler Leak

- [ ] **M3. `useArenaSocket.ts` — 핸들러를 `useEffect` 내부로 이동**
    - File: `hooks/useArenaSocket.ts`
    - `onConnect`, `onDisconnect`, `onConnectError` 함수를 effect 내부로 이동하여 `socket.on`/`socket.off` 참조 일치 보장
    - `onConnect` 내부의 `engine.on("upgrade", ...)` 리스너 cleanup 추가

---

## Phase 5 — Header MenuLink

- [ ] **M4. `Header.tsx` — `MenuLink`를 모듈 스코프로 이동**
    - File: `app/components/Header.tsx`
    - `MenuLink` 컴포넌트를 `Header` 함수 바깥으로 추출
    - Props: `type MenuLinkProps = { href: string; label: string; pathname: string; onNavigate: () => void; }`
    - `Header` 내부에서 `const handleNavigate = useCallback(() => setMenuOpen(false), [])` 생성 후 전달

---

## Affected Files

| Phase | File                                                                          | 변경 유형 |
| ----- | ----------------------------------------------------------------------------- | --------- |
| H1    | `backend/review-like/domain/repositories/ReviewLikeRepository.ts`             | 수정      |
| H1    | `backend/review-like/infra/repositories/prisma/PrismaReviewLikeRepository.ts` | 수정      |
| H1    | `backend/review/application/usecase/GetReviewsByGameIdUsecase.ts`             | 수정      |
| H2    | `app/(base)/games/page.tsx`                                                   | 수정      |
| H2    | `app/(base)/games/[gameId]/components/ClientContentWrapper.tsx`               | 수정      |
| H3    | `app/(base)/arenas/ArenaPage.tsx`                                             | 수정      |
| H4    | `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx`                   | 수정      |
| H4    | `app/(base)/arenas/[id]/components/ArenaDetailContainer.tsx`                  | 수정      |
| H5    | `app/(base)/arenas/[id]/page.tsx`                                             | 수정      |
| H6    | `app/(base)/games/[gameId]/components/lexical/ReadOnlyReview.tsx`             | 수정      |
| M1    | `app/(base)/games/[gameId]/components/ReviewSelector.tsx`                     | 수정      |
| M1    | `app/(base)/games/[gameId]/components/CommentCard.tsx`                        | 수정      |
| M2    | `app/(base)/games/[gameId]/loading.tsx`                                       | **신규**  |
| M2    | `app/(base)/arenas/[id]/loading.tsx`                                          | **신규**  |
| M3    | `hooks/useArenaSocket.ts`                                                     | 수정      |
| M4    | `app/components/Header.tsx`                                                   | 수정      |

---

## Risks & Mitigations

| Risk                                                          | Mitigation                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| H1: `viewerId` falsy 시 `isLikedByReviewIds` 불필요한 DB 호출 | 유스케이스에서 falsy guard → 빈 Set 즉시 반환                                  |
| H4: `ArenaDetailChatList` props 인터페이스 변경               | caller(`ArenaDetailContainer`)를 같은 PR에서 함께 수정                         |
| H5: TanStack Query 재요청 시 `data` 참조 변경                 | `structuralSharing: true`(기본값)이므로 실제 데이터 동일 시 참조 유지됨        |
| M1: Lottie 초기 렌더 시 잠깐 미표시                           | Lottie는 장식 요소 — UX 영향 미미. 필요 시 `loading` prop으로 placeholder 추가 |

## Success Criteria

- [ ] 게임 리뷰 목록 API DB 쿼리 3회 이내 (1 findByGameId + 1 groupBy + 1 findMany)
- [ ] `ArenaPage`에서 `<Modals />` 1회만 마운트
- [ ] `ArenaDetailChatList`가 관련 없는 상태 변경 시 리렌더되지 않음
- [ ] Lottie 번들이 초기 JS에서 분리됨 (dynamic import)
- [ ] `games/[gameId]`, `arenas/[id]` route에 `loading.tsx` 존재
- [ ] 소켓 핸들러 등록/해제 참조 일치
- [ ] `npm test` 전체 통과
- [ ] `npm run build` 성공

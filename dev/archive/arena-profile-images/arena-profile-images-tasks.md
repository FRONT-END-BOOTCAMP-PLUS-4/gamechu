# Tasks: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-20 (tsc 잔존 에러 수정 완료 — 커밋 필요)

---

## Phase A — Backend: ArenaDetailDto 확장

### A-1. ArenaDetailDto에 이미지 URL 필드 추가

- ✅ `backend/arena/application/usecase/dto/ArenaDetailDto.ts` 수정
    - `creatorScore` 다음에 `public creatorImageUrl: string` 추가
    - `challengerScore` 다음에 `public challengerImageUrl: string | null` 추가
- **Acceptance**: TypeScript 컴파일 에러 없음, 필드 순서가 관련 필드(creatorName/score) 그룹과 일치

### A-2. GetArenaDetailUsecase 수정

- ✅ `backend/arena/application/usecase/GetArenaDetailUsecase.ts` 수정
    - `const creatorImageUrl = ArenaDetail.creator?.imageUrl || "";` 추출
    - `const challengerImageUrl = ArenaDetail.challenger?.imageUrl || null;` 추출
    - `new ArenaDetailDto(...)` 생성 시 두 필드 인수 추가 (constructor 순서에 맞게)
- ✅ `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts` 수정
    - 캐시 히트 테스트 `ArenaDetailDto` 객체 리터럴에 `creatorImageUrl: ""`, `challengerImageUrl: null` 추가
- **Acceptance**: 기존 테스트 (`GetArenaDetailUsecase.test.ts`) 통과, 실제 API 응답에 imageUrl 필드 포함

---

## Phase B — Frontend: 헤더 수정

### B-1. ArenaDetailHeader — 헤더 전용 인라인 구현

- ✅ `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx` 수정
    - `UserProfileComponent` 대신 헤더 전용 인라인 구현 (UI 어색함으로 교체 결정)
    - 이미지(button) + 게시자 레이블 + 닉네임(button) + TierBadge 구조
    - 이미지·닉네임 클릭 시만 프로필 이동, 게시자 레이블·TierBadge 클릭 무반응
    - `unoptimized` 없음
- **Acceptance**: 헤더에 프로필 이미지 + 닉네임 + 티어뱃지 표시, "게시자" 레이블 유지

---

## Phase C — Frontend: 채팅 수정

### C-1. ArenaDetailChatList — props drift 수정 + 아이콘 교체

- ✅ `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` 수정
    - `interface ArenaChatListProps` → `type ArenaChatListProps` 변경 (drift fix)
    - `h-8 w-8 shrink-0 overflow-hidden rounded-full` wrapper div + `h-full w-full object-cover` Image
    - `unoptimized` 없음
- **Acceptance**: 채팅 헤더에 원형 프로필 이미지 표시, fallback 정상 동작, interface drift 수정

---

## Phase D — Frontend: 투표 수정

### D-1. ArenaDetailVote — 아이콘 교체

- ✅ `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` 수정
    - `h-10 w-10 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full` wrapper div + `h-full w-full object-cover` Image
    - 체크마크 배지(`absolute -right-1 -top-1`)는 wrapper div 기준으로 위치, 변경 없이 유지됨
    - `unoptimized` 없음
- **Acceptance**: 투표 카드에 원형 프로필 이미지 표시, 체크마크 배지 위치 유지, fallback 정상 동작

---

## Phase E — 잔존 tsc 에러 수정 (이번 작업과 무관한 기존 에러)

### E-1. UpdateArenaUsecase.test.ts

- ✅ `backend/arena/application/usecase/__tests__/UpdateArenaUsecase.test.ts` 수정
    - `makeArena()`에서 `gameId: 100` 제거 — `Arena` Prisma 타입에 해당 필드 없음

### E-2. ToggleReviewLikeUsecase.test.ts

- ✅ `backend/review-like/application/usecase/__tests__/ToggleReviewLikeUsecase.test.ts` 수정
    - `import { Review }` → `import { ReviewDto }` 교체
    - `mockReview` 타입: `Review` → `ReviewDto`, 누락 필드 추가 (`nickname: "author"`, `imageUrl: null`, `score: 0`, `likeCount: 0`, `isLiked: false`)
    - **원인**: `ReviewRepository.findById()`가 `ReviewDto | null` 반환 — `Review` (Prisma) 타입과 다름

---

## Completion Checklist

- ✅ TypeScript 컴파일 에러 없음 (`npx tsc --noEmit` 에러 0개)
- ✅ `teamA.svg`, `teamB.svg` 사용처 3개 컴포넌트에서 모두 fallback으로만 사용
- ✅ Convention drift (`interface` → `type`) 수정 완료
- ✅ 게시자/도전자 모두 null 케이스 처리 확인
- ✅ `ArenaDetailWaiting.tsx`는 status 2(도전자 미배정)이므로 이번 작업 범위에서 의도적으로 제외
- ✅ 세로 이미지 원형 처리 — wrapper div `overflow-hidden rounded-full` 패턴 적용
- ✅ `unoptimized` prop 제거 완료
- ✅ 헤더 클릭 영역 분리 — 이미지/닉네임만 프로필 이동, 레이블/TierBadge 제외
- ✅ PR #270 생성 완료

---

## 다음 단계

1. **커밋**: 미커밋 테스트 파일 2개 커밋 후 PR에 push
    ```bash
    git add "backend/arena/application/usecase/__tests__/UpdateArenaUsecase.test.ts" \
            "backend/review-like/application/usecase/__tests__/ToggleReviewLikeUsecase.test.ts"
    git commit -m "[fix] UpdateArenaUsecase, ToggleReviewLikeUsecase 테스트 tsc 에러 수정"
    git push origin feat/#269
    ```
2. **아카이브**: 작업 완료 후 `/archive-task` 실행

# Tasks: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-19 (UI 개선 완료 — 미커밋)

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

## Completion Checklist

- ✅ TypeScript 컴파일 에러 없음 (`npx tsc --noEmit` 통과)
- ✅ `teamA.svg`, `teamB.svg` 사용처 3개 컴포넌트에서 모두 fallback으로만 사용
- ✅ Convention drift (`interface` → `type`) 수정 완료
- ✅ 게시자/도전자 모두 null 케이스 처리 확인
- ✅ `ArenaDetailWaiting.tsx`는 status 2(도전자 미배정)이므로 이번 작업 범위에서 의도적으로 제외
- ✅ 세로 이미지 원형 처리 — wrapper div `overflow-hidden rounded-full` 패턴 적용
- ✅ `unoptimized` prop 제거 완료
- ✅ 헤더 클릭 영역 분리 — 이미지/닉네임만 프로필 이동, 레이블/TierBadge 제외

---

## 다음 단계

1. **커밋**: 미커밋 파일 3개 커밋 필요
   ```bash
   git add "app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx" \
           "app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx" \
           "app/(base)/arenas/[id]/components/ArenaDetailVote.tsx"
   git commit -m "[feat/#269] 헤더 인라인 구현 및 이미지 원형 처리 개선"
   ```
2. **PR 생성**: `/dev-docs-finalize` 실행하여 push + PR 생성

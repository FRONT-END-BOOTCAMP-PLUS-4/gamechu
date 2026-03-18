# Tasks: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-19

---

## Phase A — Backend: ArenaDetailDto 확장

### A-1. ArenaDetailDto에 이미지 URL 필드 추가
- [ ] `backend/arena/application/usecase/dto/ArenaDetailDto.ts` 수정
  - `creatorScore` 다음에 `public creatorImageUrl: string` 추가
  - `challengerScore` 다음에 `public challengerImageUrl: string | null` 추가
- **Acceptance**: TypeScript 컴파일 에러 없음, 필드 순서가 관련 필드(creatorName/score) 그룹과 일치

### A-2. GetArenaDetailUsecase 수정
- [ ] `backend/arena/application/usecase/GetArenaDetailUsecase.ts` 수정
  - `const creatorImageUrl = ArenaDetail.creator?.imageUrl || "";` 추출
  - `const challengerImageUrl = ArenaDetail.challenger?.imageUrl || null;` 추출
  - `new ArenaDetailDto(...)` 생성 시 두 필드 인수 추가 (constructor 순서에 맞게)
- **Acceptance**: 기존 테스트 (`GetArenaDetailUsecase.test.ts`) 통과, 실제 API 응답에 imageUrl 필드 포함

---

## Phase B — Frontend: 헤더 수정

### B-1. ArenaDetailHeader — UserProfileComponent 교체
- [ ] `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx` 수정
  - `Image` (teamA.svg) 제거
  - `UserProfileComponent` import 추가
  - `arenaDetail?.creatorImageUrl || "/icons/teamA.svg"` fallback 처리
  - `arenaDetail?.creatorName ?? ""` 와 `arenaDetail?.creatorScore` 전달
  - "게시자" 레이블은 `UserProfileComponent` 위에 `<span>` 유지
- **Acceptance**: 헤더에 프로필 이미지 + 닉네임 + 티어뱃지 표시, "게시자" 레이블 유지

---

## Phase C — Frontend: 채팅 수정

### C-1. ArenaDetailChatList — props drift 수정 + 아이콘 교체
- [ ] `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` 수정
  - `interface ArenaChatListProps` → `type ArenaChatListProps` 변경 (drift fix)
  - 게시자 아이콘: `src="/icons/teamA.svg"` → `src={arenaDetail?.creatorImageUrl || "/icons/teamA.svg"}`
  - 도전자 아이콘: `src="/icons/teamB.svg"` → `src={arenaDetail?.challengerImageUrl || "/icons/teamB.svg"}`
  - 두 `<Image>`에 `className="rounded-full object-cover"` 추가
- **Acceptance**: 채팅 헤더에 원형 프로필 이미지 표시, fallback 정상 동작, interface drift 수정

---

## Phase D — Frontend: 투표 수정

### D-1. ArenaDetailVote — 아이콘 교체
- [ ] `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` 수정
  - 게시자 측 `<Image src="/icons/teamA.svg">` → `src={arenaDetail?.creatorImageUrl || "/icons/teamA.svg"}`
  - 도전자 측 `<Image src="/icons/teamB.svg">` → `src={arenaDetail?.challengerImageUrl || "/icons/teamB.svg"}`
  - 두 `<Image>`에 `className="rounded-full object-cover sm:h-16 sm:w-16"` 유지 및 원형 추가
- **Acceptance**: 투표 카드에 원형 프로필 이미지 표시, 체크마크 배지 위치 유지, fallback 정상 동작

---

## Completion Checklist

- [ ] TypeScript 컴파일 에러 없음 (`npm run build` 또는 tsc)
- [ ] `teamA.svg`, `teamB.svg` 사용처 3개 컴포넌트에서 모두 제거 또는 fallback으로만 사용
- [ ] Convention drift (`interface` → `type`) 수정 완료
- [ ] 게시자/도전자 모두 null 케이스 처리 확인

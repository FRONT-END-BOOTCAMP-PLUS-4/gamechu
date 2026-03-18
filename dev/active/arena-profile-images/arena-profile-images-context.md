# Context: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-19 (UI 개선 완료 — 미커밋, PR 대기 중)

---

## Issue & Branch

- GitHub Issue: #269
- Branch: `feat/#269`
- 상태: **UI 개선 완료, 미커밋, push 및 PR 미생성**

## 커밋 이력

1. `[feat/#269] arena-profile-images 계획 수립` — 계획 파일 3개
2. `[feat/#269] 투기장 상세 페이지 A/B팀 아이콘을 프로필 이미지로 교체` — 실제 구현 (7개 파일)

## 미커밋 변경사항 (commit 필요)

아래 3개 파일이 수정되었으나 아직 커밋되지 않았음:
- `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx`
- `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx`
- `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx`

---

## Key Files

### Backend
| 파일 | 역할 |
|------|------|
| `backend/arena/application/usecase/dto/ArenaDetailDto.ts` | DTO 클래스 — `creatorImageUrl`, `challengerImageUrl` 필드 추가 대상 |
| `backend/arena/application/usecase/GetArenaDetailUsecase.ts` | DTO 생성 로직 — imageUrl 추출 및 전달 수정 대상 |
| `backend/arena/domain/repositories/ArenaRepository.ts` | `ArenaWithRelations` 타입 — 이미 `imageUrl` 포함됨 (수정 불필요) |
| `backend/arena/infra/cache/ArenaCacheService.ts` | Redis 캐시 — JSON 직렬화 방식으로 신규 필드 자동 포함 (수정 불필요) |

### Frontend
| 파일 | 역할 |
|------|------|
| `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx` | 게시글 헤더 — 헤더 전용 인라인 구현 (56px 이미지, 게시자 레이블, 닉네임, 티어뱃지) |
| `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` | 채팅 목록 — teamA/B.svg → 프로필 이미지 (interface→type drift fix 포함) |
| `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` | 투표 컴포넌트 — teamA/B.svg → 프로필 이미지 |
| `app/components/UserProfileComponent.tsx` | 재사용 컴포넌트 — 헤더에서 결국 미사용 (리뷰 목록 전용 크기/스타일) |

---

## Key Decisions

### imageUrl 데이터 흐름
1. `PrismaArenaRepository.getArenaById()` → `arenaRelationSelect`에 `imageUrl: true` 포함 (이미 구현됨)
2. `GetArenaDetailUsecase` → `ArenaDetail.creator?.imageUrl` 접근 가능하지만 현재 DTO에 미포함
3. `ArenaDetailDto` → `creatorImageUrl`, `challengerImageUrl` 필드 추가 필요
4. Zustand `useArenaStore` → `ArenaDetailDto` 그대로 저장되므로 수정 불필요
5. 프론트엔드 컴포넌트 → `arenaDetail?.creatorImageUrl` 사용

### Fallback 처리
- `creatorImageUrl`: `ArenaDetail.creator?.imageUrl || ""`
- `challengerImageUrl`: `ArenaDetail.challenger?.imageUrl || null`
- 프론트엔드에서 URL 없는 경우 teamA/B.svg를 fallback으로 사용

### ArenaDetailHeader — UserProfileComponent 미사용 결정
- 초기에 `UserProfileComponent`를 헤더에 도입했으나 리뷰 목록용으로 설계된 컴포넌트라 헤더 컨텍스트에서 UI가 어색했음
- **방안 A 선택**: `UserProfileComponent` 제거, 헤더 전용 인라인 구현
  - 이미지: `h-10 w-10` (40px, 모바일) → linter가 조정
  - "게시자" 레이블: `text-xs font-bold text-font-200`
  - 닉네임: `text-base font-bold sm:text-lg` + `hover:underline`
  - TierBadge: 닉네임 옆 인라인
  - 클릭: 이미지 button + 닉네임 button 각각 별도로 → 게시자 레이블/티어뱃지 클릭 시 이동 안 함
  - 프로필 이동 로직: `UserProfileComponent`와 동일 (본인/타인 분기)

### Image unoptimized 정책
- 이번 작업에서 추가한 모든 프로필 `<Image>`에서 `unoptimized` **제거** (유저 결정)
- `next.config.ts`의 `remotePatterns`에 등록된 도메인만 사용해야 함 (imgur, imgbb 등)

### 채팅/투표 이미지 원형 처리
- `rounded-full object-cover`만으로는 세로 이미지가 타원으로 늘어남
- **올바른 패턴**: `overflow-hidden rounded-full` wrapper div + `h-full w-full object-cover` Image
- 채팅: `h-8 w-8 shrink-0` wrapper
- 투표: `h-10 w-10 sm:h-16 sm:w-16 shrink-0` wrapper

### Convention Drift
- `ArenaDetailChatList.tsx:7` — `interface ArenaChatListProps` → `type ArenaChatListProps` 변경 필요

---

## Data Structures

### 현재 ArenaDetailDto
```typescript
export class ArenaDetailDto {
    constructor(
        public id: number,
        public creatorId: string,
        public creatorName: string,
        public creatorScore: number,
        public challengerId: string | null,
        public challengerName: string | null,
        public challengerScore: number | null,
        // ... 나머지 필드
    ) {}
}
```

### 수정 후 ArenaDetailDto (추가 필드)
```typescript
public creatorImageUrl: string,        // creatorScore 다음
public challengerImageUrl: string | null,  // challengerScore 다음
```

---

## 구현 완료 상태 및 세션 핵심 정보

### 커밋된 파일 (7개, 2번째 커밋)
1. `backend/arena/application/usecase/dto/ArenaDetailDto.ts` — `creatorImageUrl: string`, `challengerImageUrl: string | null` 추가
2. `backend/arena/application/usecase/GetArenaDetailUsecase.ts` — imageUrl 추출 및 DTO 전달
3. `backend/arena/application/usecase/__tests__/GetArenaDetailUsecase.test.ts` — 캐시 히트 테스트 업데이트
4. `app/(base)/arenas/[id]/page.tsx` — `new ArenaDetailDto(...)` 생성자 인수 추가
5. `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx` — UserProfileComponent 도입 (이후 UI 개선으로 교체됨)
6. `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` — 프로필 이미지 교체
7. `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` — 프로필 이미지 교체

### 미커밋 UI 개선 (3개 파일)
1. `ArenaDetailHeader.tsx` — UserProfileComponent 제거, 헤더 전용 인라인 구현으로 교체, `unoptimized` 제거
2. `ArenaDetailChatList.tsx` — overflow-hidden wrapper div 패턴으로 원형 보정, `unoptimized` 제거
3. `ArenaDetailVote.tsx` — overflow-hidden wrapper div 패턴으로 원형 보정, `unoptimized` 제거

### 계획에 없었던 추가 수정
- `page.tsx`: `new ArenaDetailDto(...)` 직접 생성 코드가 있어 생성자 인수 추가 필요했음. 계획 단계에서 발견 못했으나 tsc 에러로 즉시 발견됨.

### 빌드 상태
- `npm run build` 통과
- 잔존 tsc 에러 2개는 이번 작업과 무관한 기존 테스트 파일 문제:
  - `UpdateArenaUsecase.test.ts:14` — `gameId` 필드 없는 객체 리터럴
  - `ToggleReviewLikeUsecase.test.ts:29,55` — `ReviewDto` 필드 누락

---

## Architecture Notes

- `ArenaDetailDto` 수정 → constructor parameter 순서 변경 시 `GetArenaDetailUsecase`에서 `new ArenaDetailDto(...)` 인수 순서도 동일하게 변경 필요
- Redis 캐시: TTL 2분, 기존 캐시에 새 필드 없어도 프론트 fallback으로 graceful degradation
- `useArenaStore` (Zustand): `ArenaDetailDto` 타입 그대로 사용하므로 TypeScript가 새 필드 자동 인식

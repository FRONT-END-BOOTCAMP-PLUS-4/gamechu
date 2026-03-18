# Context: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-19

---

## Issue & Branch

- GitHub Issue: (생성 후 기입)
- Branch: `feat/#<issue-number>`

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
| `app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx` | 게시글 헤더 — teamA.svg → UserProfileComponent |
| `app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx` | 채팅 목록 — teamA/B.svg → 프로필 이미지 (+ interface→type drift fix) |
| `app/(base)/arenas/[id]/components/ArenaDetailVote.tsx` | 투표 컴포넌트 — teamA/B.svg → 프로필 이미지 |
| `app/components/UserProfileComponent.tsx` | 재사용 컴포넌트 — props: `profileImage`, `nickname`, `score?` (수정 불필요) |

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

### UserProfileComponent 활용
- `ArenaDetailHeader`에서 바로 사용 가능: `profileImage`, `nickname`, `score` props 전달
- 채팅/투표에서는 아이콘 크기 제약이 있어 `<Image>` + `rounded-full`로 직접 처리
  (UserProfileComponent는 44×44 고정 크기이므로 투표 sm:64×64에 맞지 않음)

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

## Architecture Notes

- `ArenaDetailDto` 수정 → constructor parameter 순서 변경 시 `GetArenaDetailUsecase`에서 `new ArenaDetailDto(...)` 인수 순서도 동일하게 변경 필요
- Redis 캐시: TTL 2분, 기존 캐시에 새 필드 없어도 프론트 fallback으로 graceful degradation
- `useArenaStore` (Zustand): `ArenaDetailDto` 타입 그대로 사용하므로 TypeScript가 새 필드 자동 인식

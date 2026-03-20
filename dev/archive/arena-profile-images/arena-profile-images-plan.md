# Plan: 투기장 상세 페이지 프로필 이미지 표시

Last Updated: 2026-03-19

---

## Executive Summary

투기장 상세 페이지(게시글 헤더, 채팅, 투표)에서 현재 사용되는 A/B팀 SVG 아이콘(`teamA.svg`, `teamB.svg`) 대신 실제 사용자 프로필 이미지를 표시하도록 수정한다.

백엔드에서 `ArenaDetailDto`에 `creatorImageUrl` / `challengerImageUrl` 필드를 추가하고, 프론트엔드 3개 컴포넌트에서 `UserProfileComponent` 및 프로필 이미지로 대체한다.

---

## Current State Analysis

### 백엔드
- `ArenaRepository` (`ArenaWithRelations`)은 이미 `imageUrl`을 포함하여 조회함
- 단, `ArenaDetailDto` 생성 시 `imageUrl` 필드를 누락하고 있음
- `GetArenaDetailUsecase`에서 `ArenaDetail.creator.imageUrl`에 접근 가능하지만 DTO에 포함하지 않음

### 프론트엔드
- `ArenaDetailHeader` — teamA.svg 표시, `UserProfileComponent` 미사용
- `ArenaDetailChatList` — 채팅 헤더에 teamA/B.svg 표시
- `ArenaDetailVote` — 투표 영역에 teamA/B.svg 표시 (40×40 → sm:64×64)
- `UserProfileComponent` 존재하나 arena 페이지에서 전혀 활용되지 않음

---

## Proposed Future State

| 위치 | 현재 | 변경 후 |
|------|------|---------|
| 헤더 게시자 | teamA.svg (40×40) | 실제 프로필 이미지 (UserProfileComponent 활용) |
| 채팅 헤더 아이콘 | teamA/B.svg (32×32) | 실제 프로필 이미지 (원형, 32×32) |
| 투표 카드 아이콘 | teamA/B.svg (40×40 / sm:64×64) | 실제 프로필 이미지 (원형, 동일 크기) |

---

## Convention Drift Check

| 항목 | 파일 | 심각도 | 설명 |
|------|------|--------|------|
| props `interface` → `type` | `ArenaDetailChatList.tsx:7` | **medium** | `interface ArenaChatListProps` → `type ArenaChatListProps` |

> 나머지 파일은 conventions 준수 확인.

**Mitigation**: Phase C 작업에서 drift 수정을 함께 처리한다.

---

## Implementation Phases

### Phase A — Backend: ArenaDetailDto 확장 (S)

`ArenaWithRelations`이 이미 `imageUrl`을 포함하므로 DTO와 usecase만 수정하면 된다.

**A-1. `ArenaDetailDto`에 이미지 URL 필드 추가**
- `creatorImageUrl: string` 추가
- `challengerImageUrl: string | null` 추가
- 필드 위치: "관련 테이블 필드" 그룹 (creatorName, creatorScore 다음)

**A-2. `GetArenaDetailUsecase` 수정**
- `ArenaDetail.creator?.imageUrl || ""` 추출
- `ArenaDetail.challenger?.imageUrl || null` 추출
- `new ArenaDetailDto(...)` 호출 시 두 필드 포함

**캐시 영향**:
- 기존 캐시(TTL 2분)에는 새 필드가 없으므로 배포 직후 최대 2분간 이미지 URL이 없는 응답 가능
- 프론트엔드에서 null/undefined 처리로 fallback 처리 → 문제 없음

---

### Phase B — Frontend: ArenaDetailHeader 수정 (S)

**B-1. teamA.svg → UserProfileComponent 교체**
- `UserProfileComponent`는 프로필 이미지 + 닉네임 + TierBadge를 포함
- 헤더에는 "게시자" 레이블 유지 필요 → `UserProfileComponent` 위에 레이블 추가하거나 별도 레이아웃 유지
- `arenaDetail?.creatorImageUrl`, `arenaDetail?.creatorName`, `arenaDetail?.creatorScore` 전달
- fallback: `creatorImageUrl`이 없을 경우 기본 이미지(`/icons/teamA.svg`)

---

### Phase C — Frontend: ArenaDetailChatList 수정 (S)

**C-1. props interface → type drift 수정**
- `interface ArenaChatListProps` → `type ArenaChatListProps`

**C-2. 채팅 헤더 아이콘 교체**
- `<Image src="/icons/teamA.svg" ...>` → `<Image src={arenaDetail?.creatorImageUrl || "/icons/teamA.svg"} ...>`
- `<Image src="/icons/teamB.svg" ...>` → `<Image src={arenaDetail?.challengerImageUrl || "/icons/teamB.svg"} ...>`
- 크기 유지 (32×32), 원형 처리(`rounded-full`, `object-cover`)

---

### Phase D — Frontend: ArenaDetailVote 수정 (S)

**D-1. 투표 카드 아이콘 교체**
- 게시자 측: `<Image src="/icons/teamA.svg">` → 프로필 이미지 (40×40 / sm:64×64)
- 도전자 측: `<Image src="/icons/teamB.svg">` → 프로필 이미지 (40×40 / sm:64×64)
- `rounded-full`, `object-cover` 클래스 추가로 원형 표시
- fallback: 이미지 URL 없을 경우 teamA/B.svg 유지

---

## Risk Assessment

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| 기존 캐시에 imageUrl 필드 없음 | 낮음 | TTL 2분 자연 만료, fallback 이미지로 graceful degradation |
| challenger가 없는 경우 (null) | 낮음 | `challengerImageUrl: string \| null`, 프론트에서 null 체크 |
| 프로필 이미지 URL 유효하지 않은 경우 | 낮음 | `unoptimized` + `onError` fallback 또는 teamA/B.svg로 대체 |
| Convention drift (interface → type) | medium | Phase C에서 함께 수정 |

---

## Success Metrics

- [ ] 투기장 상세 헤더에 게시자 프로필 이미지 표시
- [ ] 채팅 메시지 헤더에 프로필 이미지 표시 (teamA/B.svg 제거)
- [ ] 투표 카드에 게시자/도전자 프로필 이미지 표시 (teamA/B.svg 제거)
- [ ] 프로필 이미지 없는 경우 fallback 정상 동작
- [ ] TypeScript 컴파일 에러 없음
- [ ] Convention drift 수정 완료

---

## Dependencies

| 작업 | 의존 |
|------|------|
| Phase B, C, D | Phase A 완료 (ArenaDetailDto 확장) |
| B, C, D는 서로 독립적으로 진행 가능 | — |

---

## Files to Modify

```
backend/arena/application/usecase/dto/ArenaDetailDto.ts
backend/arena/application/usecase/GetArenaDetailUsecase.ts
app/(base)/arenas/[id]/components/ArenaDetailHeader.tsx
app/(base)/arenas/[id]/components/ArenaDetailChatList.tsx
app/(base)/arenas/[id]/components/ArenaDetailVote.tsx
```

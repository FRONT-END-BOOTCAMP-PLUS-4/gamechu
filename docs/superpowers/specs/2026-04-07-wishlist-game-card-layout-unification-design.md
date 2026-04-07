# 마이페이지 위시리스트 탭 게임 카드 레이아웃 통일 Design

**Date**: 2026-04-07
**Status**: Ready
**Branch**: `style/#296`
**Issue**: #296

---

## Problem

마이페이지 위시리스트 탭(`ProfileWishlistTab`)의 게임 목록 그리드 레이아웃이 게임 탐색 페이지(`/games`)의 `GameCardList` 컴포넌트와 달라 시각적 불일치가 발생함.

| 위치 | 현재 레이아웃 | 최대 열 수 |
|------|------------|-----------|
| `ProfileWishlistTab` (위시리스트 탭) | `grid-cols-1 md:grid-cols-2` | 2열 |
| `GameCardList` (게임 탐색 페이지) | `grid-cols-2 lg:grid-cols-5` | 5열 |

같은 `GameCard` 컴포넌트를 사용하면서도 그리드 래퍼가 달라 동일한 게임 카드가 페이지마다 다르게 보임.

---

## Root Cause

`ProfileWishlistTab.tsx`가 `GameCardList`를 재사용하지 않고 직접 `<div className="grid grid-cols-1 gap-6 md:grid-cols-2">` 래퍼를 수동으로 정의하여 `GameCard`를 반복 렌더링하고 있기 때문.

```tsx
// 현재 코드 (ProfileWishlistTab.tsx:42-46)
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {games.map((game) => (
        <GameCard key={game.id} {...game} />
    ))}
</div>
```

---

## Decisions

| 질문 | 결정 | 근거 |
|------|------|------|
| `GameCardList`로 교체할 것인가 | 교체 | 그리드 레이아웃을 단일 출처(GameCardList)로 통일, 향후 레이아웃 변경 시 한 곳만 수정 |
| 빈 상태 메시지를 `GameCardList`에 위임할 것인가 | 위임 안 함 | `GameCardList`의 빈 상태는 "검색 결과가 없습니다"(검색 특화 문구 + 이미지)이므로 위시리스트 컨텍스트에 부적합 |
| `Pager`는 유지할 것인가 | 유지 | 위시리스트 전용 페이지네이션 기능은 `GameCardList` 범위 밖 |

---

## Architecture

### 변경 전

```
ProfileWishlistTab
  ├── 빈 상태: <p>위시리스트에 등록된 게임이 없습니다.</p>
  └── 게임 있음:
        ├── <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        │     └── GameCard × N  (직접 렌더링)
        └── Pager
```

### 변경 후

```
ProfileWishlistTab
  ├── 빈 상태: <p>위시리스트에 등록된 게임이 없습니다.</p>  ← 유지
  └── 게임 있음:
        ├── GameCardList  ← grid-cols-2 lg:grid-cols-5 (재사용)
        └── Pager         ← 유지
```

### 수정 코드

```tsx
// ProfileWishlistTab.tsx 변경 사항

// Before
import GameCard from "@/app/(base)/games/components/GameCard";
// ...
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {games.map((game) => (
        <GameCard key={game.id} {...game} />
    ))}
</div>

// After
import GameCardList from "@/app/(base)/games/components/GameCardList";
// ...
<GameCardList games={games} />
```

---

## Testing

### 신규 테스트: `ProfileWishlistTab.test.tsx`

| 케이스 | 입력 | 기대 |
|--------|------|------|
| 빈 상태 메시지 | `games=[]` | "위시리스트에 등록된 게임이 없습니다." 노출 |
| `GameCardList` 렌더링 | `games=[...]` | `GameCardList` 컴포넌트가 렌더링됨 |
| 빈 상태 메시지 미노출 | `games=[...]` | 빈 상태 문구 미노출 |

**TDD 순서**: `GameCardList` mock → `data-testid="game-card-list"` 확인 → 구현 전 RED → 구현 후 GREEN

---

## Out of Scope

- `GameCardList.tsx` 자체 수정 (레이아웃 클래스 변경 없음)
- `Pager` 동작 변경
- API / 데이터 페칭 로직 변경
- 위시리스트 탭 외 다른 탭 레이아웃 변경

---

## Affected Files

| 파일 | 변경 |
|------|------|
| `app/(base)/profile/components/tabs/ProfileWishlistTab.tsx` | `GameCard` import 제거, `GameCardList` import 추가, 수동 grid div → `GameCardList` 교체 |
| `app/(base)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx` | 신규 생성 (3 test cases) |

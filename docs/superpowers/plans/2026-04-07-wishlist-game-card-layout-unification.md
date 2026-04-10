# Wishlist Game Card Layout Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ProfileWishlistTab`의 수동 grid 레이아웃을 `GameCardList` 컴포넌트로 교체하여 위시리스트와 게임 탐색 페이지의 게임 카드 레이아웃을 통일한다.

**Architecture:** 빈 상태 처리는 `ProfileWishlistTab`에 유지(위시리스트 고유 메시지 보존)하고, 게임 목록 렌더링만 `GameCardList`로 위임한다. `GameCardList`의 `grid-cols-2 lg:grid-cols-5` 레이아웃을 재사용하여 단일 출처를 만든다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS 3, Vitest 4, Testing Library

---

## File Structure

| 파일                                                                       | 역할                             | 작업                                        |
| -------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------- |
| `app/(base)/profile/components/tabs/ProfileWishlistTab.tsx`                | 위시리스트 탭 UI 컴포넌트        | **수정** — `GameCard` → `GameCardList` 교체 |
| `app/(base)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx` | `ProfileWishlistTab` 단위 테스트 | **신규 생성**                               |

참고 파일 (수정 없음):

- `app/(base)/games/components/GameCardList.tsx` — 재사용할 그리드 컴포넌트
- `app/(base)/games/components/GameCard.tsx` — `GameCardList` 내부에서 사용

---

### Task 1: 실패하는 테스트 작성

**Files:**

- Create: `app/(base)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx`

- [ ] **Step 1: `__tests__` 디렉토리를 확인하고 테스트 파일 생성**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileWishlistTab from "../ProfileWishlistTab";

vi.mock("@/app/(base)/games/components/GameCardList", () => ({
    default: ({ games }: { games: unknown[] }) => (
        <div data-testid="game-card-list" data-count={games.length} />
    ),
}));

vi.mock("@/app/components/Pager", () => ({
    default: () => <div data-testid="pager" />,
}));

const defaultProps = {
    games: [],
    pages: [],
    currentPage: 1,
    endPage: 1,
    onPageChange: vi.fn(),
};

const sampleGames = [
    {
        id: 1,
        title: "사이버펑크 2077",
        developer: "CD Projekt Red",
        thumbnail: "/img1.jpg",
        platform: "PC",
        expertRating: 8.5,
        reviewCount: 42,
    },
    {
        id: 2,
        title: "엘든 링",
        developer: "FromSoftware",
        thumbnail: "/img2.jpg",
        platform: "PC",
        expertRating: 9.5,
        reviewCount: 100,
    },
];

describe("ProfileWishlistTab", () => {
    it("게임이 없을 때 위시리스트 고유 빈 상태 메시지를 표시한다", () => {
        render(<ProfileWishlistTab {...defaultProps} />);
        expect(
            screen.getByText("위시리스트에 등록된 게임이 없습니다.")
        ).toBeDefined();
    });

    it("게임이 있을 때 GameCardList를 렌더링한다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1]}
                endPage={1}
            />
        );
        expect(screen.getByTestId("game-card-list")).toBeDefined();
    });

    it("게임이 있을 때 빈 상태 메시지를 표시하지 않는다", () => {
        render(
            <ProfileWishlistTab
                {...defaultProps}
                games={sampleGames}
                pages={[1]}
                endPage={1}
            />
        );
        expect(
            screen.queryByText("위시리스트에 등록된 게임이 없습니다.")
        ).toBeNull();
    });
});
```

- [ ] **Step 2: 테스트 실행 — 2번 케이스가 FAIL인지 확인**

```bash
npx vitest run app/\(base\)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx
```

Expected output:

```
FAIL  app/(base)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx
 × 게임이 있을 때 GameCardList를 렌더링한다
```

1번과 3번은 PASS, 2번만 FAIL이어야 함 (현재 구현이 `GameCard`를 직접 사용하므로 `data-testid="game-card-list"`가 없음).

---

### Task 2: ProfileWishlistTab 구현 수정

**Files:**

- Modify: `app/(base)/profile/components/tabs/ProfileWishlistTab.tsx`

- [ ] **Step 3: `ProfileWishlistTab.tsx` 수정**

현재 파일 전체를 아래로 교체:

```tsx
"use client";

import GameCardList from "@/app/(base)/games/components/GameCardList";
import Pager from "@/app/components/Pager";

interface Game {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
    expertRating: number;
    reviewCount: number;
}

interface Props {
    games: Game[];
    pages: number[];
    currentPage: number;
    endPage: number;
    onPageChange: (page: number) => void;
}

export default function ProfileWishlistTab({
    games,
    pages,
    currentPage,
    endPage,
    onPageChange,
}: Props) {
    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="mb-2 text-lg font-semibold">위시리스트 목록</h2>

            {games.length === 0 ? (
                <p className="text-sm text-font-200">
                    위시리스트에 등록된 게임이 없습니다.
                </p>
            ) : (
                <>
                    <GameCardList games={games} />

                    {endPage > 1 && (
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={onPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}
```

핵심 변경점:

- `import GameCard from "@/app/(base)/games/components/GameCard"` → 삭제
- `import GameCardList from "@/app/(base)/games/components/GameCardList"` → 추가
- `<div className="grid grid-cols-1 gap-6 md:grid-cols-2"> ... </div>` → `<GameCardList games={games} />` 로 교체

- [ ] **Step 4: 테스트 재실행 — 3/3 PASS 확인**

```bash
npx vitest run app/\(base\)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx
```

Expected output:

```
PASS  app/(base)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx
 ✓ 게임이 없을 때 위시리스트 고유 빈 상태 메시지를 표시한다
 ✓ 게임이 있을 때 GameCardList를 렌더링한다
 ✓ 게임이 있을 때 빈 상태 메시지를 표시하지 않는다

Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 5: 전체 테스트 suite 실행 — 기존 테스트 회귀 없음 확인**

```bash
npm test
```

Expected: 기존 전체 테스트 통과 + 신규 3개 추가 통과.

- [ ] **Step 6: lint 통과 확인**

```bash
npm run lint
```

Expected: 에러 없음.

- [ ] **Step 7: 커밋**

```bash
git add app/\(base\)/profile/components/tabs/ProfileWishlistTab.tsx app/\(base\)/profile/components/tabs/__tests__/ProfileWishlistTab.test.tsx
git commit -m "[style/#296] 위시리스트 탭 게임 카드 레이아웃을 GameCardList로 통일"
```

---

## Self-Review

### Spec Coverage 확인

| 스펙 요구사항                                                                         | 커버 Task                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------ |
| `ProfileWishlistTab`에서 수동 grid div + GameCard 반복 렌더링을 `GameCardList`로 교체 | Task 2, Step 3                             |
| 빈 상태 메시지("위시리스트에 등록된 게임이 없습니다")는 위시리스트 고유 메시지 유지   | Task 1 (테스트로 보호), Task 2 (구현 유지) |

### Placeholder 스캔

없음. 모든 step에 실제 코드 포함.

### 타입 일관성 확인

- `Game` 인터페이스: `ProfileWishlistTab.tsx`의 기존 정의 그대로 유지
- `GameCardList`의 `GameCardData` 인터페이스와 필드 완전 일치 (`id`, `title`, `developer`, `thumbnail`, `platform`, `expertRating`, `reviewCount`)

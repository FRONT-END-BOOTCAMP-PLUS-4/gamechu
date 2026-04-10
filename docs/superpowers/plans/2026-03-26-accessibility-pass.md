# Accessibility Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix keyboard navigation, screen reader support, and focus management across GameChu's frontend components.

**Architecture:** (1) Replace all `<div onClick>` card wrappers with a new `<CardLink>` semantic anchor component. (2) Add ARIA labels to TierBadge, GameCard scores, and Header buttons. (3) Add `role="dialog"`, `aria-modal`, and `focus-trap-react` to `ModalWrapper`. (4) Improve Header hamburger keyboard support. (5) Add skip-to-content link.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS 3, `@testing-library/react`, Vitest 4, `focus-trap-react`

**Branch & issue:** Create a GitHub issue first. Use branch `feat/#NNN` (replace NNN with your issue number) and prefix all commits `[feat/#NNN]`.

---

## File Map

| File                                                         | Status     | Change                                                                |
| ------------------------------------------------------------ | ---------- | --------------------------------------------------------------------- |
| `app/components/CardLink.tsx`                                | **Create** | Semantic `<Link>` wrapper for clickable cards                         |
| `app/components/__tests__/CardLink.test.tsx`                 | **Create** | Unit tests for CardLink                                               |
| `app/(base)/games/components/GameCard.tsx`                   | Modify     | div→CardLink, aria-labels on score/review                             |
| `app/(base)/games/components/__tests__/GameCard.test.tsx`    | **Create** | Renders `<a>` not `<div>`, aria-labels present                        |
| `app/(base)/arenas/components/RecruitingArenaCard.tsx`       | Modify     | div→CardLink                                                          |
| `app/(base)/arenas/components/DebatingArenaCard.tsx`         | Modify     | div→CardLink                                                          |
| `app/(base)/arenas/components/WaitingArenaCard.tsx`          | Modify     | div→CardLink                                                          |
| `app/(base)/arenas/components/VotingArenaCard.tsx`           | Modify     | div→CardLink                                                          |
| `app/(base)/arenas/components/CompleteArenaCard.tsx`         | Modify     | div→CardLink                                                          |
| `app/(base)/arenas/components/__tests__/ArenaCards.test.tsx` | **Create** | Arena cards render `<a>` tags                                         |
| `app/components/TierBadge.tsx`                               | Modify     | role="img", aria-label, alt="" on Image                               |
| `app/components/__tests__/TierBadge.test.tsx`                | **Create** | role/aria-label on wrapper                                            |
| `app/components/ModalWrapper.tsx`                            | Modify     | role="dialog", aria-modal, FocusTrap, labelId prop                    |
| `app/components/__tests__/ModalWrapper.test.tsx`             | **Create** | role/aria-modal present, FocusTrap active                             |
| `app/(base)/components/NotificationModal.tsx`                | Modify     | Add title `<h2>` with id, pass labelId                                |
| `app/(base)/arenas/components/CreateArenaModal.tsx`          | Modify     | Add id to existing `<h2>`, pass labelId                               |
| `app/(base)/profile/components/PointHelpModal.tsx`           | Modify     | Add FocusTrap, remove manual Escape/focus handlers                    |
| `app/components/Header.tsx`                                  | Modify     | aria-expanded, aria-controls, aria-hidden, aria-label on bell buttons |
| `app/components/__tests__/Header.test.tsx`                   | **Create** | Hamburger aria-expanded, mobile menu aria-hidden                      |
| `app/layout.tsx`                                             | Modify     | Skip-to-content link                                                  |
| `app/(base)/layout.tsx`                                      | Modify     | id="main-content" on `<main>`                                         |

---

## Task 1: Install focus-trap-react

**Files:**

- Modify: `package.json` (via npm)

- [ ] **Step 1: Install packages**

```bash
npm install focus-trap-react focus-trap
```

- [ ] **Step 2: Verify TypeScript types resolve**

`focus-trap-react` ships with its own types. Check it compiles:

```bash
node -e "require('focus-trap-react'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
[feat/#NNN] focus-trap-react 의존성 추가

접근성 개선을 위해 모달 포커스 트랩 라이브러리를 설치합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create CardLink component

**Files:**

- Create: `app/components/CardLink.tsx`
- Create: `app/components/__tests__/CardLink.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/components/__tests__/CardLink.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CardLink from "../CardLink";

describe("CardLink", () => {
    it("renders an anchor tag (not a div)", () => {
        render(
            <CardLink href="/games/1" aria-label="테스트 게임 상세보기">
                <span>Card content</span>
            </CardLink>
        );
        const link = screen.getByRole("link", { name: "테스트 게임 상세보기" });
        expect(link).toBeDefined();
        expect(link.tagName).toBe("A");
    });

    it("passes href to the anchor", () => {
        render(
            <CardLink href="/games/42">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe("/games/42");
    });

    it("merges className onto the anchor", () => {
        render(
            <CardLink href="/games/1" className="rounded-xl">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.className).toContain("rounded-xl");
    });

    it("has focus-visible ring classes", () => {
        render(
            <CardLink href="/games/1">
                <span>content</span>
            </CardLink>
        );
        const link = screen.getByRole("link");
        expect(link.className).toContain("focus-visible:ring-2");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- CardLink --reporter=verbose
```

Expected: FAIL — `CardLink` module not found.

- [ ] **Step 3: Create the component**

Create `app/components/CardLink.tsx`:

```tsx
import Link from "next/link";
import { ReactNode } from "react";

type CardLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-label"?: string;
};

export default function CardLink({
    href,
    children,
    className,
    "aria-label": ariaLabel,
}: CardLinkProps) {
    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-purple-100 ${className ?? ""}`}
        >
            {children}
        </Link>
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- CardLink --reporter=verbose
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/CardLink.tsx app/components/__tests__/CardLink.test.tsx
git commit -m "$(cat <<'EOF'
[feat/#NNN] CardLink 컴포넌트 추가

div onClick 대신 사용할 시맨틱 링크 래퍼를 생성합니다.
키보드 탐색 및 스크린리더 접근성을 위해 Next.js Link 기반으로 구현합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Update GameCard

**Files:**

- Modify: `app/(base)/games/components/GameCard.tsx`
- Create: `app/(base)/games/components/__tests__/GameCard.test.tsx`

Current: outer `<div onClick={handleClick} className="... cursor-pointer ...">` with `useRouter`.
Target: `<CardLink href={/games/${id}} aria-label={${title} 게임 상세보기} className="rounded-xl ...">`. Score and review containers get `aria-label`. Icon Images get `alt=""`.

- [ ] **Step 1: Write the failing test**

Create `app/(base)/games/components/__tests__/GameCard.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameCard from "../GameCard";

const defaultProps = {
    id: 1,
    platform: "PC",
    title: "사이버펑크 2077",
    expertRating: 8.5,
    developer: "CD Projekt Red",
    thumbnail: "https://example.com/thumb.jpg",
    reviewCount: 42,
};

describe("GameCard", () => {
    it("renders a link, not a clickable div", () => {
        render(<GameCard {...defaultProps} />);
        const link = screen.getByRole("link", {
            name: "사이버펑크 2077 게임 상세보기",
        });
        expect(link).toBeDefined();
        expect(link.tagName).toBe("A");
    });

    it("link href points to the game detail page", () => {
        render(<GameCard {...defaultProps} />);
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe("/games/1");
    });

    it("review count container has aria-label", () => {
        render(<GameCard {...defaultProps} />);
        const reviewEl = screen.getByLabelText("리뷰 42개");
        expect(reviewEl).toBeDefined();
    });

    it("rating container has aria-label", () => {
        render(<GameCard {...defaultProps} />);
        const ratingEl = screen.getByLabelText("전문가 평점 8.5");
        expect(ratingEl).toBeDefined();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- GameCard --reporter=verbose
```

Expected: FAIL — link not found, aria-labels not found.

- [ ] **Step 3: Update GameCard**

Replace `app/(base)/games/components/GameCard.tsx` with:

```tsx
"use client";
import Image from "next/image";
import CardLink from "@/app/components/CardLink";

interface GameCardProps {
    id: number;
    platform: string;
    title: string;
    expertRating: number;
    developer: string;
    thumbnail: string;
    reviewCount: number;
}

export default function GameCard({
    id,
    platform,
    title,
    expertRating,
    developer,
    thumbnail,
    reviewCount,
}: GameCardProps) {
    const thumbnailSrc =
        !thumbnail || !thumbnail.trim()
            ? "/icons/default-thumbnail.svg"
            : thumbnail.startsWith("//")
              ? `https:${thumbnail}`
              : thumbnail;

    return (
        <CardLink
            href={`/games/${id}`}
            aria-label={`${title} 게임 상세보기`}
            className="relative flex w-full flex-col overflow-hidden rounded-xl bg-background-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background-200"
        >
            {/* 이미지 영역 */}
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={thumbnailSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                />

                {/* 플랫폼 태그 */}
                <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {platform}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="flex flex-col gap-2 p-3 sm:p-4">
                <h2 className="line-clamp-1 text-sm font-bold text-font-100 transition-colors group-hover:text-primary-purple-200 sm:text-base">
                    {title}
                </h2>

                <div className="flex items-center justify-between">
                    <span className="line-clamp-1 text-[11px] text-font-300 sm:text-xs">
                        {developer}
                    </span>
                </div>

                {/* 별점 */}
                <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2">
                    <div
                        className="flex items-center gap-1"
                        aria-label={`리뷰 ${reviewCount}개`}
                    >
                        <Image
                            src="/icons/review.svg"
                            alt=""
                            width={14}
                            height={14}
                            className="opacity-70"
                        />
                        <span className="text-[11px] text-font-200">
                            {reviewCount}
                        </span>
                    </div>

                    <div
                        className="flex items-center gap-1 rounded-lg bg-primary-purple-300/10 px-2 py-0.5"
                        aria-label={`전문가 평점 ${(expertRating ?? 0).toFixed(1)}`}
                    >
                        <Image
                            src="/icons/empty-purple-star.svg"
                            alt=""
                            width={12}
                            height={12}
                        />
                        <span className="text-[12px] font-bold text-primary-purple-100">
                            {(expertRating ?? 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- GameCard --reporter=verbose
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/(base)/games/components/GameCard.tsx app/(base)/games/components/__tests__/GameCard.test.tsx
git commit -m "$(cat <<'EOF'
[feat/#NNN] GameCard div→CardLink 교체 및 ARIA 레이블 추가

키보드 탐색 가능하도록 clickable div를 시맨틱 링크로 교체합니다.
평점 및 리뷰 수 컨테이너에 스크린리더용 aria-label을 추가합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Update arena card components (5 cards)

**Files:**

- Modify: `app/(base)/arenas/components/RecruitingArenaCard.tsx`
- Modify: `app/(base)/arenas/components/DebatingArenaCard.tsx`
- Modify: `app/(base)/arenas/components/WaitingArenaCard.tsx`
- Modify: `app/(base)/arenas/components/VotingArenaCard.tsx`
- Modify: `app/(base)/arenas/components/CompleteArenaCard.tsx`
- Create: `app/(base)/arenas/components/__tests__/ArenaCards.test.tsx`

The pattern for all 5 cards is the same:

- Remove `useRouter` import and `onClickHandler` / `router.push`
- Replace outer `<div onClick={onClickHandler} className="... hover:cursor-pointer ...">` with `<CardLink href={/arenas/${props.id}} aria-label={${props.title} 아레나} className="flex h-full w-full ...">`
- Drop `cursor-pointer` from className (native to `<a>`)

- [ ] **Step 1: Write the failing test**

Create `app/(base)/arenas/components/__tests__/ArenaCards.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecruitingArenaCard from "../RecruitingArenaCard";
import DebatingArenaCard from "../DebatingArenaCard";
import WaitingArenaCard from "../WaitingArenaCard";
import VotingArenaCard from "../VotingArenaCard";
import CompleteArenaCard from "../CompleteArenaCard";

const baseDate = new Date("2026-04-01T10:00:00");

describe("Arena cards render semantic links", () => {
    it("RecruitingArenaCard renders an anchor", () => {
        render(
            <RecruitingArenaCard
                id={1}
                creatorNickname="홍길동"
                creatorProfileImageUrl="/icons/default-profile.svg"
                creatorScore={500}
                title="PS5 vs Xbox 논쟁"
                description="어느 쪽이 더 나은가"
                startDate={baseDate}
            />
        );
        const link = screen.getByRole("link", {
            name: "PS5 vs Xbox 논쟁 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/1");
    });

    it("DebatingArenaCard renders an anchor", () => {
        render(
            <DebatingArenaCard
                id={2}
                title="롤 vs 발로란트"
                creatorNickname="유저A"
                creatorScore={500}
                challengerNickname="유저B"
                challengerScore={600}
                debateEndDate={baseDate}
            />
        );
        const link = screen.getByRole("link", {
            name: "롤 vs 발로란트 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/2");
    });

    it("WaitingArenaCard renders an anchor", () => {
        render(
            <WaitingArenaCard
                id={3}
                title="PC vs 콘솔"
                creatorNickname="유저C"
                creatorScore={500}
                challengerNickname="유저D"
                challengerScore={700}
                startDate={baseDate}
            />
        );
        const link = screen.getByRole("link", { name: "PC vs 콘솔 아레나" });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/3");
    });

    it("VotingArenaCard renders an anchor", () => {
        render(
            <VotingArenaCard
                id={4}
                title="젤다 vs 마리오"
                creatorNickname="유저E"
                creatorScore={500}
                challengerNickname="유저F"
                challengerScore={800}
                voteEndDate={baseDate}
                voteCount={10}
            />
        );
        const link = screen.getByRole("link", {
            name: "젤다 vs 마리오 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/4");
    });

    it("CompleteArenaCard renders an anchor", () => {
        render(
            <CompleteArenaCard
                id={5}
                title="포켓몬 vs 디지몬"
                description="최고의 몬스터 게임"
                creatorNickname="유저G"
                creatorProfileImageUrl="/icons/default-profile.svg"
                creatorScore={500}
                challengerNickname="유저H"
                challengerProfileImageUrl="/icons/default-profile.svg"
                challengerScore={900}
                voteCount={20}
                leftCount={12}
                rightCount={8}
                leftPercent={60}
                rightPercent={40}
            />
        );
        const link = screen.getByRole("link", {
            name: "포켓몬 vs 디지몬 아레나",
        });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/arenas/5");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ArenaCards --reporter=verbose
```

Expected: FAIL — links not found (cards render divs).

- [ ] **Step 3: Update RecruitingArenaCard**

Replace `app/(base)/arenas/components/RecruitingArenaCard.tsx`:

```tsx
"use client";

import TierBadge from "@/app/components/TierBadge";
import CardLink from "@/app/components/CardLink";
import Image from "next/image";

type RecruitingArenaCardProps = {
    id: number;
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorScore: number;
    title: string;
    description: string;
    startDate: Date;
    showBadgeIconOnly?: boolean;
};

export default function RecruitingArenaCard({
    showBadgeIconOnly = false,
    ...props
}: RecruitingArenaCardProps) {
    return (
        <CardLink
            href={`/arenas/${props.id}`}
            aria-label={`${props.title} 아레나`}
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="flex flex-row items-center justify-between gap-1">
                {/* 작성자 정보 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="aspect-square rounded-full object-cover"
                    />
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge
                        score={props.creatorScore}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-background-200 px-3 text-xs font-semibold">
                    모집중
                </div>
            </div>

            <div className="flex-grow rounded-2xl bg-background-200 p-4">
                {/* 제목 */}
                <div className="break-keep text-base font-semibold text-white">
                    {props.title}
                </div>

                {/* 설명 */}
                <div className="line-clamp-3 overflow-hidden break-keep text-sm text-gray-300">
                    {props.description}
                </div>
            </div>

            {/* 하단 영역 */}
            <div className="mt-2 flex items-center justify-between">
                {/* 시작 시간 */}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span>
                        토론 시작:{" "}
                        {props.startDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 4: Update DebatingArenaCard**

Replace `app/(base)/arenas/components/DebatingArenaCard.tsx`:

```tsx
"use client";

import TierBadge from "@/app/components/TierBadge";
import CardLink from "@/app/components/CardLink";
import Image from "next/image";

type DebatingArenaCardProps = {
    id: number;
    title: string;
    creatorNickname: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerScore: number | null;
    debateEndDate: Date;
    showBadgeIconOnly?: boolean;
};

export default function DebatingArenaCard({
    showBadgeIconOnly = false,
    ...props
}: DebatingArenaCardProps) {
    return (
        <CardLink
            href={`/arenas/${props.id}`}
            aria-label={`${props.title} 아레나`}
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="flex flex-row items-start justify-between gap-1">
                <div className="line-clamp-2 min-h-[3.5rem] break-keep text-lg font-bold">
                    {props.title}
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-purple-500 px-3 text-xs font-semibold">
                    토론중
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-100">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge score={props.creatorScore} />
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge
                        score={props.challengerScore || 0}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        토론 종료:{" "}
                        {props.debateEndDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 5: Update WaitingArenaCard**

Replace `app/(base)/arenas/components/WaitingArenaCard.tsx`:

```tsx
"use client";

import TierBadge from "@/app/components/TierBadge";
import CardLink from "@/app/components/CardLink";
import Image from "next/image";

type WaitingArenaCardProps = {
    id: number;
    title: string;
    creatorNickname: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerScore: number | null;
    startDate: Date;
    showBadgeIconOnly?: boolean;
};

export default function WaitingArenaCard({
    showBadgeIconOnly = false,
    ...props
}: WaitingArenaCardProps) {
    return (
        <CardLink
            href={`/arenas/${props.id}`}
            aria-label={`${props.title} 아레나`}
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="flex flex-row items-start justify-between gap-1">
                <div className="line-clamp-2 min-h-[3.5rem] break-keep text-lg font-bold">
                    {props.title}
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-background-200 px-3 text-xs font-semibold">
                    대기중
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-100">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge
                        score={props.creatorScore}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge
                        score={props.challengerScore || 0}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        토론 시작:{" "}
                        {props.startDate.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 6: Update VotingArenaCard**

Replace `app/(base)/arenas/components/VotingArenaCard.tsx`:

```tsx
"use client";

import TierBadge from "@/app/components/TierBadge";
import CardLink from "@/app/components/CardLink";
import Image from "next/image";

type VotingArenaCardProps = {
    id: number;
    title: string;
    creatorNickname: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerScore: number | null;
    voteEndDate: Date;
    voteCount: number;
    showBadgeIconOnly?: boolean;
};

export default function VotingArenaCard({
    showBadgeIconOnly = false,
    ...props
}: VotingArenaCardProps) {
    return (
        <CardLink
            href={`/arenas/${props.id}`}
            aria-label={`${props.title} 아레나`}
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="flex flex-row items-start justify-between gap-1">
                <div className="line-clamp-2 min-h-[3.5rem] break-keep text-lg font-bold">
                    {props.title}
                </div>
                <div className="flex h-6 flex-shrink-0 items-center rounded-full bg-purple-500 px-3 text-xs font-semibold">
                    투표중
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-100">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge
                        score={props.creatorScore}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>

                <span className="mx-2 text-gray-400">vs</span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <span className="max-w-[100px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge
                        score={props.challengerScore || 0}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">
                        {props.voteEndDate.toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/voteComplete.svg"
                        alt="투표완료 아이콘"
                        width={18}
                        height={18}
                        className="object-contain"
                    />
                    <span className="text-gray-400">{props.voteCount}명</span>
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 7: Update CompleteArenaCard**

Replace `app/(base)/arenas/components/CompleteArenaCard.tsx`:

```tsx
"use client";

import TierBadge from "@/app/components/TierBadge";
import CardLink from "@/app/components/CardLink";
import Image from "next/image";
import VoteStatusBar from "./VoteStatusBar";

type CompleteArenaCardProps = {
    id: number;
    title: string;
    description: string;
    creatorNickname: string;
    creatorProfileImageUrl: string;
    creatorScore: number;
    challengerNickname: string | null;
    challengerProfileImageUrl: string | null;
    challengerScore: number | null;
    voteCount: number;
    leftCount: number;
    rightCount: number;
    leftPercent: number;
    rightPercent: number;
    showBadgeIconOnly?: boolean;
};

export default function CompleteArenaCard({
    showBadgeIconOnly = false,
    ...props
}: CompleteArenaCardProps) {
    return (
        <CardLink
            href={`/arenas/${props.id}`}
            aria-label={`${props.title} 아레나`}
            className="flex h-full w-full transform flex-col gap-4 rounded-2xl border border-transparent bg-background-300 p-4 text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="flex-grow rounded-2xl bg-background-200 p-4">
                {/* 제목 */}
                <div className="break-keep text-base font-semibold text-white">
                    {props.title}
                </div>
            </div>

            <VoteStatusBar
                voteCount={props.voteCount}
                leftPercent={props.leftPercent}
                rightPercent={props.rightPercent}
            />
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between">
                {/* 작성자 */}
                <div className="flex min-w-0 flex-shrink items-center gap-2 overflow-hidden">
                    <Image
                        src={props.creatorProfileImageUrl}
                        alt="작성자 프로필"
                        width={24}
                        height={24}
                        className="aspect-square rounded-full object-cover"
                    />
                    <span className="max-w-[80px] truncate whitespace-nowrap">
                        {props.creatorNickname}
                    </span>
                    <TierBadge
                        score={props.creatorScore}
                        iconOnly={showBadgeIconOnly}
                    />
                    <span className="whitespace-nowrap">
                        {props.leftPercent}%
                    </span>
                </div>

                <span className="mx-2 flex-shrink-0 items-center text-gray-400">
                    vs
                </span>

                {/* 도전자 */}
                <div className="flex min-w-0 flex-shrink items-center justify-end gap-2 overflow-hidden">
                    <span className="whitespace-nowrap">
                        {props.rightPercent}%
                    </span>
                    <Image
                        src={
                            props.challengerProfileImageUrl ||
                            "/icons/arena2.svg"
                        }
                        alt="도전자 프로필"
                        width={24}
                        height={24}
                        className="aspect-square rounded-full object-cover"
                    />
                    <span className="max-w-[80px] truncate whitespace-nowrap">
                        {props.challengerNickname}
                    </span>
                    <TierBadge
                        score={props.challengerScore || 0}
                        iconOnly={showBadgeIconOnly}
                    />
                </div>
            </div>
        </CardLink>
    );
}
```

- [ ] **Step 8: Run test to verify all pass**

```bash
npm test -- ArenaCards --reporter=verbose
```

Expected: PASS (5 tests)

- [ ] **Step 9: Commit**

```bash
git add \
  app/(base)/arenas/components/RecruitingArenaCard.tsx \
  app/(base)/arenas/components/DebatingArenaCard.tsx \
  app/(base)/arenas/components/WaitingArenaCard.tsx \
  app/(base)/arenas/components/VotingArenaCard.tsx \
  app/(base)/arenas/components/CompleteArenaCard.tsx \
  "app/(base)/arenas/components/__tests__/ArenaCards.test.tsx"
git commit -m "$(cat <<'EOF'
[feat/#NNN] 아레나 카드 5종 div→CardLink 교체

모든 아레나 카드의 clickable div를 시맨틱 링크로 교체합니다.
키보드 탐색 및 스크린리더에서 링크로 인식됩니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Update TierBadge

**Files:**

- Modify: `app/components/TierBadge.tsx`
- Create: `app/components/__tests__/TierBadge.test.tsx`

Current: wrapper `<div>` with no role; `<Image alt="${tier.label} 배지">` announces redundant text.
Target: wrapper `<div role="img" aria-label="${tier.label} 티어">`; `<Image alt="">`.

- [ ] **Step 1: Write the failing test**

Create `app/components/__tests__/TierBadge.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TierBadge from "../TierBadge";

describe("TierBadge", () => {
    it("wrapper has role='img'", () => {
        render(<TierBadge score={500} />);
        // 500 points = 브론즈 tier
        const badge = screen.getByRole("img");
        expect(badge).toBeDefined();
    });

    it("wrapper has aria-label with tier name", () => {
        render(<TierBadge score={500} />);
        // getTier(500) returns 브론즈
        const badge = screen.getByRole("img", { name: "브론즈 티어" });
        expect(badge).toBeDefined();
    });

    it("inner Image has empty alt to prevent duplication", () => {
        render(<TierBadge score={500} />);
        // The img element from next/image should have alt=""
        // role="img" is on the div, so the inner img has no accessible name
        const badge = screen.getByRole("img", { name: "브론즈 티어" });
        const innerImg = badge.querySelector("img");
        expect(innerImg?.getAttribute("alt")).toBe("");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- TierBadge --reporter=verbose
```

Expected: FAIL — wrapper has no role="img", Image has alt with text.

- [ ] **Step 3: Update TierBadge**

Replace `app/components/TierBadge.tsx`:

```tsx
"use client";

import Image from "next/image";
import { getTier } from "@/utils/GetTiers";

interface TierBadgeProps {
    score: number;
    iconOnly?: boolean;
}

export default function TierBadge({ score, iconOnly = false }: TierBadgeProps) {
    const tier = getTier(score);

    return (
        <div
            role="img"
            aria-label={`${tier.label} 티어`}
            className={
                iconOnly
                    ? "flex h-[32px] w-[32px] items-center justify-center rounded-full"
                    : "flex h-[32px] w-[30px] items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-semibold sm:h-[32px] sm:w-[120px]"
            }
            style={{
                backgroundColor: `${tier.color}1A`,
                color: tier.color,
                border: `1px solid ${tier.color}33`,
            }}
        >
            {/* 아이콘은 항상 출력 */}
            <Image
                src={tier.icon}
                alt=""
                width={18}
                height={18}
                className={
                    iconOnly
                        ? "h-[24px] w-[24px]"
                        : "h-[24px] w-[24px] sm:h-[18px] sm:w-[18px]"
                }
            />

            {/* iconOnly가 아닐 때만 라벨 출력 */}
            {!iconOnly && (
                <span className="hidden sm:inline">{tier.label}</span>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- TierBadge --reporter=verbose
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/TierBadge.tsx app/components/__tests__/TierBadge.test.tsx
git commit -m "$(cat <<'EOF'
[feat/#NNN] TierBadge ARIA 개선

래퍼 div에 role="img" 및 aria-label 추가,
내부 이미지 alt를 빈 문자열로 변경하여 중복 읽힘을 방지합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Update ModalWrapper

**Files:**

- Modify: `app/components/ModalWrapper.tsx`
- Create: `app/components/__tests__/ModalWrapper.test.tsx`

Current: no `role`, no `aria-modal`, manual `keyup` Escape handler, no focus trap, no `labelId` prop.
Target: `role="dialog"`, `aria-modal="true"`, `aria-labelledby={labelId}`, `<FocusTrap>`, remove Escape handler.

- [ ] **Step 1: Write the failing test**

Create `app/components/__tests__/ModalWrapper.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModalWrapper from "../ModalWrapper";

describe("ModalWrapper", () => {
    it("renders dialog role when open", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}}>
                <p>Modal content</p>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeDefined();
    });

    it("has aria-modal='true'", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}}>
                <p>Modal content</p>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("links to title via aria-labelledby when labelId is provided", () => {
        render(
            <ModalWrapper isOpen={true} onClose={() => {}} labelId="test-title">
                <h2 id="test-title">Test Modal</h2>
            </ModalWrapper>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-labelledby")).toBe("test-title");
    });

    it("renders nothing when closed", () => {
        render(
            <ModalWrapper isOpen={false} onClose={() => {}}>
                <p>Modal content</p>
            </ModalWrapper>
        );
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ModalWrapper --reporter=verbose
```

Expected: FAIL — no dialog role, no aria-modal.

- [ ] **Step 3: Update ModalWrapper**

Replace `app/components/ModalWrapper.tsx`:

```tsx
"use client";

import { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

type ModalWrapperProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    anchorRef?: RefObject<HTMLElement>;
    labelId?: string;
};

export default function ModalWrapper({
    isOpen,
    onClose,
    children,
    labelId,
}: ModalWrapperProps) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4"
            onClick={onClose}
        >
            <FocusTrap
                active={isOpen}
                focusTrapOptions={{
                    onDeactivate: onClose,
                    returnFocusOnDeactivate: true,
                    escapeDeactivates: true,
                    allowOutsideClick: true,
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelId}
                    className="max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-xl bg-background-300 p-6 text-font-100 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </FocusTrap>
        </div>,
        document.body
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ModalWrapper --reporter=verbose
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/ModalWrapper.tsx app/components/__tests__/ModalWrapper.test.tsx
git commit -m "$(cat <<'EOF'
[feat/#NNN] ModalWrapper 접근성 개선

role="dialog", aria-modal, aria-labelledby, FocusTrap 추가.
수동 keyup Escape 핸들러를 focus-trap-react로 교체합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Update NotificationModal

**Files:**

- Modify: `app/(base)/components/NotificationModal.tsx`

Current: no `<h2>` title, no `labelId` passed to `ModalWrapper`.
Target: add `<h2 id="notification-modal-title">알림</h2>` as first child, pass `labelId="notification-modal-title"` to `ModalWrapper`.

- [ ] **Step 1: Update NotificationModal**

Replace `app/(base)/components/NotificationModal.tsx`:

```tsx
"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import React, { useEffect, useState } from "react";
import Pager from "@/app/components/Pager";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";
import NotificationRecordList from "./NotificationRecordList";

export default function NotificationModal() {
    const { isOpen, closeModal } = useModalStore();
    const [notificationRecordListDto, setNotificationRecordListDto] =
        useState<NotificationRecordListDto>();

    useEffect(() => {
        const fetchNotificationRecords = async () => {
            try {
                const params = new URLSearchParams();

                const res = await fetch(
                    `/api/member/notifications?${params.toString()}`,
                    { method: "GET" }
                );
                const data = await res.json();
                setNotificationRecordListDto(data);
            } catch (error: unknown) {
                console.error("Failed to fetch notification records", error);
            }
        };

        fetchNotificationRecords();
    }, []);

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={closeModal}
            labelId="notification-modal-title"
        >
            <div className="flex max-h-[80vh] w-[480px] flex-col gap-4">
                <h2
                    id="notification-modal-title"
                    className="text-lg font-bold text-font-100"
                >
                    알림
                </h2>
                {notificationRecordListDto && (
                    <div>
                        <NotificationRecordList
                            notificationRecords={
                                notificationRecordListDto.records
                            }
                        />
                        {notificationRecordListDto.records.length > 0 && (
                            <Pager
                                currentPage={
                                    notificationRecordListDto.currentPage
                                }
                                pages={notificationRecordListDto.pages}
                                endPage={notificationRecordListDto.endPage}
                                onPageChange={(newPage: number) =>
                                    (notificationRecordListDto.currentPage =
                                        newPage)
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}
```

- [ ] **Step 2: Run full test suite to verify no regressions**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```

Expected: all tests still pass, no new failures.

- [ ] **Step 3: Commit**

```bash
git add "app/(base)/components/NotificationModal.tsx"
git commit -m "$(cat <<'EOF'
[feat/#NNN] NotificationModal 제목 및 labelId 추가

스크린리더가 모달 제목을 읽을 수 있도록 h2 요소와 labelId를 추가합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Update CreateArenaModal

**Files:**

- Modify: `app/(base)/arenas/components/CreateArenaModal.tsx`

Current: `<h2>` "도전장 작성" has no `id`. `<ModalWrapper>` has no `labelId`.
Target: add `id="create-arena-modal-title"` to the existing `<h2>`. Pass `labelId="create-arena-modal-title"` to `ModalWrapper`.

- [ ] **Step 1: Add id to h2 in CreateArenaModal**

In `app/(base)/arenas/components/CreateArenaModal.tsx`, find the `<h2>` at line 121 and add an `id`:

```tsx
// Before:
<h2 className="flex items-center gap-2 text-xl font-bold text-white">

// After:
<h2
    id="create-arena-modal-title"
    className="flex items-center gap-2 text-xl font-bold text-white"
>
```

- [ ] **Step 2: Pass labelId to ModalWrapper**

Find `<ModalWrapper isOpen={isOpen} onClose={closeModal}>` at line 118 and add `labelId`:

```tsx
// Before:
<ModalWrapper isOpen={isOpen} onClose={closeModal}>

// After:
<ModalWrapper
    isOpen={isOpen}
    onClose={closeModal}
    labelId="create-arena-modal-title"
>
```

- [ ] **Step 3: Run full test suite to verify no regressions**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add "app/(base)/arenas/components/CreateArenaModal.tsx"
git commit -m "$(cat <<'EOF'
[feat/#NNN] CreateArenaModal labelId 연결

h2 제목에 id를 부여하고 ModalWrapper에 labelId를 전달합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Update PointHelpModal

**Files:**

- Modify: `app/(base)/profile/components/PointHelpModal.tsx`

`PointHelpModal` does **not** use `ModalWrapper` — it has its own custom implementation. It already has `role="dialog"`, `aria-modal`, `aria-labelledby`, and an Escape key handler. Missing: proper focus trap (keyboard can tab outside).

Changes:

1. Add `<FocusTrap>` wrapping the panel div
2. Remove the manual `onKeyDown` Escape handler and the `window.addEventListener` effect
3. Remove the `setTimeout(() => closeBtnRef.current?.focus(), 0)` and `closeBtnRef` (FocusTrap handles initial focus)

- [ ] **Step 1: Update PointHelpModal**

Replace `app/(base)/profile/components/PointHelpModal.tsx`:

```tsx
"use client";

import { useEffect, useId } from "react";
import FocusTrap from "focus-trap-react";

type PointHelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function PointHelpModal({ open, onClose }: PointHelpModalProps) {
    const dialogTitleId = useId();

    // ✅ (1) 모달 열릴 때 body 스크롤 잠금 + 스크롤바 폭만큼 padding-right 보정
    useEffect(() => {
        if (!open) return;

        const body = document.body;

        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            id="tier-point-help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="fixed inset-0 z-50"
        >
            {/* overlay */}
            <button
                type="button"
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="모달 닫기"
            />

            {/* panel */}
            <FocusTrap
                active={open}
                focusTrapOptions={{
                    onDeactivate: onClose,
                    returnFocusOnDeactivate: true,
                    escapeDeactivates: true,
                    allowOutsideClick: true,
                }}
            >
                <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background-300 p-6 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3
                                id={dialogTitleId}
                                className="text-base font-semibold text-font-100"
                            >
                                포인트는 어떻게 쌓이고, 왜 줄어들까요?
                            </h3>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4 text-sm text-font-100">
                        <div className="rounded-xl bg-background-200 p-4">
                            <div className="font-semibold">✅ 포인트 적립</div>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                                <li>
                                    출석 체크:{" "}
                                    <span className="font-semibold text-green-600">
                                        +5
                                    </span>
                                </li>
                                <li>
                                    리뷰 좋아요 획득:{" "}
                                    <span className="font-semibold text-green-600">
                                        +5
                                    </span>
                                    <span>
                                        {" "}
                                        (한 리뷰당 획득할 수 있는 좋아요
                                        포인트는 최대 20개로 총 100포인트 획득
                                        가능합니다.)
                                    </span>
                                </li>
                                <li>
                                    투기장 무승부:{" "}
                                    <span className="font-semibold text-green-600">
                                        +100
                                    </span>
                                </li>
                                <li>
                                    투기장 미성립:{" "}
                                    <span className="font-semibold text-green-600">
                                        +100
                                    </span>
                                </li>
                                <li>
                                    투기장 승리:{" "}
                                    <span className="font-semibold text-green-600">
                                        +190
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl bg-background-200 p-4">
                            <div className="font-semibold">⚠️ 포인트 차감</div>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                                <li>
                                    투기장 작성 및 참여:{" "}
                                    <span className="font-semibold text-red-500">
                                        -100
                                    </span>
                                </li>
                                <li>
                                    리뷰 좋아요 삭제:{" "}
                                    <span className="font-semibold text-red-500">
                                        -5
                                    </span>
                                </li>
                                <li>
                                    리뷰 삭제:{" "}
                                    <span className="font-semibold text-red-500">
                                        -5 ~ -100
                                    </span>
                                    <span>
                                        {" "}
                                        (해당 리뷰가 받은 좋아요 수에 비례해서
                                        줄어듭니다. 예: 좋아요 20개 받은 리뷰
                                        삭제 시 -100점)
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl bg-background-200 p-4">
                            <div className="font-semibold">ℹ️ 티어 계산</div>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                                <li>처음 가입할 때 500점으로 시작합니다.</li>
                                <li>
                                    0~999점은{" "}
                                    <span className="font-semibold text-[#C97A40]">
                                        브론즈
                                    </span>
                                    , 1000~1999점은{" "}
                                    <span className="font-semibold text-[#B0B0B0]">
                                        실버
                                    </span>
                                    , 2000~2999점은{" "}
                                    <span className="font-semibold text-[#FFD700]">
                                        골드
                                    </span>
                                    , 3000~3999점은{" "}
                                    <span className="font-semibold text-[#45E0FF]">
                                        플래티넘
                                    </span>
                                    , 4000점 이상은{" "}
                                    <span className="font-semibold text-[#4C7DFF]">
                                        다이아몬드
                                    </span>
                                    입니다.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-background-200 px-4 py-2 text-sm text-font-100 hover:opacity-90"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
}
```

- [ ] **Step 2: Run full test suite to verify no regressions**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add "app/(base)/profile/components/PointHelpModal.tsx"
git commit -m "$(cat <<'EOF'
[feat/#NNN] PointHelpModal FocusTrap 추가

focus-trap-react로 포커스 트랩을 적용합니다.
수동 Escape 핸들러와 focus 관리 코드를 제거합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Update Header keyboard support

**Files:**

- Modify: `app/components/Header.tsx`
- Create: `app/components/__tests__/Header.test.tsx`

Changes needed:

1. **Hamburger button**: `aria-expanded={menuOpen}`, `aria-controls="mobile-menu"`, dynamic `aria-label` (`메뉴 열기` / `메뉴 닫기`)
2. **Mobile menu div**: add `id="mobile-menu"` and `aria-hidden={!menuOpen}`
3. **Desktop notification button**: add `aria-label="알림"`, change Image `alt="알림"` → `alt=""`
4. **Mobile notification button**: add `aria-label="알림"`, change Image `alt="알림"` → `alt=""`

- [ ] **Step 1: Write the failing test**

Create `app/components/__tests__/Header.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
    usePathname: () => "/",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
    signOut: vi.fn(),
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
    default: { remove: vi.fn() },
}));

// Mock auth utility
vi.mock("@/utils/GetAuthUserId.client", () => ({
    getAuthUserId: vi.fn().mockResolvedValue(null),
}));

// Mock modalStore
vi.mock("@/stores/modalStore", () => ({
    default: { getState: () => ({ openModal: vi.fn() }) },
}));

import Header from "../Header";

describe("Header accessibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("hamburger button has aria-expanded=false when menu is closed", () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        expect(hamburger.getAttribute("aria-expanded")).toBe("false");
    });

    it("hamburger button has aria-controls='mobile-menu'", () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        expect(hamburger.getAttribute("aria-controls")).toBe("mobile-menu");
    });

    it("hamburger aria-label changes to '메뉴 닫기' when menu is open", async () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        await userEvent.click(hamburger);
        const closingBtn = screen.getByRole("button", { name: "메뉴 닫기" });
        expect(closingBtn.getAttribute("aria-expanded")).toBe("true");
    });

    it("mobile menu has id='mobile-menu' and aria-hidden when closed", () => {
        render(<Header />);
        const menu = document.getElementById("mobile-menu");
        expect(menu).not.toBeNull();
        expect(menu?.getAttribute("aria-hidden")).toBe("true");
    });

    it("mobile menu aria-hidden is false when open", async () => {
        render(<Header />);
        const hamburger = screen.getByRole("button", { name: "메뉴 열기" });
        await userEvent.click(hamburger);
        const menu = document.getElementById("mobile-menu");
        expect(menu?.getAttribute("aria-hidden")).toBe("false");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- "Header.test" --reporter=verbose
```

Expected: FAIL — hamburger button has wrong aria attributes.

- [ ] **Step 3: Update Header**

Replace `app/components/Header.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Cookies from "js-cookie";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import useModalStore from "@/stores/modalStore";
import Button from "./Button";
import { Menu, User, X } from "lucide-react";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const id = await getAuthUserId();
            setIsLoggedIn(!!id);
        };
        fetchUser();
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout = async () => {
        Cookies.remove("attendance", { path: "/" });
        await signOut({ redirect: false });
        setIsLoggedIn(false);
        setMenuOpen(false);
        router.refresh();
    };

    const handleLogin = () => {
        router.push(`/log-in?callbackUrl=${encodeURIComponent(pathname)}`);
        setMenuOpen(false);
    };

    const MenuLink = ({ href, label }: { href: string; label: string }) => (
        <Link
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`rounded-lg px-16 py-2 text-center text-base font-medium transition-all duration-200 hover:bg-white/10 sm:px-4 sm:py-2 sm:text-2xl ${
                pathname === href ? "text-primary-purple-100" : "text-white"
            }`}
        >
            {label}
        </Link>
    );

    return (
        <header className="relative border-b border-white/10 bg-background-300 text-white shadow-lg">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
                {/* 로고 */}
                <Link
                    href="/"
                    className="flex items-center transition-all duration-200 hover:scale-105"
                >
                    <Image
                        src="/icons/gamechu-logo.svg"
                        alt="Gamechu 로고"
                        width={160}
                        height={100}
                        priority
                    />
                </Link>

                {/* 모바일 햄버거 버튼 */}
                <button
                    className="rounded-lg bg-white/10 p-1 transition-all sm:hidden"
                    onClick={toggleMenu}
                    aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* 가운데  */}
                <nav className="hidden whitespace-nowrap sm:flex sm:space-x-8">
                    <MenuLink href="/games" label="게임" />
                    <MenuLink href="/arenas" label="투기장" />
                </nav>

                {/* 오른쪽  */}
                <div className="flex hidden flex-shrink-0 items-center space-x-8 sm:flex">
                    {isLoggedIn && (
                        <button
                            className="relative rounded-lg p-2 transition-colors hover:bg-white/20"
                            aria-label="알림"
                            onClick={() => {
                                useModalStore
                                    .getState()
                                    .openModal("notification", null);
                                setMenuOpen(false);
                            }}
                        >
                            <Image
                                src="/icons/bell.svg"
                                alt=""
                                width={24}
                                height={24}
                                className="text-white"
                            />
                        </button>
                    )}
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/profile"
                                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                                aria-label="마이페이지"
                            >
                                <User
                                    size={28}
                                    className="text-primary-purple-100"
                                />
                            </Link>
                            <Button
                                label="로그아웃"
                                size="small"
                                type="purple"
                                onClick={handleLogout}
                            />
                        </>
                    ) : (
                        <Button
                            label="로그인"
                            size="small"
                            type="purple"
                            onClick={handleLogin}
                        />
                    )}
                </div>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            <div
                id="mobile-menu"
                aria-hidden={!menuOpen}
                className={`absolute left-0 right-0 z-40 overflow-hidden border-b border-t border-white/10 bg-background-300 transition-all duration-300 sm:hidden ${
                    menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex items-start justify-between px-6 py-4">
                    {/* 왼쪽  */}
                    <nav className="flex flex-col space-y-2">
                        <MenuLink href="/games" label="게임" />
                        <MenuLink href="/arenas" label="투기장" />
                    </nav>

                    {/* 오른쪽 */}
                    <div className="flex flex-col items-end space-y-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    {/* 알림 버튼 */}
                                    <button
                                        className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/10"
                                        aria-label="알림"
                                        onClick={() => {
                                            useModalStore
                                                .getState()
                                                .openModal(
                                                    "notification",
                                                    null
                                                );
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <Image
                                            src="/icons/bell.svg"
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="text-white"
                                        />
                                    </button>

                                    {/* 마이페이지 버튼 */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/10"
                                        onClick={() => setMenuOpen(false)}
                                        aria-label="마이페이지"
                                    >
                                        <User
                                            size={20}
                                            className="text-primary-purple-100"
                                        />
                                    </Link>
                                </div>

                                {/* 하단 로그아웃 버튼 */}
                                <Button
                                    label="로그아웃"
                                    size="small"
                                    type="purple"
                                    onClick={handleLogout}
                                />
                            </>
                        ) : (
                            <Button
                                label="로그인"
                                size="small"
                                type="purple"
                                onClick={handleLogin}
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- "Header.test" --reporter=verbose
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/Header.tsx app/components/__tests__/Header.test.tsx
git commit -m "$(cat <<'EOF'
[feat/#NNN] Header 키보드 접근성 개선

햄버거 버튼에 aria-expanded, aria-controls, 동적 aria-label 추가.
모바일 메뉴에 id, aria-hidden 추가.
알림 버튼에 aria-label 추가, 중복 이미지 alt 제거.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Add skip-to-content link and main id

**Files:**

- Modify: `app/layout.tsx`
- Modify: `app/(base)/layout.tsx`

- [ ] **Step 1: Add skip link to app/layout.tsx**

In `app/layout.tsx`, add the skip link as the first child of `<body>`, before `<Modals />`:

```tsx
// Before:
<body className="bg-background-400 font-sans text-font-100">
    <Modals />
    {children}
</body>

// After:
<body className="bg-background-400 font-sans text-font-100">
    <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-purple-100 focus:px-4 focus:py-2 focus:text-white"
    >
        본문으로 바로가기
    </a>
    <Modals />
    {children}
</body>
```

- [ ] **Step 2: Add id="main-content" to main in app/(base)/layout.tsx**

In `app/(base)/layout.tsx`, add `id="main-content"` to the `<main>` element:

```tsx
// Before:
<main className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">

// After:
<main id="main-content" className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
```

- [ ] **Step 3: Run full test suite**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx "app/(base)/layout.tsx"
git commit -m "$(cat <<'EOF'
[feat/#NNN] 본문 바로가기 링크 추가

키보드 사용자를 위한 skip-to-content 링크를 루트 레이아웃에 추가합니다.
베이스 레이아웃의 main 요소에 id="main-content"를 추가합니다.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Checklist

**Spec coverage:**

- [x] §1 CardLink — Tasks 2, 3, 4
- [x] §2 ARIA Labels (TierBadge) — Task 5
- [x] §2 ARIA Labels (GameCard score/review) — Task 3
- [x] §2 ARIA Labels (Header notification buttons) — Task 10
- [x] §3 Modal Accessibility (ModalWrapper) — Task 6
- [x] §3 Modal Accessibility (NotificationModal labelId) — Task 7
- [x] §3 Modal Accessibility (CreateArenaModal labelId) — Task 8
- [x] §3 Modal Accessibility (PointHelpModal focus trap) — Task 9
- [x] §4 Header Keyboard Support — Task 10
- [x] §5 Skip-to-content link — Task 11

**PointHelpModal note:** The spec says PointHelpModal should "pass labelId to ModalWrapper", but this component uses its own custom dialog implementation (not ModalWrapper) with existing `role="dialog"`, `aria-modal`, and `aria-labelledby` via `useId()`. The plan preserves its existing ARIA attributes and adds a focus trap instead of migrating it to ModalWrapper, achieving the same accessibility outcome.

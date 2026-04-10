# Profile Component Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 13 duplicated profile components by merging them into `app/(base)/profile/components/` and parameterizing with `isOwnProfile` and optional `memberId` props.

**Architecture:** The canonical component location is `app/(base)/profile/components/`. Each shared component gains an `isOwnProfile: boolean` prop to toggle own-profile vs. other-profile behavior. The 5 `My*ArenaList` components are renamed (no `My` prefix) and accept an optional `memberId?: string` — absent means `mine: true`, present means `targetMemberId: memberId`. The `[nickname]/components/` directory is deleted except for `tab/` (which is not duplicated).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), TailwindCSS 3

---

## File Map

| Action | File                                                               |
| ------ | ------------------------------------------------------------------ |
| Modify | `app/(base)/profile/components/ProfileSidebar.tsx`                 |
| Modify | `app/(base)/profile/components/ProfileSummaryCard.tsx`             |
| Modify | `app/(base)/profile/components/ProfileTierCard.tsx`                |
| Create | `app/(base)/profile/components/RecruitingArenaList.tsx`            |
| Create | `app/(base)/profile/components/WaitingArenaList.tsx`               |
| Create | `app/(base)/profile/components/DebatingArenaList.tsx`              |
| Create | `app/(base)/profile/components/VotingArenaList.tsx`                |
| Create | `app/(base)/profile/components/CompletedArenaList.tsx`             |
| Modify | `app/(base)/profile/components/tabs/ProfileArenaTab.tsx`           |
| Modify | `app/(base)/profile/[nickname]/components/tab/ProfileArenaTab.tsx` |
| Modify | `app/(base)/profile/page.tsx`                                      |
| Modify | `app/(base)/profile/[nickname]/page.tsx`                           |
| Delete | `app/(base)/profile/components/MyRecrutingArenaList.tsx`           |
| Delete | `app/(base)/profile/components/MyWaitingArenaList.tsx`             |
| Delete | `app/(base)/profile/components/MyDebatingArenaList.tsx`            |
| Delete | `app/(base)/profile/components/MyVotingArenaList.tsx`              |
| Delete | `app/(base)/profile/components/MyCompletedArenaList.tsx`           |
| Delete | `app/(base)/profile/[nickname]/components/ProfileSidebar.tsx`      |
| Delete | `app/(base)/profile/[nickname]/components/ProfileSummaryCard.tsx`  |
| Delete | `app/(base)/profile/[nickname]/components/ProfileTierCard.tsx`     |
| Delete | `app/(base)/profile/[nickname]/components/RecrutingArenaList.tsx`  |
| Delete | `app/(base)/profile/[nickname]/components/WaitingArenaList.tsx`    |
| Delete | `app/(base)/profile/[nickname]/components/DebatingArenaList.tsx`   |
| Delete | `app/(base)/profile/[nickname]/components/VotingArenaList.tsx`     |
| Delete | `app/(base)/profile/[nickname]/components/CompletedArenaList.tsx`  |
| Keep   | `app/(base)/profile/[nickname]/components/tab/` (not duplicated)   |

---

## Task 1: Merge ProfileSidebar

**Files:**

- Modify: `app/(base)/profile/components/ProfileSidebar.tsx`
- Modify: `app/(base)/profile/page.tsx` (add `isOwnProfile={true}`)
- Modify: `app/(base)/profile/[nickname]/page.tsx` (update import + add `isOwnProfile={false}`)
- Delete: `app/(base)/profile/[nickname]/components/ProfileSidebar.tsx`

- [ ] **Step 1: Replace `ProfileSidebar.tsx` with merged version**

Replace the entire contents of `app/(base)/profile/components/ProfileSidebar.tsx`:

```tsx
"use client";

import { useState } from "react";

const ownProfileTabs = [
    { key: "reviews", label: "리뷰" },
    { key: "wishlists", label: "위시리스트" },
    { key: "score-history", label: "포인트 히스토리" },
    { key: "arena", label: "투기장" },
    { key: "profile", label: "계정" },
];

const otherProfileTabs = [
    { key: "reviews", label: "리뷰" },
    { key: "arena", label: "투기장" },
];

type ProfileSidebarProps = {
    isOwnProfile: boolean;
    onSelect: (tab: string) => void;
};

export default function ProfileSidebar({
    isOwnProfile,
    onSelect,
}: ProfileSidebarProps) {
    const [active, setActive] = useState("reviews");
    const tabs = isOwnProfile ? ownProfileTabs : otherProfileTabs;

    return (
        <div
            className={[
                "rounded-xl bg-background-200",
                "mx-auto w-full max-w-full p-3",
                "grid auto-rows-fr grid-cols-2 gap-3",
                "md:mx-0 md:block md:w-[250px] md:space-y-2 md:p-4",
            ].join(" ")}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => {
                        setActive(tab.key);
                        onSelect(tab.key);
                    }}
                    className={[
                        "flex h-12 w-full items-center justify-center rounded-lg p-0 font-medium transition-colors",
                        "md:block md:h-auto md:px-4 md:py-2 md:text-left",
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300",
                    ].join(" ")}
                >
                    <span className="whitespace-normal break-keep leading-tight">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Update `app/(base)/profile/page.tsx` — add `isOwnProfile={true}` to ProfileSidebar**

Find this line in `app/(base)/profile/page.tsx`:

```tsx
<ProfileSidebar onSelect={setActiveTab} />
```

Replace with:

```tsx
<ProfileSidebar isOwnProfile={true} onSelect={setActiveTab} />
```

- [ ] **Step 3: Update `app/(base)/profile/[nickname]/page.tsx` — update import and add `isOwnProfile={false}`**

Change the import:

```tsx
import ProfileSidebar from "./components/ProfileSidebar";
```

To:

```tsx
import ProfileSidebar from "../components/ProfileSidebar";
```

Find this line in the JSX:

```tsx
<ProfileSidebar onSelect={setActiveTab} />
```

Replace with:

```tsx
<ProfileSidebar isOwnProfile={false} onSelect={setActiveTab} />
```

- [ ] **Step 4: Delete the now-redundant file**

```bash
rm "app/(base)/profile/[nickname]/components/ProfileSidebar.tsx"
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(base)/profile/components/ProfileSidebar.tsx" \
        "app/(base)/profile/page.tsx" \
        "app/(base)/profile/[nickname]/page.tsx"
git rm "app/(base)/profile/[nickname]/components/ProfileSidebar.tsx"
git commit -m "$(cat <<'EOF'
refactor: ProfileSidebar 컴포넌트 통합 (isOwnProfile prop 추가)

- profile/components/ProfileSidebar에 isOwnProfile prop 추가
- isOwnProfile=true: 5개 탭, false: 2개 탭
- [nickname]/components/ProfileSidebar 삭제
EOF
)"
```

---

## Task 2: Merge ProfileSummaryCard

**Files:**

- Modify: `app/(base)/profile/components/ProfileSummaryCard.tsx`
- Modify: `app/(base)/profile/page.tsx` (add `isOwnProfile={true}`)
- Modify: `app/(base)/profile/[nickname]/page.tsx` (update import + add `isOwnProfile={false}`)
- Delete: `app/(base)/profile/[nickname]/components/ProfileSummaryCard.tsx`

- [ ] **Step 1: Replace `ProfileSummaryCard.tsx` with merged version**

Replace the entire contents of `app/(base)/profile/components/ProfileSummaryCard.tsx`:

```tsx
"use client";

import Image from "next/image";

type ProfileSummaryCardProps =
    | {
          isOwnProfile: true;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
          wishlistCount: number;
          createdAt: string;
      }
    | {
          isOwnProfile: false;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
      };

export default function ProfileSummaryCard(props: ProfileSummaryCardProps) {
    const { nickname, imageUrl, score, reviewCount, isOwnProfile } = props;

    return (
        <div
            className={[
                "w-full rounded-xl bg-background-300 p-6 shadow md:w-[250px]",
                isOwnProfile ? "md:h-[320px]" : "h-[270px]",
            ].join(" ")}
        >
            <div className="mx-auto mb-4 h-[120px] w-[120px] overflow-hidden rounded-full">
                <Image
                    src={imageUrl || "/icons/arena.svg"}
                    alt="프로필 이미지"
                    width={120}
                    height={120}
                />
            </div>
            <h2 className="min-h-[24px] text-center text-body font-semibold">
                {nickname || (
                    <span className="text-font-200">닉네임 불러오는 중</span>
                )}
            </h2>
            {isOwnProfile && (
                <p className="mt-1 min-h-[20px] text-center text-caption text-font-200">
                    가입일: {props.createdAt || "-"}
                </p>
            )}
            <div className="mt-4 space-y-1 text-sm">
                <p className="flex min-h-[20px] justify-between">
                    <span>포인트</span>
                    <span className="font-semibold">
                        {score !== undefined ? score : "-"}
                    </span>
                </p>
                <p className="flex min-h-[20px] justify-between">
                    <span>리뷰</span>
                    <span className="font-semibold">
                        {reviewCount !== undefined ? reviewCount : "-"}
                    </span>
                </p>
                {isOwnProfile && (
                    <p className="flex min-h-[20px] justify-between">
                        <span>위시리스트</span>
                        <span className="font-semibold">
                            {props.wishlistCount !== undefined
                                ? props.wishlistCount
                                : "-"}
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Update `app/(base)/profile/page.tsx` — add `isOwnProfile={true}` to ProfileSummaryCard**

Find:

```tsx
<ProfileSummaryCard
    reviewCount={reviewCount}
    wishlistCount={wishlistPageData.totalCount}
    nickname={nickname}
    imageUrl={imageUrl}
    score={score}
    createdAt={createdAt}
/>
```

Replace with:

```tsx
<ProfileSummaryCard
    isOwnProfile={true}
    reviewCount={reviewCount}
    wishlistCount={wishlistPageData.totalCount}
    nickname={nickname}
    imageUrl={imageUrl}
    score={score}
    createdAt={createdAt}
/>
```

- [ ] **Step 3: Update `app/(base)/profile/[nickname]/page.tsx` — update import and add `isOwnProfile={false}`**

Change the import:

```tsx
import ProfileSummaryCard from "./components/ProfileSummaryCard";
```

To:

```tsx
import ProfileSummaryCard from "../components/ProfileSummaryCard";
```

Find:

```tsx
<ProfileSummaryCard
    reviewCount={reviewCount}
    nickname={nickname}
    imageUrl={imageUrl}
    score={score}
/>
```

Replace with:

```tsx
<ProfileSummaryCard
    isOwnProfile={false}
    reviewCount={reviewCount}
    nickname={nickname}
    imageUrl={imageUrl}
    score={score}
/>
```

- [ ] **Step 4: Delete the now-redundant file**

```bash
rm "app/(base)/profile/[nickname]/components/ProfileSummaryCard.tsx"
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(base)/profile/components/ProfileSummaryCard.tsx" \
        "app/(base)/profile/page.tsx" \
        "app/(base)/profile/[nickname]/page.tsx"
git rm "app/(base)/profile/[nickname]/components/ProfileSummaryCard.tsx"
git commit -m "$(cat <<'EOF'
refactor: ProfileSummaryCard 컴포넌트 통합 (discriminated union props)

- isOwnProfile=true: wishlistCount, createdAt 표시 (320px)
- isOwnProfile=false: 두 필드 타입 수준에서 제거 (270px)
- [nickname]/components/ProfileSummaryCard 삭제
EOF
)"
```

---

## Task 3: Merge ProfileTierCard

**Files:**

- Modify: `app/(base)/profile/components/ProfileTierCard.tsx`
- Modify: `app/(base)/profile/page.tsx` (add `isOwnProfile={true}`)
- Modify: `app/(base)/profile/[nickname]/page.tsx` (update import + add `isOwnProfile={false}`)
- Delete: `app/(base)/profile/[nickname]/components/ProfileTierCard.tsx`

- [ ] **Step 1: Replace `ProfileTierCard.tsx` with merged version**

Replace the entire contents of `app/(base)/profile/components/ProfileTierCard.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import TierBadge from "@/app/components/TierBadge";
import { tiers, Tier } from "@/constants/tiers";
import { getTier } from "@/utils/GetTiers";
import PointHelpModal from "./PointHelpModal";

type ProfileTierCardProps = {
    score: number;
    isOwnProfile: boolean;
};

export default function ProfileTierCard({
    score,
    isOwnProfile,
}: ProfileTierCardProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const currentTier: Tier = getTier(score);
    const currentIndex = tiers.indexOf(currentTier);
    const nextTier = tiers[Math.min(currentIndex + 1, tiers.length - 1)];

    const progress =
        currentTier.max === Infinity
            ? 100
            : ((score - currentTier.min) /
                  (currentTier.max - currentTier.min)) *
              100;

    const pointsToNext =
        currentTier.max === Infinity ? 0 : Math.max(0, nextTier.min - score);

    useEffect(() => {
        if (!isOwnProfile) return;
        if (isHelpOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isHelpOpen, isOwnProfile]);

    return (
        <div
            className={[
                "w-full flex-1 rounded-xl bg-background-300 p-6 shadow",
                isOwnProfile ? "h-[320px]" : "h-[270px]",
            ].join(" ")}
        >
            {/* 제목 & 설명 */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-body font-semibold">
                        {isOwnProfile ? "나의 티어" : "현재 티어"}
                    </h2>
                    {isOwnProfile && (
                        <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm text-font-200">
                                포인트를 모아 더 높은 티어로 승급하세요!
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsHelpOpen(true)}
                                className="focus:ring-primary/60 inline-flex h-6 w-6 items-center justify-center rounded-full border border-background-200 bg-background-200 text-xs font-bold text-font-100 hover:opacity-90 focus:outline-none focus:ring-2"
                                aria-label="포인트 안내 보기"
                                aria-haspopup="dialog"
                                aria-expanded={isHelpOpen}
                                aria-controls="tier-point-help-modal"
                                title="포인트 안내"
                            >
                                ?
                            </button>
                        </div>
                    )}
                </div>
                <div className="block md:hidden">
                    <TierBadge score={score} />
                </div>
                <div className="hidden md:block">
                    <TierBadge score={score} />
                </div>
            </div>

            <p className="text-sm font-semibold">
                현재 포인트: {score.toString()}
            </p>

            <p className="mb-1 text-right text-caption text-font-200">
                {currentTier.max === Infinity
                    ? "최고 티어입니다!"
                    : `다음 티어까지: ${pointsToNext.toString()} 포인트`}
            </p>

            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-background-200">
                <div
                    className="h-full transition-all duration-700 ease-out"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: currentTier.color,
                    }}
                />
            </div>

            {/* 모바일: 현재 티어만 */}
            <div className="grid grid-cols-1 gap-2 text-center text-caption md:hidden">
                <div
                    className="flex flex-col items-center rounded-xl border px-4 py-4 font-bold text-white"
                    style={{
                        backgroundColor: `${currentTier.color}22`,
                        border: `2px solid ${currentTier.color}`,
                    }}
                >
                    <Image
                        src={currentTier.icon}
                        alt={currentTier.label}
                        width={24}
                        height={24}
                        className="mb-1 brightness-[1.5]"
                    />
                    <div className="text-sm">{currentTier.label}</div>
                    <div className="text-xs">
                        {currentTier.max === Infinity
                            ? `${currentTier.min}+`
                            : `${currentTier.min} - ${currentTier.max}`}
                    </div>
                </div>
            </div>

            {/* 태블릿 */}
            <div className="hidden grid-cols-5 gap-2 text-center text-caption md:grid lg:hidden">
                {tiers.map((tier) => {
                    const isActive = tier.label === currentTier.label;
                    return (
                        <div
                            key={tier.label}
                            className={`flex min-w-0 flex-col items-center rounded-xl border px-3 py-4 transition-all duration-300 ${
                                isActive
                                    ? "font-bold text-white"
                                    : "text-font-200"
                            }`}
                            style={{
                                backgroundColor: isActive
                                    ? `${tier.color}22`
                                    : "#1e1e1e",
                                border: isActive
                                    ? `2px solid ${tier.color}`
                                    : "1px solid #333",
                            }}
                        >
                            <Image
                                src={tier.icon}
                                alt={tier.label}
                                width={22}
                                height={22}
                                className={`${isActive ? "brightness-[1.5]" : "opacity-70"} mb-1`}
                            />
                            <div className="truncate text-xs sm:text-sm">
                                {tier.label}
                            </div>
                            <div className="hidden text-[10px]" />
                        </div>
                    );
                })}
            </div>

            {/* 데스크탑 */}
            <div className="grid hidden grid-cols-5 gap-3 text-center text-caption lg:grid">
                {tiers.map((tier) => {
                    const isActive = tier.label === currentTier.label;
                    return (
                        <div
                            key={tier.label}
                            className={`flex min-w-0 flex-col items-center rounded-xl border px-4 py-6 transition-all duration-300 ${
                                isActive
                                    ? "font-bold text-white"
                                    : "text-font-200"
                            }`}
                            style={{
                                backgroundColor: isActive
                                    ? `${tier.color}22`
                                    : "#1e1e1e",
                                border: isActive
                                    ? `2px solid ${tier.color}`
                                    : "1px solid #333",
                            }}
                        >
                            <Image
                                src={tier.icon}
                                alt={tier.label}
                                width={24}
                                height={24}
                                className={`${isActive ? "brightness-[1.5]" : "opacity-70"} mb-1`}
                            />
                            <div className="text-sm">{tier.label}</div>
                            <div className="text-xs">
                                {tier.max === Infinity
                                    ? `${tier.min}+`
                                    : `${tier.min} - ${tier.max}`}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isOwnProfile && (
                <PointHelpModal
                    open={isHelpOpen}
                    onClose={() => setIsHelpOpen(false)}
                />
            )}
        </div>
    );
}
```

- [ ] **Step 2: Update `app/(base)/profile/page.tsx` — add `isOwnProfile={true}` to ProfileTierCard**

Find:

```tsx
<ProfileTierCard score={score} />
```

Replace with:

```tsx
<ProfileTierCard isOwnProfile={true} score={score} />
```

- [ ] **Step 3: Update `app/(base)/profile/[nickname]/page.tsx` — update import and add `isOwnProfile={false}`**

Change the import:

```tsx
import ProfileTierCard from "./components/ProfileTierCard";
```

To:

```tsx
import ProfileTierCard from "../components/ProfileTierCard";
```

Find:

```tsx
<ProfileTierCard score={score} />
```

Replace with:

```tsx
<ProfileTierCard isOwnProfile={false} score={score} />
```

- [ ] **Step 4: Delete the now-redundant file**

```bash
rm "app/(base)/profile/[nickname]/components/ProfileTierCard.tsx"
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(base)/profile/components/ProfileTierCard.tsx" \
        "app/(base)/profile/page.tsx" \
        "app/(base)/profile/[nickname]/page.tsx"
git rm "app/(base)/profile/[nickname]/components/ProfileTierCard.tsx"
git commit -m "$(cat <<'EOF'
refactor: ProfileTierCard 컴포넌트 통합 (isOwnProfile prop 추가)

- isOwnProfile=true: "나의 티어" 제목, PointHelpModal 포함 (320px)
- isOwnProfile=false: "현재 티어" 제목, 모달 없음 (270px)
- [nickname]/components/ProfileTierCard 삭제
EOF
)"
```

---

## Task 4: Merge 5 ArenaList components

**Files:**

- Create: `app/(base)/profile/components/RecruitingArenaList.tsx`
- Create: `app/(base)/profile/components/WaitingArenaList.tsx`
- Create: `app/(base)/profile/components/DebatingArenaList.tsx`
- Create: `app/(base)/profile/components/VotingArenaList.tsx`
- Create: `app/(base)/profile/components/CompletedArenaList.tsx`
- Modify: `app/(base)/profile/components/tabs/ProfileArenaTab.tsx`
- Modify: `app/(base)/profile/[nickname]/components/tab/ProfileArenaTab.tsx`
- Delete: `app/(base)/profile/components/MyRecrutingArenaList.tsx`
- Delete: `app/(base)/profile/components/MyWaitingArenaList.tsx`
- Delete: `app/(base)/profile/components/MyDebatingArenaList.tsx`
- Delete: `app/(base)/profile/components/MyVotingArenaList.tsx`
- Delete: `app/(base)/profile/components/MyCompletedArenaList.tsx`
- Delete: `app/(base)/profile/[nickname]/components/RecrutingArenaList.tsx`
- Delete: `app/(base)/profile/[nickname]/components/WaitingArenaList.tsx`
- Delete: `app/(base)/profile/[nickname]/components/DebatingArenaList.tsx`
- Delete: `app/(base)/profile/[nickname]/components/VotingArenaList.tsx`
- Delete: `app/(base)/profile/[nickname]/components/CompletedArenaList.tsx`

- [ ] **Step 1: Create `RecruitingArenaList.tsx`**

Create `app/(base)/profile/components/RecruitingArenaList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import RecruitingArenaCard from "@/app/(base)/arenas/components/RecruitingArenaCard";
import Pager from "@/app/components/Pager";

type ArenaListProps = {
    memberId?: string;
};

export default function RecruitingArenaList({ memberId }: ArenaListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 1,
        mine: true,
        pageSize,
        ...(memberId ? { targetMemberId: memberId } : {}),
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 모집 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                모집 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full">
                <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <RecruitingArenaCard
                            key={arena.id}
                            {...arena}
                            startDate={new Date(arena.startDate)}
                            showBadgeIconOnly={true}
                        />
                    ))}
                </div>
            </div>
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
```

- [ ] **Step 2: Create `WaitingArenaList.tsx`**

Create `app/(base)/profile/components/WaitingArenaList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import WaitingArenaCard from "@/app/(base)/arenas/components/WaitingArenaCard";
import Pager from "@/app/components/Pager";

type ArenaListProps = {
    memberId?: string;
};

export default function WaitingArenaList({ memberId }: ArenaListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 2,
        mine: true,
        pageSize,
        ...(memberId ? { targetMemberId: memberId } : {}),
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 대기 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                대기 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full">
                <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <WaitingArenaCard
                            key={arena.id}
                            id={arena.id}
                            title={arena.title}
                            creatorNickname={arena.creatorNickname}
                            creatorScore={arena.creatorScore}
                            challengerNickname={arena.challengerNickname}
                            challengerScore={arena.challengerScore}
                            startDate={new Date(arena.startDate)}
                            showBadgeIconOnly={true}
                        />
                    ))}
                </div>
            </div>
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
```

- [ ] **Step 3: Create `DebatingArenaList.tsx`**

Create `app/(base)/profile/components/DebatingArenaList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import DebatingArenaCard from "@/app/(base)/arenas/components/DebatingArenaCard";
import Pager from "@/app/components/Pager";
import { useLoadingStore } from "@/stores/loadingStore";

type ArenaListProps = {
    memberId?: string;
};

export default function DebatingArenaList({ memberId }: ArenaListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const { setLoading } = useLoadingStore();

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 3,
        mine: true,
        pageSize,
        ...(memberId ? { targetMemberId: memberId } : {}),
    });

    useEffect(() => {
        setLoading(loading);
    }, [loading, setLoading]);

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 진행 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                진행 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full">
                <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <DebatingArenaCard
                            key={arena.id}
                            id={arena.id}
                            title={arena.title}
                            creatorNickname={arena.creatorNickname}
                            creatorScore={arena.creatorScore}
                            challengerNickname={arena.challengerNickname}
                            challengerScore={arena.challengerScore}
                            debateEndDate={new Date(arena.debateEndDate)}
                            showBadgeIconOnly={false}
                        />
                    ))}
                </div>
            </div>
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
```

- [ ] **Step 4: Create `VotingArenaList.tsx`**

Create `app/(base)/profile/components/VotingArenaList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import VotingArenaCard from "@/app/(base)/arenas/components/VotingArenaCard";
import Pager from "@/app/components/Pager";

type ArenaListProps = {
    memberId?: string;
};

export default function VotingArenaList({ memberId }: ArenaListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const { arenaListDto, loading, error } = useFetchArenas({
        currentPage,
        status: 4,
        mine: true,
        pageSize,
        ...(memberId ? { targetMemberId: memberId } : {}),
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 투표 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                투표 중인 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="w-full">
                <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                    {arenaListDto.arenas.map((arena) => (
                        <VotingArenaCard
                            key={arena.id}
                            id={arena.id}
                            title={arena.title}
                            creatorNickname={arena.creatorNickname}
                            creatorScore={arena.creatorScore}
                            challengerNickname={arena.challengerNickname}
                            challengerScore={arena.challengerScore}
                            voteEndDate={new Date(arena.voteEndDate)}
                            voteCount={arena.voteCount}
                            showBadgeIconOnly={true}
                        />
                    ))}
                </div>
            </div>
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
```

- [ ] **Step 5: Create `CompletedArenaList.tsx`**

Create `app/(base)/profile/components/CompletedArenaList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import useArenas from "@/hooks/useArenas";
import CompleteArenaCard from "@/app/(base)/arenas/components/CompleteArenaCard";
import Pager from "@/app/components/Pager";

type ArenaListProps = {
    memberId?: string;
};

export default function CompletedArenaList({ memberId }: ArenaListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const status = 5;

    const { arenaListDto, loading, error } = useArenas({
        currentPage,
        status,
        mine: true,
        pageSize,
        ...(memberId ? { targetMemberId: memberId } : {}),
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 완료된 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-sm text-font-200">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-sm text-red-500">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-sm text-font-200">
                참여한 종료된 투기장이 없습니다.
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="grid grid-cols-1 gap-6 px-1 md:grid-cols-2">
                {arenaListDto.arenas.map((arena) => (
                    <CompleteArenaCard
                        key={arena.id}
                        {...arena}
                        showBadgeIconOnly={true}
                    />
                ))}
            </div>
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
```

- [ ] **Step 6: Update `app/(base)/profile/components/tabs/ProfileArenaTab.tsx`**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import WaitingArenaList from "../WaitingArenaList";
import DebatingArenaList from "../DebatingArenaList";
import CompletedArenaList from "../CompletedArenaList";
import RecruitingArenaList from "../RecruitingArenaList";
import VotingArenaList from "../VotingArenaList";

const TABS = [
    { key: "recruiting", label: "모집 중" },
    { key: "waiting", label: "대기 중" },
    { key: "debating", label: "토론 중" },
    { key: "voting", label: "투표 중" },
    { key: "completed", label: "종료됨" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfileArenaTab() {
    const [activeTab, setActiveTab] = useState<TabKey>("debating");

    const renderContent = () => {
        switch (activeTab) {
            case "recruiting":
                return <RecruitingArenaList />;
            case "waiting":
                return <WaitingArenaList />;
            case "debating":
                return <DebatingArenaList />;
            case "voting":
                return <VotingArenaList />;
            case "completed":
                return <CompletedArenaList />;
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="text-lg font-semibold">투기장</h2>

            <div className="no-scrollbar relative overflow-x-auto">
                <div className="flex min-w-max justify-center gap-2 whitespace-nowrap border-b border-gray-600 px-4 pb-2 sm:gap-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                                activeTab === tab.key
                                    ? "border-purple-500 text-purple-500"
                                    : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>{renderContent()}</div>
        </div>
    );
}
```

- [ ] **Step 7: Update `app/(base)/profile/[nickname]/components/tab/ProfileArenaTab.tsx`**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import WaitingArenaList from "@/app/(base)/profile/components/WaitingArenaList";
import DebatingArenaList from "@/app/(base)/profile/components/DebatingArenaList";
import CompletedArenaList from "@/app/(base)/profile/components/CompletedArenaList";
import RecruitingArenaList from "@/app/(base)/profile/components/RecruitingArenaList";
import VotingArenaList from "@/app/(base)/profile/components/VotingArenaList";

const TABS = [
    { key: "recruiting", label: "모집 중" },
    { key: "waiting", label: "대기 중" },
    { key: "debating", label: "토론 중" },
    { key: "voting", label: "투표 중" },
    { key: "completed", label: "종료됨" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfileArenaTab({ memberId }: { memberId: string }) {
    const [activeTab, setActiveTab] = useState<TabKey>("debating");

    const renderContent = () => {
        switch (activeTab) {
            case "recruiting":
                return <RecruitingArenaList memberId={memberId} />;
            case "waiting":
                return <WaitingArenaList memberId={memberId} />;
            case "debating":
                return <DebatingArenaList memberId={memberId} />;
            case "voting":
                return <VotingArenaList memberId={memberId} />;
            case "completed":
                return <CompletedArenaList memberId={memberId} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="text-lg font-semibold">투기장</h2>

            <div className="no-scrollbar relative overflow-x-auto">
                <div className="flex min-w-max justify-center gap-2 whitespace-nowrap border-b border-gray-600 px-4 pb-2 sm:gap-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                                activeTab === tab.key
                                    ? "border-purple-500 text-purple-500"
                                    : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>{renderContent()}</div>
        </div>
    );
}
```

- [ ] **Step 8: Delete old My\* and [nickname] ArenaList files**

```bash
rm "app/(base)/profile/components/MyRecrutingArenaList.tsx" \
   "app/(base)/profile/components/MyWaitingArenaList.tsx" \
   "app/(base)/profile/components/MyDebatingArenaList.tsx" \
   "app/(base)/profile/components/MyVotingArenaList.tsx" \
   "app/(base)/profile/components/MyCompletedArenaList.tsx" \
   "app/(base)/profile/[nickname]/components/RecrutingArenaList.tsx" \
   "app/(base)/profile/[nickname]/components/WaitingArenaList.tsx" \
   "app/(base)/profile/[nickname]/components/DebatingArenaList.tsx" \
   "app/(base)/profile/[nickname]/components/VotingArenaList.tsx" \
   "app/(base)/profile/[nickname]/components/CompletedArenaList.tsx"
```

- [ ] **Step 9: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add "app/(base)/profile/components/RecruitingArenaList.tsx" \
        "app/(base)/profile/components/WaitingArenaList.tsx" \
        "app/(base)/profile/components/DebatingArenaList.tsx" \
        "app/(base)/profile/components/VotingArenaList.tsx" \
        "app/(base)/profile/components/CompletedArenaList.tsx" \
        "app/(base)/profile/components/tabs/ProfileArenaTab.tsx" \
        "app/(base)/profile/[nickname]/components/tab/ProfileArenaTab.tsx"
git rm "app/(base)/profile/components/MyRecrutingArenaList.tsx" \
       "app/(base)/profile/components/MyWaitingArenaList.tsx" \
       "app/(base)/profile/components/MyDebatingArenaList.tsx" \
       "app/(base)/profile/components/MyVotingArenaList.tsx" \
       "app/(base)/profile/components/MyCompletedArenaList.tsx" \
       "app/(base)/profile/[nickname]/components/RecrutingArenaList.tsx" \
       "app/(base)/profile/[nickname]/components/WaitingArenaList.tsx" \
       "app/(base)/profile/[nickname]/components/DebatingArenaList.tsx" \
       "app/(base)/profile/[nickname]/components/VotingArenaList.tsx" \
       "app/(base)/profile/[nickname]/components/CompletedArenaList.tsx"
git commit -m "$(cat <<'EOF'
refactor: ArenaList 컴포넌트 통합 (My* 접두사 제거, memberId prop 추가)

- 5개 ArenaList 컴포넌트를 profile/components/로 통합
- memberId 없음: mine=true, 있음: targetMemberId=memberId
- My*ArenaList 및 [nickname]/components/*ArenaList 삭제
- 두 ProfileArenaTab 임포트 경로 업데이트
EOF
)"
```

---

## Task 5: Final smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify own profile page**

Open `http://localhost:3000/profile` (must be logged in).

Check:

- ProfileSidebar shows 5 tabs: 리뷰, 위시리스트, 포인트 히스토리, 투기장, 계정
- ProfileSummaryCard shows 가입일, 위시리스트 count
- ProfileTierCard shows "나의 티어" heading with `?` help button
- Arena tab shows all 5 status sub-tabs with your arenas

- [ ] **Step 3: Verify other profile page**

Open `http://localhost:3000/profile/[any-nickname]`.

Check:

- ProfileSidebar shows 2 tabs: 리뷰, 투기장
- ProfileSummaryCard shows no 가입일, no 위시리스트
- ProfileTierCard shows "현재 티어" heading with no `?` button
- Arena tab shows all 5 status sub-tabs with that user's arenas

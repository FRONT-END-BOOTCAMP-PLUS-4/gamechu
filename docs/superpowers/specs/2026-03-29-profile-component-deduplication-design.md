# Profile Component Deduplication — Design Spec

**Date:** 2026-03-29
**Status:** Approved

---

## Problem

`app/(base)/profile/` and `app/(base)/profile/[nickname]/` maintain near-identical component sets, resulting in 10 duplicated files across 8 component types. Any UI change must be applied twice, and the two copies can silently diverge.

**Duplicated files:**

- `ProfileSidebar.tsx` × 2
- `ProfileSummaryCard.tsx` × 2
- `ProfileTierCard.tsx` × 2
- `*ArenaList.tsx` × 5 statuses × 2 = 10 → 5

---

## File Structure

`app/(base)/profile/components/` becomes the single canonical location. The `[nickname]/components/` directory is deleted entirely.

**After refactor:**

```
app/(base)/profile/components/
  ProfileSidebar.tsx          ← merged (5 tabs or 2 tabs via isOwnProfile)
  ProfileSummaryCard.tsx      ← merged (discriminated union props)
  ProfileTierCard.tsx         ← merged (modal + heading via isOwnProfile)
  RecruitingArenaList.tsx     ← renamed from MyRecruitingArenaList
  WaitingArenaList.tsx        ← renamed from MyWaitingArenaList
  DebatingArenaList.tsx       ← renamed from MyDebatingArenaList
  VotingArenaList.tsx         ← renamed from MyVotingArenaList
  CompletedArenaList.tsx      ← renamed from MyCompletedArenaList
  MemberReviewItem.tsx        ← untouched
  PointHelpModal.tsx          ← untouched
  PointHistoryCard.tsx        ← untouched
  tabs/                       ← untouched

app/(base)/profile/[nickname]/components/
  ← DELETED
```

---

## Component Interfaces

### ProfileSidebar

```tsx
type ProfileSidebarProps = {
    isOwnProfile: boolean;
};
// isOwnProfile=true  → 5 tabs: Reviews, Wishlists, Point History, Arena, Account
// isOwnProfile=false → 2 tabs: Reviews, Arena
```

### ProfileSummaryCard

Uses a discriminated union to prevent private fields from being passed in the other-profile context at the type level:

```tsx
type ProfileSummaryCardProps =
    | {
          isOwnProfile: true;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
          wishlistCount: number; // own-profile only
          createdAt: string; // own-profile only
      }
    | {
          isOwnProfile: false;
          nickname: string;
          imageUrl: string | null;
          score: number;
          reviewCount: number;
          // wishlistCount and createdAt are structurally absent — compile error if passed
      };
// isOwnProfile=true  → 320px height, shows wishlistCount + createdAt
// isOwnProfile=false → 270px height, omits both fields
```

### ProfileTierCard

```tsx
type ProfileTierCardProps = {
    score: number;
    isOwnProfile: boolean;
};
// isOwnProfile=true  → heading="나의 티어", shows PointHelpModal button
// isOwnProfile=false → heading="현재 티어", no modal
```

### ArenaList variants (×5)

```tsx
type ArenaListProps = {
    memberId?: string;
};
// memberId absent  → fetches mine: true
// memberId present → fetches targetMemberId: memberId
```

One component per status: `RecruitingArenaList`, `WaitingArenaList`, `DebatingArenaList`, `VotingArenaList`, `CompletedArenaList`.

---

## Page Migration

### `app/(base)/profile/page.tsx` (own profile)

- Import paths unchanged (`./components/`)
- Add `isOwnProfile={true}` to `ProfileSidebar`, `ProfileSummaryCard`, `ProfileTierCard`
- Pass `wishlistCount` and `createdAt` to `ProfileSummaryCard`
- ArenaList components: no `memberId` prop → fetches `mine: true`

### `app/(base)/profile/[nickname]/page.tsx` (other profile)

- All shared component imports change from `./components/` → `../components/`
- Add `isOwnProfile={false}` to `ProfileSidebar`, `ProfileSummaryCard`, `ProfileTierCard`
- ArenaList components: pass `memberId={memberId}` → fetches `targetMemberId`

---

## Data / Privacy

**API layer is clean:** `/api/member/profile/[nickname]` returns only `{ id, nickname, imageUrl, score }`. Private fields (`wishlistCount`, `createdAt`, `email`, etc.) are only returned by authenticated endpoints that the `[nickname]` page never calls.

**UI layer protection:** The discriminated union on `ProfileSummaryCard` ensures TypeScript prevents passing private fields (`wishlistCount`, `createdAt`) when `isOwnProfile={false}` — enforced at compile time.

---

## Testing

- `npm run build` must pass (pre-commit hook enforces this)
- Manual smoke test: visit `/profile` and `/profile/[nickname]` in dev — verify tabs, tier card heading, arena lists, and summary card render correctly for both contexts
- No new unit tests needed — no new logic introduced

---

## Out of Scope

- Tab components inside `tabs/` / `tab/` subdirectories (not duplicated)
- `MemberReviewItem`, `PointHelpModal`, `PointHistoryCard` (only in own-profile)
- Any API route changes

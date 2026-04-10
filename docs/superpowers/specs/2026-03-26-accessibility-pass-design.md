# Accessibility Pass Design (5.2)

**Date:** 2026-03-26
**Scope:** Keyboard users, screen reader users, mobile users

---

## Summary

Fix accessibility issues across GameChu's frontend. Covers semantic HTML for clickable cards, ARIA labels for interactive elements and tier badges, modal focus management, header keyboard support, and a skip-to-content link.

---

## 1. Clickable Cards — `CardLink` wrapper

### Problem

All 6 card components (`GameCard`, `RecruitingArenaCard`, `DebatingArenaCard`, `WaitingArenaCard`, `VotingArenaCard`, `CompleteArenaCard`) use `<div onClick={() => router.push(...)}>`. These are invisible to keyboard navigation and not announced as interactive by screen readers.

### Solution

Create `app/components/CardLink.tsx` — a thin wrapper around Next.js `<Link>` with shared card interaction styling:

```tsx
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

Replace the outer `<div onClick>` in all 6 cards with `<CardLink href={...} aria-label={...}>`. Remove `useRouter` import and `onClick` handler. Drop `cursor-pointer` (native to `<a>`). Each card passes its own `rounded-*` class via `className` (e.g. `rounded-xl` for GameCard, `rounded-2xl` for arena cards). Each card gets a descriptive `aria-label` (e.g. `${title} 게임 상세보기`, `${title} 아레나`).

---

## 2. ARIA Labels

### TierBadge (`app/components/TierBadge.tsx`)

Add `role="img"` and `aria-label={tier.label + " 티어"}` to the wrapper `<div>`. Change the inner `<Image>` to `alt=""` to prevent duplicate announcements.

```tsx
<div
    role="img"
    aria-label={`${tier.label} 티어`}
    className={...}
    style={...}
>
    <Image src={tier.icon} alt="" ... />
    {!iconOnly && <span className="hidden sm:inline">{tier.label}</span>}
</div>
```

### GameCard score + review count (`app/(base)/games/components/GameCard.tsx`)

- Rating container: add `aria-label={`전문가 평점 ${expertRating.toFixed(1)}`}`
- Review count container: add `aria-label={`리뷰 ${reviewCount}개`}`
- Inner icon `<Image>` elements: set `alt=""` to avoid duplication

### Header notification buttons (`app/components/Header.tsx`)

Both desktop and mobile `<button>` elements wrapping the bell icon get `aria-label="알림"`. Inner `<Image>` gets `alt=""`.

---

## 3. Modal Accessibility (`app/components/ModalWrapper.tsx`)

### Problem

`ModalWrapper` has no `role="dialog"`, no `aria-modal`, no focus trap, and no focus management. Screen readers do not know a modal is open; keyboard users can tab outside the modal.

### Solution

Install `focus-trap-react`. Make four changes to `ModalWrapper`:

1. Accept optional `labelId` prop
2. Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby={labelId}` to the inner content div
3. Wrap inner content with `<FocusTrap active={isOpen}>` — focus moves to first focusable element on open, returns to trigger on close
4. Remove the manual `keyup` Escape handler (replaced by `focus-trap-react`'s `escapeDeactivates` option)

```tsx
type ModalWrapperProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    labelId?: string;
};

// Inner structure:
<FocusTrap
    active={isOpen}
    focusTrapOptions={{
        onDeactivate: onClose,
        returnFocusOnDeactivate: true,
        escapeDeactivates: true,
    }}
>
    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="max-h-[90vh] w-full max-w-[700px] ..."
        onClick={(e) => e.stopPropagation()}
    >
        {children}
    </div>
</FocusTrap>;
```

Each modal (`NotificationModal`, `CreateArenaModal`, `PointHelpModal`) adds an `id` to its title element and passes that `id` as `labelId` to `ModalWrapper`.

---

## 4. Header Keyboard Support (`app/components/Header.tsx`)

### Changes

**Hamburger button:**

```tsx
<button
    aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
    aria-expanded={menuOpen}
    aria-controls="mobile-menu"
    ...
>
```

**Mobile menu panel:**

```tsx
<div
    id="mobile-menu"
    aria-hidden={!menuOpen}
    className={`absolute ... ${menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
>
```

**Notification buttons** (covered in Section 2 above).

---

## 5. Skip-to-Content Link (`app/layout.tsx` + `app/(base)/layout.tsx`)

Add a visually hidden skip link as the first child of `<body>`. Becomes visible on keyboard focus.

```tsx
// app/layout.tsx — first child of <body>
<a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-purple-100 focus:px-4 focus:py-2 focus:text-white"
>
    본문으로 바로가기
</a>
```

```tsx
// app/(base)/layout.tsx
<main id="main-content" className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
```

---

## Files Changed

| File                                                   | Change                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `app/components/CardLink.tsx`                          | New component                                                                 |
| `app/(base)/games/components/GameCard.tsx`             | div→CardLink, aria-labels on score/review                                     |
| `app/(base)/arenas/components/RecruitingArenaCard.tsx` | div→CardLink                                                                  |
| `app/(base)/arenas/components/DebatingArenaCard.tsx`   | div→CardLink                                                                  |
| `app/(base)/arenas/components/WaitingArenaCard.tsx`    | div→CardLink                                                                  |
| `app/(base)/arenas/components/VotingArenaCard.tsx`     | div→CardLink                                                                  |
| `app/(base)/arenas/components/CompleteArenaCard.tsx`   | div→CardLink                                                                  |
| `app/components/TierBadge.tsx`                         | role="img", aria-label, alt="" on image                                       |
| `app/components/Header.tsx`                            | aria-expanded, aria-controls, aria-hidden on menu, aria-label on bell buttons |
| `app/components/ModalWrapper.tsx`                      | role="dialog", aria-modal, focus-trap-react, labelId prop                     |
| `app/(base)/components/NotificationModal.tsx`          | Add title id, pass labelId                                                    |
| `app/(base)/arenas/components/CreateArenaModal.tsx`    | Add title id, pass labelId                                                    |
| `app/(base)/profile/components/PointHelpModal.tsx`     | Add title id, pass labelId                                                    |
| `app/layout.tsx`                                       | Skip link                                                                     |
| `app/(base)/layout.tsx`                                | id="main-content" on main                                                     |

## Dependencies

- Install `focus-trap-react` (and `focus-trap` peer dep)

## Out of Scope

- Color contrast audit
- Status badge divs (`모집중`, `토론중`, etc.) — presentational, not interactive
- Visual regression testing

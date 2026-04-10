# Styling Guide

TailwindCSS styling patterns for GameChu's Next.js application.

---

## Primary Method: TailwindCSS Utility Classes

All styling in GameChu uses TailwindCSS utility classes directly in `className`:

```typescript
export default function ArenaCard({ arena }: ArenaCardProps) {
    return (
        <div className="rounded-lg bg-background-300 p-4 transition duration-200 hover:bg-background-200">
            <h3 className="text-lg font-bold text-font-100">{arena.title}</h3>
            <p className="mt-2 text-sm text-font-200">{arena.description}</p>
        </div>
    );
}
```

---

## Conditional Classes with `cn()`

Use `cn()` from `@/utils/tailwindUtil` for conditional class names:

```typescript
import { cn } from "@/utils/tailwindUtil";

export default function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
            )}
        >
            {active ? "진행 중" : "종료"}
        </span>
    );
}
```

### Multiple Conditions

```typescript
<button
    className={cn(
        "inline-flex items-center justify-center rounded-[8px] font-medium transition duration-200",
        sizeClasses[size],
        typeClasses[type],
        disabled && "pointer-events-none cursor-not-allowed opacity-50"
    )}
>
    {label}
</button>
```

---

## GameChu Design Tokens

Custom colors and tokens defined in `tailwind.config.ts`:

### Colors

```
Background:
  background-200    # Lighter surface
  background-300    # Card/surface
  background-400    # Page background (darkest)

Text:
  font-100          # Primary text (white/light)
  font-200          # Secondary text (muted)

Brand:
  primary-purple-200  # Primary purple
  primary-purple-300  # Purple hover
  primary-blue-200    # Primary blue
  primary-blue-300    # Blue hover

Borders:
  line-100          # Border color
```

### Usage

```typescript
// Background
<div className="bg-background-400">       {/* Page background */}
<div className="bg-background-300">       {/* Card surface */}

// Text
<h1 className="text-font-100">           {/* Primary text */}
<p className="text-font-200">            {/* Secondary text */}

// Brand
<button className="bg-primary-purple-200 hover:bg-primary-purple-300">

// Borders
<div className="border border-line-100">
```

---

## Responsive Design

Use Tailwind's responsive prefixes:

```typescript
// Mobile-first responsive layout
<div className="flex flex-col gap-8 lg:flex-row">
    {/* Column on mobile, row on large screens */}
    <div className="flex w-full flex-1 flex-col lg:flex-[3]">
        {/* Main content — takes 3/4 on large screens */}
    </div>
    <div className="mt-16 hidden flex-[1] lg:block">
        {/* Sidebar — hidden on mobile, visible on large screens */}
    </div>
</div>
```

### Breakpoints

| Prefix | Min Width | Use Case       |
| ------ | --------- | -------------- |
| (none) | 0px       | Mobile default |
| `sm:`  | 640px     | Small tablets  |
| `md:`  | 768px     | Tablets        |
| `lg:`  | 1024px    | Desktop        |
| `xl:`  | 1280px    | Large desktop  |

### Common Responsive Patterns

```typescript
// Responsive padding
<main className="mx-auto max-w-[1480px] sm:px-10">

// Responsive grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// Responsive text
<h1 className="text-2xl font-bold lg:text-5xl">

// Show/hide at breakpoints
<div className="mt-6 block lg:hidden">     {/* Mobile only */}
<div className="hidden lg:block">           {/* Desktop only */}
```

---

## Animation Classes

GameChu uses custom Tailwind animation classes:

```typescript
// Fade in with upward motion
<span className="animate-fade-in-up-strong inline-block" style={{ animationDelay: "0.1s" }}>

// Gradient animation
<span className="animate-gradient-xy bg-gradient-to-br from-primary-purple-300 via-purple-200 to-primary-purple-300 bg-[length:200%_200%] bg-clip-text text-transparent">

// Typing animation
<p className="animate-typing relative overflow-hidden whitespace-nowrap" style={{ animationDelay: "1.5s" }}>
```

Also uses Framer Motion for component animations:

```typescript
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence>
    {visible && (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
        >
            Content
        </motion.div>
    )}
</AnimatePresence>
```

---

## Common Layout Patterns

### Centered Content

```typescript
<div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background-400 px-4">
    <div className="flex w-full max-w-7xl flex-col items-center gap-12">
        {/* content */}
    </div>
</div>
```

### Page Container

```typescript
<div className="px-4 py-10 sm:px-8 md:px-12 lg:px-16">
    {/* page content */}
</div>
```

### Card

```typescript
<div className="rounded-lg border border-line-100 bg-background-300 p-4">
    {/* card content */}
</div>
```

### Sticky Sidebar

```typescript
<div className="sticky top-6">
    {/* sidebar content */}
</div>
```

---

## Code Style Standards

### Quotes

**Double quotes** for JSX strings (project standard):

```typescript
// ✅ CORRECT — GameChu uses double quotes
import { cn } from "@/utils/tailwindUtil";
<div className="flex items-center gap-2">

// ❌ WRONG for this project
import { cn } from '@/utils/tailwindUtil';
```

### Indentation

**4 spaces** (configured in Prettier/ESLint):

```typescript
export default function MyComponent() {
    return (
        <div className="p-4">
            <h1 className="text-lg font-bold">Title</h1>
        </div>
    );
}
```

---

## What NOT to Use

```typescript
// ❌ NEVER — Inline style objects
<div style={{ padding: "16px", backgroundColor: "#1a1a2e" }}>

// ❌ NEVER — CSS Modules
import styles from "./MyComponent.module.css";

// ❌ NEVER — styled-components or Emotion
const StyledDiv = styled.div`padding: 16px;`;

// ❌ NEVER — MUI sx prop
<Box sx={{ p: 2, display: "flex" }}>

// ✅ ALWAYS — TailwindCSS utility classes
<div className="flex bg-background-300 p-4">
```

---

## Summary

**Styling Checklist:**

- TailwindCSS utility classes in `className`
- `cn()` for conditional classes
- Custom design tokens: `background-*`, `font-*`, `primary-purple-*`, `line-*`
- Mobile-first responsive: `sm:`, `md:`, `lg:` prefixes
- Framer Motion for complex animations
- Double quotes for strings
- 4 space indentation
- No inline styles, CSS modules, or CSS-in-JS

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full styling examples

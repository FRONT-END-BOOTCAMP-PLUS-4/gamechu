# CSS & Styling Conventions

> Framework: **TailwindCSS 3** with custom design tokens in `tailwind.config.ts`

## Color tokens

Use semantic token names — never raw hex values:

### Backgrounds

| Token               | Hex       | Use                    |
| ------------------- | --------- | ---------------------- |
| `bg-background-400` | `#090909` | Page root background   |
| `bg-background-300` | `#1F1F1F` | Page containers, cards |
| `bg-background-100` | `#191919` | Header, footer         |
| `bg-background-200` | `#373737` | Input fields           |

### Text

| Token           | Hex       | Use                    |
| --------------- | --------- | ---------------------- |
| `text-font-100` | `#FFFFFF` | Primary text           |
| `text-font-200` | `#C4C4C4` | Placeholder, secondary |
| `text-font-300` | `#a5a5a5` | Muted / helper text    |

### Brand (actions)

| Token                | Use                             |
| -------------------- | ------------------------------- |
| `primary-purple-200` | Primary button background       |
| `primary-purple-300` | Primary button hover            |
| `primary-purple-100` | Disabled state                  |
| `primary-purple-400` | Chat/overlay backgrounds (rgba) |
| `primary-blue-200`   | Secondary button background     |
| `primary-blue-300`   | Secondary button hover          |
| `primary-blue-400`   | Overlay backgrounds (rgba)      |

### Borders & state

| Token              | Use               |
| ------------------ | ----------------- |
| `border-line-100`  | Button borders    |
| `border-line-200`  | Container borders |
| `text-state-error` | Error messages    |

## Typography scale

Use named scale classes — never raw `text-[Xpx]`:

| Class           | Size / Line-height | Use                      |
| --------------- | ------------------ | ------------------------ |
| `text-headline` | 32px / 40px        | Page titles              |
| `text-h2`       | 24px / 32px        | Section headings         |
| `text-h3`       | 20px / 28px        | Card headings            |
| `text-body`     | 16px / 24px        | Body text                |
| `text-button`   | 14px / 20px        | Button labels            |
| `text-caption`  | 12px / 16px        | Captions, error messages |

Font family: **Pretendard** (loaded via `globals.css`).

## Class composition

Use `cn()` from `utils/tailwindUtil.ts` for any conditional or merged classes:

```typescript
import { cn } from "@/utils/tailwindUtil";

<button className={cn(
    "px-4 py-2 rounded text-button",            // base
    variant === "primary" && "bg-primary-purple-200",  // variant
    isDisabled && "opacity-50 cursor-not-allowed"      // conditional
)} />
```

Class order: **base → variant → conditional**

## Animations

| Type                  | Tool                        | Example                                 |
| --------------------- | --------------------------- | --------------------------------------- |
| Simple entrance/exit  | Tailwind `animate-*`        | `animate-fade-in`, `animate-fade-in-up` |
| Complex / interactive | Framer Motion               | `<motion.div>`, `<AnimatePresence>`     |
| Special effects       | Custom CSS in `globals.css` | `.glow-border`, `.animated-border`      |

Available Tailwind animation classes (defined in `tailwind.config.ts`):

- `animate-fade-in` — opacity + translateY
- `animate-fade-in-up` / `animate-fade-in-left` / `animate-fade-in-right`
- `animate-fade-in-up-strong` / `-left-strong` / `-right-strong` (100px offset)
- `animate-slow-pan` — background position pan
- `animate-border-flow`, `animate-gradient-xy` — gradient effects
- `animate-shake` — error shake

Never duplicate keyframes in component inline styles — add new animations to `tailwind.config.ts` or `globals.css`.

## Responsive design

Mobile-first: write base styles for mobile, use `sm:` / `md:` / `lg:` for larger screens.

**Never use `dark:` modifier** — this is a dark-mode-only app. All styles assume a dark background.

## `globals.css` rules

Only add to `globals.css` when Tailwind config cannot express the style:

- Multi-step gradient border animations (`.animated-border`, `.glow-border`)
- Pseudo-element animations
- Custom scrollbar styles
- Font `@font-face` declarations

```css
/* ✅ — add to globals.css: pseudo-element animation Tailwind can't do */
.glow-border::before { ... }

/* ❌ — do not add: simple utility already in Tailwind config */
.my-custom-color { color: #9333EA; }
```

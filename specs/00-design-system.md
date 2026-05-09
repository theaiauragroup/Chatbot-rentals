# 00 — Design System

## Purpose

Define every visual primitive, token, and motion rule that every dashboard screen consumes.
This is the only spec that other specs reference for "what does a Button look like / what's our gray scale / how much does a drawer slide". If a screen breaks this spec, the spec wins — fix the screen.

Aesthetic target: **Modern minimal — Linear / Vercel / Stripe Dashboard**. Crisp neutrals, near-black text, hairline borders, near-invisible shadows, dense 13–14px body type. One cool accent. No decorative gradients, no rainbow KPI tiles, no oversized shadows.

## Tokens

All tokens live in `src/app/globals.css` inside Tailwind v4's `@theme {}` block. Use semantic names (`--color-fg`, `--color-accent`) not visual names (`--color-gray-900`, `--color-purple`).

### Color — Neutrals (canvas + surface ramp)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FAFAFA` | App canvas (everything behind cards) |
| `--color-surface` | `#FFFFFF` | Cards, drawers, modals, table rows |
| `--color-surface-2` | `#F4F4F5` | Hover states, table zebra, inset wells |
| `--color-border` | `#E4E4E7` | Default 1px borders |
| `--color-border-strong` | `#D4D4D8` | Hover-state border, focus boundaries |
| `--color-fg` | `#09090B` | Primary text, headings, KPI numbers |
| `--color-fg-muted` | `#52525B` | Secondary text, table meta, helper text |
| `--color-fg-subtle` | `#71717A` | Tertiary text, placeholder, disabled labels (≥ 4.5:1 contrast on white) |

### Color — Accent

| Token | Hex | Use |
|---|---|---|
| `--color-accent` | `#5B5BD6` | Primary buttons, active nav, focus ring, single highlight chart series |
| `--color-accent-hover` | `#4F4FC4` | Primary button hover |
| `--color-accent-soft` | `#EEF0FF` | Selected nav background, accent pill background |
| `--color-accent-fg` | `#FFFFFF` | Text on `--color-accent` |

**One accent only.** Do not introduce a second brand color. Resist Tailwind's default blue.

### Color — Lead temperature (data only)

| Token | Hex | Use |
|---|---|---|
| `--color-hot` | `#E11D48` | Hot lead pill text + chart series |
| `--color-hot-soft` | `#FFE4E6` | Hot lead pill background |
| `--color-warm` | `#F59E0B` | Warm lead pill text + chart series |
| `--color-warm-soft` | `#FEF3C7` | Warm lead pill background |
| `--color-cold` | `#3B82F6` | Cold lead pill text + chart series |
| `--color-cold-soft` | `#DBEAFE` | Cold lead pill background |

### Color — Semantic

| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#16A34A` | Booked outcome, success toast, positive delta |
| `--color-warning` | `#D97706` | Maintenance status, warning toast |
| `--color-danger` | `#DC2626` | Destructive button, error state, lost outcome |
| `--color-info` | `#0EA5E9` | Info toast, neutral notification |

### Typography

Font (sans): **Inter** — loaded via `next/font/google`, exposed as CSS var `--font-inter`. Used for everything except code blocks. Variable axes: weight 100–900, optical sizing on. We use weights 400 / 500 / 600 / 700.
Font (mono): **Geist Mono** (already wired via `next/font` in `app/layout.tsx`). Used only in code blocks (Settings → Widget embed snippet) and `Kbd` primitive.

The Geist Sans wired by the Next.js starter is replaced with Inter. Geist Mono stays.

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 12px (0.75rem) | Table meta, timestamps, badge text |
| `--text-sm` | 13px (0.8125rem) | Sidebar, filter chips, tertiary UI |
| `--text-base` | 14px (0.875rem) | **Default body**, table rows, form labels |
| `--text-md` | 16px (1rem) | Card titles, section headings |
| `--text-lg` | 18px (1.125rem) | Page subtitles |
| `--text-xl` | 24px (1.5rem) | Card numeric values |
| `--text-2xl` | 32px (2rem) | KPI hero numbers |
| `--text-3xl` | 40px (2.5rem) | Empty-state titles, login welcome |

Letter spacing: `-0.01em` (`--tracking-tight`) on display sizes ≥ 24px; `-0.02em` (`--tracking-tighter`) on hero numbers ≥ 32px. Otherwise default.
Line height: 1.45 body, 1.2 display.
Weight: 400 body, 500 medium (table headers, button), 600 semibold (KPI numbers, card titles), 700 bold (rare — only page H1).
Antialiasing: `font-feature-settings: "cv11", "ss01", "ss03";` on body for Inter's calibrated alternates (more open `1`, slashed `0`, single-story `a` in dense UI). Apply via `globals.css` `body` selector.

### Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Input fields, segmented controls, small buttons |
| `--radius-md` | 8px | Buttons, dropdowns, tags |
| `--radius-lg` | 12px | Cards, drawers, modals |
| `--radius-xl` | 16px | Hero cards, large media frames |
| `--radius-full` | 9999px | Status pills, avatars only |

Never `rounded-full` on a rectangle that isn't a status pill or avatar.

### Shadow

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 2px 0 rgb(9 9 11 / 0.04)` | Subtle separation |
| `--shadow-sm` | `0 1px 2px 0 rgb(9 9 11 / 0.05), 0 1px 1px 0 rgb(9 9 11 / 0.03)` | **Default card shadow** |
| `--shadow-md` | `0 4px 12px -2px rgb(9 9 11 / 0.06), 0 2px 4px -2px rgb(9 9 11 / 0.04)` | Popovers, dropdown menus, tooltips |
| `--shadow-lg` | `0 12px 32px -8px rgb(9 9 11 / 0.10), 0 4px 8px -4px rgb(9 9 11 / 0.05)` | Drawer, modal |

Never `shadow-xl` / `shadow-2xl`. Linear/Vercel use shadows so light they're nearly invisible — that's the look.

### Spacing

Use Tailwind v4's default 4px scale. Common rhythm:
- Card inner padding: `24px` (`p-6`)
- Section vertical rhythm: `32px` between major blocks (`gap-8`)
- Form field stack: `16px` between fields (`gap-4`)
- Inline icon → label gap: `8px` (`gap-2`)
- Page outer padding: `32px` left/right, `24px` top, `48px` bottom

### Z-index

| Layer | z |
|---|---|
| Base | `auto` |
| Sticky table header | `10` |
| Top bar | `30` |
| Sidebar (mobile drawer) | `40` |
| Popover / Dropdown / Tooltip | `50` |
| Drawer | `60` |
| Modal | `70` |
| Toast | `80` |

## Layout primitives

### App shell

- Sidebar: fixed `240px` wide, full height, `--color-surface` background, `1px` right border `--color-border`.
- Top bar: fixed `56px` tall, full width, `--color-surface` with `1px` bottom border `--color-border`.
- Main content area: `--color-bg`, padding `24px 32px 48px`, max content width `1440px` centered.
- At ≥ 1920: sidebar stays 240px, main content caps at 1440px and centers; canvas fills.
- At < 1280: sidebar collapses to icon-only 64px; tables paginate (no horizontal scroll).
- At < 1024 (out of scope this pass — note in `<aside>` "Optimized for desktop").

### Grid

12-column grid for the Dashboard page. Card spans:
- KPI tiles: 2 or 3 columns each (5 KPIs across at 1440 = 12 / not even — use 6 KPIs at span 2, or 5 KPIs split as 2+2+2+3+3, or **prefer 4 KPI columns × 3 cols = 12**).
- Charts: 6 columns each (two-up) or 12 columns (full width).
- Activity feed: 4 columns sticky right rail; main content 8.

## UI primitives (the ~15 things to build first)

Each primitive lives in `src/components/ui/<Name>.tsx`. Each must support these baseline props: `className?: string`, `children?: ReactNode`, plus its own. Each renders accessibly via Radix where possible.

### `Button`

Variants: `primary` (default), `secondary`, `ghost`, `destructive`, `link`.
Sizes: `sm` (28px), `md` (36px, default), `lg` (44px).
States: default / hover / focus-visible (accent ring) / active / disabled / loading (spinner replaces icon, text dims).
Optional `leadingIcon`, `trailingIcon` (both lucide).
Radius `--radius-md`. Font weight 500. Padding: sm `0 12px`, md `0 16px`, lg `0 20px`.

```
primary:    bg --color-accent, text white, hover bg --color-accent-hover
secondary:  bg --color-surface, border 1px --color-border, text --color-fg, hover border --color-border-strong + bg --color-surface-2
ghost:      no bg, text --color-fg-muted, hover bg --color-surface-2
destructive:bg --color-danger, text white, hover bg darker
link:       text --color-accent, underline on hover, no padding
```

### `Input` / `Textarea`

Height 36px (input). Radius `--radius-sm`. Border 1px `--color-border`, focus ring 2px `--color-accent` with offset 0, no border color change on focus (use the ring instead). Placeholder `--color-fg-subtle`. Error state: border `--color-danger`, helper text in `--color-danger`. Optional `leadingIcon` (16px lucide, left padding 36px).

### `Select`

Built on `@radix-ui/react-popover` + custom trigger to match Input visually. Options list: white surface, `--shadow-md`, `--radius-md`, max-height 320px, scrollable. Selected option: `--color-accent-soft` background, accent text.

### `Card`

Base white surface, `--radius-lg`, `1px` border `--color-border`, `--shadow-sm`. Sub-parts:
- `Card.Header` — flex row, padding 24px, optional border-bottom on dense cards
- `Card.Body` — padding 24px
- `Card.Footer` — padding 16px 24px, border-top, smaller text

Variants: `flat` (no shadow, just border), `interactive` (hover lifts shadow to `--shadow-md`, cursor pointer).

### `Badge`

Small inline label, padding `2px 8px`, radius `--radius-full`, `text-xs`, font-weight 500. Variants:
- `neutral` — `--color-surface-2` bg, `--color-fg-muted` text
- `accent` — `--color-accent-soft` bg, `--color-accent` text
- `success` / `warning` / `danger` / `info` — soft bg + solid text
- `hot` / `warm` / `cold` — paired temperature tokens

### `StatusPill` (specialized Badge)

For lead temperature and vehicle status. Always paired with a 6px solid dot. E.g. for hot:
`[•] Hot` — dot `--color-hot`, text `--color-hot`, bg `--color-hot-soft`.

### `Tabs`

Built on `@radix-ui/react-tabs`. Underline style only (no pill tabs).
- Inactive: `--color-fg-muted`, no underline.
- Active: `--color-fg`, 2px bottom underline `--color-accent`, animate underline slide between tabs (150ms ease-out).
- Tab list border-bottom `1px --color-border`.
- Padding per tab: `0 16px`, height 40px.

### `Drawer`

Right-side slide-in. Width 480px (560px on Lead detail). Built on `@radix-ui/react-dialog`. Backdrop: `rgba(9, 9, 11, 0.4)` with `backdrop-blur-sm`. Panel: `--color-surface`, `--shadow-lg`, full-height. Header (sticky top): title + close button (lucide X). Body: scrollable. Footer (sticky bottom, optional): actions right-aligned.
Motion: enter slide-in-from-right 200ms cubic-bezier(0.32, 0.72, 0, 1), exit reverse 150ms.

### `Modal`

Centered. Max width 480px (confirm), 640px (form). Same Radix dialog primitive. Backdrop identical to Drawer. Motion: fade + scale-from-0.96 150ms.

### `Tooltip`

Built on `@radix-ui/react-tooltip`. Dark variant: `--color-fg` background, white text, `text-xs`, padding `4px 8px`, `--radius-sm`. Delay 300ms open. Arrow 6px.

### `Switch`

Built on `@radix-ui/react-switch`. Track 40×24px, thumb 20px. Off: `--color-border-strong` track. On: `--color-accent` track. Animate 100ms.

### `Slider`

Built on `@radix-ui/react-slider`. Track 4px tall `--color-border`, fill `--color-accent`, thumb 16px white circle with `--shadow-sm` and 1px border. Used in Tune AI tone slider.

### `Avatar`

Round 32px (sm 24px, lg 40px). Initials fallback: bg `--color-accent-soft`, text `--color-accent`, font-weight 500. Image: `next/image`.

### `Skeleton`

Shimmer placeholder. Shape-matches the real element. `--color-surface-2` base with diagonal sweep `--color-bg`. 1.4s loop. Used during 200ms initial mount to avoid CLS, then real (mock) data.

### `EmptyState`

Vertical center stack. 24px lucide icon (`--color-fg-subtle`), 16px gap, `text-md` title (`--color-fg`), `text-sm` body (`--color-fg-muted`), 16px gap, optional CTA button. Vertical padding 64px. **No illustrations.**

### `Kbd`

Inline keyboard hint. Padding `2px 6px`, `--radius-sm`, border 1px `--color-border`, bg `--color-surface-2`, font `--font-mono`, `text-xs`. E.g. `⌘K`.

### `Separator`

1px line `--color-border`. Horizontal default. `aria-orientation` set.

### `ScrollArea`

Built on `@radix-ui/react-scroll-area`. Custom 6px scrollbar, `--color-border-strong` thumb, transparent track. Use inside Drawer body, long Sidebar, transcript view.

## Motion

- Hover transitions: `100ms ease-out`, color/background only. Never animate width/height on hover.
- Focus ring: appears instantly (no fade).
- Drawer: `200ms cubic-bezier(0.32, 0.72, 0, 1)` enter, `150ms` exit.
- Modal: `150ms ease-out` fade + scale.
- Tooltip: `300ms` delay open, fade 100ms.
- Tab underline slide: `150ms ease-out`.
- Toast: slide-up + fade, 200ms enter, 150ms exit.
- Page transitions: none (instant). Loading state via `Skeleton`.
- Reduced motion: respect `prefers-reduced-motion: reduce` — disable slides/scales, keep fades at 50ms.

## Focus & accessibility

- All interactive elements have a visible focus ring: 2px `--color-accent`, 0 offset, on `:focus-visible`.
- Click targets ≥ 32px in any dimension; tap targets ≥ 44px on mobile (out of scope this pass but enforce in primitives).
- Color contrast: body text ≥ 7:1 on white (`#09090B`), muted text ≥ 4.5:1 (`#71717A`).
- All inputs have associated `<label>` (visible or `aria-label`).
- Drawer/Modal trap focus, restore focus to opener on close, Esc to close.
- Tabs and lists support arrow-key navigation (Radix default).
- Status pills carry `aria-label` with the full status name (e.g. `aria-label="Hot lead"`) — color is supplemented by the leading dot and text.

## Iconography

Library: `lucide-react`. Default size 16px, stroke 1.5, `currentColor`. Sizes 14 / 16 / 20 / 24 only — no in-between. Icon used in a button must size-match the button text size. Never use emoji as functional UI.

## Data viz (charts)

Charts live in `src/components/charts/`. All built with **recharts**, themed via CSS vars.

- Default series: `--color-accent`. For multi-series temperature charts: hot/warm/cold tokens.
- Axis color: `--color-fg-subtle`, `text-xs`.
- Gridlines: `--color-border` (horizontal only on most charts; no vertical gridlines).
- Tooltip: `Card`-style with `--shadow-md`, `--radius-md`, `text-xs`.
- Legend: top-right, `text-xs`, dot 8px.
- Empty state: chart container shows `EmptyState` with `BarChart3` lucide icon.
- Animations: enter only, 400ms ease-out. No on-hover animations beyond tooltip.

## Anti-patterns (do not do, ever)

1. Default Tailwind blue (`blue-500/600`) — use `--color-accent`.
2. Multi-color KPI tiles — cards stay monochrome; color is only for *data*.
3. Gradients on backgrounds, buttons, cards — flat surfaces only.
4. `shadow-xl` / `shadow-2xl` — use `--shadow-sm` for cards, `--shadow-lg` only for drawer/modal.
5. Low-contrast gray-on-gray (`text-gray-400` on `bg-gray-100`).
6. Borders heavier than 1px; on hover, change *color* never *width*.
7. Oversized type in dense areas — tables/sidebar/filters stay 13–14px.
8. Emoji as icons — lucide only.
9. `rounded-full` on rectangles — pills only for status badges and avatars.
10. Decorative illustrations in empty states.
11. Animating everything — drawers/modals only.
12. Mock data that looks fake (`John Doe`, `Lorem ipsum`, `$0.00`).
13. Reaching for shadcn CLI — conflicts with v4 `@theme` setup.

## Acceptance checklist

- [ ] `globals.css` contains every token in the tables above, expressed inside `@theme {}`.
- [ ] No `tailwind.config.ts` exists.
- [ ] Body default style: `bg-bg text-fg text-base font-sans antialiased`.
- [ ] Each of the 15 UI primitives has its own file under `src/components/ui/` and imports nothing from a third-party UI kit (only Radix primitives à la carte + lucide).
- [ ] Every primitive has a focus-visible ring in `--color-accent`.
- [ ] No `blue-500`, `purple-500`, `gradient-to-`, `shadow-xl`, `shadow-2xl` strings in the codebase grep.
- [ ] Lighthouse a11y ≥ 95 on the dashboard route.
- [ ] `prefers-reduced-motion` disables slide/scale transitions globally.

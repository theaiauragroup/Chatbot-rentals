# 01 — Information Architecture

## Purpose

Define every URL the dashboard owns, how the shell (sidebar + top bar) behaves across all of them, and the global states (loading / error / 404 / empty) every screen falls back to.

## Sitemap

```
/                                     → redirect to /dashboard
/dashboard                            Dashboard (KPIs + charts + activity)
/chats                                Chat history table
/chats/[id]                           Single transcript view
/leads                                Leads (kanban + table toggle)
/tune                                 Tune AI (tabs)
/tune?tab=playground                  Tune AI deep-link to Playground
/fleets                               Fleet grid/list
/fleets/new                           Add vehicle form
/fleets/[id]                          Vehicle detail (photos + calendar)
/settings                             Settings (tabs)
/settings?tab=twilio                  Settings deep-link
/calls                                Inbound and outbound call logs

/login                                Static login page (visual stub only, this pass)
                                      No auth wiring; submit redirects to /dashboard.

/_not-found                           Custom 404
/_error                               Custom error boundary
```

Route group: all dashboard routes live under `src/app/(dashboard)/...` so they share the shell layout. `/login` and 404 live outside the group.

Next.js 16 reminder: `params` and `searchParams` are `Promise<>` in dynamic routes — must `await` them.

## Sidebar (left, 240px fixed, never scrolls)

The dashboard shell is intentionally **non-scrolling at the page level**. The layout root (`src/app/(dashboard)/layout.tsx`) is `flex h-screen w-full overflow-hidden` so the body itself doesn't scroll — only the main content column does. The Sidebar is a flex item with `h-full`, no `sticky` / `fixed` positioning. It cannot drift, scroll, or detach from the viewport edge. The TopBar inside the main column uses `sticky top-0` so it pins to the scroll-container's top.

```
┌─ Sidebar ──────────────────┐
│  Logo · "AIAURA FLEETS"     │  ← brand block, 56px tall, border-bottom
│                            │
│  Main                      │  ← section label, text-xs, --color-fg-subtle
│   ▣ Dashboard      ⌘1      │
│   ◫ Chats          ⌘2      │
│   ✦ Leads          ⌘3      │
│                            │
│  Configure                 │
│   ⌥ Tune AI        ⌘4      │
│   ⊞ Fleets         ⌘5      │
│   ⚙ Settings       ⌘6      │
│                            │
│  ────────                  │  ← spacer pushes the footer down
│                            │
│  ┌──────────────────────┐  │
│  │ ◐  Sarah Khan        │  │  ← manager block
│  │    Owner             │  │
│  │                  ⋯   │  │  ← user menu trigger
│  └──────────────────────┘  │
└────────────────────────────┘
```

- Nav items: 36px tall, padding `0 12px`, gap 8px between icon and label.
- Inactive: `--color-fg-muted` text + icon.
- Hover: bg `--color-surface-2`, text `--color-fg`.
- Active: bg `--color-accent-soft`, text `--color-accent`, icon `--color-accent`. **No border, no left bar** — the bg tint is the indicator.
- Section labels: text-xs uppercase tracking-wide `--color-fg-subtle`, 8px bottom margin.
- Keyboard shortcuts (`⌘1`–`⌘6`): rendered with `Kbd` primitive, right-aligned, dim. Active when focus is not in an input.
- Manager footer: 56px tall, padding 12px, click opens user menu (Profile / Sign out). Sign out is stubbed to a toast this pass.
- At < 1280: collapses to 64px icon-only rail; tooltip on hover shows label.

Order of sections **must** match the source spec §8.1 exactly: Dashboard → Chats (labeled "Chat history" in UI) → Leads → Tune AI → Fleets → Settings.

## Top bar (56px, sticky)

```
┌─ Top bar ─────────────────────────────────────────────────────────────────────┐
│  [Page title]              ┌─ Search ────────────────┐    ⏱ 7d ▾   🔔  ◐    │
│                            │ ⌕ Search chats, leads… │    ↑                  │
│                            └─────────────────────────┘    Date filter        │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **Page title** (left): the active section name. On `/chats/[id]` shows back button + chat ID. On `/fleets/[id]` shows back + vehicle name.
- **Global search** (center, 360px): `Input` with leading `⌕` icon and trailing `⌘K` Kbd. Opens command palette this pass — palette content is mock, returns 5 fake results across leads/chats/fleets, picking one navigates.
- **Date filter** (right, only on `/dashboard` and `/chats` and `/leads`): `DateRangePicker` with presets Today / 7 days (default) / 30 days / Custom. Selection persists in URL search param `?range=7d` so reload preserves.
- **Notifications bell**: dropdown with last 8 mock notifications. Unread count badge in `--color-accent`.
- **Account avatar**: opens same menu as sidebar footer's `⋯` (single source).

## Breadcrumbs

Only on detail pages (`/chats/[id]`, `/fleets/[id]`, `/fleets/new`). Renders inline at the top of the page content (under top bar), not in the top bar itself. Format: `Chats / TR-001432`. Each segment is a link except the last.

## Global keyboard shortcuts

| Key | Action | Status |
|---|---|---|
| `⌘K` (mac) / `Ctrl+K` | Open global search palette | **Wired** (TopBar effect) |
| `⌘1`–`⌘6` | Jump to sidebar section | **Wired** (Sidebar effect) |
| `⌘.` | Toggle sidebar collapse | Out of scope this pass |
| `?` | Show shortcut cheat sheet (modal) | Out of scope this pass |
| `Esc` | Close active drawer / modal / palette | Wired via Radix |

`⌘K` and `⌘1–6` listeners are mounted on `document` and skip when the active element is `<input>`/`<textarea>`/contenteditable so they don't intercept typing.

## Global states

### Loading

Mounted skeleton, never blank. Each section spec defines its own skeleton layout. Page shell (sidebar + top bar) renders immediately; only the main content area shows skeletons.

This pass's mock data is synchronous, so loading states only show for ~200ms on initial mount via deliberate `setTimeout`-based suspense to avoid CLS. Production will replace this with real async.

### Empty

Each section defines its own empty-state copy in the section spec. Universal pattern: 24px lucide icon (`--color-fg-subtle`), title (`text-md` `--color-fg`), body (`text-sm` `--color-fg-muted`), optional CTA `Button` (variant=`primary`).

### Error boundary (`error.tsx`)

Each route group has an `error.tsx`. Layout: centered card, `AlertTriangle` icon (24px, `--color-danger`), heading "Something broke", body "We couldn't load this page. Try refreshing.", primary button "Reload" (calls `reset()`). Includes `<details>` with stack trace in dev only.

### 404 (`not-found.tsx`)

Centered card. `Compass` icon (24px, `--color-fg-subtle`), heading "Page not found", body "That URL doesn't match anything we know about.", primary button "Back to dashboard" (Link to `/dashboard`).

## Toast system

Right-bottom stack, 16px from edges, auto-dismiss 4s, swipe-right to dismiss. Variants: `success` / `info` / `warning` / `danger` — each with a leading lucide icon (`CheckCircle2` / `Info` / `AlertTriangle` / `AlertCircle`).

Used for:
- Stub-action confirmations ("This will be wired in pass 2")
- Real mock-state changes ("Lead marked as Booked")
- Async-feel feedback ("Test SMS sent. Check your phone.")

**Implementation**: `@radix-ui/react-toast` for accessibility + swipe + animation. Provider mounted at app root in `src/app/layout.tsx` via `<Toaster>` from [src/components/ui/Toaster.tsx](../src/components/ui/Toaster.tsx). Components consume via `const toast = useToast(); toast.success(body, title?)`. Available methods: `toast.success / .info / .warning / .danger / .toast({...})`.

## Page-title map

| Route | Top-bar title | `<title>` (browser tab) |
|---|---|---|
| `/dashboard` | Dashboard | Dashboard · AIAURA FLEETS |
| `/chats` | Chat history | Chat history · AIAURA FLEETS |
| `/chats/[id]` | (back) Chat #TR-… | Chat #TR-… · AIAURA FLEETS |
| `/leads` | Leads | Leads · AIAURA FLEETS |
| `/tune` | Tune AI | Tune AI · AIAURA FLEETS |
| `/fleets` | Fleet | Fleet · AIAURA FLEETS |
| `/fleets/new` | (back) Add vehicle | Add vehicle · AIAURA FLEETS |
| `/fleets/[id]` | (back) {Make} {Model} | {Make} {Model} · AIAURA FLEETS |
| `/settings` | Settings | Settings · AIAURA FLEETS |
| `/calls` | Call Logs | Call Logs · AIAURA FLEETS |

Mock business name "AIAURA FLEETS" lives in `src/lib/mock/manager.ts` — every reference reads from there, never hardcoded inline.

## URL search-param contract

| Param | Pages | Values |
|---|---|---|
| `range` | `/dashboard`, `/chats`, `/leads` | `today` \| `7d` \| `30d` \| `custom:YYYY-MM-DD~YYYY-MM-DD` |
| `view` | `/leads`, `/fleets` | `kanban` \| `table` (leads) / `grid` \| `list` (fleets) |
| `status` | `/leads` | `hot` \| `warm` \| `cold` \| `all` (default) |
| `outcome` | `/leads` | `open` \| `booked` \| `lost` \| `no_response` \| `all` |
| `q` | `/chats`, `/fleets` | URL-encoded search string |
| `tab` | `/tune`, `/settings` | tab id (e.g. `personality`, `playground`, `twilio`) |
| `sort` / `dir` | tables | column id / `asc`\|`desc` |
| `page` | tables | 1-indexed |

Hooks: `useDateRange()`, `useTableState()` read/write these. Browsers' back button restores prior state for free.

## Empty-state copy library

| Section | Empty title | Body |
|---|---|---|
| Dashboard (zero data) | No activity yet | Once your widget goes live, leads and chats will land here. |
| Chats | No chats match your filters | Adjust the date range or clear filters to see more. |
| Chats (search) | Nothing matched "{q}" | Try a customer name, phone number, or keyword from a message. |
| Leads (kanban col empty) | No {temperature} leads | New {temperature} leads will appear here automatically. |
| Leads (filtered) | No leads match your filters | Clear filters to see all leads. |
| Fleets | No vehicles yet | Add your first car to start showing it to customers. |
| Tune AI versions | No saved versions | Your first save will appear here for one-click rollback. |
| Settings team | No teammates yet | Invite a teammate to share this dashboard. |
| Notifications | All caught up | New SMS triggers will appear here. |

## Global search palette (`⌘K`)

**Wired** ([src/components/shell/CommandPalette.tsx](../src/components/shell/CommandPalette.tsx)). Modal centered, 640px wide, `--color-surface`, `--shadow-lg`, padding 0. Top: input with leading `⌕` and trailing `Esc` Kbd hint. Body: substring-match results grouped by entity type, max ~6 per group:

```
PAGES
  ▣ Dashboard
  ◫ Chat history
  ✦ Leads
  ⚙ Settings
LEADS
  ◐ Ahmed Khan · +1 (555) 555-0173 · 2h ago      [• Hot]
  ◐ Sofia Reyes · 14 min ago                      [• Warm]
CHATS
  ◫ Marcus Lee · 12 msgs · 2h ago
VEHICLES
  ⊞ Toyota RAV4 · ZAB-1041 · 2024
```

Footer shows three Kbd hints: `↑↓ navigate · ⏎ open · Esc close`. Keyboard: ↑/↓ to move highlight, Enter to open, mouse-hover also moves highlight, Esc closes. Substring match on customer name/phone/email/message body for chats; make/model/plate for vehicles; label for pages.

## Layout constants (express in code as constants)

```ts
export const LAYOUT = {
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  TOPBAR_HEIGHT: 56,
  CONTENT_MAX_WIDTH: 1440,
  CONTENT_PADDING_X: 32,
  CONTENT_PADDING_Y: 24,
  PAGE_BOTTOM_PADDING: 48,
  DRAWER_WIDTH: 480,
  DRAWER_WIDTH_LARGE: 560,
  MODAL_WIDTH_CONFIRM: 480,
  MODAL_WIDTH_FORM: 640,
};
```

## Acceptance checklist

- [ ] All 6 sidebar routes render with their own page; clicking each updates active state and URL.
- [ ] `/` redirects to `/dashboard` (server redirect, not client).
- [ ] Top bar shows page title that changes per route.
- [ ] Date filter only appears on `/dashboard`, `/chats`, `/leads` and persists via `?range=`.
- [ ] `⌘K` opens search palette; Esc closes it; arrow keys navigate items; Enter routes.
- [ ] `⌘1`–`⌘6` jump to corresponding sidebar sections.
- [ ] `/some-bad-url` renders the 404 page.
- [ ] Throwing in a page renders the error boundary (verify by temporarily throwing in a page).
- [ ] Sidebar collapses to 64px icon rail at viewport < 1280.
- [ ] Browser tab title matches the page-title map.
- [ ] No hardcoded `"AIAURA FLEETS"` strings outside `src/lib/mock/manager.ts`.

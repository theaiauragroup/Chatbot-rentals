# 05 — Section: Leads

Route: `/leads` · Source spec: §8.4 · Sidebar position: 3

## Purpose

The pipeline. Manager works hot leads first, follows up on warm, decides whether cold are worth nurture campaigns later. Two view modes — **kanban** (default, optimized for visual triage) and **table** (optimized for bulk actions). One drawer for detailed per-lead work.

## Layout — Kanban view (default)

```
┌─ Top bar — title "Leads" — date filter active ────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║  Leads                                          [Kanban | Table]  [Export ▾] ║   ← view toggle (segmented), bulk actions
║  38 active leads · 14 hot · 16 warm · 8 cold                                  ║
║                                                                               ║
║  ┌─ FilterBar ──────────────────────────────────────────────────────────────┐ ║
║  │ ⌕ Search…    Outcome ▾    Vehicle category ▾    Min value $▾   Reset    │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Hot · 14 ──────────┐ ┌─ Warm · 16 ─────────┐ ┌─ Cold · 8 ───────────┐  ║
║  │ avg value $987      │ │ avg value $612      │ │ avg value $234       │  ║
║  ├─────────────────────┤ ├─────────────────────┤ ├──────────────────────┤  ║
║  │ ┌─ KanbanCard ─────┐│ │ ┌─ KanbanCard ─────┐│ │ ┌─ KanbanCard ──────┐│  ║
║  │ │ ◐ Ahmed Khan     ││ │ │ ◐ Olivia Park    ││ │ │ ◐ Diego Alvarez   ││  ║
║  │ │ BMW 5 · May 12-18││ │ │ Camry · May 22-25││ │ │ Sentra · Jul 4-7  ││  ║
║  │ │ $1,080  · Open   ││ │ │ $237 · Open      ││ │ │ $135 · No-resp.   ││  ║
║  │ │ ◫ 12 msg · 2h    ││ │ │ ◫ 6 msg · 1d     ││ │ │ ◫ 3 msg · 4d      ││  ║
║  │ └──────────────────┘│ │ └──────────────────┘│ │ └───────────────────┘│  ║
║  │ ┌─ KanbanCard ─────┐│ │ ┌─ KanbanCard ─────┐│ │                      │  ║
║  │ │ Priya Nair       ││ │ │ Marcus Lee       ││ │                      │  ║
║  │ │ ...              ││ │ │ ...              ││ │                      │  ║
║  │ └──────────────────┘│ │ └──────────────────┘│ │                      │  ║
║  └─────────────────────┘ └─────────────────────┘ └──────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Layout — Table view

Same shell, body becomes a `DataTable` (see Chats spec for table primitive). Columns:

| Column | Notes |
|---|---|
| Customer | name + phone helper |
| Temperature | StatusPill |
| Outcome | Select inline (Open/Booked/Lost/No-response) |
| Vehicle | "Make Model" + thumbnail 24px |
| Pickup → Return | "May 12 → 18" |
| Value | `$1,080`, right-aligned |
| Last activity | `2h ago` |
| Actions | `⋯` menu |

Bulk select via header checkbox + per-row checkbox. Bulk action bar appears at table bottom when ≥1 selected: `Export CSV` / `Mark No-response` / `Clear selection`. Bulk SMS template is mentioned in source spec as **future** — render a disabled `Button` with tooltip "Coming soon".

## Layout — Lead drawer (`/leads?id={leadId}`)

Right-side drawer, **560px** (large variant).

```
┌─ Drawer ─────────────────────────────────────────────────────────────┐
│ ← Back   Lead #L-014                                            [×]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ◐ Ahmed Khan                                       [• Hot ▾]        │   ← StatusPill is a button-like menu trigger
│  +1 (555) 555-0173 · ahmed.khan@gmail.com                            │
│                                                                      │
│  Outcome  [ Open ▾ ]   Estimated value  $1,080                       │
│  Created May 8 · Updated 2h ago                                      │
│                                                                      │
│  ┌─ Trip ────────────────────────────────────────────────────────┐   │
│  │ Pickup    May 17 · LAX terminal 4                              │   │
│  │ Return    May 19 · LAX terminal 4                              │   │
│  │ Duration  2 days                                               │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Vehicle interest ────────────────────────────────────────────┐   │
│  │ ⊞  BMW 5 Series 2024 · ABC-1234                                │   │
│  │    $159/day · Luxury · Available                               │   │
│  │    [ View vehicle → ]                                          │   │
│  │                                                                │   │
│  │ ⊞  Mercedes E-Class 2023 · XYZ-9912                            │   │
│  │    $179/day · Luxury · Rented                                  │   │
│  │    [ View vehicle → ]                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Conversation ────────────────────────────────────────────────┐   │
│  │ ◫ Chat #TR-001432 · 12 messages · 4m 32s                       │   │
│  │ [ View transcript → ]                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Manager notes                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Followed up via SMS at 14:45 — confirmed verbal yes.           │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  Saved · 14:46                                                       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Sticky footer:                                                       │
│ [ Mark booked ]   [ Mark lost ]   [ No response ]            [ Save ]│
└──────────────────────────────────────────────────────────────────────┘
```

Drawer behavior:
- Open via row click or `?id=` URL param.
- Close via `[×]`, Esc, or backdrop click.
- Closing clears `?id=` so refresh doesn't reopen.

## Components used

- `src/components/leads/KanbanBoard.tsx`
- `src/components/leads/KanbanCard.tsx`
- `src/components/leads/LeadDrawer.tsx`
- `src/components/leads/StatusPill.tsx`
- `src/components/leads/OutcomeSelect.tsx`
- `src/components/data/DataTable.tsx`
- `src/components/data/FilterBar.tsx`
- `src/components/ui/Card.tsx`, `Button.tsx`, `Drawer.tsx`, `Textarea.tsx`, `Modal.tsx`

## KanbanCard

```
┌──────────────────────────────────┐
│ ◐ Ahmed Khan          ⋮          │   ← avatar + name + overflow menu
│ +1 (555) 555-0173                │   ← phone (text-xs muted)
│ BMW 5 Series · May 12–18         │   ← interest summary
│ $1,080 · 2 days                  │
│ ───────────────                  │   ← thin separator
│ ◫ 12 msg · 2h ago                │   ← chat badge + last activity
└──────────────────────────────────┘
```

- Background `--color-surface`, border 1px `--color-border`, `--radius-lg`, `--shadow-xs`.
- Padding 12. Gap between rows 6.
- Hover: shadow lifts to `--shadow-sm`, border `--color-border-strong`. Cursor pointer.
- Click: open drawer with that lead. Cmd+click: navigate to deep link without drawer (URL only).
- `⋮` overflow menu: "Mark booked", "Mark lost", "Mark no-response", "Copy phone", "Open chat".
- Drag handle: entire card. Drop targets: the other two columns. Drop validation: any column accepts (manual override is allowed). On drop, temperature changes locally + toast "Marked as {temperature}".
- Keyboard DnD: Tab to focus → Space to pick up → arrow keys to move → Space to drop. (dnd-kit a11y default.)

## KanbanBoard

- Three columns equal width, gap 16, scrollable independently if more cards than viewport height.
- Column header sticky inside each column: title + count + small avg-value line.
- Column body padding 16, vertical gap 12.
- Empty column: `EmptyState` inline ("No {temperature} leads", "New {temperature} leads will appear here automatically.").
- Column header tinted: hot col gets a 4px top border in `--color-hot`, warm `--color-warm`, cold `--color-cold`. (Subtle, no full-width tinted backgrounds.)
- Badge in header: count chip in `--color-surface-2`.

## OutcomeSelect

Inline select inside drawer or table. **Eleven outcomes** rendered as a Radix dropdown menu with a leading colored dot per option, divided into three groups (active engagement / commit progression / terminal):

| Outcome | Label | Dot color | Notes |
|---|---|---|---|
| `open` | Open | `--color-fg-subtle` (gray) | Default for new leads |
| `working_on` | Working on | `--color-accent` (indigo) | Manager actively engaging now |
| `contacted` | Contacted | `--color-info` (blue) | Reached out, awaiting reply |
| `in_process` | In process | `--color-warning` (amber) | Long-running engagement |
| `quoted` | Quoted | `--color-warm` (amber-yellow) | Price sent, awaiting decision |
| — *separator* — | | | |
| `call_booked` | Call booked | `--color-cold` (light blue) | Follow-up call scheduled |
| `deposit_paid` | Deposit paid | `--color-success-soft + success` text | Deposit received, awaiting full payment |
| `booked` | Booked | `--color-success` (green) | Booking confirmed — prompts calendar block |
| `deal_closed` | Deal closed | `--color-success` (deep green / bg-success) | Closed-won terminal (paid in full + picked up) |
| — *separator* — | | | |
| `lost` | Lost | `--color-danger` (red) | Closed-lost — terminal |
| `no_response` | No response | `--color-fg-muted` (neutral) | Ghosted — terminal |

When user selects "Booked":
- Open a `Modal` (`Modal width=form`) titled "Add booking to vehicle calendar":

```
┌─ Modal ──────────────────────────────────────────┐
│ Add booking to vehicle calendar                  │
├──────────────────────────────────────────────────┤
│ Vehicle    [ BMW 5 Series 2024 ▾ ]               │   ← prefilled with first interest
│ Pickup     [ 2026-05-17 ]                        │
│ Return     [ 2026-05-19 ]                        │
│ Notes      [                              ]      │
│                                                  │
│ This will block these dates on the vehicle's     │
│ availability calendar.                           │
├──────────────────────────────────────────────────┤
│                  [ Skip ]   [ Add booking ]      │
└──────────────────────────────────────────────────┘
```

Skip button: just sets outcome to Booked without adding to calendar. "Add booking" appends a `BookingRange` (reason `rented`, leadId set) to that vehicle's `blocks` array (mock state) and closes modal with toast "Booking added to {vehicle}'s calendar".

## StatusPill (lead temperature menu)

Clicking the pill in drawer opens a popover with three options (radio): Hot / Warm / Cold. Selecting overrides the auto-classified value (mock-state). Toast: "Temperature set to {temp}." 

## Filter bar

```
[ ⌕ Search name, phone, vehicle… ]  [ Outcome ▾ ]  [ Vehicle category ▾ ]  [ Min value $0 ▾ ]  [ Reset ]
```

- Outcome: multi-select with the 4 outcomes (default: Open only).
- Vehicle category: multi-select with the 5 categories.
- Min value: slider 0–2,500 with $250 steps.
- Search: substring match across name, phone, email, vehicle make/model, manager notes.

URL params: `q`, `outcome[]`, `category[]`, `min`, `view=kanban|table`, `id=` (drawer).

## States

- **Loading**: kanban shows 3 columns each with 3 skeleton cards (varied heights).
- **Empty (zero leads)**: full-width `EmptyState` ("No leads yet", "Once your widget captures contact info, qualified leads will appear here.", CTA "Embed widget").
- **Empty (filtered)**: per-column empty state. If all 3 columns empty after filter: full-width "No leads match your filters" + Reset CTA.
- **Drawer not-found**: if `?id=` doesn't match a lead, show error in drawer body "Lead not found" + Close button.

## Mock data dependencies

- `mock/leads.ts` — primary source
- `mock/chats.ts` — for "View transcript" link
- `mock/vehicles.ts` — for vehicle interest expansion

## Mock state (in-memory only this pass)

A small Zustand-free `useLeadsStore()` hook (or React `useReducer` lifted to a Context provider) keeps mutations local:
- `setTemperature(leadId, temperature)`
- `setOutcome(leadId, outcome)`
- `addBookingFromLead(leadId, range)` — also touches the vehicles store
- `updateNotes(leadId, text)`

Reload reverts to initial mock data. **Do not persist to localStorage** — that would mask UI rerender bugs we want to catch.

## Copy

| Element | Text |
|---|---|
| Page heading | `Leads` |
| Page sub | `{n} active leads · {hot} hot · {warm} warm · {cold} cold` |
| View toggle | `Kanban` / `Table` |
| Bulk actions | `Export CSV` / `Mark no-response` / `Clear selection` |
| Bulk SMS (disabled) | `Bulk SMS · Coming soon` |
| Filter labels | `Outcome` / `Vehicle category` / `Min value` |
| Drawer header | `Lead #{id}` |
| Drawer trip card | `Trip` / `Pickup` / `Return` / `Duration` |
| Drawer interest card | `Vehicle interest` / `View vehicle →` |
| Drawer chat card | `Conversation` / `View transcript →` |
| Drawer notes label | `Manager notes` |
| Drawer notes saved | `Saved · {time}` |
| Drawer footer actions | `Mark booked` / `Mark lost` / `No response` / `Save` |
| Booked modal title | `Add booking to vehicle calendar` |
| Booked modal copy | `This will block these dates on the vehicle's availability calendar.` |
| Booked modal CTAs | `Skip` / `Add booking` |
| Empty (zero leads) | `No leads yet` / `Once your widget captures contact info, qualified leads will appear here.` |
| Empty (filtered) | `No leads match your filters` / `Reset filters` |
| Empty per col | `No {temperature} leads` / `New {temperature} leads will appear here automatically.` |
| Toast (temp change) | `Temperature set to {temp}.` |
| Toast (outcome) | `Lead marked as {outcome}.` |
| Toast (booking added) | `Booking added to {vehicle}'s calendar.` |

## Acceptance checklist

- [ ] `/leads?view=kanban` (default) renders three columns with the correct counts and avg-value lines.
- [ ] `/leads?view=table` renders the table with the same data.
- [ ] View toggle persists in URL.
- [ ] Drag-drop a card between columns updates temperature locally and shows toast; column counts re-flow.
- [ ] Keyboard DnD works (Tab → Space → arrows → Space).
- [ ] Clicking a card opens the drawer with `?id=` in URL; closing clears it.
- [ ] Drawer renders all fields per layout; manager notes textarea autosaves on blur (mock persistence).
- [ ] Outcome select supports all 4 values; selecting "Booked" opens modal.
- [ ] "Booked" modal "Add booking" appends a `BookingRange` to the matching vehicle's `blocks` (verify by visiting `/fleets/{id}` calendar).
- [ ] StatusPill in drawer opens a popover allowing manual override; toast confirms.
- [ ] Bulk select in table view enables the bulk action bar; "Mark no-response" updates selected leads.
- [ ] Filters persist via URL; Reset clears all and disables itself.
- [ ] Empty per-column state renders correctly when a column has 0 cards.
- [ ] At 1280: drawer remains 560px; kanban columns may scroll horizontally (use horizontal scroll on board container, not the page).
- [ ] No `shadow-xl`, no Tailwind blue, no emoji icons.
- [ ] Lighthouse a11y ≥ 95 on `/leads`.

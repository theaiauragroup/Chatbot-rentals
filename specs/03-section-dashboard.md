# 03 — Section: Dashboard

Route: `/dashboard` · Source spec: §8.2 · Sidebar position: 1

## Purpose

The landing screen — at-a-glance daily snapshot. Combines KPIs, analytics charts, an activity feed, and today's hot leads into one view. This is **the aesthetic milestone** for the whole product: if Dashboard feels world-class, the rest of the app inherits the look.

## Layout (1440 width, 12-col grid)

Goal: rich, attractive, considered. **Three** high-impact graphs only — every chart earns its place by answering a question the manager asks daily. Density still high (compact KPI tiles, tight rows), but each graph is rendered with more visual weight than before.

The two charts that earned their place:
1. **Conversion Funnel** — vertical, 4 stages (Chats → Leads → Hot → Bookings) with absolute counts AND drop-off % between steps. The single chart that tells you whether the bot is qualifying well.
2. **Top Performing Cars by revenue** — table-style with **car photo thumbnails** as row labels, a horizontal bar showing each car's revenue share, and the revenue figure right-aligned. Tells you which inventory is paying.

Plus two data-rich list panels (also "boxes in line"):
3. **Recent bookings** — last 6 booked leads with customer avatar, vehicle photo thumbnail, pickup→return dates, and dollar value. Whole-row clickable into the lead drawer. Replaces the earlier Revenue area chart — uses the same underlying data (our booked leads' `estimatedValueUsd`) but ties every dollar to a specific customer + vehicle the manager can act on.
4. **Today's hot leads** — sticky 4-col card with up to 5 hot/open leads + Call buttons. Unchanged from the previous pass.

```
┌─ Top bar ─────────────────────────────────────────────────────────────────────┐
│  Dashboard                          ⌕ Search…           ⏱ 7 days ▾   🔔  ◐  │
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content (px-8 pt-6 pb-12, gap-4) ═════════════════════════════════════╗
║                                                                              ║
║  Hi Sarah,                                  Avg dur 4m 32s · Pipeline $24K   ║
║  Here's what's happening this week                                           ║
║                                                                              ║
║  ┌─ 6 KPI tiles ────────────────────────────────────────────────────────────┐ ║
║  │ Chats / New leads / Hot / Conv. / Bookings / Pipeline (each w spark)    │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌─ Recent bookings (col 1–8, list with photos) ─────┐ ┌─ Hot leads (4) ─┐ ║
║  │ Recent bookings · 6 booked · $14,820 booked val   │ │ list (existing) │ ║
║  │ ─────────────────────────────────────────         │ │                 │ ║
║  │ ◐ Olivia Park   [📷] Camry  Apr 30→May 5  $345    │ │                 │ ║
║  │ ◐ Mateo Silva   [📷] Civic  Apr 26→Apr 30 $196    │ │                 │ ║
║  │ ◐ Aaliyah B.    [📷] CR-V   May 1→May 6  $425     │ │                 │ ║
║  │ ◐ Hana Tanaka   [📷] Corolla May 12→May 15 $135   │ │                 │ ║
║  │ ◐ Diego Alvarez [📷] Sorento May 8→May 14 $570    │ │                 │ ║
║  │ ...                                                │ │                 │ ║
║  └────────────────────────────────────────────────────┘ └─────────────────┘ ║
║                                                                              ║
║  ┌─ Conversion Funnel (col 1–5) ──┐ ┌─ Top Performing Cars (col 6–12) ───┐  ║
║  │ Chats   ████████ 142            │ │ [📷] Toyota RAV4    ████  $11,420  │  ║
║  │   ↓ −60%                        │ │ [📷] BMW 5 Series   ███   $9,640   │  ║
║  │ Leads   █████ 57                │ │ [📷] Honda Civic    ██    $6,840   │  ║
║  │   ↓ −56%                        │ │ ...                                │  ║
║  │ Hot     ███ 25                  │ │                                    │  ║
║  │   ↓ −32%                        │ │                                    │  ║
║  │ Booked  ██ 17                   │ │                                    │  ║
║  │ 12.0% chats → bookings          │ │                                    │  ║
║  └─────────────────────────────────┘ └────────────────────────────────────┘  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

(The previous full-width Activity feed has been **dropped** — its events live inside the relevant entity pages and the AI Activity card is reachable via the leads / chats deep links.)

Reflows:
- **1280**: KPIs go to 3-up. Recent bookings + Hot leads stay 8/4. Funnel + Top cars stack (12 each).
- **1920**: same as 1440, content centers (max-width 1440).
- **<1024**: out of scope this pass.

Density / visual tokens:
- Recent bookings card padding `p-0` body with `px-5 pt-4 pb-3` header. Each booking row 56px.
- Funnel card padding `p-5`. Each stage row 56px; drop-off chip 24px between rows.
- Top Performing Cars card padding `p-0` body, `px-5 pt-4 pb-3` header. Each car row 52px (cap visible to 6, scroll if more).
- Outer gap between rows `gap-4`. KPI tiles `p-4`. KPI value `text-xl`.
- **Equal-height rows** — Row A (Recent bookings + Hot leads) and Row B (Funnel + Top Cars) both pin to `min-h-[440px]` so the dashboard reads as a uniform grid of boxes-in-line, not a ragged collage. Every Card in those rows uses `h-full flex flex-col` so empty space falls to natural padding/scroll instead of the card shrinking to its content.
- The Revenue area chart, Stacked Bar, Heatmap, Most-popular-cars, Revenue-pipeline-bars, Chats-line charts are **dropped** from the dashboard. The Recent bookings panel surfaces the same revenue data tied to specific customer + vehicle rows the manager can act on.

## Components used

- `src/components/charts/KpiCard.tsx`
- `src/components/charts/SparkLine.tsx`
- `src/components/charts/ConversionFunnel.tsx` — vertical 4-stage funnel with drop-off chips
- `src/components/charts/TopCarsTable.tsx` — photo + bar + revenue rows
- `src/components/dashboard/RecentBookings.tsx` — list of recently-booked leads with photos
- `src/components/dashboard/HotLeadsCard.tsx`
- `src/components/leads/StatusPill.tsx`
- `src/components/ui/Card.tsx`, `Button.tsx`, `Badge.tsx`, `EmptyState.tsx`

## KPI tiles

**Six KPIs**, equal width (col 2 each at xl, 3 cols at lg, 2 cols at sm), padding 16 (`p-4`), `Card` with `--shadow-sm`. Compact-dense layout: label on top, big numeric value, inline delta to the right of the value, sparkline beneath.

Each `KpiCard` shape:

```
┌──────────────────────┐
│  Total chats         │   ← label (text-xs, 500, --color-fg-muted)
│  142     ↑ 18%       │   ← value (text-xl, 600, --tracking-tight) + inline delta pill
│  ⌐⌐⌐⌐⌐⌐⌐⌐⌐⌐⌐⌐⌐ spark │   ← sparkline (24px tall)
└──────────────────────┘
```

| KPI | Label | Value | Delta | Spark series | Source |
|---|---|---|---|---|---|
| Chats | "Total chats" | `142` | `↑ 18%` | daily chats | `totalChats` |
| New leads | "New leads" | `38` | `↑ 9%` | daily total | `newLeads.{hot,warm,cold}` |
| Hot | "Hot leads" | `25` | `↑ 12%` | daily hot | `newLeads.hot` |
| Conv. | "Conversion rate" | `12.4%` | `↑ 2.1 pp` | daily conv | `conversionRatePct` |
| Bookings | "Bookings" | `17` | `↑ 14%` | daily bookings | `bookings` |
| Pipeline | "Pipeline value" | `$24,180` | `↑ 22%` | daily revenue | `pipelineValueUsd` |

**All six tiles have identical structure** (label + value+delta + sparkline) and identical height — no per-card caption row, since adding one to a single tile makes the row look ragged. The H/W/C breakdown that previously sat under New leads is reachable via the Hot leads tile and the Funnel.

`KpiCard` uses `h-full flex flex-col` with the sparkline pinned to the bottom via `mt-auto`, so even if a tile's content (e.g. a longer label) reflows, the spark stays anchored to the card's bottom edge and tile heights stay uniform across the grid.

The greeting row carries inline meta on the right: `Avg duration {dur}` · `Open pipeline {money}` (rendered as small `Badge`s, no separate row). The standalone pill row from the previous spec is dropped — its info either lives in the inline-meta or graduates into a KPI tile.

Delta pill rules:
- Positive on a "good" metric (chats, leads, conv, pipeline, bookings) → `--color-success` text + soft bg + `↑` icon.
- Negative → `--color-danger` text + soft bg + `↓` icon.
- Zero → neutral `Badge`.

## Chart / panel specs

### Recent bookings (list with photos)
- Card: `Card p-0`, header `px-5 pt-4 pb-2` with title `Recent bookings` + meta `{n} booked · {money} booked value` (sums `estimatedValueUsd` across booked leads).
- Body: vertical list, each row 56px tall, divided by `border-b border-border`. Source: `leads.filter(outcome === 'booked')` sorted by `updatedAt` desc, capped at 6 visible (excess scrolls inside the card).
  - Customer avatar (initials) on left.
  - Vehicle photo thumbnail 56×36 `rounded-md` (`vehicle.photos[0]` from the lead's first interest, fallback gradient + Car icon).
  - Customer name `text-sm font-medium fg`, vehicle make+model `text-[11px] fg-subtle`.
  - Pickup → Return date range `text-[11px] fg-muted tabular-nums` (e.g. `Apr 30 → May 5`).
  - Dollar value right-aligned `text-sm font-semibold tabular-nums fg`.
  - Whole row is a Link to `/leads?id={leadId}` opening the drawer; hover bg `surface-2`.
- Footer link: `View all booked leads →` → `/leads?outcome=booked`.

### Conversion Funnel (vertical, 4 stages)
- Card: `Card p-5`. Card body uses `flex flex-col` so stage rows distribute evenly across the row height.
- Stages (top → bottom): **Chats** / **Leads** / **Hot leads** / **Bookings**, each with a leading lucide icon in a tinted square (24×24, `--radius-md`) matching the stage's accent opacity:
  - Chats — `MessageCircle` · `bg-accent` · `text-accent-fg`
  - Leads — `Sparkles` · `bg-accent-soft` (85% opacity) · `text-accent`
  - Hot leads — `Flame` · `bg-hot-soft` · `text-hot`
  - Bookings — `CheckCircle2` · `bg-success-soft` · `text-success`
- Stage row layout: icon + label `text-sm font-medium fg` (left), count `text-lg font-semibold tabular-nums fg` + share-of-top `text-[11px] fg-subtle` (right). Below the row: a 12px-tall bar:
  - Bar full width is the largest stage (Chats); subsequent stages tapered.
  - Bar uses the same accent at decreasing opacities (1.0 / 0.85 / 0.65 / 0.5).
  - 12px height, `rounded-full`, with a soft `bg-surface-2` track behind.
- Between rows: a connector area with chevron-down icon + signed delta chip. Math:
  - If next ≤ prior (normal): `−{n}% drop-off · {abs} lost` in `text-fg-muted`.
  - If next > prior (anomaly — e.g., bookings include warm/cold conversions): `+{n}% above hot pool` in `text-success`.
- Footer (`pt-3 border-t text-xs`): `{convPct}% chats → bookings` (left) · `avg deal {money}` (right).

### Top Performing Cars (photo + bar + revenue)
- Card: `Card p-0`, header `px-5 pt-4 pb-2` with title + meta `Last 30 days`.
- Body: vertical list of 8 vehicles, each row 52px tall, divided by `border-b border-border`.
  - Photo thumbnail 56×40, `rounded-md`, `object-cover` (uses `vehicle.photos[0]`; fallback gradient + Car icon).
  - Make + model `text-sm font-medium fg`, plate sub `text-[11px] fg-subtle tabular-nums`.
  - Inline horizontal bar (h-1.5 rounded-full) showing revenue share of #1; `bg-accent`.
  - Revenue value `text-sm font-semibold tabular-nums fg`, right-aligned.
- Footer link: `View all vehicles →` → `/fleets`.

## Today's hot leads list (col 9–12 on chart row 2)

`Card` titled "Today's hot leads · {n}". Body: vertical list of up to 5 lead rows. Each row: avatar (initials), name, vehicle + dates, value, primary `Button size=sm` "Call now" (stub-toast).
Footer link → `/leads?status=hot&outcome=open`.
Empty state: "No open hot leads today. Nice clean inbox."

## Activity feed (bottom, full width)

Vertical timeline. Each item: type icon + description + relative timestamp.
Item types: `new_chat`, `new_hot_lead`, `temp_change`, `booking_closed`, `handoff_request`, `chat_ended`.
Limit 12 events; footer link "View all activity" → `/chats?range=today`.

## Greeting line

Top of content. `Hi Sarah,` (text-xl, 600). Sub varies by time of day.

## States

- **Loading**: KPI cards show Skeleton; charts show Skeleton matching their bounding box; activity rows show 6 skeleton rows.
- **Empty (zero data)**: Replace KPI grid with full-width `EmptyState` ("No activity yet", CTA "Embed widget" → `/settings?tab=widget`).
- **Partial (no hot leads)**: Today's hot leads card shows its own empty state.
- **Error**: `error.tsx` renders the standard error boundary.

## Mock data dependencies

- `mock/manager.ts` — greeting name
- `mock/kpis.ts` — `chartSeries`, `kpiSummary7d`, `peakHours`
- `mock/leads.ts` — today's hot leads
- `mock/aggregations.ts` — popular cars, recent activity

## Copy

| Element | Text |
|---|---|
| Greeting (morning) | `Hi {name},` / `Here's what's happening this morning` |
| Greeting (afternoon) | `Hi {name},` / `Here's what's happening this week` |
| Greeting (evening) | `Hi {name},` / `Quick recap before you log off` |
| KPI labels | `Total chats` / `New leads` / `Conversion rate` / `Pipeline value` |
| Side pills | `Avg duration {dur}` / `Total bookings {n}` / `Open pipeline {money}` |
| Chart titles | `Chats over time` / `Leads by status` / `Conversion funnel` / `Revenue pipeline` / `Most popular cars` / `Peak hours` |
| Hot leads card | `Today's hot leads · {n}` / `View all open hot leads →` |
| Hot leads row CTA | `Call now` |
| Activity card | `Activity` / `Last 7 days · {n} events` / `View all activity →` |
| Empty (zero data) | `No activity yet` / `Once your widget goes live, leads and chats will land here.` / CTA `Embed widget` |
| Empty (today's hot leads) | `No open hot leads today. Nice clean inbox.` |

## Acceptance checklist

- [ ] Page renders at `/dashboard` and on `/`.
- [ ] All 6 KPI tiles show real mock numbers, not placeholders.
- [ ] **Each KPI tile is a Link** — clicking navigates to its deep view (Total chats → /chats, New leads → /leads, Hot leads → /leads?status=hot, Conversion → /leads?outcome=booked, Bookings → /leads?outcome=booked, Pipeline value → /leads?outcome=open). Hover lifts shadow and shows trailing arrow.
- [ ] Greeting + **live pill** (`{n} live · {n} new this hour` with animated `success` ping) + inline meta strip (Avg duration, Open pipeline) render in the header row.
- [ ] A subtle 1px accent gradient bar sits under the header for visual flair.
- [ ] **Two charts + two list panels** render: Conversion Funnel, Top Performing Cars, Recent bookings, Today's hot leads. No chats-line / leads-stacked / heatmap / popular-cars-bar / revenue-pipeline-bars / revenue-area chart.
- [ ] Recent bookings shows ≥ 5 booked leads with avatar + vehicle photo + dates + value; whole row is a Link to `/leads?id=…`.
- [ ] Conversion Funnel has 4 rows with tapered bars and drop-off `−%` chips between rows.
- [ ] Top Performing Cars renders ≥ 6 vehicle rows with **photo thumbnails**, make/model, revenue bar, and revenue value. Whole row is a Link to `/fleets/{id}`.
- [ ] "Today's hot leads" card sits in col 9–12 next to the Recent bookings panel with working "Call" button (toast).
- [ ] Sparkline in each KPI card matches the corresponding daily series.
- [ ] All chart tooltips render in `Card` style with `--shadow-md`.
- [ ] No default Tailwind `blue-*`, `shadow-xl`, `shadow-2xl` on this page.
- [ ] At 1280 width: KPIs reflow 3-up; Funnel + Top Cars stack 12-cols.
- [ ] Lighthouse a11y ≥ 95 on `/dashboard`.

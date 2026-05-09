# 04 — Section: Chat Complete History

Routes: `/chats` (list), `/chats/[id]` (transcript) · Source spec: §8.3 · Sidebar position: 2

## Purpose

Audit and review every conversation. Manager comes here to read what the bot said, see how leads were qualified, and verify scoring decisions. Two screens: a filterable history table, and a single-conversation transcript view.

## Layout — `/chats` (list)

```
┌─ Top bar — title "Chat history" — date filter active ─────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║  Chat history                                                                 ║   ← page heading (text-xl 600)
║  All conversations from your widget                                           ║   ← sub
║                                                                               ║
║  ┌─ FilterBar ──────────────────────────────────────────────────────────────┐ ║
║  │ ⌕ Search name, phone, message…       Status ▾  Outcome ▾  Country ▾  Reset│ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ DataTable ──────────────────────────────────────────────────────────────┐ ║
║  │ Started ▼   Customer       Country  Messages  Final temp  Lead?   Duration│ ║
║  ├──────────────────────────────────────────────────────────────────────────┤ ║
║  │ May 8 14:24 Ahmed Khan      🇺🇸 US    12       [• Hot]    ✓ #L-014  4m 32s│ ║
║  │ May 8 13:51 Priya Nair      🇺🇸 US     8       [• Warm]   ✓ #L-013  3m 12s│ ║
║  │ May 8 11:09 (anon)          🇲🇽 MX     3       [• Cold]   —        0m 48s│ ║
║  │ ...                                                                      │ ║
║  ├──────────────────────────────────────────────────────────────────────────┤ ║
║  │ Showing 1–25 of 30        Export CSV          [<] 1 of 2 [>]              │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Layout — `/chats/[id]` (transcript)

```
┌─ Top bar — "← Chats / #TR-001432" ────────────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content (split: left = transcript, right = sidebar) ══════════════════╗
║                                                                              ║
║  ┌─ left col (col 1–8) ──────────────────┐ ┌─ right col (col 9–12) ───────┐ ║
║  │ Started May 8 14:24 · 4m 32s · 12 msg │ │ Linked lead                  │ ║
║  │                                        │ │ ┌────────────────────────┐  │ ║
║  │ [u 14:24] hey looking for an SUV…     │ │ │ ◐ Ahmed Khan           │  │ ║
║  │ [a 14:24] Got it. May 17–19, what …   │ │ │ +1 (555) 555-0173      │  │ ║
║  │                                        │ │ │ [• Hot] · Open         │  │ ║
║  │                                        │ │ │ Pickup May 17 → May 19 │  │ ║
║  │ [u 14:25] the bigger one              │ │ │ View lead →            │  │ ║
║  │ [a 14:25] Grand Cherokee 2024 …       │ │ └────────────────────────┘  │ ║
║  │                                        │ │ Vehicles discussed           │ ║
║  │ [u 14:26] yeah send me details        │ │  • Toyota RAV4 2024          │ ║
║  │ [a 14:26] Perfect. Could I get …      │ │  • Jeep Grand Cherokee 2024  │ ║
║  │                                        │ │ Quick actions                │ ║
║  │ ... (transcript continues)            │ │ [Mark resolved] [Export PDF] │ ║
║  └────────────────────────────────────────┘ └──────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

Reflows:
- **1280**: right sidebar collapses; "Linked lead" + "Vehicles discussed" become a card row above the transcript.
- **<1024**: out of scope.

## Components used

### `/chats`
- `src/components/data/DataTable.tsx`
- `src/components/data/FilterBar.tsx`
- `src/components/data/SearchInput.tsx`
- `src/components/data/Pagination.tsx`
- `src/components/data/CsvExportButton.tsx`
- `src/components/leads/StatusPill.tsx`
- `src/components/ui/Badge.tsx`, `Button.tsx`, `Select.tsx`

### `/chats/[id]`
- `src/components/chat/TranscriptView.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/ui/Card.tsx`, `Button.tsx`
- `src/components/leads/StatusPill.tsx`

## Table columns (`/chats`)

| Column | Content | Sort | Filter | Notes |
|---|---|---|---|---|
| Started | `May 8 14:24` (relative tooltip) | yes (default desc) | via date filter | width ~140 |
| Customer | name OR `(anon)` if missing | yes asc | search | shows phone in helper text below name |
| Country | `🇺🇸 US` flag + 2-letter | yes | filter dropdown | use Twemoji or fallback letters |
| Messages | integer | yes | — | center align |
| Final temp | `StatusPill hot/warm/cold` | yes | filter dropdown | |
| Lead? | `✓ #L-014` link OR `—` | — | filter "has lead" toggle | links to `/leads/{id}` |
| Duration | `4m 32s` | yes | — | gray meta |

Row hover: `--color-surface-2`. Row click: navigate to `/chats/{id}`. Row keyboard focus + Enter: same.

Sticky header. Header cells: `text-xs` 500 `--color-fg-muted`, hover shows sort caret. Active sort: `--color-fg` + caret in `--color-accent`.

Zebra striping: off (use single white surface; rely on hover for separation). Row borders: 1px `--color-border` bottom only.

## FilterBar

```
[ ⌕ Search name, phone, message…  ]  [ Status ▾ ]  [ Outcome ▾ ]  [ Country ▾ ]  [ Reset ]
```

- Search input: 280px, debounce 200ms.
- Status: multi-select dropdown (Hot/Warm/Cold).
- Outcome: multi-select (Open/Booked/Lost/No-response).
- Country: multi-select; only shows countries present in mock data.
- Reset: `Button variant=ghost`, only enabled when ≥1 filter active.
- Active filter count appears in a small `Badge` next to "Filters" if collapsed (responsive at 1280: filters collapse into "Filters [3]" toggle that opens a popover).

URL params: `q`, `status[]`, `outcome[]`, `country[]`, `range`, `sort`, `dir`, `page`. Browser back restores.

## Pagination

Bottom of table. Left: "Showing 1–25 of 30". Center: `Export CSV` button. Right: `[<] 1 of 2 [>]`. Page size fixed at 25. Disabled prev/next at boundaries.

## CSV export

Click `Export CSV` triggers a client-side blob download. Filename:
`aiaura-fleets-chats-{from}-to-{to}.csv`
Columns mirror the visible table columns plus full transcript JSON in the last column. Honors active filters.
This pass: real download (it's just JSON.stringify into a Blob — no backend needed). Toast: "Exported {n} chats."

## Search behavior

Substring match (case-insensitive) across:
- customer name, phone, email
- every message text in the chat

Hits highlighted in transcript view (deep-link `?q=…` to highlight matched messages with `--color-accent-soft` background).

## Transcript view (`/chats/[id]`)

Top breadcrumb: `← Chats / #TR-001432`.

Header strip (above transcript):
```
Started May 8 · 14:24    Duration 4m 32s    12 messages    [• Hot] final score
```

### MessageBubble

Two visual variants based on role:

**user (right-aligned)**:
- Max width 70%. Padding 10×14. Radius `--radius-md` with 2px tail on bottom-right.
- Background `--color-accent-soft`. Text `--color-fg`.
- Above bubble: timestamp `text-xs --color-fg-subtle`, right-aligned.
- Below: optional metadata `aria-hidden`.

**assistant (left-aligned)**:
- Max width 70%. Padding 10×14. Radius `--radius-md` with 2px tail on bottom-left.
- Background `--color-surface-2`. Text `--color-fg`.
- Avatar circle 24px to the left with bot icon (`Bot` lucide, `--color-accent`).
- Above bubble: bot name + timestamp.

**system (centered)**:
- Italic, `text-xs --color-fg-subtle`, centered, no bubble. Used for events like "Customer requested human agent" or "Conversation ended".

The AI scoring metadata (intent, confidence, tempShift, collectedFields) is **not displayed inline** in the transcript UI — it's noisy in normal review. The `aiDecision` data still rides on each Message in the type model and remains available for future surfaces (e.g., a dedicated "scoring trail" tab in pass 2). For now, transcripts are bubbles only.

### Right sidebar card (transcript page)

#### Linked lead card
- Avatar (initials) + name + phone (tappable `tel:`).
- StatusPill + outcome label.
- "Pickup {date} → {date}".
- Estimated value.
- Link "View lead →" → `/leads?id={leadId}` opens drawer.
- If no lead linked: card shows `EmptyState` "Conversation didn't generate a lead yet" + button "Create lead from chat" (stub-toast "Wired in pass 2").

#### Vehicles discussed card
- Bullet list of vehicles referenced in messages (read from `chat.vehicleIdsOfInterest`).
- Each row: thumbnail (24px square) + Make Model Year + small chevron → `/fleets/{id}`.

#### Quick actions card
- `Button secondary` "Mark resolved" — toggles `outcome` to `closed` (mock state, persists in-memory only).
- `Button ghost` "Export PDF" — stub-toast "PDF export wired in pass 2".

## States

- **Loading**: 8 skeleton table rows; transcript page shows 6 skeleton bubbles alternating sides.
- **Empty (no chats)**: `MessageCircle` icon, "No chats yet", "Conversations from your widget will appear here.", CTA "Embed widget" → `/settings?tab=widget`.
- **Empty (filtered)**: same icon, "No chats match your filters", "Adjust filters or clear them.", CTA "Reset filters".
- **Search no-match**: "Nothing matched '{q}'", "Try a customer name, phone number, or keyword from a message.", CTA "Clear search".
- **Transcript not found**: 404 page (handled by `not-found.tsx`).

## Mock data dependencies

- `mock/chats.ts` — all chats with messages
- `mock/leads.ts` — for linked-lead card lookup
- `mock/vehicles.ts` — for vehicles-discussed card

## Copy

| Element | Text |
|---|---|
| Page heading | `Chat history` |
| Page sub | `All conversations from your widget` |
| Search placeholder | `Search name, phone, message…` |
| Filter labels | `Status` / `Outcome` / `Country` |
| Reset | `Reset filters` |
| Empty (no chats) | `No chats yet` / `Conversations from your widget will appear here.` / `Embed widget` |
| Empty (filtered) | `No chats match your filters` / `Adjust filters or clear them.` / `Reset filters` |
| Empty (search) | `Nothing matched "{q}"` / `Try a customer name, phone number, or keyword from a message.` / `Clear search` |
| Pagination | `Showing {from}–{to} of {total}` / `Export CSV` |
| Transcript header | `Started {date} · {time}` / `Duration {dur}` / `{n} messages` |
| Linked lead empty | `Conversation didn't generate a lead yet` / `Create lead from chat` |
| Quick actions | `Mark resolved` / `Export PDF` |
| CSV toast | `Exported {n} chats.` |

## Acceptance checklist

- [ ] `/chats` renders the table with all 30 mock chats sorted newest first.
- [ ] Search debounces 200ms; substring matches name, phone, email, message bodies.
- [ ] All filters persist via URL params and survive reload.
- [ ] Sort by any sortable column toggles asc/desc; sort caret reflects state.
- [ ] CSV export downloads a real file with the active filters honored.
- [ ] Clicking a row navigates to `/chats/{id}`.
- [ ] `/chats/[id]` renders the full transcript with correct user/assistant/system bubble variants.
- [ ] Transcripts render plain bubbles only — no AI scoring badges inline (data still attached on `Message.aiDecision` for future surfaces).
- [ ] Linked-lead card shows correct lead and links to `/leads?id=…`.
- [ ] Vehicles-discussed card lists every vehicle in `chat.vehicleIdsOfInterest`.
- [ ] Pagination math correct (25 per page, 2 pages for 30 items).
- [ ] Empty states render copy verbatim from the table above.
- [ ] At 1280: right sidebar collapses; transcript stays readable.
- [ ] No `shadow-xl`, no `blue-*`, no `purple-*` tokens used.
- [ ] Lighthouse a11y ≥ 95 on `/chats` and `/chats/[id]`.

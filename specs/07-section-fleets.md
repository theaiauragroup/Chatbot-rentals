# 07 — Section: Fleets

Routes: `/fleets` (list), `/fleets/new`, `/fleets/[id]` · Source spec: §8.6, §5 · Sidebar position: 5

## Purpose

Manage the cars the bot can offer. Manager adds vehicles, sets prices, uploads photos, and maintains each car's availability calendar so the bot doesn't promise dates that conflict with existing bookings or maintenance.

## Layout — `/fleets` (list)

```
┌─ Top bar — title "Fleet" ─────────────────────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║  Fleet                                            [Grid | List]   [+ Add vehicle] ║
║  20 vehicles · 12 available · 4 rented · 3 maintenance · 1 retired            ║
║                                                                               ║
║  ┌─ FilterBar ──────────────────────────────────────────────────────────────┐ ║
║  │ ⌕ Search make, model, plate…  Category ▾  Status ▾  Sort ▾   [Import CSV]│ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Grid (4 cols × N rows) ─────────────────────────────────────────────────┐ ║
║  │ ┌─ VehicleCard ──┐ ┌─ VehicleCard ──┐ ┌─ VehicleCard ──┐ ┌─ VehicleCard ─┐│ ║
║  │ │ [photo 16:10]  │ │ [photo]        │ │ [photo]        │ │ [photo]       ││ ║
║  │ │ BMW 5 Series   │ │ Toyota RAV4    │ │ Honda Civic    │ │ Tesla Model S ││ ║
║  │ │ 2024 · ABC-1234│ │ 2023 · XYZ-991 │ │ 2024 · DEF-301 │ │ 2024 · 7AS123 ││ ║
║  │ │ $159/day       │ │ $79/day        │ │ $49/day        │ │ $249/day      ││ ║
║  │ │ [• Available]  │ │ [• Rented]     │ │ [• Available]  │ │ [• Maintenance]││ ║
║  │ └────────────────┘ └────────────────┘ └────────────────┘ └───────────────┘│ ║
║  │ ...                                                                      │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Layout — `/fleets/[id]` (detail)

```
┌─ Top bar — "← Fleet / BMW 5 Series 2024" ─────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║                                                                               ║
║  ┌─ Hero strip ─────────────────────────────────────────────────────────────┐ ║
║  │ BMW 5 Series 2024                            [• Available]  [Edit] [⋯]  │ ║
║  │ ABC-1234 · Luxury · $159/day · 23,400 km                                 │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Photo gallery (col 1–7) ─────────────────────┐ ┌─ Specs (col 8–12) ────┐ ║
║  │ [hero photo, 16:10]                            │ │ Make         BMW      │ ║
║  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                  │ │ Model        5 Series │ ║
║  │ │t1│ │t2│ │t3│ │t4│ │t5│ │t6│ ← thumbnails    │ │ Year         2024     │ ║
║  │ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                  │ │ Category     Luxury   │ ║
║  │ [+ Add photo]   [Manage photos]                │ │ Seats        5        │ ║
║  └────────────────────────────────────────────────┘ │ Transmission Auto     │ ║
║                                                      │ Fuel         Hybrid   │ ║
║                                                      │ Mileage      23,400km │ ║
║                                                      │ Features     AC, GPS, │ ║
║                                                      │              Bluetooth│ ║
║                                                      │              Sunroof  │ ║
║                                                      └───────────────────────┘ ║
║                                                                               ║
║  ┌─ AvailabilityCalendar (full width) ──────────────────────────────────────┐ ║
║  │ Availability                                          [< May 2026 >]     │ ║
║  │ ┌────────────────────────────────────────────────────────────────────┐   │ ║
║  │ │  S  M  T  W  T  F  S    │   S  M  T  W  T  F  S                    │   │ ║
║  │ │     1  2  3  4  5  6    │   29 30  1  2  3  4  5                   │   │ ║
║  │ │  7  8  9 10 11 12 13    │    6  7  8  9 10 11 12                   │   │ ║
║  │ │ 14 15 [16  17  18] 20   │   13 14 15 16 17 18 19  ← rented block   │   │ ║
║  │ │ 21 22 [23] 24 25 26 27  │   20 21 22 23 24 25 26  ← maintenance    │   │ ║
║  │ │ 28 29 30 31             │   27 28 29 30                            │   │ ║
║  │ └────────────────────────────────────────────────────────────────────┘   │ ║
║  │ Drag to block dates · Click a block to edit · Right-click to delete      │ ║
║  │ Legend: ◼ Rented   ◼ Maintenance   ◼ Blocked                             │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Components used

- `src/components/fleets/VehicleCard.tsx`
- `src/components/fleets/VehicleForm.tsx`
- `src/components/fleets/AvailabilityCalendar.tsx`
- `src/components/fleets/PhotoManager.tsx`
- `src/components/fleets/FeatureChips.tsx`
- `src/components/fleets/CategoryBadge.tsx`
- `src/components/data/FilterBar.tsx`
- `src/components/data/SearchInput.tsx`
- `src/components/data/DataTable.tsx` (List view)
- `src/components/leads/StatusPill.tsx` (reused for vehicle status)
- `src/components/ui/Card.tsx`, `Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `Tabs.tsx`, `Input.tsx`, `Select.tsx`

## VehicleCard (grid)

```
┌────────────────────────────────────┐
│ ┌───── photo 16:10 ─────────────┐ │   ← image fills, object-cover
│ │                               │ │      [• Available] pill top-right overlay
│ └───────────────────────────────┘ │
│ BMW 5 Series                      │   ← text-md 600
│ 2024 · ABC-1234                   │   ← text-xs muted
│                                   │
│ $159/day              [Luxury]    │   ← left price, right CategoryBadge
└────────────────────────────────────┘
```

- `Card variant=interactive`. Click → `/fleets/{id}`.
- Status pill overlays photo top-right with `--shadow-sm` and white surface so it's readable on any photo.
- Empty photo: `Skeleton`-style placeholder with `Car` lucide icon centered.
- Hover: shadow lifts; "View" overlay fades in bottom-left? **No** — stay quiet. Only hover state is shadow lift.

## List view row

Columns: photo (40×40 round-md) + Make Model, Plate, Category, Daily rate, Status, Mileage, Created, Actions (⋯).

Same `DataTable` primitive as Chats spec. Sortable on every column except photo. Row click → detail.

## VehicleForm (`/fleets/new` and `/fleets/[id]?edit=1`)

Two-column layout (col 1–8 form, col 9–12 live preview card showing how this vehicle will appear in grid).

```
┌─ Form ────────────────────────────────────────────────────────────────────┐
│ Make            [ Toyota                       ]                           │
│ Model           [ Corolla                      ]                           │
│ Year            [ 2024  ▾ ]                                                │
│ License plate   [ ABC-1234                     ]                           │
│ Category        [ Economy ▾ ]                                              │
│ Daily rate      [ $  45  ]/day                                             │
│ Seats           [ 5      ]                                                 │
│ Transmission    [ Automatic ▾ ]                                            │
│ Fuel            [ Petrol ▾ ]                                               │
│ Mileage         [ 23400  ] km                                              │
│ Features        [ AC ] [ GPS ] [ Bluetooth ] [ Sunroof ] [+ add]           │
│                                                                            │
│ Status          [ Available ▾ ]                                            │
│                                                                            │
│ ── Photos ──                                                               │
│ Drag images here or [ Upload ]   (1–6, max 5MB each)                       │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ─ thumbnails with × delete + drag-reorder              │
└────────────────────────────────────────────────────────────────────────────┘
```

Validation (client-side via zod):
- Make: required, ≤ 40 chars
- Model: required, ≤ 60 chars
- Year: required, integer 1990–2030
- Plate: required, ≤ 12 chars, alphanumeric + dash
- Daily rate: required, integer ≥ 0
- Seats: required, integer 1–15
- Mileage: required, integer ≥ 0
- Photos: 0–6; this pass file uploads are stubbed — clicking "+ Add photo" picks the next URL from a curated Unsplash car-photo rotation. Each thumbnail has an X to delete. Drag-reorder is available on the detail page after creation; the create form is just an in-place picker.

Photos picker UX in the create form (matches PhotoManager visually):
- Strip of up-to-6 thumbnails, each 80×80, rounded-md, with delete-on-hover X
- Trailing dashed "+" tile (disabled at 6) that adds the next placeholder photo
- Helper text below: `{n} / 6 photos · drag-reorder available after creation`
- Photos are submitted as part of the form payload and persisted into the new vehicle's `photos[]` so the detail page shows them immediately

Save: stores vehicle in mock state, redirects to detail page, toast "Vehicle added."
Cancel: confirm modal if dirty, "Discard changes?", buttons "Stay" / "Discard".

## PhotoManager

- 1–6 thumbnails in a horizontal strip below the hero photo.
- Drag-reorder via dnd-kit sortable.
- Per thumbnail: `×` delete button on hover (top-right), 12px lucide.
- Empty state: "Add photos to help customers visualize" with `+` tile.
- Cap enforced: 7th thumbnail tile becomes disabled with tooltip "Maximum 6 photos".

## AvailabilityCalendar

Two-month side-by-side view (current month + next). Built on `react-day-picker v9` with custom styling.

Cell states:
- Default: small day number, neutral.
- **Today**: bold + 1px ring `--color-accent`.
- **Past**: `--color-fg-subtle`, no interaction.
- **Rented block**: bg `--color-accent-soft`, text `--color-accent`. Hover tooltip with lead name + dates + value.
- **Maintenance block**: bg `#FEF3C7` (warm soft), text `#92400E`. Tooltip "Maintenance · {reason}".
- **Manually blocked**: bg `--color-surface-2`, text `--color-fg-muted`, dashed top border. Tooltip "Manually blocked".

Interactions:
- Drag across days (or click a single day) to create a block. The "Block these dates" modal opens with: reason select (Blocked / Maintenance / Rented), **pickup time + return time inputs (HH:mm, default 09:00 → 18:00)**, optional note. Pickup/return times are stored on the BookingRange as `startTime` / `endTime`.
- Click an existing block: "Edit block" modal shows the start date · pickup time and end date · return time, reason, and (when reason='rented') the linked lead. Delete button removes the block.
- Times are displayed wherever a block is shown (calendar tooltip, edit modal header) e.g. `May 12 09:00 → May 14 18:00`. If a block has no times, only the date range shows.
- Drag the edge of a block to extend/shorten. (Optional polish — if dnd-kit complexity is too high this pass, allow only via popover edit.)
- Keyboard: arrow keys move focus; Space + arrows extends selection; Enter opens reason picker.

Top right: month nav arrows.

Below the calendar: legend + helper "Drag to block dates · Click a block to edit · Right-click to delete".

## CSV import

`Import CSV` button on `/fleets` opens a `Modal width=form`:

```
┌─ Modal ────────────────────────────────────────────────────┐
│ Import vehicles from CSV                                   │
├────────────────────────────────────────────────────────────┤
│ 1. Download the [template] for the expected columns.       │
│ 2. Drop your CSV here or [ Choose file ].                  │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │  ⊕  Drop CSV here                                    │   │
│ │     or click to browse                               │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ Preview (after upload): table of parsed rows + validation  │
│                                                            │
│  Skip   ✓ 18 ready · ⚠ 2 with issues                       │
├────────────────────────────────────────────────────────────┤
│              [ Cancel ]    [ Import 18 vehicles ]          │
└────────────────────────────────────────────────────────────┘
```

This pass: stub. Clicking [template] downloads a real CSV file with header row matching the schema. Choosing a file shows a preview using a static parsed sample (3 mock rows). "Import" toasts "CSV import wired in pass 2 — 0 vehicles imported." Closes modal.

## Filter / sort

Filters: Category (multi), Status (multi), Search (substring match make/model/plate).
Sort options: Newest first (default), Daily rate asc/desc, Make A→Z, Mileage asc/desc.

URL params: `q`, `category[]`, `status[]`, `sort`, `view=grid|list`.

## States

- **Loading**: 8 skeleton vehicle cards (4 cols × 2 rows).
- **Empty (zero vehicles)**: full-width `EmptyState` with `Car` icon, "No vehicles yet", "Add your first car to start showing it to customers.", CTA "+ Add vehicle".
- **Empty (filtered)**: "No vehicles match your filters" + Reset.
- **Detail not found**: 404.
- **Form errors**: inline under each field; Save button disabled until valid.

## Mock data dependencies

- `mock/vehicles.ts` — primary
- `mock/leads.ts` — for AvailabilityCalendar tooltip content (lead lookup by `block.leadId`)

## Mock state

`useFleetStore()` reducer:
- `addVehicle(v)` / `updateVehicle(id, patch)` / `archiveVehicle(id)` (sets status 'retired')
- `addBlock(vehicleId, range)` / `updateBlock(blockId, patch)` / `removeBlock(blockId)`
- `reorderPhotos(vehicleId, fromIdx, toIdx)`

Reload reverts.

## Copy

| Element | Text |
|---|---|
| Page heading | `Fleet` |
| Page sub | `{n} vehicles · {available} available · {rented} rented · {maintenance} maintenance · {retired} retired` |
| Primary CTA | `+ Add vehicle` |
| Import CSV | `Import CSV` |
| Sort options | `Newest first` / `Price low → high` / `Price high → low` / `Make A → Z` / `Mileage low → high` |
| Filter labels | `Category` / `Status` |
| Empty (zero) | `No vehicles yet` / `Add your first car to start showing it to customers.` / `+ Add vehicle` |
| Empty (filtered) | `No vehicles match your filters` / `Reset filters` |
| Detail back | `← Fleet` |
| Detail edit | `Edit` |
| Detail overflow | `Archive vehicle` / `Duplicate` / `Export to CSV` |
| Form sections | `Photos` |
| Form helpers | `1–6, max 5MB each` |
| Form discard modal | `Discard changes?` / `Stay` / `Discard` |
| Form save toast | `Vehicle added.` / `Vehicle updated.` |
| Photo manager empty | `Add photos to help customers visualize` |
| Photo cap tooltip | `Maximum 6 photos` |
| Photo upload toast | `Photo upload wired in pass 2; using placeholder.` |
| Calendar legend | `Rented` / `Maintenance` / `Blocked` |
| Calendar helper | `Drag to block dates · Click a block to edit · Right-click to delete` |
| CSV modal title | `Import vehicles from CSV` |
| CSV template link | `Download the template` |
| CSV preview status | `{n} ready · {m} with issues` |
| CSV import toast | `CSV import wired in pass 2 — 0 vehicles imported.` |
| Archive confirm | `Archive {make} {model}?` / `Customers won't be offered this vehicle anymore.` / `Cancel` / `Archive` |

## Acceptance checklist

- [ ] `/fleets` renders all 20 mock vehicles in 4-col grid by default.
- [ ] View toggle Grid/List persists in URL.
- [ ] Each VehicleCard shows photo (or skeleton placeholder), make/model/year, plate, daily rate, category badge, status pill.
- [ ] Card click navigates to detail.
- [ ] Search debounces and matches across make/model/plate.
- [ ] Filters and sort update URL and re-render grid.
- [ ] `/fleets/new` shows the empty form; saving redirects to `/fleets/{newId}` with toast.
- [ ] Form client-side validation per field; submit disabled until all required fields valid.
- [ ] Photo upload stub adds a placeholder image and shows the toast.
- [ ] Drag-reorder photos persists order in mock state.
- [ ] `/fleets/[id]` shows hero, gallery, specs, calendar.
- [ ] AvailabilityCalendar renders two-month view with mock blocks; rented blocks show lead tooltip.
- [ ] Drag across calendar days creates a manually blocked range (popover lets reason be set).
- [ ] Click a block opens edit popover; delete removes from mock state.
- [ ] CSV import modal opens; template download works; preview is static; import toast appears.
- [ ] Archive action sets status to 'retired' and removes from default grid (visible only with status filter "Retired").
- [ ] Empty states render verbatim copy.
- [ ] At 1280: grid reflows to 3 cols.
- [ ] At 1024 (informational only): grid 2 cols. (We don't test below 1024 this pass.)
- [ ] Lighthouse a11y ≥ 95 on `/fleets` and `/fleets/[id]`.

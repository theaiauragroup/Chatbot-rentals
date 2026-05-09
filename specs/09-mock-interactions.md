# 09 — Mock Interactions

## Purpose

Catalog every interactive thing in the dashboard and classify it as **wired** (actually does something to mock state and updates the UI), **stub-toast** (only shows a toast saying "wired in pass 2"), or **navigation** (just routes). This is the contract for what "static UI with mock data" means concretely. Anything not listed here should default to **stub-toast** rather than dead/broken.

## Legend

- **Wired** — mutates `useStore` (in-memory), UI re-renders, optional toast.
- **Toast** — no state change. Shows toast: `"This will be wired in pass 2."` or specific message in section spec.
- **Nav** — `router.push()` or `<Link>` navigation, no state mutation.
- **URL** — updates URL search params via `useRouter().replace()` (filter / sort / pagination / drawer-deep-link).

## Global

| Element | Type | Behavior |
|---|---|---|
| Sidebar nav items | Nav | Route to corresponding page. |
| Sidebar collapse toggle (`⌘.`) | Deferred | Out of scope this pass. |
| Account menu (avatar) → "Profile" | Nav | `/settings?tab=profile` |
| Account menu (avatar) → "Settings" | Nav | `/settings` |
| Account menu (avatar) → "Sign out" | Toast | `Auth wired in pass 2.` |
| `⌘K` / `Ctrl+K` | Wired | Opens command palette. Document-level listener; skips when focus is in input/textarea. |
| `⌘1`–`⌘6` | Wired | Routes to corresponding sidebar section. Same focus skip as `⌘K`. |
| Command palette item click / Enter | Nav | Routes to entity (`/leads?id=`, `/chats/{id}`, `/fleets/{id}`, page link). |
| Command palette `↑/↓` | Wired | Moves highlighted item; mouse hover also re-targets. |
| Notification bell | Wired | Opens dropdown; unread count badge updates as items are clicked. |
| Notification "Mark all read" | Wired | Sets all `notification.read = true`; bell badge clears. |
| Notification item click | Nav | Routes to `refLeadId` (`/leads?id=...`) or `refChatId` (`/chats/{id}`); marks that one read. |
| Date filter preset | URL | Updates `?range=` and re-renders charts/tables. |
| Date filter custom | Deferred | Out of scope this pass — preset dropdown only. |
| `?` cheat sheet | Deferred | Out of scope this pass. |
| Toaster | Wired | All `toast.success/info/warning/danger(...)` calls render via Radix toasts at bottom-right with swipe-dismiss. |

## Dashboard (`/dashboard`)

| Element | Type | Behavior |
|---|---|---|
| KPI delta tooltip | — | Hover only. |
| Sparkline | — | Static. |
| Chart tooltips | — | Hover only. |
| "Today's hot leads" row click | Nav | `/leads?id={leadId}` (opens drawer). |
| "Today's hot leads" Call now button | Toast | `We'd dial {phone} — wired in pass 2.` |
| "View all open hot leads →" | Nav | `/leads?status=hot&outcome=open` |
| Activity item click | Nav | Routes per item type. |
| "View all activity →" | Nav | `/chats?range=today` |
| Empty state CTA "Embed widget" | Nav | `/settings?tab=widget` |

## Chat history (`/chats`)

| Element | Type | Behavior |
|---|---|---|
| Search input | URL | Updates `?q=`, debounce 200ms. |
| Status / Outcome / Country filters | URL | Multi-select; updates URL. |
| Reset filters | URL | Clears all filter params. |
| Sort header click | URL | Toggles `?sort` and `?dir`. |
| Pagination prev/next | URL | Updates `?page`. |
| Row click | Nav | `/chats/{id}` |
| Export CSV | Wired | Generates real CSV blob from filtered set; triggers download; toast `Exported {n} chats.` |

## Transcript (`/chats/[id]`)

| Element | Type | Behavior |
|---|---|---|
| Back arrow | Nav | `/chats` (preserves filters). |
| AiScoreInline expand | Wired | Toggles full JSON view. |
| "View lead →" | Nav | `/leads?id={leadId}` |
| "Create lead from chat" (when no lead) | Toast | `Lead creation from chat wired in pass 2.` |
| Vehicles-discussed row | Nav | `/fleets/{id}` |
| Mark resolved | Wired | Sets `chat.outcome = 'closed'`; toast `Chat marked resolved.` |
| Export PDF | Toast | `PDF export wired in pass 2.` |

## Leads (`/leads`)

| Element | Type | Behavior |
|---|---|---|
| View toggle Kanban/Table | URL | Updates `?view=`. |
| Search input | URL | Updates `?q=`. |
| Filters (Outcome, Category, Min value) | URL | |
| Reset filters | URL | |
| Card click | Wired+URL | Opens drawer; sets `?id=`. |
| Card cmd+click | URL | Adds `?id=` without opening drawer (deep-link copy). |
| Card overflow menu → Mark booked | Wired | Outcome → 'booked', opens "Add to calendar" modal. |
| Card overflow menu → Mark lost | Wired | Outcome → 'lost'; toast. |
| Card overflow menu → Mark no-response | Wired | Outcome → 'no_response'; toast. |
| Card overflow menu → Copy phone | Wired | `navigator.clipboard.writeText(phone)`; toast `Phone copied.` |
| Card overflow menu → Open chat | Nav | `/chats/{chatId}` |
| Drag card between columns | Wired | Updates `lead.temperature`; counts re-flow; toast `Temperature set to {temp}.` |
| Drawer close | URL | Clears `?id=`. |
| Drawer status pill click | Wired | Opens popover for manual override; updates `lead.temperature`. |
| Drawer outcome select | Wired | Updates `lead.outcome`; if 'booked' opens modal. |
| "Add booking" modal Skip | Wired | Outcome=booked, closes modal. |
| "Add booking" modal Submit | Wired | Outcome=booked, appends `BookingRange` to vehicle, closes modal, toast. |
| Drawer notes textarea | Wired | Autosave on blur; mock state; "Saved · {time}" caption. |
| Drawer footer Mark booked / lost / no-response | Wired | Same as outcome select. |
| Drawer footer Save | Wired | Closes drawer; toast `Lead saved.` |
| Bulk select header | Wired | Toggles all visible rows. |
| Bulk action: Export CSV | Wired | Real download of selected rows. |
| Bulk action: Mark no-response | Wired | Updates each selected; toast `{n} leads marked no-response.` |
| Bulk SMS template | Disabled | Tooltip `Bulk SMS · Coming soon`. |

## Tune AI (`/tune`)

| Element | Type | Behavior |
|---|---|---|
| Tab change | URL | Updates `?tab=`. |
| Tone slider | Wired | Updates `draft.toneIndex`; preview re-renders; save bar dirty. |
| Greeting radio | Wired | Updates `draft.greetingStyle`; preview re-renders. |
| Brand voice textarea | Wired | Updates `draft.brandVoice`. |
| Business rules inputs | Wired | Updates `draft.businessRules.*`. |
| Knowledge editor | Wired | Updates `draft.knowledge`. |
| Knowledge toolbar insert button | Wired | Inserts canned snippet at cursor. |
| Off-limits / escalation chip add | Wired | Pushes to array. |
| Off-limits / escalation chip remove | Wired | Splices out. |
| Save & publish | Wired | Pushes new `PromptVersion` (current=true), demotes prior; toast `Saved as v{n}. Bot updated.` |
| Discard | Wired | `draft = current`; save bar disabled. |
| Playground left input | Wired | Sends user message → both sides reply via `mockBotReply`. |
| Playground right input | Wired | Same as left when "Mirror typing" on; otherwise only right side. |
| Playground "Mirror typing" toggle | Wired | Toggles a local boolean. |
| Playground "Reset chat" | Wired | Clears both panes; re-greets. |
| Versions "View" | Wired | Opens drawer with read-only settings. |
| Versions "Roll back" | Wired | Opens confirm modal → on confirm, sets that version as current, draft=current; toast. |

## Fleets (`/fleets`, `/fleets/[id]`, `/fleets/new`)

| Element | Type | Behavior |
|---|---|---|
| View toggle Grid/List | URL | |
| Search / Category / Status / Sort | URL | |
| `+ Add vehicle` | Nav | `/fleets/new` |
| `Import CSV` | Wired | Opens modal. |
| Import CSV "Download template" | Wired | Real CSV download. |
| Import CSV "Choose file" | Wired | File picker; preview = static sample. |
| Import CSV "Import" | Toast | `CSV import wired in pass 2 — 0 vehicles imported.` |
| VehicleCard click | Nav | `/fleets/{id}` |
| Detail "Edit" | URL | `?edit=1` toggles form mode in place. |
| Detail overflow "Archive" | Wired | Confirm modal → sets status='retired'; toast. |
| Detail overflow "Duplicate" | Wired | Creates copy with new id, redirects to its edit page; toast `Vehicle duplicated.` |
| Detail overflow "Export to CSV" | Wired | Real single-row CSV download. |
| Form field changes | Wired | Updates form state; validation runs on blur and submit. |
| Form Save (new) | Wired | Pushes vehicle to mock state; redirects `/fleets/{newId}`; toast `Vehicle added.` |
| Form Save (edit) | Wired | Patches mock state; toast `Vehicle updated.` |
| Form Cancel (dirty) | Wired | Confirm modal `Discard changes?` |
| PhotoManager Upload | Toast (partial) | Adds a placeholder photo from `/public/mock/cars/`; toast `Photo upload wired in pass 2; using placeholder.` |
| PhotoManager drag-reorder | Wired | Updates `vehicle.photos` order. |
| PhotoManager × delete | Wired | Splices photo. |
| Calendar drag-create block | Wired | Opens reason popover; on submit pushes `BookingRange` (reason='blocked' default). |
| Calendar block click | Wired | Edit popover (start, end, reason, note, delete). |
| Calendar month nav | Wired | Updates visible month range. |

## Settings (`/settings`)

| Element | Type | Behavior |
|---|---|---|
| Tab change | URL | |
| Profile fields | Wired | Updates `manager.*`; save bar dirty. |
| Profile "Change avatar" | Toast | `Avatar upload wired in pass 2.` |
| Update password | Toast | `Password updated.` |
| Send reset link | Toast | `Reset link sent to {email}.` |
| Sign out everywhere | Toast | `Auth wired in pass 2.` |
| Notification triggers | Wired | Updates `tenant.notifications.*`. |
| Schedule fields | Wired | Updates `tenant.notifications.dailySummaryTime` etc. |
| Channel phone | Wired | Updates `tenant.notifications.managerPhone`. |
| Twilio fields | Wired | Updates `tenant.twilio.*`. |
| Auth token Show | Wired | Toggles masked/revealed. |
| Send test SMS | Wired (stub) | Confirm modal → 1.2s spinner → toast `Test SMS sent. Check your phone.` |
| Open Twilio console | Toast | `External link wired in pass 2.` (do NOT open a real twilio.com link in this pass) |
| View full SMS log | Toast | `Full log wired in pass 2.` |
| Business fields | Wired | Updates `tenant.*`. |
| Brand color picker | Wired | Updates `tenant.brandColor`; does NOT recolor dashboard (intentional). |
| Currency / TZ / Locale | Wired | Updates `tenant.*`. |
| Widget Copy snippet | Wired | Clipboard copy + toast. |
| Widget customize fields | Wired | Updates `tenant.widget.*`. |
| Team Invite teammate | Toast | `Team access wired in pass 2.` |
| Save changes (any tab) | Wired | Persists draft to mock state; clears dirty; toast `Settings saved.` |
| Discard | Wired | Reverts draft. |
| Sidebar click while dirty | Wired | Confirm modal `Discard unsaved changes?` |

## Toast registry

Centralize toast strings in `src/lib/toasts.ts` so copy stays consistent. Examples:

```ts
export const toasts = {
  notImplemented: (what: string) => `${what} wired in pass 2.`,
  copied: (label = 'Copied to clipboard.') => label,
  exported: (n: number, kind: 'chats' | 'leads') => `Exported ${n} ${kind}.`,
  leadOutcome: (label: string) => `Lead marked as ${label}.`,
  leadTemperature: (label: string) => `Temperature set to ${label}.`,
  bookingAdded: (vehicle: string) => `Booking added to ${vehicle}'s calendar.`,
  versionSaved: (v: string) => `Saved as v${v}. Bot updated.`,
  rolledBack: (v: string) => `Rolled back to v${v}.`,
  settingsSaved: 'Settings saved.',
  testSmsSent: 'Test SMS sent. Check your phone.',
  vehicleAdded: 'Vehicle added.',
  vehicleUpdated: 'Vehicle updated.',
  vehicleDuplicated: 'Vehicle duplicated.',
  phoneCopied: 'Phone copied.',
};
```

## What's deliberately broken / disabled

These elements are visually present (so the dashboard looks complete) but are intentionally non-functional this pass. Each has a tooltip explaining why.

| Element | Tooltip / disabled reason |
|---|---|
| Bulk SMS template button (Leads bulk bar) | `Bulk SMS · Coming soon` |
| Twilio "Send test SMS" when unverified | `Verify your sender number first.` |
| External "Open Twilio console" link | renders as button, toasts (no real link) |
| External "View full log →" link | toasts |
| Profile role select | read-only this pass |
| Brand color picker | wired but doesn't recolor dashboard |

## Loading-state policy

Mock data is synchronous, but to avoid the "everything just appears" feel, each page wraps its data fetch in a 200ms `setTimeout` shim during initial mount. After that, mutations are instant (no spinners, no skeletons reappearing). Spinners only appear on:
- `Send test SMS` (1.2s) — to make the confirm flow feel real
- `Save & publish` in Tune AI (600ms) — same reason
- Form submissions on Fleet add/edit (400ms)

These are deliberate UX flourishes, not actual async work.

## Persistence policy

Mock state is kept entirely in React state via Context+useReducer. Reload reverts to seed mock data. The single exception: **sidebar collapsed/expanded** preference may persist to `localStorage` because it's a UI affordance, not domain data. Nothing else persists, so QA always sees a clean dataset on reload.

## Acceptance checklist

- [ ] Every interactive element in the dashboard maps to a row in this document.
- [ ] No element produces a JS error on click; if not implemented, it shows a toast with the standard pass-2 message.
- [ ] All "Wired" rows above mutate state and update the UI without a page reload.
- [ ] All "URL" rows update `useRouter().replace()` and `?` params; back/forward navigates correctly.
- [ ] All toasts source their text from `src/lib/toasts.ts` (no inline string duplication).
- [ ] Reload reverts mock state (only sidebar-collapsed flag survives).
- [ ] No `console.error` / `console.warn` during normal interaction.
- [ ] CSV exports for chats and leads produce valid CSV with proper escaping.
- [ ] Clipboard interactions feature-detect `navigator.clipboard` and fall back to a select-and-copy textarea trick (toast says "Press ⌘C to copy" if needed).

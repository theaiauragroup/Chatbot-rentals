# 06 — Section: Tune AI

Route: `/tune` · Source spec: §8.5 · Sidebar position: 4

## Purpose

Where the manager (often with developer support during onboarding) shapes how the bot behaves without touching code. Every change here updates the `PromptSettings` object that gets injected into the system prompt at runtime. A safe playground lets them test before publishing, and version history gives them one-click rollback.

## Layout

```
┌─ Top bar — title "Tune AI" ───────────────────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║  Tune AI                                            v1.4.0 · last saved 1h ago ║
║  Shape how your bot greets, qualifies, and escalates                          ║
║                                                                               ║
║  ┌─ Tabs ───────────────────────────────────────────────────────────────────┐ ║
║  │ Personality  Business rules  Knowledge  Off-limits  Escalation  Playground  Versions  │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Active tab content (varies) ────────────────────────────────────────────┐ ║
║  │                                                                          │ ║
║  │   ... (per tab spec below) ...                                           │ ║
║  │                                                                          │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Save bar (sticky bottom on tabs that mutate settings) ──────────────────┐ ║
║  │ 3 unsaved changes        [ Discard ]      [ Save & publish ]              │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

Tabs (Radix-tabs underline style). Default tab `personality`. URL: `?tab=personality|rules|knowledge|off-limits|escalation|playground|versions`.

## Components used

- `src/components/ui/Tabs.tsx`, `Card.tsx`, `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Slider.tsx`, `Switch.tsx`, `Modal.tsx`, `Drawer.tsx`
- `src/components/tune/ToneSlider.tsx`
- `src/components/tune/RuleRow.tsx`
- `src/components/tune/KnowledgeEditor.tsx`
- `src/components/tune/Playground.tsx`
- `src/components/tune/VersionList.tsx`
- `src/components/chat/MessageBubble.tsx` (reused in Playground)

## Tab 1 — Personality

Two-column layout (col 1–7 form, col 8–12 preview).

**Left column** (form):

```
┌─ Tone ─────────────────────────────────────────────────────────┐
│ Tone of voice                                                  │
│ How does your bot sound to customers?                          │
│                                                                │
│   Formal                            Casual                     │
│   ◉═════●══════════════════════════════                        │   ← Slider 0–10, default 4
│   3 · "Friendly and professional"                              │
└────────────────────────────────────────────────────────────────┘

┌─ Greeting ─────────────────────────────────────────────────────┐
│ Greeting style                                                 │
│ The first message your bot sends.                              │
│                                                                │
│  ◉ Classic    "Hi, welcome to {business}. How can I help?"     │
│  ○ Warm       "Hey! Looking to rent a car? I can help with…"   │
│  ○ Concise    "Hi. What dates and what kind of car?"           │
└────────────────────────────────────────────────────────────────┘

┌─ Brand voice notes ────────────────────────────────────────────┐
│ Anything specific about your brand the bot should mirror?      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Never use slang. Address customers by first name once they │ │
│ │ share it. Reference our 24/7 roadside support when relevant│ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Right column** (preview): a sticky `Card` that shows a single greeting message bubble rendered with the current tone+greeting selection. Updates live as slider or radio changes. Bot avatar + the greeting message + a faint "Preview · not sent" caption.

**ToneSlider** component: 0–10 integer scale. Labels under slider re-write based on value:
- 0–2 — "Strict and corporate"
- 3–4 — "Friendly and professional"
- 5–6 — "Warm and conversational"
- 7–8 — "Playful and direct"
- 9–10 — "Very casual, almost text-message"

The `{business}` placeholder in greeting previews is replaced from `tenant.businessName`.

## Tab 2 — Business rules

Vertical list of structured rules. Each rule is a `RuleRow` with: label, value (input/select/number), helper text.

```
Operating hours       [ Mon–Sun 8:00 – 22:00         ]   When the bot says "we're open"
Deposit policy        [ $200                         ]   Bot quotes this when customers ask
Multi-day discount    [ 10% for ≥7 days  ]               Applied automatically in price quotes
Minimum rental        [ 1 day                        ]   Bot won't quote shorter trips
Minimum driver age    [ 21                           ]   Bot mentions if asked
Currency / locale     [ USD · America/Los_Angeles    ]   Inherited from Settings (read-only here)
```

Each row's input has a `Switch` on the right to mark "Bot must mention this proactively" (off by default). Inline helper text below the row uses `text-xs --color-fg-muted`.

## Tab 3 — Knowledge

Free-text editor. `KnowledgeEditor` is a `<Textarea>` with monospace font (`font-mono`), 320px tall, fluid width. Above editor: small chip-style toolbar with quick-insert buttons that drop snippets at cursor:

```
[ + Cancellation policy ]  [ + Fuel rules ]  [ + Mileage limits ]  [ + Damage process ]
```

Each insert appends a labeled block:
```
## Cancellation policy
Free cancellation up to 24 hours before pickup. After that, 50% charge.

## Fuel rules
Return with the same fuel level. Otherwise $9/gallon penalty.
```

Below editor: helper text "The bot will treat anything in this field as authoritative. Be specific. Avoid contradictions with Business rules."

Character counter `text-xs --color-fg-subtle` right-aligned: `1,432 / 8,000`.

## Tab 4 — Off-limits topics

Tag input + list. Manager types a topic, presses Enter to add as a chip. Each chip has an `×` to remove. Pre-seeded mock items: "insurance disputes", "refunds beyond 7 days", "custom long-term contracts", "claims paperwork".

Below the chips: example bot response preview card showing how the bot will deflect:

```
┌─ Bot deflection preview ────────────────────────────────┐
│ Customer:  Can I file an insurance claim through chat?  │
│ Bot:       Insurance claims are handled by our team —   │
│            I'll have someone reach out within an hour.  │
│            Want me to take your phone for that follow-up?│
└─────────────────────────────────────────────────────────┘
```

The deflection text is canned from a template using each chip; updates live as chips change.

## Tab 5 — Escalation triggers

Same chip-input pattern as Off-limits, but for phrases that auto-route to a human handoff. Pre-seeded: "talk to a person", "speak with manager", "this is urgent", "I want a refund", "your bot doesn't understand".

Below the input, a notification preview shows what the manager's SMS will look like:

```
┌─ SMS preview to +1 (555) 555-0173 ──────────────────────┐
│ 👤 Customer needs you: Sarah on chat right now.         │
│    Open dashboard to take over.                         │
└─────────────────────────────────────────────────────────┘
```

(Note: this is the only place an emoji appears in the dashboard UI — and only because it mirrors the actual SMS content per source spec §7.1. Render via image-style emoji rather than system emoji to keep visual consistency. Or simply use a `UserRound` lucide icon at 16px and put the literal "👤" inside `<code>` to indicate "this is the SMS literal, not our UI". The cleanest path: lucide icon + a separate `<Kbd>` block showing the raw SMS string.)

## Tab 6 — Playground

```
┌─ Playground ─────────────────────────────────────────────────────────────────┐
│ Test the current settings before publishing                  [ Reset chat ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌─ Live (current saved) ─────┐  ┌─ Draft (unsaved changes) ──────────────┐  │
│ │ [bot] Hi, welcome to Aura  │  │ [bot] Hey! Looking to rent a car? …    │  │
│ │       Rentals.…            │  │                                        │  │
│ │ [you] Need an SUV next wk  │  │ [you] Need an SUV next wk              │  │
│ │ [bot] Got it. May 17–19…   │  │ [bot] Got it. May 17–19…               │  │
│ │ ...                        │  │ ...                                    │  │
│ │                            │  │                                        │  │
│ │ ┌──────────────────────┐   │  │ ┌──────────────────────┐                │  │
│ │ │ Type a message…      │   │  │ │ Type a message…      │                │  │
│ │ └──────────────────────┘   │  │ └──────────────────────┘                │  │
│ └────────────────────────────┘  └────────────────────────────────────────┘  │
│  Side-by-side compare: type once on either side, mirror to the other        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Two columns of `MessageBubble` stacks. Top bar of each shows which version each side reflects. Below each: a chat input. Mode toggle at the top right: "Mirror typing" (default on) → typing on either side sends the same user message to both, and each side independently responds using its respective settings. Off → each side is independent.

Mock response strategy this pass:
- A small canned-response engine `mockBotReply(settings, userText)` returns one of ~6 templates based on simple keyword detection (category words like "suv", date patterns, "book"). It varies tone (concise vs warm) based on `toneIndex` and `greetingStyle`.
- For "Live" side, it uses the last-saved `PromptSettings` (from `mock.versions.find(v => v.isCurrent)`).
- For "Draft" side, it uses the in-memory unsaved settings.
- This is **not** real AI — it's a believable simulator to demonstrate the UX.

`Reset chat` button clears both panes' messages and starts over with the greeting from each side.

## Tab 7 — Versions

`VersionList` component: vertical timeline of `PromptVersion` records, newest first.

```
┌─ Versions ───────────────────────────────────────────────────────────────────┐
│                                                                              │
│ ● v1.4.0 — Current                                                           │
│ │ Tightened price floor; added child-seat upsell                              │
│ │ Sarah Khan · May 8, 2026 · 11:42                                           │
│ │                                                  [ View ]                  │
│ │                                                                            │
│ │ v1.3.2                                                                     │
│ │ Expanded off-limits topics for insurance disputes                           │
│ │ Daniel Lee · May 5, 2026 · 09:15                                            │
│ │                                              [ View ]  [ Roll back ]       │
│ │                                                                            │
│ │ v1.3.1                                                                     │
│ │ ...                                                                        │
│ ●                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Vertical line `--color-border`. Active version dot `--color-accent`, others `--color-fg-subtle`.
- Active version has a "Current" pill.
- "View" opens a `Drawer` with full settings rendered in read-only chips/cards.
- "Roll back" opens a confirm `Modal`: "Roll back to v1.3.2? Your current draft will be discarded.", buttons "Cancel" / "Roll back" (variant=destructive).

## Save bar (bottom, sticky)

Appears on tabs that mutate settings (1–5). Hidden on Playground and Versions.

```
[3 unsaved changes]                              [ Discard ]   [ Save & publish ]
```

- Background `--color-surface`, border-top `--color-border`, height 64, padding 16 32, sticky at viewport bottom.
- Disabled state when there are no changes.
- "Discard" reverts in-memory edits to last saved.
- "Save & publish" creates a new `PromptVersion` with `isCurrent: true`, demotes the previous current, and shows toast "Saved as v1.5.0. Bot updated."

## States

- **Loading**: tabs render with skeleton form rows.
- **Empty (Versions)**: rare since one current version always exists; if seed mock has only 1, list still shows it.
- **Error**: error boundary.
- **Confirm save with no changes**: button disabled.
- **Confirm rollback**: confirm modal, destructive style.

## Mock data dependencies

- `mock/versions.ts` — version history; `current` derived
- `mock/manager.ts` — author rotation in "Save & publish"

## Mock state

`useTuneStore()` (Context+useReducer):
- `draft: PromptSettings`
- `current: PromptSettings` (read from current `PromptVersion`)
- `isDirty: boolean`
- `save(summary?: string)` — pushes new version
- `rollback(versionId)` — sets that version as current, draft = current
- `discard()` — draft = current

In-memory only; reload reverts.

## Copy

| Element | Text |
|---|---|
| Page heading | `Tune AI` |
| Page sub | `Shape how your bot greets, qualifies, and escalates` |
| Header version line | `v{version} · last saved {relative}` |
| Tab labels | `Personality` / `Business rules` / `Knowledge` / `Off-limits` / `Escalation` / `Playground` / `Versions` |
| Tone helper | `How does your bot sound to customers?` |
| Tone label scale | `Strict and corporate` / `Friendly and professional` / `Warm and conversational` / `Playful and direct` / `Very casual, almost text-message` |
| Greeting label | `Greeting style` |
| Greeting helper | `The first message your bot sends.` |
| Brand voice label | `Brand voice notes` |
| Brand voice helper | `Anything specific about your brand the bot should mirror?` |
| Knowledge helper | `The bot will treat anything in this field as authoritative. Be specific. Avoid contradictions with Business rules.` |
| Off-limits helper | `Add topics the bot should refuse politely. Press Enter to add.` |
| Escalation helper | `Add phrases that should auto-handoff to you over SMS. Press Enter to add.` |
| Playground header | `Test the current settings before publishing` |
| Playground reset | `Reset chat` |
| Playground left header | `Live (current saved)` |
| Playground right header | `Draft (unsaved changes)` |
| Playground input placeholder | `Type a message…` |
| Versions current pill | `Current` |
| Save bar dirty | `{n} unsaved change{s}` |
| Save bar discard | `Discard` |
| Save bar save | `Save & publish` |
| Save toast | `Saved as v{version}. Bot updated.` |
| Rollback modal title | `Roll back to v{version}?` |
| Rollback modal body | `Your current draft will be discarded.` |
| Rollback modal CTAs | `Cancel` / `Roll back` |
| Rollback toast | `Rolled back to v{version}.` |

## Acceptance checklist

- [ ] All 7 tabs render and persist active tab via `?tab=`.
- [ ] Tone slider re-labels live; preview greeting bubble re-renders on tone or greeting change.
- [ ] Brand voice notes textarea autosizes (min 96px, max 240px).
- [ ] Business rules form prefills from `mock.versions.current.settings`.
- [ ] Knowledge editor inserts canned blocks at cursor when toolbar buttons clicked.
- [ ] Knowledge editor character counter updates as user types.
- [ ] Off-limits / escalation chip inputs add chips on Enter, remove on `×` click.
- [ ] Off-limits deflection preview text updates live based on chips.
- [ ] Playground: typing on left or right with "Mirror typing" on sends to both; off splits.
- [ ] `mockBotReply` returns different replies for the two sides whenever Personality settings differ.
- [ ] Versions tab lists ≥ 5 versions; current has the pill; non-current rows show "Roll back".
- [ ] Roll back opens confirm modal with destructive button styling.
- [ ] Save bar appears only on tabs that mutate settings (not on Playground/Versions).
- [ ] Save bar disabled when `isDirty=false`; enabled otherwise; "Save & publish" creates a new version.
- [ ] Toasts appear for save / rollback / discard with correct copy.
- [ ] No emoji in UI chrome (only in the SMS preview block, which renders as a quoted literal).
- [ ] Lighthouse a11y ≥ 95 on `/tune`.

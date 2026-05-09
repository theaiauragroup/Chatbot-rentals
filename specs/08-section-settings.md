# 08 — Section: Settings

Route: `/settings` · Source spec: §8.7 · Sidebar position: 6

## Purpose

Where the manager configures account, notifications, Twilio integration, business identity, the widget embed code, and (placeholder) team access. Boring but essential. Visual goal: forms that look as polished as the rest of the app — no Bootstrap-tier defaults.

## Layout

```
┌─ Top bar — title "Settings" ──────────────────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘

╔══ Main content ═══════════════════════════════════════════════════════════════╗
║  Settings                                                                     ║
║  Manage your account, notifications, and integrations                         ║
║                                                                               ║
║  ┌─ Tabs ───────────────────────────────────────────────────────────────────┐ ║
║  │ Profile   Notifications   Twilio   Business   Widget   Team               │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Active tab content ─────────────────────────────────────────────────────┐ ║
║  │  ... (per tab spec) ...                                                  │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  ┌─ Save bar (sticky, on tabs that mutate) ─────────────────────────────────┐ ║
║  │ {n} unsaved changes                  [ Discard ]   [ Save changes ]      │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

URL: `?tab=profile|notifications|twilio|business|widget|team`. Default `profile`.

## Components used

- `src/components/ui/Tabs.tsx`, `Card.tsx`, `Input.tsx`, `Textarea.tsx`, `Switch.tsx`, `Select.tsx`, `Button.tsx`, `Modal.tsx`, `Avatar.tsx`, `Tooltip.tsx`, `Badge.tsx`, `Kbd.tsx`
- `src/components/settings/TwilioForm.tsx`
- `src/components/settings/NotificationPrefs.tsx`
- `src/components/settings/WidgetEmbed.tsx`
- `src/components/settings/BusinessForm.tsx`

## Tab 1 — Profile

```
┌─ Card: Personal info ──────────────────────────────────────────────┐
│   ◐ SK     [ Change avatar ]                                       │
│            JPG/PNG, square, ≥ 256×256                              │
│                                                                    │
│   Full name      [ Sarah Khan                              ]       │
│   Role           [ Owner ▾ ]   (read-only this pass)               │
│   Email          [ sarah@aiaurafleets.co                    ]       │
│   Phone          [ +1 (555) 555-0173                       ]       │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Password ───────────────────────────────────────────────────┐
│   Current password   [ ••••••••           ]                        │
│   New password       [ ••••••••           ]                        │
│   Confirm new        [ ••••••••           ]                        │
│                                            [ Update password ]     │
│                                                                    │
│   Forgot your current password?  [ Send reset link ]               │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Sessions (placeholder) ─────────────────────────────────────┐
│   You're signed in on 1 device.                                    │
│                                              [ Sign out everywhere ]│
└────────────────────────────────────────────────────────────────────┘
```

This pass: Save just updates mock state (toast). "Update password" toast: "Password updated." (stub). "Send reset link" toast: "Reset link sent to {email}." (stub).

## Tab 2 — Notifications

Three cards: Triggers, Schedule, Channel.

```
┌─ Card: Triggers ───────────────────────────────────────────────────┐
│   Hot lead detected           [Switch  ●==]                        │
│   Bot sees a buying-intent message and a complete lead profile.    │
│   Default: ON                                                      │
│                                                                    │
│   Human handoff requested     [Switch  ●==]                        │
│   Customer asks for a person.                                      │
│   Default: ON                                                      │
│                                                                    │
│   Booking inquiry with dates  [Switch  ●==]                        │
│   Customer asks about a specific car for specific dates.           │
│   Default: ON                                                      │
│                                                                    │
│   Daily summary               [Switch  ●==]                        │
│   End-of-day digest of chats and bookings.                         │
│   Default: ON                                                      │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Schedule ───────────────────────────────────────────────────┐
│   Daily summary delivery time   [ 20:00 ▾ ]   in your time zone    │
│   Quiet hours (no SMS)          [ 22:00 — 08:00 ]                  │
│   Quiet hours apply to          [ Daily summary only ▾ ]           │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Channel ────────────────────────────────────────────────────┐
│   Manager phone (E.164)         [ +1 (555) 555-0173 ]              │
│   This is where SMS notifications are sent.                        │
└────────────────────────────────────────────────────────────────────┘
```

Each trigger row has a `Switch`, label (text-base 500), helper (text-sm muted), default note (text-xs subtle). Toggle off-state: track `--color-border-strong`. On-state: `--color-accent`.

## Tab 3 — Twilio

```
┌─ Card: Status banner ──────────────────────────────────────────────┐
│   ◯ Verified · ready to send                  [ Send test SMS ]    │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Credentials ────────────────────────────────────────────────┐
│   Account SID         [ ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ]          │
│   Auth token          [ ••••••••8c0f                       ] [Show]│
│   Sender number       [ +1 (555) 222-1010                ]         │
│                                                                    │
│   Where do I find these?  [ Open Twilio console → ]                │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Sending log (last 7 days) ──────────────────────────────────┐
│   Sent          37                                                 │
│   Failed         1                                                 │
│   Cost (est)    $0.74                                              │
│                                              [ View full log → ]   │
└────────────────────────────────────────────────────────────────────┘
```

Status banner color:
- Verified → `◯` dot `--color-success`, banner bg `--color-success` 8% alpha, text `--color-success`.
- Unverified → `◯` dot `--color-warning`, banner bg `--color-warning` 8% alpha, "Verify your number" CTA.
- Disabled → muted gray.

`Send test SMS` button:
- Click opens `Modal width=confirm`:
  ```
  Send test SMS to +1 (555) 555-0173?
  This will send a sample notification using your current Twilio
  configuration.

  [ Cancel ]   [ Send test ]
  ```
- On confirm: 1.2s spinner state on button, then toast "Test SMS sent. Check your phone." (stub — no real send.)

`Show` toggles auth-token field between masked and revealed (mock — actual mock data is already masked).

## Tab 4 — Business

```
┌─ Card: Identity ───────────────────────────────────────────────────┐
│   Business name        [ AIAURA FLEETS                       ]      │
│   Logo                 [drop area · 1:1 SVG/PNG, ≥ 256×256] [Upload]│
│   Brand color          [ #5B5BD6 ▾ ]   (color picker)              │
│                                                                    │
│   Currency             [ USD — US Dollar ▾ ]                       │
│   Time zone            [ America/Los_Angeles ▾ ]                   │
│   Locale               [ en-US ▾ ]                                 │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Contact ────────────────────────────────────────────────────┐
│   Public phone         [ +1 (555) 555-0100  ]                      │
│   Public email         [ hello@aiaurafleets.co ]                    │
│   Address              [ 123 Wilshire Blvd, Los Angeles, CA 90017 ]│
└────────────────────────────────────────────────────────────────────┘
```

Brand color picker is informational this pass — changing it does NOT recolor the dashboard accent (out of scope; the multi-tenant branding apparatus comes later). A small note: "Used by your widget; dashboard accent stays the same."

## Tab 5 — Widget

```
┌─ Card: Embed code ─────────────────────────────────────────────────┐
│   Paste this snippet right before the closing </body> tag of your  │
│   site. The widget appears as a floating button bottom-right.      │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │ <script                                                      │ │
│   │   src="https://widget.aiaurafleets.app/v1/loader.js"           │ │
│   │   data-tenant="aiaura-fleets"                                  │ │
│   │   defer                                                       │ │
│   │ ></script>                                                    │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                  [ Copy snippet ]  │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Preview ────────────────────────────────────────────────────┐
│   How customers will see the widget on your site                   │
│   ┌─ iframe-style preview frame, 320×420, bottom-right pinned ──┐ │
│   │                                                              │ │
│   │           Mock website backdrop                              │ │
│   │                                                              │ │
│   │                                       ┌───────────┐          │ │
│   │                                       │  Aura     │          │ │
│   │                                       │   Hi! Need│          │ │
│   │                                       │   a car?  │          │ │
│   │                                       │           │          │ │
│   │                                       │  ◯  Chat  │          │ │
│   │                                       └───────────┘          │ │
│   └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌─ Card: Customize (placeholder) ────────────────────────────────────┐
│   Position           [ Bottom right ▾ ]   (only option this pass)  │
│   Greeting badge     [ Hi! Need a car? ]                           │
│   Show on pages      [ All pages ▾ ]      (only option this pass)  │
└────────────────────────────────────────────────────────────────────┘
```

Embed snippet code block: `font-mono text-sm`, `--color-surface-2` bg, `--radius-md`, padding 16, scrollable horizontally if long. Copy button: `Button variant=secondary leadingIcon=ClipboardCopy`. On click: `navigator.clipboard.writeText(snippet)`, button morphs to "✓ Copied" for 1.5s, toast "Copied to clipboard."

Preview frame: a static mock — no real widget loads. Just a faux website backdrop with a faux chat bubble illustrating positioning.

## Tab 6 — Team (placeholder)

```
┌─ Card: Team members ───────────────────────────────────────────────┐
│   ◐ Sarah Khan          Owner                                      │
│      sarah@aiaurafleets.co                                          │
│                                                                    │
│   No teammates yet                                                 │
│   Invite a teammate to share this dashboard.                       │
│                                              [ Invite teammate ]   │
└────────────────────────────────────────────────────────────────────┘
```

`Invite teammate` button: stub-toast "Team access wired in pass 2." Source spec marks this as future — render the empty state cleanly without making it look broken.

## Save bar

Same pattern as Tune AI — sticky bottom on tabs that mutate (1, 2, 3, 4, 5; not Team). Hidden when no changes. Discard reverts; Save toasts "Settings saved."

## States

- **Loading**: each card shows skeleton field rows.
- **Error**: error boundary.
- **Twilio unverified**: status banner shows the unverified variant; "Send test SMS" is disabled with tooltip "Verify your sender number first."
- **Confirm leave with unsaved changes**: when navigating away (sidebar click), if dirty → confirm modal "Discard unsaved changes?" / "Stay" / "Discard".

## Mock data dependencies

- `mock/manager.ts` — Manager + TenantConfig

## Mock state

`useSettingsStore()` reducer:
- `updateProfile(patch)`
- `updateNotifications(patch)`
- `updateTwilio(patch)`
- `updateBusiness(patch)`
- `updateWidget(patch)`

Reload reverts.

## Copy

| Element | Text |
|---|---|
| Page heading | `Settings` |
| Page sub | `Manage your account, notifications, and integrations` |
| Tab labels | `Profile` / `Notifications` / `Twilio` / `Business` / `Widget` / `Team` |
| Profile card titles | `Personal info` / `Password` / `Sessions` |
| Avatar helper | `JPG/PNG, square, ≥ 256×256` |
| Password CTA | `Update password` |
| Forgot CTA | `Send reset link` |
| Sessions copy | `You're signed in on 1 device.` |
| Sessions CTA | `Sign out everywhere` |
| Notifications card titles | `Triggers` / `Schedule` / `Channel` |
| Trigger labels | `Hot lead detected` / `Human handoff requested` / `Booking inquiry with dates` / `Daily summary` |
| Trigger helpers | `Bot sees a buying-intent message and a complete lead profile.` / `Customer asks for a person.` / `Customer asks about a specific car for specific dates.` / `End-of-day digest of chats and bookings.` |
| Default note | `Default: ON` |
| Schedule labels | `Daily summary delivery time` / `Quiet hours (no SMS)` / `Quiet hours apply to` |
| Channel label | `Manager phone (E.164)` |
| Channel helper | `This is where SMS notifications are sent.` |
| Twilio status (verified) | `Verified · ready to send` |
| Twilio status (unverified) | `Unverified — verify your sender number to start sending` |
| Twilio test CTA | `Send test SMS` |
| Twilio test modal | `Send test SMS to {phone}?` / `This will send a sample notification using your current Twilio configuration.` / `Cancel` / `Send test` |
| Twilio test toast | `Test SMS sent. Check your phone.` |
| Twilio credential labels | `Account SID` / `Auth token` / `Sender number` |
| Twilio help | `Where do I find these?` / `Open Twilio console →` |
| Twilio log card | `Sending log (last 7 days)` / `Sent` / `Failed` / `Cost (est)` / `View full log →` |
| Business card titles | `Identity` / `Contact` |
| Business labels | `Business name` / `Logo` / `Brand color` / `Currency` / `Time zone` / `Locale` / `Public phone` / `Public email` / `Address` |
| Brand color note | `Used by your widget; dashboard accent stays the same.` |
| Widget card titles | `Embed code` / `Preview` / `Customize` |
| Widget intro | `Paste this snippet right before the closing </body> tag of your site. The widget appears as a floating button bottom-right.` |
| Widget copy CTA | `Copy snippet` |
| Widget copy state | `✓ Copied` (1.5s) / toast `Copied to clipboard.` |
| Widget preview header | `How customers will see the widget on your site` |
| Widget customize labels | `Position` / `Greeting badge` / `Show on pages` |
| Team card title | `Team members` |
| Team empty | `No teammates yet` / `Invite a teammate to share this dashboard.` / `Invite teammate` |
| Team toast (stub) | `Team access wired in pass 2.` |
| Save bar dirty | `{n} unsaved change{s}` |
| Save bar discard | `Discard` |
| Save bar save | `Save changes` |
| Save toast | `Settings saved.` |
| Leave-with-unsaved modal | `Discard unsaved changes?` / `Stay` / `Discard` |

## Acceptance checklist

- [ ] All 6 tabs render and persist active tab via `?tab=`.
- [ ] Profile fields prefill from `mock.manager`; editing toggles save bar dirty state.
- [ ] Avatar component shows initials when `avatarUrl` undefined; "Change avatar" stub toasts.
- [ ] Password "Update password" + "Send reset link" both stub-toast.
- [ ] Notification triggers all default ON; toggling each updates mock state.
- [ ] Schedule fields render time pickers in 24-hour format.
- [ ] Twilio status banner reflects mock `isVerified` (true → green; flip in mock to test other state).
- [ ] "Send test SMS" opens confirm modal; confirm shows 1.2s spinner then toast.
- [ ] Auth token field masked by default; Show toggles to revealed state.
- [ ] Business form prefills from `mock.tenant`; brand color picker is functional but doesn't recolor dashboard.
- [ ] Widget embed snippet renders in mono code block; Copy snippet copies text and shows "✓ Copied" + toast.
- [ ] Widget preview frame is purely decorative (no real loader.js).
- [ ] Team tab shows current manager + empty-state CTA.
- [ ] Save bar appears only on tabs 1–5 when dirty; "Save changes" toasts and clears dirty.
- [ ] Sidebar click while dirty triggers leave-confirm modal.
- [ ] All copy matches the table above verbatim.
- [ ] No `shadow-xl`, no Tailwind blue, no emoji icons in chrome.
- [ ] Lighthouse a11y ≥ 95 on `/settings`.

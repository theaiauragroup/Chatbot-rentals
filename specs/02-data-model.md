# 02 — Data Model

## Purpose

Define every TypeScript type the dashboard consumes, and the volume + realism rules for the mock data that fills every screen. The mock data must look real enough that a stakeholder can't tell the difference from a populated production tenant.

## Files

- `src/lib/types.ts` — all domain types (single file)
- `src/lib/mock/index.ts` — barrel re-export
- `src/lib/mock/manager.ts` — current "logged-in" manager + tenant
- `src/lib/mock/vehicles.ts` — 20 vehicles
- `src/lib/mock/leads.ts` — 50 leads
- `src/lib/mock/chats.ts` — chats + messages
- `src/lib/mock/kpis.ts` — daily ChartPoint series + summaries
- `src/lib/mock/notifications.ts` — 12 notifications
- `src/lib/mock/versions.ts` — 5–8 prompt versions
- `src/lib/mock/aggregations.ts` — popular cars, today's hot leads, recent activity
- `public/mock/cars/` — 6–8 stock car photos (jpg)

## Conventions

- IDs are stable strings prefixed by entity: `veh_001`, `lead_001`, `chat_001`, `msg_001`, `notif_001`, `ver_001`.
- Dates: ISO 8601. `ISODate` for date-only (`2026-05-08`), `ISODateTime` for full (`2026-05-08T14:32:00Z`).
- Currency: stored as integer cents to avoid float drift, but for this static prototype we'll use plain `number` representing whole-USD daily rates (e.g. `89` = `$89/day`). Display formatter wraps with `Intl.NumberFormat`.
- Phone: store as E.164-ish strings (`+15551234567`), display formatted (`(555) 123-4567`).

## Types

`src/lib/types.ts` — exact contents:

```ts
// ─── Primitive aliases ──────────────────────────────────────────────────────
export type ID = string;
export type ISODate = string;       // 'YYYY-MM-DD'
export type ISODateTime = string;   // 'YYYY-MM-DDTHH:mm:ssZ'

// ─── Lead ───────────────────────────────────────────────────────────────────
export type LeadTemperature = 'hot' | 'warm' | 'cold';
/**
 * Manager-managed lifecycle status of a lead.
 *
 * Typical progression (managers can skip stages freely — these are tags, not a strict state machine):
 *   open → working_on → contacted → in_process → quoted →
 *   call_booked → deposit_paid → booked → deal_closed
 *                                ↘ lost
 *                                ↘ no_response
 *
 * `booked` is the operational confirmation state and triggers the "Add booking to
 * vehicle calendar" modal. `deal_closed` is the terminal closed-won state (vehicle
 * picked up, paid in full, deal is done). `lost` and `no_response` are closed-lost
 * terminals that don't touch the calendar.
 */
export type LeadOutcome =
  | 'open'           // new, untouched
  | 'working_on'     // manager actively engaging right now
  | 'contacted'      // manager reached out, awaiting reply
  | 'in_process'     // long-running engagement, scheduled follow-up
  | 'quoted'         // price/options sent, awaiting decision
  | 'call_booked'    // follow-up call scheduled with customer
  | 'deposit_paid'   // deposit received, awaiting full payment / pickup confirmation
  | 'booked'         // booking confirmed — prompts calendar block
  | 'deal_closed'    // fully closed-won (vehicle picked up + paid in full) — terminal
  | 'lost'           // closed-lost
  | 'no_response';   // ghosted

export interface Lead {
  id: ID;
  chatId: ID;                         // 1:1 link back to source chat
  customerName: string;
  customerPhone?: string;             // E.164
  customerEmail?: string;
  temperature: LeadTemperature;
  outcome: LeadOutcome;
  trip: {
    pickupDate: ISODate;
    returnDate: ISODate;
    pickupLocation?: string;          // free text
    dropoffLocation?: string;
  };
  vehicleInterestIds: ID[];           // FK → Vehicle.id (>=0)
  estimatedValueUsd: number;          // dailyRate × days
  managerNotes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  source: 'web_widget';               // future-proof, single value v1
}

// ─── Vehicle ────────────────────────────────────────────────────────────────
export type VehicleCategory = 'economy' | 'compact' | 'suv' | 'luxury' | 'van';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired';
export type Transmission = 'automatic' | 'manual';
export type Fuel = 'gasoline' | 'diesel' | 'hybrid' | 'electric';
export type Feature =
  | 'ac' | 'gps' | 'bluetooth' | 'sunroof'
  | 'child_seat' | 'all_wheel_drive' | 'apple_carplay' | 'heated_seats';

export interface BookingRange {
  id: ID;
  start: ISODate;
  end: ISODate;
  /** HH:mm pickup time on the start date (optional). */
  startTime?: string;
  /** HH:mm return time on the end date (optional). */
  endTime?: string;
  reason: 'rented' | 'maintenance' | 'blocked';
  leadId?: ID;                        // backref when reason='rented'
}

export interface Vehicle {
  id: ID;
  make: string;
  model: string;
  year: number;
  plate: string;
  category: VehicleCategory;
  dailyRateUsd: number;
  seats: number;
  transmission: Transmission;
  fuel: Fuel;
  mileageKm: number;
  photos: string[];                   // URLs under /mock/cars/, remote CDN URLs, or base64 strings (with/without data URI prefix)
  features: Feature[];
  status: VehicleStatus;
  blocks: BookingRange[];
  createdAt: ISODateTime;
}

// ─── Chat ───────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system';

export interface AiDecision {
  intent:
    | 'greeting' | 'browsing' | 'pricing_inquiry' | 'availability_check'
    | 'booking_intent' | 'objection' | 'handoff_request' | 'off_topic';
  confidence: number;                 // 0..1
  tempShift?: LeadTemperature;        // set when scoring changed temperature
  collectedFields?: Array<keyof Lead | 'pickupDate' | 'returnDate' | 'pickupLocation' | 'dropoffLocation'>;
}

export interface Message {
  id: ID;
  chatId: ID;
  role: MessageRole;
  text: string;
  sentAt: ISODateTime;
  aiDecision?: AiDecision;            // present on assistant turns when scoring fired
}

export interface Chat {
  id: ID;
  startedAt: ISODateTime;
  lastMessageAt: ISODateTime;
  endedAt?: ISODateTime;              // set when conversation closed
  durationSec: number;                // computed: last - start
  customerName?: string;              // captured during chat (may be undefined for browse-only chats)
  customerPhone?: string;
  customerEmail?: string;
  messages: Message[];
  leadId?: ID;                        // becomes set once enough info captured
  vehicleIdsOfInterest: ID[];
  finalTemperature: LeadTemperature;  // current temperature score
  channel: 'web_widget';
  countryCode?: string;               // ISO-3166 (mock from IP later); show flag inline
  outcome?: 'in_progress' | 'closed' | 'handed_off';
}

// ─── Notification ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'hot_lead' | 'human_handoff' | 'booking_inquiry' | 'daily_summary' | 'system';

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
  refLeadId?: ID;
  refChatId?: ID;
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export interface ChartPoint {
  date: ISODate;
  chats: number;
  hot: number;
  warm: number;
  cold: number;
  bookings: number;
  revenueUsd: number;
}

export interface KpiSummary {
  rangeLabel: string;                 // 'Last 7 days', etc.
  totalChats: number;
  newLeads: { hot: number; warm: number; cold: number };
  conversionRatePct: number;          // 0..100
  pipelineValueUsd: number;           // sum of open Hot+Warm estimated values
  avgChatDurationSec: number;
  bookings: number;
  // % deltas vs. previous period
  deltas: {
    totalChats: number;
    newLeads: number;
    conversionRatePct: number;
    pipelineValueUsd: number;
    avgChatDurationSec: number;
    bookings: number;
  };
}

export interface PeakHourCell {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // Sun..Sat
  hour: number;                            // 0..23
  count: number;
}

// ─── Tune AI ────────────────────────────────────────────────────────────────
export interface PromptSettings {
  toneIndex: number;                  // 0..10 (formal..casual)
  greetingStyle: 'classic' | 'warm' | 'concise';
  brandVoice: string;                 // free text
  businessRules: {
    operatingHours: string;           // 'Mon-Sun 8:00-22:00'
    depositPolicyUsd: number;
    multiDayDiscountPct: number;
    minRentalDays: number;
    minDriverAge: number;
  };
  knowledge: string;                  // free text (cancellation/fuel/mileage policies)
  offLimitsTopics: string[];          // ['insurance disputes', 'refunds', ...]
  escalationTriggers: string[];       // phrases that auto-handoff
}

export interface PromptVersion {
  id: ID;
  versionLabel: string;               // 'v1.4.0'
  createdAt: ISODateTime;
  authorName: string;
  summary: string;                    // human-readable change description
  settings: PromptSettings;
  isCurrent: boolean;
}

// ─── Manager / tenant ───────────────────────────────────────────────────────
export interface Manager {
  id: ID;
  name: string;
  role: 'owner' | 'manager';
  email: string;
  phone: string;                      // E.164
  avatarUrl?: string;
}

export interface TenantConfig {
  id: ID;
  slug: string;                       // 'aiaura-fleets'
  businessName: string;               // 'AIAURA FLEETS'
  logoUrl?: string;
  currency: 'USD';
  timezone: string;                   // 'America/Los_Angeles'
  notifications: {
    hotLead: boolean;
    humanHandoff: boolean;
    bookingInquiry: boolean;
    dailySummary: boolean;
    dailySummaryTime: string;         // 'HH:mm' local
    managerPhone: string;
  };
  twilio: {
    accountSid: string;               // mock 'AC…' string
    authTokenMasked: string;          // '••••••••8c0f'
    senderNumber: string;             // E.164
    isVerified: boolean;
  };
  widgetEmbedSnippet: string;         // computed once, displayed in Settings
}
```

## Mock data plan

### Manager + tenant (`src/lib/mock/manager.ts`)

One Manager and one TenantConfig.

```
Manager: 'Sarah Khan', role 'owner', email 'sarah@aiaurafleets.co',
         phone '+15125550173', avatarUrl undefined (use initials).
Tenant : slug 'aiaura-fleets', businessName 'AIAURA FLEETS',
         currency USD, timezone 'America/Los_Angeles'.
         Notifications all ON, dailySummaryTime '20:00', managerPhone matches Sarah's.
         Twilio mocked verified.
```

### Vehicles (`vehicles.ts`)

**20 vehicles** distributed:

| Category | Count | Examples |
|---|---|---|
| Economy | 5 | Toyota Corolla, Honda Civic (×2), Nissan Sentra, Hyundai Elantra |
| Compact | 4 | Toyota Camry, Mazda 3, VW Jetta, Honda Accord |
| SUV | 5 | Toyota RAV4, Honda CR-V, Jeep Grand Cherokee, Kia Sorento, Subaru Outback |
| Luxury | 4 | BMW 5 Series, Mercedes E-Class, Audi A6, Tesla Model S |
| Van | 2 | Toyota Sienna, Honda Odyssey |

Status distribution: 12 available, 4 rented, 3 maintenance, 1 retired.
Years: mix of 2022 / 2023 / 2024 / 2025.
Daily rates: economy `$39–59`, compact `$49–79`, SUV `$79–119`, luxury `$159–249`, van `$99–129`.
Plates: realistic regional formats `XYZ-1234`, `7ABC123` (Texas-ish).
Mileages: 8,400–62,300 km, varied.
Features: each vehicle has 3–6 features. AC + Bluetooth on every car. Luxury all get Sunroof + Heated seats. SUVs get All-wheel drive. Apple CarPlay on most 2024+. GPS + Child seat random.
Photos: each vehicle references 1–3 paths from `/mock/cars/{slug}.jpg` where slug is chosen from 6–8 generic car photos. Multiple vehicles can reuse the same photo this pass.
Blocks: each vehicle has 0–4 `BookingRange` entries clustered around `today` (2026-05-08). Mix `rented` (with leadId) and `maintenance` reasons.

### Leads (`leads.ts`)

**50 leads** distributed:
- Temperature: 25 hot / 15 warm / 10 cold.
- Outcome by temperature:
  - Hot: 8 booked, 12 open, 3 no_response, 2 lost
  - Warm: 2 booked, 9 open, 2 no_response, 2 lost
  - Cold: 0 booked, 4 open, 5 no_response, 1 lost
- Customer names: realistic varied (Ahmed Khan, Priya Nair, Marcus Lee, Sofia Reyes, Olivia Park, Diego Alvarez, Hana Tanaka, Jordan Wright, etc.). At least 30 unique surnames. **No "John Doe".**
- Phones: 555-area-coded `+15555550xxx`.
- Emails: lowercase first.last format on varied domains (`gmail.com`, `outlook.com`, `proton.me`, `icloud.com`).
- Trip dates: pickup distributed from `today - 5d` to `today + 30d`. Duration 2–10 days.
- vehicleInterestIds: 1–2 vehicle IDs. ~70% link to one of the available vehicles, 30% to a rented or maintenance one to demonstrate calendar-conflict messaging downstream.
- estimatedValueUsd: dailyRate × days for the first interest vehicle.
- managerNotes: present on ~40% of leads, 1–3 sentence notes.
- createdAt: distributed across last 14 days, weighted toward recent.

### Chats (`chats.ts`)

**30 chats**, message counts 4–22 each. Of these:
- 22 chats end with a `leadId` (lead generated)
- 8 chats end without (browse-only / abandoned)
- Country mix: 70% US, 15% MX, 8% PK, 7% other.
- Final temperature distribution roughly mirrors the hot/warm/cold lead split.
- Channel always `web_widget`.

Messages must read like real conversations. Examples to seed (not all literal — vary, paraphrase, mix in different intents):

```
user (12:04): hey looking for an SUV next weekend
assistant (12:04): Got it. May 17–19, what category — RAV4-ish or larger like a Grand Cherokee?
user (12:05): the bigger one
assistant (12:05): Grand Cherokee 2024 is open those dates at $109/day. Total $327.
                   Want me to hold it?
user (12:06): yeah send me details. ahmed khan, 555-0173
...
```

Each assistant turn after the user has shared an intent gets an `aiDecision` with `intent` and `confidence`. Major shifts (e.g. user types "let's book") get `tempShift: 'hot'` to demonstrate inline scoring badges.

### KPIs (`kpis.ts`)

**14 days** of `ChartPoint` with weekday/weekend variance:
- Weekday chats: 14–28
- Weekend chats: 22–42 (peak Fri/Sat)
- hot ≈ 20% chats, warm ≈ 35%, cold ≈ 45%
- bookings ≈ 4–8/day weekdays, 6–11 weekends
- revenueUsd: bookings × avg trip value (around $400)

Two `KpiSummary` objects exported: `kpiSummary7d`, `kpiSummary30d` (the 30d one is computed from extrapolated mock series; for spec realism we just generate 30 days of data rather than 14 — adjust to **30 days** of `ChartPoint` so the "30 days" filter has real data).

PeakHourCell grid: 7×24 = 168 cells. Distribute weight: low overnight (00–07), peak 11–14 and 17–20, weekend curve flatter and higher.

### Notifications (`notifications.ts`)

**12 notifications**, mix:
- 4× hot_lead (recent, 2 unread)
- 2× human_handoff
- 3× booking_inquiry
- 2× daily_summary
- 1× system ("Twilio test message delivered")

Sorted newest first. Unread count = 4.

### Prompt versions (`versions.ts`)

**6 versions**, dated descending. Latest is `isCurrent: true`. Author rotates between Sarah and a teammate "Daniel Lee". Summaries like "Tightened price floor", "Added child-seat upsell", "Expanded off-limits topics for insurance".

## Helper functions

`src/lib/utils.ts` exports:

```ts
export function cn(...classes: ClassValue[]): string;          // clsx + tailwind-merge
export function formatUsd(cents: number): string;              // '$1,089.00'
export function formatDate(d: ISODate, opts?): string;         // 'May 8'
export function formatDateRange(s: ISODate, e: ISODate): string;// 'May 12–18'
export function formatRelative(dt: ISODateTime): string;       // '2h ago'
export function formatDuration(sec: number): string;           // '4m 32s'
export function formatPhone(e164: string): string;             // '(555) 555-0173'
export function initials(name: string): string;                // 'SK'
export function tempLabel(t: LeadTemperature): string;         // 'Hot'
export function outcomeLabel(o: LeadOutcome): string;          // 'Booked'
```

## Image asset plan

For Pass 1 the prototype uses **external Unsplash CDN URLs** for vehicle photos (real photographs, no disk-space cost, no upload pipeline). A small curated set is rotated across the 20 vehicles by category. URLs follow the pattern:
`https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=900&q=80`

Every component that renders a vehicle photo wraps it in an `<img>` with an `onError` handler that drops opacity to 0 if the image fails. The card / detail page falls back to a category-tinted gradient + lucide `Car` icon.

For Pass 2 (real backend), photos move to a per-tenant storage bucket per the source spec §13.4 and the URL field becomes a CDN URL into that bucket. The schema (`Vehicle.photos: string[]`) does not change.

`public/mock/cars/` exists as a `.gitkeep` directory for any future locally-shipped fallback photos. The starter villa images at `public/hero.png` and `public/listing-*.png` are NOT used in this pass.

## Acceptance checklist

- [ ] `src/lib/types.ts` exports every type exactly as listed above.
- [ ] All mock files compile under `tsc --noEmit`.
- [ ] `mock.vehicles.length === 20`; category and status distribution matches.
- [ ] `mock.leads.length === 50`; temperature 25/15/10 split.
- [ ] `mock.chats.length === 30`; each has 4–22 messages.
- [ ] At least 5 chats include `aiDecision.tempShift` to demonstrate inline scoring badges.
- [ ] `mock.chartSeries` covers 30 calendar days ending today (2026-05-08).
- [ ] `kpiSummary7d.deltas` contains realistic +/- percentages (no zeroes everywhere).
- [ ] `mock.notifications.length === 12`, 4 unread.
- [ ] `mock.promptVersions.length >= 5` with one `isCurrent: true`.
- [ ] No "John Doe" / "Lorem ipsum" / "555-1212" / "Email Subject" in any mock file.
- [ ] `formatUsd`, `formatPhone`, `formatRelative` produce correct output for sample inputs.
- [ ] `public/mock/cars/.gitkeep` exists; no broken `next/image` references in dev run.

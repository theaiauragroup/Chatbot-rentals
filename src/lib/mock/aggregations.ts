import type { ActivityEvent, Lead, Vehicle } from "../types";
import { chats } from "./chats";
import { leads } from "./leads";
import { vehicles } from "./vehicles";

// ─── Recent bookings (last committed leads, newest first) ───────────────────
// "Committed" = the customer has crossed the booking line: booking confirmed,
// deposit received, or deal fully closed (paid + picked up).
const BOOKING_OUTCOMES = new Set(["booked", "deposit_paid", "deal_closed"]);

export const recentBookings: Lead[] = leads
  .filter((l) => BOOKING_OUTCOMES.has(l.outcome))
  .slice()
  .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

export const totalBookedValueUsd: number = recentBookings.reduce(
  (acc, l) => acc + l.estimatedValueUsd,
  0
);

// ─── Live stats (synthesized from chats / leads near "now") ──────────────────
const NOW_MS = new Date("2026-05-08T14:30:00-07:00").getTime();
const ONE_HOUR_MS = 60 * 60 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

// "Live" = chat had activity within the last 30 minutes AND hasn't been ended.
// This filters out historical chats that just lack an `endedAt` timestamp.
export const liveChatsNow: number = chats.filter((c) => {
  if (c.outcome === "closed" || c.outcome === "handed_off") return false;
  const last = new Date(c.lastMessageAt).getTime();
  return NOW_MS - last <= THIRTY_MIN_MS;
}).length;

export const newLeadsLastHour: number = leads.filter(
  (l) => NOW_MS - new Date(l.createdAt).getTime() <= ONE_HOUR_MS
).length;

// ─── Top performing cars (by revenue from booked leads) ─────────────────────
// Revenue is derived from each booked lead's estimatedValueUsd, attributed to
// the first vehicle in vehicleInterestIds. We also fall back to mention-count
// × dailyRate × avgDays for cars with no booked leads so the list always has
// at least 8 entries with realistic numbers.
export interface TopCarRow {
  vehicle: Vehicle;
  revenueUsd: number;
  bookings: number;
}

export const topPerformingCars: TopCarRow[] = (() => {
  const revByVehicle = new Map<string, { revenue: number; bookings: number }>();
  for (const l of leads) {
    if (!BOOKING_OUTCOMES.has(l.outcome)) continue;
    const vid = l.vehicleInterestIds[0];
    if (!vid) continue;
    const cur = revByVehicle.get(vid) ?? { revenue: 0, bookings: 0 };
    cur.revenue += l.estimatedValueUsd;
    cur.bookings += 1;
    revByVehicle.set(vid, cur);
  }
  // Synthesize for vehicles without booked leads so the list reads as a real fleet
  for (const v of vehicles) {
    if (revByVehicle.has(v.id)) continue;
    if (v.status === "retired") continue;
    // 1–4 phantom bookings × daily rate × 4 days, scaled by category
    const factor =
      v.category === "luxury" ? 3 : v.category === "suv" ? 2.4 : v.category === "compact" ? 1.8 : 1.4;
    const phantomBookings = Math.max(1, Math.round(factor));
    revByVehicle.set(v.id, {
      revenue: Math.round(v.dailyRateUsd * 4 * phantomBookings),
      bookings: phantomBookings,
    });
  }
  return [...revByVehicle.entries()]
    .map(([vehicleId, data]) => ({
      vehicle: vehicles.find((v) => v.id === vehicleId)!,
      revenueUsd: data.revenue,
      bookings: data.bookings,
    }))
    .filter((row) => !!row.vehicle)
    .sort((a, b) => b.revenueUsd - a.revenueUsd)
    .slice(0, 8);
})();

// ─── Most popular cars (by chat-mention) ─────────────────────────────────────
export const popularCars = (() => {
  const counts = new Map<string, number>();
  for (const c of chats) {
    for (const id of c.vehicleIdsOfInterest) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([vehicleId, mentions]) => {
      const v = vehicles.find((x) => x.id === vehicleId);
      return {
        vehicleId,
        mentions,
        label: v ? `${v.make} ${v.model}` : vehicleId,
      };
    })
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);
})();

// ─── Today's hot leads ───────────────────────────────────────────────────────
export const todaysHotLeads = leads
  .filter(
    (l) =>
      l.temperature === "hot" &&
      l.outcome === "open" &&
      l.createdAt.slice(0, 10) === "2026-05-08"
  )
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// ─── Recent activity events ──────────────────────────────────────────────────
export const recentActivity: ActivityEvent[] = [
  {
    id: "act_001",
    type: "new_hot_lead",
    text: "New hot lead — Ahmed Khan asked to book BMW 5 Series",
    at: "2026-05-08T14:28:00-07:00",
    refLeadId: "lead_001",
    refChatId: "chat_001",
    refVehicleId: "veh_015",
  },
  {
    id: "act_002",
    type: "temp_change",
    text: "Lead temperature changed warm → hot — Marcus Lee",
    at: "2026-05-08T11:54:00-07:00",
    refLeadId: "lead_003",
    refChatId: "chat_003",
  },
  {
    id: "act_003",
    type: "new_chat",
    text: "New chat — Camille Dubois started a conversation",
    at: "2026-05-08T10:02:00-07:00",
    refChatId: "chat_009",
  },
  {
    id: "act_004",
    type: "booking_closed",
    text: "Booked — Hana Tanaka confirmed Toyota Corolla May 12–15",
    at: "2026-05-08T09:45:00-07:00",
    refLeadId: "lead_007",
    refVehicleId: "veh_001",
  },
  {
    id: "act_005",
    type: "handoff_request",
    text: "Customer escalated — Jordan Wright requested manager",
    at: "2026-05-08T08:39:00-07:00",
    refLeadId: "lead_008",
    refChatId: "chat_008",
  },
  {
    id: "act_006",
    type: "new_hot_lead",
    text: "New hot lead — Yuki Watanabe wants Audi A6",
    at: "2026-05-08T07:44:00-07:00",
    refLeadId: "lead_011",
    refChatId: "chat_011",
  },
  {
    id: "act_007",
    type: "chat_ended",
    text: "Chat ended — anonymous browser, 4 messages, no lead",
    at: "2026-05-08T06:20:00-07:00",
    refChatId: "chat_051",
  },
  {
    id: "act_008",
    type: "booking_closed",
    text: "Booked — Diego Alvarez confirmed Kia Sorento May 8–14",
    at: "2026-05-07T17:22:00-07:00",
    refLeadId: "lead_006",
    refVehicleId: "veh_013",
  },
  {
    id: "act_009",
    type: "new_chat",
    text: "New chat — Priya Nair started a conversation",
    at: "2026-05-05T09:12:00-07:00",
    refChatId: "chat_002",
  },
  {
    id: "act_010",
    type: "booking_closed",
    text: "Booked — Olivia Park confirmed Toyota Camry Apr 30 – May 5",
    at: "2026-04-29T11:00:00-07:00",
    refLeadId: "lead_005",
    refVehicleId: "veh_006",
  },
  {
    id: "act_011",
    type: "temp_change",
    text: "Lead temperature changed cold → warm — Iris Nakamura",
    at: "2026-05-08T10:40:00-07:00",
    refLeadId: "lead_027",
    refChatId: "chat_027",
  },
  {
    id: "act_012",
    type: "new_chat",
    text: "New chat — Sienna Collins started a conversation",
    at: "2026-05-08T15:45:00-07:00",
    refChatId: "chat_015",
    refLeadId: "lead_015",
  },
];

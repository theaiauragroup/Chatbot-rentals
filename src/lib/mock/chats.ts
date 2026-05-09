import type { Chat, Message, AiDecision, LeadTemperature } from "../types";
import { leads } from "./leads";

let nextMsg = 1;
const mid = () => `msg_${String(nextMsg++).padStart(4, "0")}`;

function userMsg(chatId: string, text: string, sentAt: string): Message {
  return { id: mid(), chatId, role: "user", text, sentAt };
}
function botMsg(chatId: string, text: string, sentAt: string, ai?: AiDecision): Message {
  return { id: mid(), chatId, role: "assistant", text, sentAt, aiDecision: ai };
}
function sysMsg(chatId: string, text: string, sentAt: string): Message {
  return { id: mid(), chatId, role: "system", text, sentAt };
}

function durationBetween(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
}

interface ChatSeed {
  id: string;
  startedAt: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleIds: string[];
  finalTemperature: LeadTemperature;
  countryCode?: string;
  build: (id: string, start: Date) => Message[];
  outcome?: Chat["outcome"];
}

function plus(start: Date, deltaSec: number): string {
  const d = new Date(start.getTime() + deltaSec * 1000);
  return d.toISOString();
}

const chatSeeds: ChatSeed[] = [
  {
    id: "chat_001",
    startedAt: "2026-05-08T14:24:00-07:00",
    customerName: "Ahmed Khan",
    customerPhone: "+15555550173",
    customerEmail: "ahmed.khan@gmail.com",
    vehicleIds: ["veh_015", "veh_016"],
    finalTemperature: "hot",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "hey looking for a luxury car for next weekend", plus(s, 0)),
      botMsg(id, "Got it. Which dates and pickup spot are you thinking?", plus(s, 18),
        { intent: "browsing", confidence: 0.92 }),
      userMsg(id, "May 12 to 18, picking up at LAX", plus(s, 52)),
      botMsg(id, "BMW 5 Series 2024 is open those dates at $179/day. Total $1,074 for 6 days. Want me to hold it?", plus(s, 79),
        { intent: "pricing_inquiry", confidence: 0.94, tempShift: "warm", collectedFields: ["pickupDate", "returnDate", "pickupLocation"] }),
      userMsg(id, "what about the E-Class?", plus(s, 142)),
      botMsg(id, "E-Class 2023 is open too — $199/day, total $1,194. Both have heated seats and sunroof.", plus(s, 168),
        { intent: "pricing_inquiry", confidence: 0.91 }),
      userMsg(id, "lets do the BMW. send me the details", plus(s, 230)),
      botMsg(id, "Perfect. Could I get your name and phone for the booking?", plus(s, 248),
        { intent: "booking_intent", confidence: 0.97, tempShift: "hot", collectedFields: ["customerName", "customerPhone"] }),
      userMsg(id, "Ahmed Khan, 555-555-0173", plus(s, 280)),
      botMsg(id, "Thanks Ahmed. What's a good email for the receipt?", plus(s, 298)),
      userMsg(id, "ahmed.khan@gmail.com", plus(s, 322)),
      botMsg(id, "Got it. The manager will reach out within the hour to confirm pickup. Anything else?", plus(s, 342),
        { intent: "booking_intent", confidence: 0.96, collectedFields: ["customerEmail"] }),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_003",
    startedAt: "2026-05-08T11:51:00-07:00",
    customerName: "Marcus Lee",
    customerPhone: "+15555550144",
    vehicleIds: ["veh_016"],
    finalTemperature: "hot",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "hi do you have an E-Class for May 20-25?", plus(s, 0)),
      botMsg(id, "Yes — Mercedes E-Class 2023 is open. $199/day, total $995 for 5 days. Pickup at LAX?", plus(s, 22),
        { intent: "availability_check", confidence: 0.95, collectedFields: ["pickupDate", "returnDate"] }),
      userMsg(id, "yeah LAX. how does it compare to the audi a6", plus(s, 58)),
      botMsg(id, "A6 2024 is $189/day, all-wheel drive, slightly newer. E-Class has the longer wheelbase and better rear seating. Tradeoff really.", plus(s, 88),
        { intent: "browsing", confidence: 0.89 }),
      userMsg(id, "ok let me think", plus(s, 134)),
      botMsg(id, "Sounds good. Want me to hold the E-Class on a 24-hour soft hold while you decide?", plus(s, 152),
        { intent: "objection", confidence: 0.84 }),
      userMsg(id, "yes please", plus(s, 178)),
      botMsg(id, "Done. Could I get your name and phone for the hold?", plus(s, 196),
        { intent: "booking_intent", confidence: 0.93, tempShift: "hot" }),
      userMsg(id, "Marcus Lee, 5555550144", plus(s, 220)),
      botMsg(id, "Holds expire end of day Saturday. The manager will reach out to confirm.", plus(s, 240),
        { intent: "booking_intent", confidence: 0.95, collectedFields: ["customerName", "customerPhone"] }),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_004",
    startedAt: "2026-05-08T13:09:00-07:00",
    customerName: "Sofia Reyes",
    customerPhone: "+15555550118",
    customerEmail: "sofia.reyes@icloud.com",
    vehicleIds: ["veh_010"],
    finalTemperature: "hot",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "hi sarah!! its sofia again. need the rav4 may 14-17", plus(s, 0)),
      botMsg(id, "Welcome back Sofia. RAV4 2024 is open — $89/day, $267 total. Pickup Santa Monica again?", plus(s, 16),
        { intent: "availability_check", confidence: 0.96 }),
      userMsg(id, "yes please", plus(s, 38)),
      botMsg(id, "Booked the soft hold. Manager will text to confirm later this afternoon.", plus(s, 56),
        { intent: "booking_intent", confidence: 0.97, tempShift: "hot" }),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_009",
    startedAt: "2026-05-08T10:02:00-07:00",
    customerName: "Camille Dubois",
    customerPhone: "+15555550107",
    customerEmail: "camille.dubois@outlook.com",
    vehicleIds: ["veh_019"],
    finalTemperature: "hot",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "Hi! We are 6 people, need a van May 16-23", plus(s, 0)),
      botMsg(id, "Toyota Sienna 2023 fits 8 — $119/day, $833 total for 7 days. Pickup spot?", plus(s, 24),
        { intent: "availability_check", confidence: 0.94, collectedFields: ["pickupDate", "returnDate"] }),
      userMsg(id, "Long Beach if possible", plus(s, 56)),
      botMsg(id, "We can deliver to Long Beach for a $40 flat fee. Does that work?", plus(s, 78),
        { intent: "pricing_inquiry", confidence: 0.91 }),
      userMsg(id, "Yes thats fine. Lock it in. Camille Dubois +1 555 555 0107", plus(s, 112)),
      botMsg(id, "Locked. Could I grab an email for the booking confirmation?", plus(s, 130),
        { intent: "booking_intent", confidence: 0.96, tempShift: "hot", collectedFields: ["customerName", "customerPhone"] }),
      userMsg(id, "camille.dubois@outlook.com", plus(s, 158)),
      botMsg(id, "Perfect. Manager will reach out today to confirm.", plus(s, 174),
        { intent: "booking_intent", confidence: 0.97, collectedFields: ["customerEmail"] }),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_026",
    startedAt: "2026-05-04T15:42:00-07:00",
    customerName: "Callum Walsh",
    customerPhone: "+15555550114",
    customerEmail: "callum.walsh@gmail.com",
    vehicleIds: ["veh_007"],
    finalTemperature: "warm",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "looking at a mazda 3 for a few days", plus(s, 0)),
      botMsg(id, "Mazda 3 2023 — $59/day. What dates?", plus(s, 18),
        { intent: "browsing", confidence: 0.88 }),
      userMsg(id, "may 10 to 13, hollywood pickup", plus(s, 42)),
      botMsg(id, "Open. Total $177. Want to lock it?", plus(s, 60),
        { intent: "availability_check", confidence: 0.93, tempShift: "warm" }),
      userMsg(id, "yeah, callum walsh, callum.walsh@gmail.com, 5555550114", plus(s, 90)),
      botMsg(id, "Got it Callum. Manager will reach out to confirm.", plus(s, 108),
        { intent: "booking_intent", confidence: 0.95, collectedFields: ["customerName", "customerPhone", "customerEmail"] }),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_041",
    startedAt: "2026-05-08T05:30:00-07:00",
    customerName: "Selene Ortiz",
    customerPhone: "+15555550111",
    vehicleIds: ["veh_004"],
    finalTemperature: "cold",
    countryCode: "MX",
    build: (id, s) => [
      userMsg(id, "do you have economy cars in july", plus(s, 0)),
      botMsg(id, "Yes — Sentra and Elantra start at $42/day in July. Specific dates?", plus(s, 22),
        { intent: "browsing", confidence: 0.86 }),
      userMsg(id, "maybe 4 to 7", plus(s, 64)),
      botMsg(id, "Both open. Want me to hold one?", plus(s, 82),
        { intent: "availability_check", confidence: 0.84 }),
      userMsg(id, "ill think about it", plus(s, 132)),
    ],
    outcome: "in_progress",
  },
  {
    id: "chat_042",
    startedAt: "2026-05-04T22:15:00-07:00",
    vehicleIds: [],
    finalTemperature: "cold",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "what time do you open tomorrow", plus(s, 0)),
      botMsg(id, "We're open Mon–Sun 8:00–22:00. Looking to rent a car?", plus(s, 14),
        { intent: "off_topic", confidence: 0.79 }),
      userMsg(id, "just wondering thanks", plus(s, 38)),
      sysMsg(id, "Conversation ended", plus(s, 200)),
    ],
    outcome: "closed",
  },
  // ─── Browse-only / abandoned (no lead) ────────────────────────────
  {
    id: "chat_051",
    startedAt: "2026-05-08T09:14:00-07:00",
    vehicleIds: [],
    finalTemperature: "cold",
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "do you do monthly rentals", plus(s, 0)),
      botMsg(id, "We do up to 30 days. Longer than that, the manager handles custom contracts. Want me to set up a callback?", plus(s, 22),
        { intent: "browsing", confidence: 0.83 }),
      userMsg(id, "no thanks", plus(s, 60)),
      sysMsg(id, "Conversation ended", plus(s, 250)),
    ],
    outcome: "closed",
  },
];

// Build a lookup of seeds by id so any lead's chat exists. For leads without a
// detailed seeded chat we synthesize a minimal 4-message conversation.
const seedById = new Map(chatSeeds.map((s) => [s.id, s]));

function synthesize(chatId: string, leadId: string): ChatSeed {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return {
      id: chatId,
      startedAt: "2026-05-07T12:00:00-07:00",
      vehicleIds: [],
      finalTemperature: "cold",
      countryCode: "US",
      build: (id, s) => [
        userMsg(id, "hi", plus(s, 0)),
        botMsg(id, "Hey — looking to rent a car?", plus(s, 12), { intent: "greeting", confidence: 0.99 }),
        sysMsg(id, "Conversation ended", plus(s, 180)),
      ],
      outcome: "closed",
    };
  }
  const v0 = lead.vehicleInterestIds[0];
  return {
    id: chatId,
    startedAt: lead.createdAt,
    customerName: lead.customerName,
    customerPhone: lead.customerPhone,
    customerEmail: lead.customerEmail,
    vehicleIds: lead.vehicleInterestIds,
    finalTemperature: lead.temperature,
    countryCode: "US",
    build: (id, s) => [
      userMsg(id, "hey looking for a car", plus(s, 0)),
      botMsg(id, `Got it. Which dates and what kind of car?`, plus(s, 16),
        { intent: "browsing", confidence: 0.9 }),
      userMsg(id, `${lead.trip.pickupDate} to ${lead.trip.returnDate}`, plus(s, 38)),
      botMsg(id, `We have a few options that fit. Want me to recommend one?`, plus(s, 58),
        { intent: "availability_check", confidence: 0.88, tempShift: lead.temperature, collectedFields: ["pickupDate", "returnDate"] }),
      userMsg(id, "yes", plus(s, 90)),
      botMsg(id, `${v0 ? "Let me pull the details now." : "I'll have the manager follow up."}`, plus(s, 108),
        { intent: "booking_intent", confidence: 0.86 }),
    ],
    outcome: "in_progress",
  };
}

const allSeeds: ChatSeed[] = [];
for (const s of chatSeeds) allSeeds.push(s);
for (const l of leads) {
  if (!seedById.has(l.chatId)) allSeeds.push(synthesize(l.chatId, l.id));
}

export const chats: Chat[] = allSeeds.map((seed) => {
  const start = new Date(seed.startedAt);
  const messages = seed.build(seed.id, start);
  const lastMessageAt = messages[messages.length - 1]?.sentAt ?? seed.startedAt;
  const endedAt = seed.outcome === "closed" ? lastMessageAt : undefined;
  const lead = leads.find((l) => l.chatId === seed.id);
  return {
    id: seed.id,
    startedAt: seed.startedAt,
    lastMessageAt,
    endedAt,
    durationSec: durationBetween(seed.startedAt, lastMessageAt),
    customerName: seed.customerName,
    customerPhone: seed.customerPhone,
    customerEmail: seed.customerEmail,
    messages,
    leadId: lead?.id,
    vehicleIdsOfInterest: seed.vehicleIds,
    finalTemperature: seed.finalTemperature,
    channel: "web_widget",
    countryCode: seed.countryCode,
    outcome: seed.outcome,
  };
});

export const chatById = (id: string) => chats.find((c) => c.id === id);

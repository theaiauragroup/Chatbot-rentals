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

const chatSeeds: ChatSeed[] = [];

// Build a lookup of seeds by id so any lead's chat exists. For leads without a
// detailed seeded chat we synthesize a minimal 4-message conversation.
const seedById = new Map(chatSeeds.map((s) => [s.id, s]));

function synthesize(chatId: string, leadId: string): ChatSeed {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return {
      id: chatId,
      startedAt: new Date().toISOString(),
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

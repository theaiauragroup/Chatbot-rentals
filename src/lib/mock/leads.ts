import type { Lead, LeadOutcome, LeadTemperature } from "../types";
import { vehicleById } from "./vehicles";
import { addDays, daysBetween } from "../utils";

interface Seed {
  id: string;
  chatId: string;
  name: string;
  phone?: string;
  email?: string;
  temp: LeadTemperature;
  outcome: LeadOutcome;
  pickup: string;
  ret: string;
  pickupLoc?: string;
  dropoffLoc?: string;
  vehicleIds: string[];
  notes?: string;
  createdAt: string;
}

function buildLead(s: Seed): Lead {
  const days = Math.max(1, daysBetween(s.pickup, s.ret));
  const primary = vehicleById(s.vehicleIds[0]);
  const dailyRate = primary?.dailyRateUsd ?? 0;
  return {
    id: s.id,
    chatId: s.chatId,
    customerName: s.name,
    customerPhone: s.phone,
    customerEmail: s.email,
    temperature: s.temp,
    outcome: s.outcome,
    trip: {
      pickupDate: s.pickup,
      returnDate: s.ret,
      pickupLocation: s.pickupLoc,
      dropoffLocation: s.dropoffLoc ?? s.pickupLoc,
    },
    vehicleInterestIds: s.vehicleIds,
    estimatedValueUsd: dailyRate * days,
    managerNotes: s.notes,
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
    source: "web_widget",
  };
}

const seeds: Seed[] = [];

export const leads: Lead[] = seeds.map(buildLead);

export const leadById = (id: string) => leads.find((l) => l.id === id);

// Helpers used by Dashboard "Today's hot leads"
export function todaysHotLeads(now: Date) {
  const ymd = now.toISOString().slice(0, 10);
  return leads.filter(
    (l) => l.temperature === "hot" && l.outcome === "open" && l.createdAt.slice(0, 10) === ymd
  );
}

// Avoid unused-var warning if `addDays` isn't used elsewhere
void addDays;

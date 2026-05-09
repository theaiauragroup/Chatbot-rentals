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

const seeds: Seed[] = [
  // ─── Hot leads (25) ───────────────────────────────────────────────
  { id: "lead_001", chatId: "chat_001", name: "Ahmed Khan", phone: "+15555550173", email: "ahmed.khan@gmail.com", temp: "hot", outcome: "working_on", pickup: "2026-05-12", ret: "2026-05-18", pickupLoc: "LAX terminal 4", vehicleIds: ["veh_015", "veh_016"], notes: "Wants confirmation by EOD. Asked about delivery to hotel.", createdAt: "2026-05-08T14:24:00-07:00" },
  { id: "lead_002", chatId: "chat_002", name: "Priya Nair", phone: "+15555550182", email: "priya.nair@outlook.com", temp: "hot", outcome: "booked", pickup: "2026-05-06", ret: "2026-05-11", pickupLoc: "Downtown LA office", vehicleIds: ["veh_003"], notes: "Booked. Picked up Tuesday morning.", createdAt: "2026-05-05T09:12:00-07:00" },
  { id: "lead_003", chatId: "chat_003", name: "Marcus Lee", phone: "+15555550144", email: "marcus.lee@proton.me", temp: "hot", outcome: "quoted", pickup: "2026-05-20", ret: "2026-05-25", pickupLoc: "LAX", vehicleIds: ["veh_016"], notes: "Comparing E-Class vs A6.", createdAt: "2026-05-08T11:51:00-07:00" },
  { id: "lead_004", chatId: "chat_004", name: "Sofia Reyes", phone: "+15555550118", email: "sofia.reyes@icloud.com", temp: "hot", outcome: "contacted", pickup: "2026-05-14", ret: "2026-05-17", pickupLoc: "Santa Monica", vehicleIds: ["veh_010"], notes: "Repeat customer.", createdAt: "2026-05-08T13:09:00-07:00" },
  { id: "lead_005", chatId: "chat_005", name: "Olivia Park", phone: "+15555550162", email: "olivia.park@gmail.com", temp: "hot", outcome: "deal_closed", pickup: "2026-04-30", ret: "2026-05-05", pickupLoc: "Burbank airport", vehicleIds: ["veh_006"], notes: "Picked up + paid in full + returned. 5-star review left.", createdAt: "2026-04-29T10:44:00-07:00" },
  { id: "lead_006", chatId: "chat_006", name: "Diego Alvarez", phone: "+15555550129", email: "diego.alvarez@gmail.com", temp: "hot", outcome: "deposit_paid", pickup: "2026-05-08", ret: "2026-05-14", pickupLoc: "LAX", vehicleIds: ["veh_013"], notes: "Deposit cleared yesterday — pickup confirmed for 09:00 today.", createdAt: "2026-05-07T16:22:00-07:00" },
  { id: "lead_007", chatId: "chat_007", name: "Hana Tanaka", phone: "+15555550155", email: "hana.tanaka@gmail.com", temp: "hot", outcome: "booked", pickup: "2026-05-12", ret: "2026-05-15", pickupLoc: "Pasadena", vehicleIds: ["veh_001"], createdAt: "2026-05-06T11:18:00-07:00" },
  { id: "lead_008", chatId: "chat_008", name: "Jordan Wright", phone: "+15555550193", email: "jordan.wright@gmail.com", temp: "hot", outcome: "in_process", pickup: "2026-05-22", ret: "2026-05-26", pickupLoc: "LAX", vehicleIds: ["veh_017"], notes: "VIP — handled by Sarah personally.", createdAt: "2026-05-08T08:34:00-07:00" },
  { id: "lead_009", chatId: "chat_009", name: "Camille Dubois", phone: "+15555550107", email: "camille.dubois@outlook.com", temp: "hot", outcome: "quoted", pickup: "2026-05-16", ret: "2026-05-23", pickupLoc: "Long Beach", vehicleIds: ["veh_019"], notes: "Family of 6 — needs van.", createdAt: "2026-05-08T10:02:00-07:00" },
  { id: "lead_010", chatId: "chat_010", name: "Noah Bennett", phone: "+15555550138", email: "noah.bennett@gmail.com", temp: "hot", outcome: "lost", pickup: "2026-05-04", ret: "2026-05-08", pickupLoc: "LAX", vehicleIds: ["veh_018"], notes: "Wanted Model S; we had maintenance overlap. Lost to Hertz.", createdAt: "2026-05-03T14:55:00-07:00" },
  { id: "lead_011", chatId: "chat_011", name: "Yuki Watanabe", phone: "+15555550174", email: "yuki.w@icloud.com", temp: "hot", outcome: "call_booked", pickup: "2026-05-19", ret: "2026-05-22", pickupLoc: "Beverly Hills", vehicleIds: ["veh_017"], notes: "Follow-up call scheduled tomorrow 14:00 to firm up Audi A6 dates.", createdAt: "2026-05-08T07:41:00-07:00" },
  { id: "lead_012", chatId: "chat_012", name: "Liam O'Connor", phone: "+15555550168", email: "liam.oconnor@proton.me", temp: "hot", outcome: "no_response", pickup: "2026-05-02", ret: "2026-05-05", pickupLoc: "LAX", vehicleIds: ["veh_007"], notes: "Sent SMS Sunday — no reply.", createdAt: "2026-05-01T09:24:00-07:00" },
  { id: "lead_013", chatId: "chat_013", name: "Aaliyah Brown", phone: "+15555550149", email: "aaliyah.brown@gmail.com", temp: "hot", outcome: "booked", pickup: "2026-05-01", ret: "2026-05-06", pickupLoc: "Glendale", vehicleIds: ["veh_011"], createdAt: "2026-04-30T13:11:00-07:00" },
  { id: "lead_014", chatId: "chat_014", name: "Rafael Costa", phone: "+15555550112", email: "rafael.costa@gmail.com", temp: "hot", outcome: "open", pickup: "2026-05-15", ret: "2026-05-18", pickupLoc: "LAX", vehicleIds: ["veh_014"], createdAt: "2026-05-08T12:20:00-07:00" },
  { id: "lead_015", chatId: "chat_015", name: "Sienna Collins", phone: "+15555550135", email: "sienna.collins@outlook.com", temp: "hot", outcome: "open", pickup: "2026-05-21", ret: "2026-05-23", pickupLoc: "Hollywood", vehicleIds: ["veh_009"], createdAt: "2026-05-08T15:45:00-07:00" },
  { id: "lead_016", chatId: "chat_016", name: "Mateo Silva", phone: "+15555550104", email: "mateo.silva@gmail.com", temp: "hot", outcome: "booked", pickup: "2026-04-26", ret: "2026-04-30", pickupLoc: "LAX", vehicleIds: ["veh_002"], createdAt: "2026-04-25T08:18:00-07:00" },
  { id: "lead_017", chatId: "chat_017", name: "Isla Foster", phone: "+15555550127", email: "isla.foster@icloud.com", temp: "hot", outcome: "lost", pickup: "2026-05-07", ret: "2026-05-10", pickupLoc: "Santa Monica", vehicleIds: ["veh_015"], notes: "Found a cheaper Audi nearby.", createdAt: "2026-05-06T11:35:00-07:00" },
  { id: "lead_018", chatId: "chat_018", name: "Theo Park", phone: "+15555550196", email: "theo.park@gmail.com", temp: "hot", outcome: "booked", pickup: "2026-05-03", ret: "2026-05-09", pickupLoc: "LAX", vehicleIds: ["veh_010"], createdAt: "2026-05-02T14:50:00-07:00" },
  { id: "lead_019", chatId: "chat_019", name: "Naomi Rivera", phone: "+15555550172", email: "naomi.rivera@gmail.com", temp: "hot", outcome: "no_response", pickup: "2026-05-13", ret: "2026-05-16", pickupLoc: "Pasadena", vehicleIds: ["veh_006"], createdAt: "2026-05-08T06:55:00-07:00" },
  { id: "lead_020", chatId: "chat_020", name: "Ezra Cohen", phone: "+15555550159", email: "ezra.cohen@proton.me", temp: "hot", outcome: "open", pickup: "2026-05-25", ret: "2026-05-30", pickupLoc: "LAX", vehicleIds: ["veh_016"], createdAt: "2026-05-08T16:15:00-07:00" },
  { id: "lead_021", chatId: "chat_021", name: "Maya Patel", phone: "+15555550141", email: "maya.patel@gmail.com", temp: "hot", outcome: "booked", pickup: "2026-04-28", ret: "2026-05-02", pickupLoc: "Burbank", vehicleIds: ["veh_004"], createdAt: "2026-04-27T09:08:00-07:00" },
  { id: "lead_022", chatId: "chat_022", name: "Adrian Reyes", phone: "+15555550185", email: "adrian.reyes@icloud.com", temp: "hot", outcome: "open", pickup: "2026-05-18", ret: "2026-05-22", pickupLoc: "LAX", vehicleIds: ["veh_011"], createdAt: "2026-05-08T13:35:00-07:00" },
  { id: "lead_023", chatId: "chat_023", name: "Eleanor Hayes", phone: "+15555550161", email: "eleanor.hayes@gmail.com", temp: "hot", outcome: "lost", pickup: "2026-05-05", ret: "2026-05-08", pickupLoc: "Long Beach", vehicleIds: ["veh_007"], createdAt: "2026-05-04T10:20:00-07:00" },
  { id: "lead_024", chatId: "chat_024", name: "Felix Andersson", phone: "+15555550133", email: "felix.andersson@gmail.com", temp: "hot", outcome: "open", pickup: "2026-05-23", ret: "2026-05-27", pickupLoc: "LAX", vehicleIds: ["veh_017"], createdAt: "2026-05-08T11:09:00-07:00" },
  { id: "lead_025", chatId: "chat_025", name: "Zoe Martinez", phone: "+15555550178", email: "zoe.martinez@outlook.com", temp: "hot", outcome: "open", pickup: "2026-05-26", ret: "2026-05-29", pickupLoc: "Santa Monica", vehicleIds: ["veh_012"], createdAt: "2026-05-08T09:48:00-07:00" },

  // ─── Warm leads (15) ──────────────────────────────────────────────
  { id: "lead_026", chatId: "chat_026", name: "Callum Walsh", phone: "+15555550114", email: "callum.walsh@gmail.com", temp: "warm", outcome: "booked", pickup: "2026-05-10", ret: "2026-05-13", pickupLoc: "Hollywood", vehicleIds: ["veh_007"], createdAt: "2026-05-04T15:42:00-07:00" },
  { id: "lead_027", chatId: "chat_027", name: "Iris Nakamura", email: "iris.nakamura@icloud.com", temp: "warm", outcome: "open", pickup: "2026-05-22", ret: "2026-05-25", vehicleIds: ["veh_006"], createdAt: "2026-05-08T10:38:00-07:00" },
  { id: "lead_028", chatId: "chat_028", name: "Harvey Singh", phone: "+15555550190", temp: "warm", outcome: "open", pickup: "2026-05-29", ret: "2026-06-02", pickupLoc: "Pasadena", vehicleIds: ["veh_011"], createdAt: "2026-05-08T07:25:00-07:00" },
  { id: "lead_029", chatId: "chat_029", name: "Ana Lima", phone: "+15555550152", email: "ana.lima@gmail.com", temp: "warm", outcome: "booked", pickup: "2026-05-09", ret: "2026-05-12", pickupLoc: "LAX", vehicleIds: ["veh_002"], createdAt: "2026-05-05T08:55:00-07:00" },
  { id: "lead_030", chatId: "chat_030", name: "Tomás Vega", phone: "+15555550109", email: "tomas.vega@outlook.com", temp: "warm", outcome: "open", pickup: "2026-05-19", ret: "2026-05-21", pickupLoc: "LAX", vehicleIds: ["veh_005"], createdAt: "2026-05-08T14:12:00-07:00" },
  { id: "lead_031", chatId: "chat_031", name: "Ruby Walker", phone: "+15555550181", email: "ruby.walker@proton.me", temp: "warm", outcome: "open", pickup: "2026-05-15", ret: "2026-05-19", pickupLoc: "Glendale", vehicleIds: ["veh_010"], createdAt: "2026-05-08T13:01:00-07:00" },
  { id: "lead_032", chatId: "chat_032", name: "Owen Carter", phone: "+15555550148", email: "owen.carter@gmail.com", temp: "warm", outcome: "lost", pickup: "2026-05-04", ret: "2026-05-07", pickupLoc: "Burbank", vehicleIds: ["veh_001"], createdAt: "2026-05-03T16:30:00-07:00" },
  { id: "lead_033", chatId: "chat_033", name: "Lucia Romano", phone: "+15555550175", email: "lucia.romano@gmail.com", temp: "warm", outcome: "open", pickup: "2026-05-30", ret: "2026-06-04", pickupLoc: "Santa Monica", vehicleIds: ["veh_014"], createdAt: "2026-05-08T11:58:00-07:00" },
  { id: "lead_034", chatId: "chat_034", name: "Ravi Mehta", phone: "+15555550120", email: "ravi.mehta@outlook.com", temp: "warm", outcome: "no_response", pickup: "2026-05-06", ret: "2026-05-09", pickupLoc: "LAX", vehicleIds: ["veh_004"], createdAt: "2026-05-04T09:11:00-07:00" },
  { id: "lead_035", chatId: "chat_035", name: "Fiona Brennan", phone: "+15555550168", email: "fiona.brennan@icloud.com", temp: "warm", outcome: "open", pickup: "2026-05-17", ret: "2026-05-20", pickupLoc: "Pasadena", vehicleIds: ["veh_009"], createdAt: "2026-05-08T08:09:00-07:00" },
  { id: "lead_036", chatId: "chat_036", name: "Pedro Ortiz", phone: "+15555550137", email: "pedro.ortiz@gmail.com", temp: "warm", outcome: "open", pickup: "2026-05-24", ret: "2026-05-27", pickupLoc: "LAX", vehicleIds: ["veh_011"], createdAt: "2026-05-08T15:21:00-07:00" },
  { id: "lead_037", chatId: "chat_037", name: "Astrid Lindqvist", email: "astrid.l@gmail.com", temp: "warm", outcome: "open", pickup: "2026-05-31", ret: "2026-06-05", vehicleIds: ["veh_014"], createdAt: "2026-05-08T12:44:00-07:00" },
  { id: "lead_038", chatId: "chat_038", name: "Daniel Park", phone: "+15555550199", email: "daniel.park@gmail.com", temp: "warm", outcome: "lost", pickup: "2026-05-02", ret: "2026-05-05", pickupLoc: "Long Beach", vehicleIds: ["veh_006"], createdAt: "2026-05-01T11:17:00-07:00" },
  { id: "lead_039", chatId: "chat_039", name: "Greta Becker", phone: "+15555550143", email: "greta.becker@outlook.com", temp: "warm", outcome: "no_response", pickup: "2026-05-11", ret: "2026-05-14", pickupLoc: "LAX", vehicleIds: ["veh_007"], createdAt: "2026-05-07T07:50:00-07:00" },
  { id: "lead_040", chatId: "chat_040", name: "Jonas Hartmann", phone: "+15555550126", email: "jonas.hartmann@proton.me", temp: "warm", outcome: "open", pickup: "2026-05-28", ret: "2026-06-02", pickupLoc: "Hollywood", vehicleIds: ["veh_010"], createdAt: "2026-05-08T16:33:00-07:00" },

  // ─── Cold leads (10) ──────────────────────────────────────────────
  { id: "lead_041", chatId: "chat_041", name: "Selene Ortiz", phone: "+15555550111", temp: "cold", outcome: "open", pickup: "2026-07-04", ret: "2026-07-07", vehicleIds: ["veh_004"], createdAt: "2026-05-08T05:30:00-07:00" },
  { id: "lead_042", chatId: "chat_042", name: "Bram Visser", email: "bram.visser@gmail.com", temp: "cold", outcome: "no_response", pickup: "2026-05-25", ret: "2026-05-28", vehicleIds: ["veh_005"], createdAt: "2026-05-04T22:15:00-07:00" },
  { id: "lead_043", chatId: "chat_043", name: "Mira Alvi", phone: "+15555550158", temp: "cold", outcome: "open", pickup: "2026-06-12", ret: "2026-06-15", vehicleIds: ["veh_002"], createdAt: "2026-05-08T18:42:00-07:00" },
  { id: "lead_044", chatId: "chat_044", name: "Henri Laurent", email: "henri.laurent@icloud.com", temp: "cold", outcome: "no_response", pickup: "2026-05-16", ret: "2026-05-18", vehicleIds: ["veh_007"], createdAt: "2026-05-05T20:08:00-07:00" },
  { id: "lead_045", chatId: "chat_045", name: "Saanvi Joshi", phone: "+15555550182", temp: "cold", outcome: "open", pickup: "2026-06-20", ret: "2026-06-23", vehicleIds: ["veh_001"], createdAt: "2026-05-08T03:20:00-07:00" },
  { id: "lead_046", chatId: "chat_046", name: "Levi Cohen", temp: "cold", outcome: "lost", pickup: "2026-05-08", ret: "2026-05-10", vehicleIds: ["veh_008"], createdAt: "2026-05-07T19:55:00-07:00" },
  { id: "lead_047", chatId: "chat_047", name: "Elena Vasquez", phone: "+15555550103", temp: "cold", outcome: "open", pickup: "2026-07-15", ret: "2026-07-22", vehicleIds: ["veh_019"], createdAt: "2026-05-08T17:12:00-07:00" },
  { id: "lead_048", chatId: "chat_048", name: "Otto Schmidt", email: "otto.schmidt@outlook.com", temp: "cold", outcome: "no_response", pickup: "2026-05-31", ret: "2026-06-02", vehicleIds: ["veh_004"], createdAt: "2026-05-04T18:33:00-07:00" },
  { id: "lead_049", chatId: "chat_049", name: "Yara El-Sayed", phone: "+15555550164", temp: "cold", outcome: "no_response", pickup: "2026-06-08", ret: "2026-06-12", vehicleIds: ["veh_011"], createdAt: "2026-05-06T21:48:00-07:00" },
  { id: "lead_050", chatId: "chat_050", name: "Wren McAllister", phone: "+15555550154", temp: "cold", outcome: "open", pickup: "2026-08-03", ret: "2026-08-09", vehicleIds: ["veh_010"], createdAt: "2026-05-08T04:14:00-07:00" },
];

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

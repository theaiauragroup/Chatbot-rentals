import type { ChartPoint, KpiSummary, PeakHourCell } from "../types";
import { addDays } from "../utils";

const TODAY = "2026-05-08";
const DAYS = 30;

// Deterministic pseudo-random (mulberry32) so every render is stable.
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeries(): ChartPoint[] {
  const rand = mulberry32(20260508);
  const out: ChartPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = addDays(TODAY, -i);
    const day = new Date(date + "T00:00:00").getDay(); // 0 Sun .. 6 Sat
    const isWeekend = day === 0 || day === 6;
    const base = isWeekend ? 28 : 18;
    const chats = Math.round(base + rand() * 14);
    const hot = Math.round(chats * (0.18 + rand() * 0.08));
    const warm = Math.round(chats * (0.30 + rand() * 0.08));
    const cold = Math.max(0, chats - hot - warm - Math.round(chats * 0.30));
    // Bookings convert from hot leads at 70–90% — keeps the funnel monotonically
    // narrowing (Chats > Leads > Hot ≥ Bookings) so drop-off math never inverts.
    const bookings = Math.max(0, Math.round(hot * (0.7 + rand() * 0.2)));
    const revenueUsd = bookings * (340 + Math.round(rand() * 220));
    out.push({ date, chats, hot, warm, cold, bookings, revenueUsd });
  }
  return out;
}

export const chartSeries30d: ChartPoint[] = buildSeries();
export const chartSeries7d: ChartPoint[] = chartSeries30d.slice(-7);
export const chartSeriesToday: ChartPoint[] = chartSeries30d.slice(-1);

function summary(series: ChartPoint[], rangeLabel: string, prev: ChartPoint[]): KpiSummary {
  const sum = (k: keyof ChartPoint) =>
    series.reduce((a, b) => a + (b[k] as number), 0);
  const prevSum = (k: keyof ChartPoint) =>
    prev.reduce((a, b) => a + (b[k] as number), 0);
  const totalChats = sum("chats");
  const hot = sum("hot");
  const warm = sum("warm");
  const cold = sum("cold");
  const bookings = sum("bookings");
  const revenue = sum("revenueUsd");
  const conv = totalChats === 0 ? 0 : (bookings / totalChats) * 100;
  const prevTotalChats = prevSum("chats");
  const prevConv =
    prevTotalChats === 0 ? 0 : (prevSum("bookings") / prevTotalChats) * 100;

  const pct = (cur: number, p: number) =>
    p === 0 ? (cur === 0 ? 0 : 100) : Math.round(((cur - p) / p) * 100);

  return {
    rangeLabel,
    totalChats,
    newLeads: { hot, warm, cold },
    conversionRatePct: Math.round(conv * 10) / 10,
    pipelineValueUsd: Math.round(revenue * 1.4), // open hot+warm forecast multiplier
    avgChatDurationSec: 272,
    bookings,
    deltas: {
      totalChats: pct(totalChats, prevTotalChats),
      newLeads: pct(hot + warm + cold, prevSum("hot") + prevSum("warm") + prevSum("cold")),
      conversionRatePct: Math.round((conv - prevConv) * 10) / 10,
      pipelineValueUsd: pct(revenue, prevSum("revenueUsd")),
      avgChatDurationSec: -8,
      bookings: pct(bookings, prevSum("bookings")),
    },
  };
}

export const kpiSummary7d = summary(
  chartSeries7d,
  "Last 7 days",
  chartSeries30d.slice(-14, -7)
);
export const kpiSummary30d = summary(
  chartSeries30d,
  "Last 30 days",
  chartSeries30d.slice(0, 0) // no prior period in mock — will show 100%
);
export const kpiSummaryToday = summary(
  chartSeriesToday,
  "Today",
  chartSeries30d.slice(-2, -1)
);

// ─── Peak hours ──────────────────────────────────────────────────────────────
export const peakHours: PeakHourCell[] = (() => {
  const out: PeakHourCell[] = [];
  const rand = mulberry32(7700);
  for (let d = 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6; d <= 6; d = (d + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    const isWeekend = d === 0 || d === 6;
    for (let h = 0; h < 24; h++) {
      let intensity = 0;
      if (h >= 0 && h < 7) intensity = 0.05 + rand() * 0.1;
      else if (h >= 7 && h < 11) intensity = 0.4 + rand() * 0.2;
      else if (h >= 11 && h < 14) intensity = 0.75 + rand() * 0.2;
      else if (h >= 14 && h < 17) intensity = 0.55 + rand() * 0.25;
      else if (h >= 17 && h < 21) intensity = 0.85 + rand() * 0.15;
      else intensity = 0.25 + rand() * 0.2;
      if (isWeekend) intensity = Math.min(1, intensity * 1.15);
      const count = Math.round(intensity * 12);
      out.push({ dayOfWeek: d, hour: h, count });
    }
  }
  return out;
})();

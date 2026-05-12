import type { ChartPoint, KpiSummary, PeakHourCell } from "../types";
import { addDays } from "../utils";

const TODAY = new Date().toISOString().slice(0, 10);
const DAYS = 30;

function buildSeries(): ChartPoint[] {
  const out: ChartPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = addDays(TODAY as any, -i);
    out.push({ date, chats: 0, hot: 0, warm: 0, cold: 0, bookings: 0, revenueUsd: 0 });
  }
  return out;
}

export const chartSeries30d: ChartPoint[] = buildSeries();
export const chartSeries7d: ChartPoint[] = chartSeries30d.slice(-7);
export const chartSeriesToday: ChartPoint[] = chartSeries30d.slice(-1);

function summary(series: ChartPoint[], rangeLabel: string, prev: ChartPoint[]): KpiSummary {
  return {
    rangeLabel,
    totalChats: 0,
    newLeads: { hot: 0, warm: 0, cold: 0 },
    conversionRatePct: 0,
    pipelineValueUsd: 0,
    avgChatDurationSec: 0,
    bookings: 0,
    deltas: {
      totalChats: 0,
      newLeads: 0,
      conversionRatePct: 0,
      pipelineValueUsd: 0,
      avgChatDurationSec: 0,
      bookings: 0,
    },
  };
}

export const kpiSummary7d = summary(chartSeries7d, "Last 7 days", []);
export const kpiSummary30d = summary(chartSeries30d, "Last 30 days", []);
export const kpiSummaryToday = summary(chartSeriesToday, "Today", []);

export const peakHours: PeakHourCell[] = [];
for (let d = 0; d <= 6; d++) {
  for (let h = 0; h < 24; h++) {
    peakHours.push({ dayOfWeek: d as any, hour: h, count: 0 });
  }
}

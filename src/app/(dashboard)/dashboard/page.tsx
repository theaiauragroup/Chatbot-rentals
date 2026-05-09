import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/charts/KpiCard";
import { ConversionFunnel } from "@/components/charts/ConversionFunnel";
import { TopCarsTable } from "@/components/charts/TopCarsTable";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { HotLeadsCard } from "@/components/dashboard/HotLeadsCard";
import {
  chartSeries7d,
  kpiSummary7d,
  liveChatsNow,
  manager,
  newLeadsLastHour,
  topPerformingCars,
} from "@/lib/mock";
import { formatDuration, formatUsd, NOW_DATE } from "@/lib/utils";

export const metadata = {
  title: "Dashboard · AIAURA FLEETS",
};

function greetingSub() {
  const h = NOW_DATE.getHours();
  if (h < 12) return "Here’s what’s happening this morning";
  if (h < 17) return "Here’s what’s happening this week";
  return "Quick recap before you log off";
}

export default function DashboardPage() {
  const series7 = chartSeries7d;
  const k = kpiSummary7d;
  const totalNewLeads = k.newLeads.hot + k.newLeads.warm + k.newLeads.cold;

  // Sparklines per KPI (7-day window)
  const sparkChats = series7.map((d) => d.chats);
  const sparkLeads = series7.map((d) => d.hot + d.warm + d.cold);
  const sparkHot = series7.map((d) => d.hot);
  const sparkConv = series7.map((d) =>
    d.chats === 0 ? 0 : (d.bookings / d.chats) * 100
  );
  const sparkBookings = series7.map((d) => d.bookings);
  const sparkRevenue = series7.map((d) => d.revenueUsd);

  // Funnel stages
  const funnelStages = [
    { label: "Chats", count: k.totalChats },
    { label: "Leads", count: totalNewLeads },
    { label: "Hot leads", count: k.newLeads.hot },
    { label: "Bookings", count: k.bookings },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting + live pill + inline meta */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2
              className="text-lg font-semibold text-fg leading-tight"
              style={{ letterSpacing: "var(--tracking-tight)" }}
            >
              Hi {manager.name.split(" ")[0]},
            </h2>
            <p className="text-xs text-fg-muted mt-0.5">{greetingSub()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              aria-label={`${liveChatsNow} live conversations, ${newLeadsLastHour} new leads in the last hour`}
              className="inline-flex items-center gap-1.5 h-6 pl-1.5 pr-2 rounded-full bg-success-soft text-success text-[11px] font-medium"
            >
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              {liveChatsNow} live · {newLeadsLastHour} new this hour
            </span>
            <Badge variant="neutral">
              Avg duration {formatDuration(k.avgChatDurationSec)}
            </Badge>
            <Badge variant="neutral">
              Open pipeline {formatUsd(k.pipelineValueUsd)}
            </Badge>
          </div>
        </div>
        {/* Subtle accent gradient bar under the header — visual flair without color noise */}
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-accent) 18%, var(--color-accent) 82%, transparent 100%)",
            opacity: 0.18,
          }}
        />
      </header>

      {/* 6 KPI tiles — each linked to its deep view */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Total chats"
          value={k.totalChats.toLocaleString()}
          delta={k.deltas.totalChats}
          spark={sparkChats}
          href="/chats"
          ariaDescription={`Total chats: ${k.totalChats}. Open chat history.`}
        />
        <KpiCard
          label="New leads"
          value={totalNewLeads.toString()}
          delta={k.deltas.newLeads}
          spark={sparkLeads}
          href="/leads"
          ariaDescription={`New leads: ${totalNewLeads} (${k.newLeads.hot} hot, ${k.newLeads.warm} warm, ${k.newLeads.cold} cold). Open leads pipeline.`}
        />
        <KpiCard
          label="Hot leads"
          value={k.newLeads.hot.toString()}
          delta={k.deltas.newLeads}
          spark={sparkHot}
          href="/leads?status=hot&outcome=open"
          ariaDescription={`Hot leads: ${k.newLeads.hot}. Open hot leads.`}
        />
        <KpiCard
          label="Conversion rate"
          value={`${k.conversionRatePct.toFixed(1)}%`}
          delta={k.deltas.conversionRatePct}
          deltaSuffix="pp"
          spark={sparkConv}
          href="/leads?outcome=booked"
          ariaDescription={`Conversion rate: ${k.conversionRatePct}%. Open booked leads.`}
        />
        <KpiCard
          label="Bookings"
          value={k.bookings.toString()}
          delta={k.deltas.bookings}
          spark={sparkBookings}
          href="/leads?outcome=booked"
          ariaDescription={`Bookings: ${k.bookings}. Open booked leads.`}
        />
        <KpiCard
          label="Pipeline value"
          value={formatUsd(k.pipelineValueUsd)}
          delta={k.deltas.pipelineValueUsd}
          spark={sparkRevenue}
          href="/leads?outcome=open"
          ariaDescription={`Pipeline value: ${formatUsd(k.pipelineValueUsd)}. Open pipeline.`}
        />
      </div>

      {/* Row A: Recent bookings (8) + Hot leads (4) — equal height boxes-in-line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-[440px]">
        <div className="lg:col-span-8 flex">
          <RecentBookings />
        </div>
        <div className="lg:col-span-4 flex">
          <HotLeadsCard />
        </div>
      </div>

      {/* Row B: Funnel (5) + Top performing cars (7) — equal height boxes-in-line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-[440px]">
        <div className="lg:col-span-5 flex">
          <ConversionFunnel
            stages={funnelStages}
            conversionPct={k.conversionRatePct}
            avgDealUsd={Math.round(k.pipelineValueUsd / Math.max(1, k.bookings))}
          />
        </div>
        <div className="lg:col-span-7 flex">
          <TopCarsTable rows={topPerformingCars} meta="Last 30 days · revenue from booked leads" />
        </div>
      </div>
    </div>
  );
}

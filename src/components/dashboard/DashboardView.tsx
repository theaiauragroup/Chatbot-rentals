"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/charts/KpiCard";
import { ConversionFunnel } from "@/components/charts/ConversionFunnel";
import { TopCarsTable } from "@/components/charts/TopCarsTable";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { HotLeadsCard } from "@/components/dashboard/HotLeadsCard";
import { manager, vehicles } from "@/lib/mock";
import { formatDuration, formatUsd, NOW_DATE } from "@/lib/utils";
import type { Lead, LeadTemperature, LeadOutcome, TopCarRow } from "@/lib/types";

export function DashboardView() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/leads");
        if (response.ok) {
          const data = await response.json();
          const rawLeads = Array.isArray(data) ? data : data.leads || [];
          const mappedLeads = rawLeads.map(mapWebhookLead);
          setLeads(mappedLeads);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  function mapWebhookLead(raw: any): Lead {
    const normalizedRaw: any = {};
    Object.keys(raw).forEach(key => normalizedRaw[key.trim()] = raw[key]);
    const find = (...keys: string[]) => {
      for (const k of keys) {
        if (normalizedRaw[k] !== undefined && normalizedRaw[k] !== null) return normalizedRaw[k];
        const variants = [k.toLowerCase(), k.toUpperCase(), k.trim(), k.replace(/ /g, '_').toLowerCase(), k.replace(/ /g, '').toLowerCase(), k.charAt(0).toUpperCase() + k.slice(1)];
        for (const v of variants) if (normalizedRaw[v] !== undefined && normalizedRaw[v] !== null) return normalizedRaw[v];
      }
      return undefined;
    };
    const nameFallback = find("Full Name", "customer_name", "name") || "Unknown";
    const phoneFallback = find("Phone Number", "phone") || "";
    return {
      id: String(find("Lead ID", "id") || `lead_${nameFallback}_${phoneFallback}`.replace(/\s+/g, '_').toLowerCase()),
      chatId: String(find("Tenant ID", "chat_id") || ""),
      customerName: nameFallback,
      customerPhone: phoneFallback,
      customerEmail: find("Email Address", "email"),
      temperature: String(find("Status", "temperature", "status") || "cold").toLowerCase() as LeadTemperature,
      outcome: String(find("Outcome", "outcome") || "open").toLowerCase() as LeadOutcome,
      trip: {
        pickupDate: find("Rental Start Date", "pickup_date") || new Date().toISOString(),
        returnDate: find("Rental End Date", "return_date") || new Date().toISOString(),
        pickupLocation: find("Pickup Location"),
        dropoffLocation: find("Drop-off Location"),
      },
      vehicleInterestIds: find("Car of Interest", "Vehicle", "Car", "Vehicle Interest", "Requested Car") 
        ? [String(find("Car of Interest", "Vehicle", "Car", "Vehicle Interest", "Requested Car"))] 
        : [],
      estimatedValueUsd: Number(String(find("Estimated Value (USD)", "Estimated Value", "value") || "0").replace(/[^0-9.]/g, '')),
      managerNotes: find("Chat Summary", "notes") || "",
      createdAt: find("Created At", "Date") || new Date().toISOString(),
      updatedAt: find("Last Activity At", "Timestamp") || new Date().toISOString(),
      source: "web_widget",
    };
  }

  // Calculate dynamic metrics
  const k = {
    totalChats: leads.length,
    newLeads: {
      hot: leads.filter(l => l.temperature === "hot").length,
      warm: leads.filter(l => l.temperature === "warm").length,
      cold: leads.filter(l => l.temperature === "cold").length,
    },
    bookings: leads.filter(l => l.outcome === "booked" || l.outcome === "deal_closed").length,
    pipelineValueUsd: leads.reduce((acc, l) => acc + (l.estimatedValueUsd || 0), 0),
    avgChatDurationSec: 0,
    conversionRatePct: leads.length > 0 ? (leads.filter(l => l.outcome === "booked").length / leads.length) * 100 : 0,
  };

  const totalNewLeads = k.newLeads.hot + k.newLeads.warm + k.newLeads.cold;

  function greetingSub() {
    const h = NOW_DATE.getHours();
    if (h < 12) return "Here’s what’s happening this morning";
    if (h < 17) return "Here’s what’s happening this week";
    return "Quick recap before you log off";
  }

  const funnelStages = [
    { label: "Chats", count: k.totalChats },
    { label: "Leads", count: totalNewLeads },
    { label: "Hot leads", count: k.newLeads.hot },
    { label: "Bookings", count: k.bookings },
  ];

  // Calculate Top Car Rows
  const topCars: TopCarRow[] = React.useMemo(() => {
    const revByVehicle = new Map<string, { revenue: number; bookings: number }>();
    leads.forEach(l => {
      if (l.outcome !== "booked" && l.outcome !== "deal_closed") return;
      const vid = l.vehicleInterestIds[0];
      if (!vid) return;
      const cur = revByVehicle.get(vid) ?? { revenue: 0, bookings: 0 };
      cur.revenue += l.estimatedValueUsd;
      cur.bookings += 1;
      revByVehicle.set(vid, cur);
    });
    return Array.from(revByVehicle.entries())
      .map(([vid, data]) => ({
        vehicle: vehicles.find(v => v.id === vid || `${v.make} ${v.model}` === vid)!,
        revenueUsd: data.revenue,
        bookings: data.bookings,
      }))
      .filter(row => !!row.vehicle)
      .sort((a, b) => b.revenueUsd - a.revenueUsd)
      .slice(0, 8);
  }, [leads]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-fg leading-tight" style={{ letterSpacing: "var(--tracking-tight)" }}>
              Hi {manager.name.split(" ")[0]},
            </h2>
            <p className="text-xs text-fg-muted mt-0.5">{greetingSub()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 h-6 pl-1.5 pr-2 rounded-full bg-success-soft text-success text-[11px] font-medium">
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              {isLoading ? "Syncing..." : "Live"}
            </span>
            <Badge variant="neutral">Open pipeline {formatUsd(k.pipelineValueUsd)}</Badge>
          </div>
        </div>
        <div aria-hidden className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, var(--color-accent) 18%, var(--color-accent) 82%, transparent 100%)", opacity: 0.18 }} />
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Total chats" value={k.totalChats.toLocaleString()} delta={0} spark={[]} href="/chats" />
        <KpiCard label="New leads" value={totalNewLeads.toString()} delta={0} spark={[]} href="/leads" />
        <KpiCard label="Hot leads" value={k.newLeads.hot.toString()} delta={0} spark={[]} href="/leads?status=hot" />
        <KpiCard label="Conversion rate" value={`${k.conversionRatePct.toFixed(1)}%`} delta={0} spark={[]} href="/leads?outcome=booked" />
        <KpiCard label="Bookings" value={k.bookings.toString()} delta={0} spark={[]} href="/leads?outcome=booked" />
        <KpiCard label="Pipeline value" value={formatUsd(k.pipelineValueUsd)} delta={0} spark={[]} href="/leads" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-[440px]">
        <div className="lg:col-span-8 flex">
          <RecentBookings leads={leads} />
        </div>
        <div className="lg:col-span-4 flex">
          <HotLeadsCard leads={leads} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-[440px]">
        <div className="lg:col-span-5 flex">
          <ConversionFunnel
            stages={funnelStages}
            conversionPct={k.conversionRatePct}
            avgDealUsd={k.bookings > 0 ? Math.round(k.pipelineValueUsd / k.bookings) : 0}
          />
        </div>
        <div className="lg:col-span-7 flex">
          <TopCarsTable rows={topCars} meta="Last 30 days · revenue from booked leads" />
        </div>
      </div>
    </div>
  );
}

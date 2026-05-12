"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  recentBookings,
  totalBookedValueUsd,
  vehicleById,
} from "@/lib/mock";
import type { Lead, Vehicle } from "@/lib/types";
import { cn, formatDate, formatUsd } from "@/lib/utils";

const FALLBACK_GRADIENTS: Record<Vehicle["category"], string> = {
  economy: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
  compact: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  suv: "linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)",
  luxury: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
  van: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
};

export function RecentBookings({ max = 6, leads: externalLeads }: { max?: number; leads?: Lead[] }) {
  const BOOKING_OUTCOMES = new Set(["booked", "deposit_paid", "deal_closed"]);
  const sourceLeads = externalLeads || recentBookings;
  
  const filtered = sourceLeads.filter(l => BOOKING_OUTCOMES.has(l.outcome))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    
  const items = filtered.slice(0, max);
  const totalValue = filtered.reduce((acc, l) => acc + l.estimatedValueUsd, 0);

  return (
    <Card className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-baseline justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-sm font-semibold text-fg">Recent bookings</h3>
          <p className="text-[11px] text-fg-subtle mt-0.5">
            {filtered.length} booked ·{" "}
            <span className="text-fg-muted">
              {formatUsd(totalValue)} booked value
            </span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="size-3" aria-hidden />
          Closed-won
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 />}
          title="No bookings yet"
          description="Booked leads will appear here as the bot closes deals."
        />
      ) : (
        <ul className="flex-1 min-h-0 overflow-y-auto border-t border-border divide-y divide-border">
          {items.map((lead) => (
            <BookingRow key={lead.id} lead={lead} />
          ))}
        </ul>
      )}
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/leads?outcome=booked"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
        >
          View all booked leads
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function BookingRow({ lead }: { lead: Lead }) {
  const vehicle = lead.vehicleInterestIds[0]
    ? vehicleById(lead.vehicleInterestIds[0])
    : undefined;

  return (
    <li>
      <Link
        href={`/leads?id=${lead.id}`}
        className="flex items-center gap-3 px-5 h-14 hover:bg-surface-2 transition-colors duration-100"
      >
        <Avatar name={lead.customerName} size="sm" />
        <PhotoThumb vehicle={vehicle} />
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-sm font-medium text-fg truncate">
            {lead.customerName}
          </p>
          <p className="text-[11px] text-fg-subtle truncate">
            {vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle TBD"}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end leading-tight shrink-0 mr-3">
          <span className="text-[11px] text-fg-muted tabular-nums whitespace-nowrap">
            {formatDate(lead.trip.pickupDate)} → {formatDate(lead.trip.returnDate)}
          </span>
        </div>
        <span className="text-sm font-semibold text-fg tabular-nums shrink-0 w-16 text-right">
          {formatUsd(lead.estimatedValueUsd)}
        </span>
      </Link>
    </li>
  );
}

function PhotoThumb({ vehicle }: { vehicle: Vehicle | undefined }) {
  const [ok, setOk] = React.useState(true);
  if (!vehicle) {
    return (
      <span className="relative w-14 h-9 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle shrink-0 border border-border">
        <Car className="size-4" aria-hidden />
      </span>
    );
  }
  const photo = vehicle.photos[0];
  return (
    <span
      className={cn(
        "relative w-14 h-9 rounded-md overflow-hidden shrink-0 border border-border"
      )}
      style={{ background: FALLBACK_GRADIENTS[vehicle.category] }}
    >
      {photo && ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`${vehicle.make} ${vehicle.model}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <Car
          aria-hidden
          className={cn(
            "absolute inset-0 m-auto size-4",
            vehicle.category === "luxury" ? "text-white/30" : "text-fg/30"
          )}
        />
      )}
    </span>
  );
}

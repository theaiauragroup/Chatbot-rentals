"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { todaysHotLeads } from "@/lib/mock";
import { vehicleById } from "@/lib/mock/vehicles";
import { formatDateRange, formatUsd, formatPhone } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";

export function HotLeadsCard() {
  const leads = todaysHotLeads;
  const toast = useToast();

  return (
    <Card className="flex flex-col flex-1 h-full">
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-fg">Today&apos;s hot leads</h3>
          <span className="text-[11px] text-fg-subtle">
            · {leads.length} open
          </span>
        </div>
      </div>
      {leads.length === 0 ? (
        <EmptyState
          icon={<Phone />}
          title="No open hot leads today"
          description="Nice clean inbox."
        />
      ) : (
        <ul className="divide-y divide-border border-t border-border flex-1">
          {leads.slice(0, 5).map((lead) => {
            const vehicle = vehicleById(lead.vehicleInterestIds[0]);
            return (
              <li
                key={lead.id}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-2 transition-colors duration-100"
              >
                <Avatar name={lead.customerName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-fg truncate">
                    {lead.customerName}
                  </p>
                  <p className="text-[11px] text-fg-subtle truncate">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle"} ·{" "}
                    {formatDateRange(lead.trip.pickupDate, lead.trip.returnDate)} ·{" "}
                    {formatUsd(lead.estimatedValueUsd)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  leadingIcon={<Phone className="size-3" />}
                  onClick={() => {
                    if (lead.customerPhone) {
                      toast.info(toasts.callPlaceholder(formatPhone(lead.customerPhone)));
                    }
                  }}
                >
                  Call
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="border-t border-border px-4 py-2">
        <Link
          href="/leads?status=hot&outcome=open"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
        >
          View all open hot leads
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

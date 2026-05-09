"use client";

import * as React from "react";
import Link from "next/link";
import { Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "./CategoryBadge";
import { VehicleStatusPill } from "@/components/leads/StatusPill";
import type { Vehicle } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

const FALLBACK_GRADIENTS: Record<Vehicle["category"], string> = {
  economy: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
  compact: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  suv: "linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)",
  luxury: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
  van: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
};

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isLuxuryDark = vehicle.category === "luxury";
  const heroPhoto = vehicle.photos[0];
  const [photoOk, setPhotoOk] = React.useState(true);

  return (
    <Link href={`/fleets/${vehicle.id}`} className="block">
      <Card variant="interactive" className="overflow-hidden">
        <div
          className="aspect-[16/10] relative"
          style={{ background: FALLBACK_GRADIENTS[vehicle.category] }}
        >
          {/* Real photo (with onError fallback to the gradient + icon below) */}
          {heroPhoto && photoOk && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroPhoto}
              alt={`${vehicle.make} ${vehicle.model}`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              onError={() => setPhotoOk(false)}
            />
          )}
          {/* Fallback Car icon when no photo / load failed */}
          {(!heroPhoto || !photoOk) && (
            <Car
              aria-hidden
              className={
                "absolute right-4 top-1/2 -translate-y-1/2 size-16 " +
                (isLuxuryDark ? "text-white/15" : "text-fg/15")
              }
            />
          )}
          {/* Status pill overlay */}
          <div className="absolute right-3 top-3">
            <VehicleStatusPill
              status={vehicle.status}
              className="bg-surface/95 backdrop-blur-sm shadow-xs"
            />
          </div>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <p className="text-sm font-semibold text-fg leading-tight">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-[11px] text-fg-subtle tabular-nums">
            {vehicle.year} · {vehicle.plate}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-fg tabular-nums">
              {formatUsd(vehicle.dailyRateUsd)}
              <span className="text-fg-subtle">/day</span>
            </span>
            <CategoryBadge category={vehicle.category} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

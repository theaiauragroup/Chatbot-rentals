"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { TopCarRow } from "@/lib/mock/aggregations";
import type { Vehicle } from "@/lib/types";
import { cn, formatUsd } from "@/lib/utils";

const FALLBACK_GRADIENTS: Record<Vehicle["category"], string> = {
  economy: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
  compact: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  suv: "linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)",
  luxury: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)",
  van: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
};

interface TopCarsTableProps {
  rows: TopCarRow[];
  meta?: string;
}

export function TopCarsTable({
  rows,
  meta = "Last 30 days",
}: TopCarsTableProps) {
  const max = Math.max(...rows.map((r) => r.revenueUsd), 1);

  return (
    <Card className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-fg">Top performing cars</h3>
          <p className="text-[11px] text-fg-subtle mt-0.5">{meta}</p>
        </div>
        <span className="text-[11px] text-fg-subtle tabular-nums">
          {rows.length} vehicle{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="flex-1 min-h-0 overflow-y-auto border-t border-border divide-y divide-border">
        {rows.map((row, i) => {
          const pct = (row.revenueUsd / max) * 100;
          const v = row.vehicle;
          const photo = v.photos[0];
          return (
            <li key={v.id}>
              <Link
                href={`/fleets/${v.id}`}
                className="flex items-center gap-3 px-5 h-[52px] hover:bg-surface-2 transition-colors duration-100"
              >
                {/* Rank */}
                <span className="text-[11px] tabular-nums text-fg-subtle w-4 text-right shrink-0">
                  {i + 1}
                </span>
                {/* Photo */}
                <PhotoThumb photo={photo} category={v.category} alt={`${v.make} ${v.model}`} />
                {/* Make + plate */}
                <div className="w-44 shrink-0 leading-tight">
                  <p className="text-sm font-medium text-fg truncate">
                    {v.make} {v.model}
                  </p>
                  <p className="text-[11px] text-fg-subtle truncate tabular-nums">
                    {v.plate} · {v.year}
                  </p>
                </div>
                {/* Bar */}
                <div className="flex-1 min-w-0 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Revenue */}
                <span className="w-20 text-right text-sm font-semibold text-fg tabular-nums shrink-0">
                  {formatUsd(row.revenueUsd)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border px-5 py-3">
        <Link
          href="/fleets"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline underline-offset-2"
        >
          View all vehicles
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function PhotoThumb({
  photo,
  category,
  alt,
}: {
  photo: string | undefined;
  category: Vehicle["category"];
  alt: string;
}) {
  const [ok, setOk] = React.useState(true);
  return (
    <span
      className={cn(
        "relative w-14 h-9 rounded-md overflow-hidden shrink-0",
        "border border-border"
      )}
      style={{ background: FALLBACK_GRADIENTS[category] }}
    >
      {photo && ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={alt}
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
            category === "luxury" ? "text-white/30" : "text-fg/30"
          )}
        />
      )}
    </span>
  );
}

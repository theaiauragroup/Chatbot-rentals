"use client";

import * as React from "react";
import {
  ChevronDown,
  MessageCircle,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn, formatUsd } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  count: number;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  conversionPct?: number;
  avgDealUsd?: number;
}

interface StageVisual {
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconFg: string;
  barOpacity: number;
}

const STAGE_VISUALS: StageVisual[] = [
  { Icon: MessageCircle, iconBg: "bg-accent", iconFg: "text-accent-fg", barOpacity: 1 },
  { Icon: Sparkles, iconBg: "bg-accent-soft", iconFg: "text-accent", barOpacity: 0.85 },
  { Icon: Flame, iconBg: "bg-hot-soft", iconFg: "text-hot", barOpacity: 0.65 },
  { Icon: CheckCircle2, iconBg: "bg-success-soft", iconFg: "text-success", barOpacity: 0.5 },
];

export function ConversionFunnel({
  stages,
  conversionPct,
  avgDealUsd,
}: ConversionFunnelProps) {
  const top = stages[0]?.count ?? 1;
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card className="p-5 flex flex-col flex-1">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-fg">Conversion funnel</h3>
        <p className="text-[11px] text-fg-subtle mt-0.5">
          Chats become leads, leads become bookings.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-1">
        {stages.map((s, i) => {
          const visual = STAGE_VISUALS[i] ?? STAGE_VISUALS[STAGE_VISUALS.length - 1];
          const widthPct = Math.max(8, (s.count / max) * 100);
          const shareOfTopPct =
            top === 0 ? 0 : Math.round((s.count / top) * 1000) / 10;
          const prior = i === 0 ? null : stages[i - 1].count;
          const delta =
            prior === null
              ? null
              : prior === 0
                ? { kind: "neutral" as const, pct: 0, abs: 0 }
                : (() => {
                    const diff = s.count - prior;
                    const pct = Math.round(Math.abs(diff / prior) * 100);
                    return diff <= 0
                      ? { kind: "drop" as const, pct, abs: -diff }
                      : { kind: "gain" as const, pct, abs: diff };
                  })();

          return (
            <div key={s.label} className="flex flex-col gap-2">
              {/* Stage row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden
                    className={cn(
                      "size-7 shrink-0 rounded-md inline-flex items-center justify-center",
                      visual.iconBg
                    )}
                  >
                    <visual.Icon className={cn("size-4", visual.iconFg)} />
                  </span>
                  <span className="text-sm font-medium text-fg truncate">
                    {s.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span
                    className="text-lg font-semibold text-fg tabular-nums leading-none"
                    style={{ letterSpacing: "var(--tracking-tight)" }}
                  >
                    {s.count.toLocaleString()}
                  </span>
                  {i > 0 && (
                    <span className="text-[11px] text-fg-subtle tabular-nums">
                      {shareOfTopPct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bar with track */}
              <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${widthPct}%`,
                    opacity: visual.barOpacity,
                  }}
                />
              </div>

              {/* Delta chip — sits between this row and the next stage */}
              {delta && i < stages.length && (
                <div className="flex items-center gap-1.5 mt-1 mb-2 ml-1 text-[11px]">
                  {delta.kind === "drop" ? (
                    <>
                      <ChevronDown className="size-3 text-fg-subtle" aria-hidden />
                      <span className="text-fg-muted">
                        <span className="font-medium tabular-nums">
                          −{delta.pct}%
                        </span>{" "}
                        drop-off
                        {delta.abs > 0 && (
                          <span className="text-fg-subtle">
                            {" "}
                            · {delta.abs} lost
                          </span>
                        )}
                      </span>
                    </>
                  ) : delta.kind === "gain" ? (
                    <>
                      <TrendingUp
                        className="size-3 text-success"
                        aria-hidden
                      />
                      <span className="text-success">
                        <span className="font-medium tabular-nums">
                          +{delta.pct}%
                        </span>{" "}
                        above prior
                      </span>
                    </>
                  ) : (
                    <span className="text-fg-subtle">No change</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(conversionPct !== undefined || avgDealUsd !== undefined) && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
          {conversionPct !== undefined && (
            <span className="text-fg-muted">
              <span className="text-fg font-semibold tabular-nums">
                {conversionPct.toFixed(1)}%
              </span>{" "}
              chats → bookings
            </span>
          )}
          {avgDealUsd !== undefined && (
            <span className="text-fg-muted">
              avg deal{" "}
              <span className="text-fg font-semibold tabular-nums">
                {formatUsd(avgDealUsd)}
              </span>
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

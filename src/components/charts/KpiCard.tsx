import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SparkLine } from "./SparkLine";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  /** signed integer percent or plain delta number; positive = "good" by default */
  delta?: number;
  /** suffix on delta (default: "%"); use "pp" for percentage points */
  deltaSuffix?: string;
  /** invert polarity color (e.g. shorter duration is "good") */
  invertPolarity?: boolean;
  spark?: number[];
  /** caption shown below the value (e.g. lead breakdown) */
  caption?: React.ReactNode;
  /** Optional href that turns the entire card into an interactive Link. */
  href?: string;
  /** Aria description hint for screen readers when href is set. */
  ariaDescription?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaSuffix = "%",
  invertPolarity = false,
  spark,
  caption,
  href,
  ariaDescription,
}: KpiCardProps) {
  const polarity =
    delta === undefined
      ? "neutral"
      : delta === 0
        ? "neutral"
        : (delta > 0) !== invertPolarity
          ? "good"
          : "bad";

  const isLink = !!href;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-fg-muted">{label}</p>
        {isLink && (
          <ArrowRight
            aria-hidden
            className="size-3 text-fg-subtle opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-[opacity,transform] duration-150"
          />
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <p
          className="text-xl font-semibold text-fg tabular-nums leading-none"
          style={{ letterSpacing: "var(--tracking-tighter)" }}
        >
          {value}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
              polarity === "good" && "bg-success-soft text-success",
              polarity === "bad" && "bg-danger-soft text-danger",
              polarity === "neutral" && "bg-surface-2 text-fg-muted"
            )}
            aria-label={`${delta > 0 ? "up" : delta < 0 ? "down" : "no change"} ${Math.abs(delta)}${deltaSuffix} versus prior period`}
          >
            {delta > 0 ? (
              <ArrowUpRight className="size-2.5" aria-hidden />
            ) : delta < 0 ? (
              <ArrowDownRight className="size-2.5" aria-hidden />
            ) : (
              <Minus className="size-2.5" aria-hidden />
            )}
            {Math.abs(delta)}
            {deltaSuffix}
          </span>
        )}
      </div>
      {caption && (
        <p className="mt-1 text-[11px] text-fg-subtle leading-tight">{caption}</p>
      )}
      {/* Sparkline pinned to bottom so all tiles align even if labels reflow. */}
      {spark && spark.length > 0 && (
        <div className="mt-auto pt-3 -mx-2">
          <SparkLine values={spark} height={28} ariaLabel={`${label} trend`} />
        </div>
      )}
    </>
  );

  const cardClass = cn(
    "p-4 h-full flex flex-col",
    isLink &&
      "group transition-[box-shadow,border-color,transform] duration-150 hover:shadow-md hover:border-border-strong hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  );

  if (isLink) {
    return (
      <Link href={href!} aria-label={ariaDescription ?? `${label}: ${value}`} className="h-full block">
        <Card className={cardClass}>{body}</Card>
      </Link>
    );
  }

  return <Card className={cardClass}>{body}</Card>;
}

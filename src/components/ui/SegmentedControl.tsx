"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption<V extends string> {
  value: V;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<V extends string> {
  value: V;
  onChange: (next: V) => void;
  options: ReadonlyArray<SegmentedControlOption<V>>;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<V extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<V>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center p-0.5 rounded-md bg-surface-2 border border-border",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-3 rounded-[5px] text-xs font-medium",
              "transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              active
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-muted hover:text-fg"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

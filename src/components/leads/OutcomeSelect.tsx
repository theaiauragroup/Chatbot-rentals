"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import type { LeadOutcome } from "@/lib/types";
import { outcomeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ORDER: LeadOutcome[] = [
  "open",
  "working_on",
  "contacted",
  "in_process",
  "quoted",
  // ─ separator ─
  "call_booked",
  "deposit_paid",
  "booked",
  "deal_closed",
  // ─ separator ─
  "lost",
  "no_response",
];

/** Leading dot colors per outcome. */
const DOT: Record<LeadOutcome, string> = {
  open: "bg-fg-subtle",
  working_on: "bg-accent",
  contacted: "bg-info",
  in_process: "bg-warning",
  quoted: "bg-warm",
  call_booked: "bg-cold",
  deposit_paid: "bg-success/70",
  booked: "bg-success",
  deal_closed: "bg-success ring-2 ring-success-soft",
  lost: "bg-danger",
  no_response: "bg-fg-muted",
};

interface OutcomeSelectProps {
  value: LeadOutcome;
  onChange: (next: LeadOutcome) => void;
  size?: "sm" | "md";
}

export function OutcomeSelect({
  value,
  onChange,
  size = "md",
}: OutcomeSelectProps) {
  const heightClass = size === "sm" ? "h-7 text-xs" : "h-9 text-sm";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5",
            heightClass,
            "bg-surface border border-border text-fg",
            "hover:border-border-strong transition-colors duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <span aria-hidden className={cn("size-1.5 rounded-full", DOT[value])} />
          {outcomeLabel(value)}
          <ChevronDown className="size-3.5 text-fg-subtle" aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={cn(
            "z-50 min-w-[200px] py-1 rounded-md bg-surface border border-border shadow-md",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          {ORDER.map((o) => {
            const active = o === value;
            // Insert dividers before the commit-progression group and the terminal group
            const isFirstCommit = o === "call_booked";
            const isFirstTerminal = o === "lost";
            return (
              <React.Fragment key={o}>
                {(isFirstCommit || isFirstTerminal) && (
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                )}
                <DropdownMenu.Item
                  onSelect={() => onChange(o)}
                  className={cn(
                    "px-3 h-8 text-sm flex items-center gap-2 outline-none cursor-pointer",
                    active ? "bg-accent-soft text-accent" : "text-fg hover:bg-surface-2"
                  )}
                >
                  <span aria-hidden className={cn("size-1.5 rounded-full", DOT[o])} />
                  <span className="flex-1">{outcomeLabel(o)}</span>
                  {active && <Check className="size-3.5 text-accent" aria-hidden />}
                </DropdownMenu.Item>
              </React.Fragment>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

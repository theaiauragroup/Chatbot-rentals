"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption<V extends string = string> {
  value: V;
  label: string;
}

interface FilterMultiSelectProps<V extends string> {
  label: string;
  options: ReadonlyArray<FilterOption<V>>;
  selected: ReadonlyArray<V>;
  onChange: (next: V[]) => void;
  className?: string;
}

export function FilterMultiSelect<V extends string>({
  label,
  options,
  selected,
  onChange,
  className,
}: FilterMultiSelectProps<V>) {
  const count = selected.length;
  const summary =
    count === 0
      ? null
      : count === 1
        ? options.find((o) => o.value === selected[0])?.label ?? null
        : `${count} selected`;

  function toggle(v: V) {
    if (selected.includes(v)) {
      onChange(selected.filter((s) => s !== v));
    } else {
      onChange([...selected, v]);
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm",
            "bg-surface border border-border text-fg-muted",
            "hover:border-border-strong hover:text-fg transition-colors duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            count > 0 && "text-fg",
            className
          )}
        >
          <span>{label}</span>
          {summary && (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-accent-soft text-accent text-[10px] font-semibold tabular-nums">
              {count}
            </span>
          )}
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className={cn(
            "z-50 min-w-[180px] py-1 rounded-md bg-surface",
            "border border-border shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <ul role="listbox" aria-multiselectable className="max-h-72 overflow-auto">
            {options.map((opt) => {
              const isOn = selected.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isOn}
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "w-full px-3 h-8 text-left text-sm flex items-center gap-2",
                      isOn ? "bg-accent-soft text-accent" : "text-fg hover:bg-surface-2"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex items-center justify-center size-4 rounded-sm border",
                        isOn
                          ? "bg-accent border-accent text-accent-fg"
                          : "border-border-strong"
                      )}
                    >
                      {isOn && <Check className="size-3" aria-hidden />}
                    </span>
                    <span className="flex-1">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {selected.length > 0 && (
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-left px-2 h-7 text-xs text-fg-muted hover:text-fg hover:bg-surface-2 rounded-sm"
              >
                Clear
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

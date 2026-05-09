"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function ChipInput({
  values,
  onChange,
  placeholder = "Type and press Enter…",
  ariaLabel,
  className,
}: ChipInputProps) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function removeAt(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 p-2 rounded-sm border border-border bg-surface",
        "focus-within:ring-2 focus-within:ring-accent transition-colors duration-100 min-h-9",
        className
      )}
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      {values.map((v, i) => (
        <span
          key={v + i}
          className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-full bg-accent-soft text-accent text-xs font-medium"
        >
          {v}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeAt(i);
            }}
            aria-label={`Remove ${v}`}
            className="size-4 inline-flex items-center justify-center rounded-full hover:bg-accent/15"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
            removeAt(values.length - 1);
          }
        }}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ""}
        aria-label={ariaLabel ?? placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-base text-fg placeholder:text-fg-subtle"
      />
    </div>
  );
}

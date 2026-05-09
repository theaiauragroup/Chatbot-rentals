"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  /** Debounce in ms; default 200. */
  debounceMs?: number;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  debounceMs = 200,
  placeholder = "Search…",
  className,
  ariaLabel,
}: SearchInputProps) {
  const [local, setLocal] = React.useState(value);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local in sync with controlled value (e.g. when URL changes externally).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal(value);
  }, [value]);

  function commit(next: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  }

  return (
    <Input
      className={cn("max-w-[320px]", className)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      value={local}
      onChange={(e) => {
        const next = e.target.value;
        setLocal(next);
        commit(next);
      }}
      leadingIcon={<Search />}
      trailingIcon={
        local ? (
          <button
            type="button"
            onClick={() => {
              setLocal("");
              if (timer.current) clearTimeout(timer.current);
              onChange("");
            }}
            aria-label="Clear search"
            className="text-fg-subtle hover:text-fg transition-colors duration-100"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : undefined
      }
    />
  );
}

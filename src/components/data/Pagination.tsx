"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (next: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-fg-muted">
      <span className="tabular-nums">
        Showing <span className="text-fg font-medium">{from}–{to}</span> of{" "}
        <span className="text-fg font-medium">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={prevDisabled}
          onClick={() => onChange(page - 1)}
          className={cn(
            "inline-flex items-center justify-center size-8 rounded-md border border-border",
            "hover:border-border-strong hover:bg-surface-2 transition-colors duration-100",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span className="px-1 tabular-nums">
          {page} of {pages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={nextDisabled}
          onClick={() => onChange(page + 1)}
          className={cn(
            "inline-flex items-center justify-center size-8 rounded-md border border-border",
            "hover:border-border-strong hover:bg-surface-2 transition-colors duration-100",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

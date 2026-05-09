"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export interface ColumnDef<Row> {
  key: string;
  label: string;
  /** Optional cell renderer; default renders String(row[key]). */
  render?: (row: Row) => React.ReactNode;
  /** Optional sort accessor; default uses row[key]. */
  sortAccessor?: (row: Row) => number | string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<Row> {
  columns: ColumnDef<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  sortKey?: string | null;
  sortDir?: SortDir;
  onSortChange?: (key: string, dir: SortDir) => void;
  empty?: React.ReactNode;
  className?: string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sortKey = null,
  sortDir = "desc",
  onSortChange,
  empty,
  className,
}: DataTableProps<Row>) {
  function toggleSort(col: ColumnDef<Row>) {
    if (!col.sortable || !onSortChange) return;
    if (sortKey === col.key) {
      onSortChange(col.key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange(col.key, "desc");
    }
  }

  return (
    <div className={cn("relative w-full overflow-x-auto", className)}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-border">
            {columns.map((col) => {
              const active = col.sortable && sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    "h-9 px-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap",
                    alignClass[col.align ?? "left"],
                    active ? "text-fg" : "text-fg-muted",
                    col.headerClassName
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={cn(
                        "inline-flex items-center gap-1 group hover:text-fg transition-colors duration-100",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      <span>{col.label}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex flex-col leading-none",
                          active ? "text-accent" : "text-fg-subtle group-hover:text-fg-muted"
                        )}
                      >
                        {active ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        ) : (
                          <ChevronDown className="size-3 opacity-60" />
                        )}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(
                  "border-b border-border transition-colors duration-100",
                  onRowClick &&
                    "cursor-pointer hover:bg-surface-2 focus-visible:outline-none focus-visible:bg-surface-2"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "h-11 px-3 text-fg align-middle",
                      "border-b border-border",
                      alignClass[col.align ?? "left"],
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : (row as unknown as Record<string, React.ReactNode>)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Generic sort helper that respects ColumnDef.sortAccessor.
 * Returns a new sorted array; original is not mutated.
 */
export function sortRows<Row>(
  rows: Row[],
  columns: ColumnDef<Row>[],
  sortKey: string | null,
  sortDir: SortDir
): Row[] {
  if (!sortKey) return rows;
  const col = columns.find((c) => c.key === sortKey);
  if (!col) return rows;
  const acc = col.sortAccessor
    ? col.sortAccessor
    : (r: Row) => (r as unknown as Record<string, unknown>)[sortKey] as number | string;
  const sign = sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = acc(a);
    const bv = acc(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
    return String(av).localeCompare(String(bv)) * sign;
  });
}

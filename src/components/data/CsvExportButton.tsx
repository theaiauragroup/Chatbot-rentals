"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CsvColumn<Row> {
  header: string;
  value: (row: Row) => string | number | undefined | null;
}

interface CsvExportButtonProps<Row> {
  rows: Row[];
  columns: CsvColumn<Row>[];
  filename: string;
  /** Variant override for the button. */
  variant?: "secondary" | "ghost";
  /** Size override. */
  size?: "sm" | "md";
  label?: string;
  onExported?: (count: number) => void;
}

function escapeCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function CsvExportButton<Row>({
  rows,
  columns,
  filename,
  variant = "secondary",
  size = "sm",
  label = "Export CSV",
  onExported,
}: CsvExportButtonProps<Row>) {
  function handle() {
    const lines: string[] = [];
    lines.push(columns.map((c) => escapeCell(c.header)).join(","));
    for (const row of rows) {
      lines.push(columns.map((c) => escapeCell(c.value(row))).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExported?.(rows.length);
  }

  return (
    <Button
      variant={variant}
      size={size}
      leadingIcon={<Download className="size-3.5" />}
      onClick={handle}
      disabled={rows.length === 0}
    >
      {label}
    </Button>
  );
}

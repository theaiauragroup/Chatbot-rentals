"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import {
  DataTable,
  sortRows,
  type ColumnDef,
  type SortDir,
} from "@/components/data/DataTable";
import { SearchInput } from "@/components/data/SearchInput";
import { FilterMultiSelect } from "@/components/data/FilterMultiSelect";
import { Pagination } from "@/components/data/Pagination";
import { CsvExportButton } from "@/components/data/CsvExportButton";
import { TemperaturePill } from "@/components/leads/StatusPill";
import { OutcomeSelect } from "@/components/leads/OutcomeSelect";
import type { Chat, LeadOutcome, LeadTemperature, Lead, Vehicle } from "@/lib/types";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatRelative,
  formatDateRange,
  formatUsd,
  cn,
} from "@/lib/utils";

const TEMPERATURE_OPTIONS = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
] as const satisfies ReadonlyArray<{ value: LeadTemperature; label: string }>;

const OUTCOME_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "working_on", label: "Working on" },
  { value: "contacted", label: "Contacted" },
  { value: "in_process", label: "In process" },
  { value: "quoted", label: "Quoted" },
  { value: "call_booked", label: "Call booked" },
  { value: "deposit_paid", label: "Deposit paid" },
  { value: "booked", label: "Booked" },
  { value: "deal_closed", label: "Deal closed" },
  { value: "lost", label: "Lost" },
  { value: "no_response", label: "No response" },
] as const satisfies ReadonlyArray<{ value: LeadOutcome; label: string }>;

const COUNTRY_LABEL: Record<string, string> = {
  US: "United States",
  MX: "Mexico",
  PK: "Pakistan",
  CA: "Canada",
  GB: "United Kingdom",
  IN: "India",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
};

const PAGE_SIZE = 25;

interface ChatsTableProps {
  chats: Chat[];
  /** Slug for CSV file naming. */
  tenantSlug: string;
  /** Map of leadId → outcome, computed server-side and passed in. */
  leadOutcomeByLeadId: Record<string, LeadOutcome>;
  leadsById: Record<string, Lead>;
  vehiclesById: Record<string, Vehicle>;
  onOpenLead: (leadId: string) => void;
}

export function ChatsTable({
  chats,
  tenantSlug,
  leadOutcomeByLeadId,
  leadsById,
  vehiclesById,
  onOpenLead,
}: ChatsTableProps) {
  const router = useRouter();
  const params = useSearchParams();

  const sort = params.get("sort") ?? "updated";
  const dir = (params.get("dir") as SortDir | null) ?? "desc";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const pathname = window.location.pathname;
    window.history.replaceState(null, "", `${pathname}?${next.toString()}`);
  }

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const columns = React.useMemo<ColumnDef<Chat>[]>(() => {
    return [
      {
        key: "id",
        label: "ID",
        sortable: true,
        width: 100,
        render: (r) => (
          <span className="text-fg-muted tabular-nums">#{r.id.replace("lead_", "L-")}</span>
        ),
      },
      {
        key: "customer",
        label: "Name",
        sortable: true,
        sortAccessor: (r) => r.customerName ?? "~",
        render: (r) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={r.customerName ?? "Anonymous"} size="sm" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-fg truncate">
                {r.customerName ?? (
                  <span className="text-fg-subtle italic">(anonymous)</span>
                )}
              </span>
              {r.customerPhone && (
                <span className="text-[11px] text-fg-subtle tabular-nums">
                  {r.customerPhone}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "vehicle",
        label: "Vehicle",
        sortable: true,
        sortAccessor: (r) => {
          const v = vehiclesById[r.vehicleIdsOfInterest[0]];
          return v ? `${v.make} ${v.model}` : "~";
        },
        render: (r) => {
          const rawId = String(r.vehicleIdsOfInterest[0] || "").trim();
          if (!rawId) return <span className="text-fg-muted text-xs">—</span>;
          const v = vehiclesById[rawId];
          return (
            <span className="text-fg-muted text-xs">
              {v ? `${v.make} ${v.model}` : rawId}
            </span>
          );
        },
      },
      {
        key: "summary",
        label: "Chat Summary",
        sortable: false,
        render: (r) => (
          <div className="max-w-[400px] truncate text-xs text-fg-muted leading-relaxed" title={r.aiSummary}>
            {r.aiSummary || <span className="italic">No summary available</span>}
          </div>
        ),
      },
    ];
  }, [vehiclesById]);

  const sorted = React.useMemo(
    () => sortRows(chats, columns, sort, dir),
    [chats, columns, sort, dir]
  );

  // ─── Paginate ─────────────────────────────────────────────────────────────
  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, lastPage);
  const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card className="overflow-hidden">
      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(r) => r.id}
        onRowClick={(r) => onOpenLead(r.id)}
        sortKey={sort}
        sortDir={dir}
        onSortChange={(k, d) => setParam({ sort: k, dir: d, page: null })}
        empty={
          <EmptyState
            icon={<MessageCircle />}
            title="No chats yet"
            description="Conversations from your widget will appear here."
          />
        }
      />
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2">
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={(p) => setParam({ page: p === 1 ? null : String(p) })}
        />
        <CsvExportButton
          rows={sorted}
          filename={`${tenantSlug}-chats.csv`}
          columns={[
            { header: "Customer", value: (r) => r.customerName ?? "" },
            { header: "Phone", value: (r) => r.customerPhone ?? "" },
            { header: "Email", value: (r) => r.customerEmail ?? "" },
            { header: "Temp", value: (r) => r.finalTemperature },
            { header: "Lead ID", value: (r) => r.leadId ?? "" },
            { header: "Last Message", value: (r) => r.lastMessageAt },
          ]}
        />
      </div>
    </Card>
  );
}

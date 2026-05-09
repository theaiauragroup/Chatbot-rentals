"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DataTable,
  sortRows,
  type ColumnDef,
  type SortDir,
} from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { CsvExportButton } from "@/components/data/CsvExportButton";
import { TemperaturePill } from "./StatusPill";
import { OutcomeSelect } from "./OutcomeSelect";
import { useLeadsStore } from "./LeadsStore";
import type { Chat, Lead, LeadOutcome, Vehicle } from "@/lib/types";
import { formatDate, formatRelative, formatUsd } from "@/lib/utils";

const PAGE_SIZE = 25;

interface LeadsTableProps {
  leads: Lead[];
  vehiclesById: Map<string, Vehicle>;
  chatsById: Map<string, Chat>;
  sort: string | null;
  dir: SortDir;
  page: number;
  tenantSlug: string;
  onSortChange: (key: string, dir: SortDir) => void;
  onPageChange: (page: number) => void;
  onOpenLead: (leadId: string) => void;
}

export function LeadsTable({
  leads,
  vehiclesById,
  chatsById,
  sort,
  dir,
  page,
  tenantSlug,
  onSortChange,
  onPageChange,
  onOpenLead,
}: LeadsTableProps) {
  const store = useLeadsStore();
  void chatsById;

  const columns = React.useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        sortAccessor: (r) => r.customerName,
        render: (r) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={r.customerName} size="sm" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-fg truncate">{r.customerName}</span>
              {r.customerPhone && (
                <span className="text-[11px] text-fg-subtle tabular-nums truncate">
                  {r.customerPhone}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "temperature",
        label: "Temp",
        sortable: true,
        sortAccessor: (r) => r.temperature,
        width: 110,
        render: (r) => <TemperaturePill temperature={r.temperature} />,
      },
      {
        key: "outcome",
        label: "Outcome",
        sortable: true,
        sortAccessor: (r) => r.outcome,
        width: 160,
        render: (r) => (
          <div onClick={(e) => e.stopPropagation()} role="presentation">
            <OutcomeSelect
              size="sm"
              value={r.outcome}
              onChange={(o: LeadOutcome) => store.setOutcome(r.id, o)}
            />
          </div>
        ),
      },
      {
        key: "vehicle",
        label: "Vehicle",
        sortable: true,
        sortAccessor: (r) => {
          const v = vehiclesById.get(r.vehicleInterestIds[0]);
          return v ? `${v.make} ${v.model}` : "~";
        },
        render: (r) => {
          const v = vehiclesById.get(r.vehicleInterestIds[0]);
          return (
            <span className="text-fg-muted text-xs">
              {v ? `${v.make} ${v.model}` : "—"}
            </span>
          );
        },
      },
      {
        key: "trip",
        label: "Trip",
        sortable: true,
        sortAccessor: (r) => r.trip.pickupDate,
        width: 170,
        render: (r) => (
          <span className="text-xs text-fg-muted tabular-nums">
            {formatDate(r.trip.pickupDate)} → {formatDate(r.trip.returnDate)}
          </span>
        ),
      },
      {
        key: "value",
        label: "Value",
        sortable: true,
        sortAccessor: (r) => r.estimatedValueUsd,
        align: "right",
        width: 110,
        render: (r) => (
          <span className="tabular-nums">{formatUsd(r.estimatedValueUsd)}</span>
        ),
      },
      {
        key: "updated",
        label: "Last activity",
        sortable: true,
        sortAccessor: (r) => r.updatedAt,
        align: "right",
        width: 130,
        render: (r) => (
          <span className="tabular-nums text-fg-muted">
            {formatRelative(r.updatedAt)}
          </span>
        ),
      },
    ],
    [vehiclesById, store]
  );

  const sorted = React.useMemo(
    () => sortRows(leads, columns, sort, dir),
    [leads, columns, sort, dir]
  );

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
        onSortChange={onSortChange}
        empty={
          <EmptyState
            icon={<Sparkles />}
            title="No leads match your filters"
            description="Adjust filters or clear them to see more."
          />
        }
      />
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2">
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={onPageChange}
        />
        <CsvExportButton
          rows={sorted}
          filename={`${tenantSlug}-leads.csv`}
          columns={[
            { header: "Customer", value: (r) => r.customerName },
            { header: "Phone", value: (r) => r.customerPhone ?? "" },
            { header: "Email", value: (r) => r.customerEmail ?? "" },
            { header: "Temperature", value: (r) => r.temperature },
            { header: "Outcome", value: (r) => r.outcome },
            { header: "Pickup", value: (r) => r.trip.pickupDate },
            { header: "Return", value: (r) => r.trip.returnDate },
            { header: "Value (USD)", value: (r) => r.estimatedValueUsd },
            { header: "Updated", value: (r) => r.updatedAt },
            { header: "Notes", value: (r) => r.managerNotes ?? "" },
          ]}
        />
      </div>
    </Card>
  );
}

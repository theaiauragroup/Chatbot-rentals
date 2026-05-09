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
import type { Chat, LeadOutcome, LeadTemperature } from "@/lib/types";
import {
  formatDate,
  formatTime,
  formatDuration,
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
}

export function ChatsTable({
  chats,
  tenantSlug,
  leadOutcomeByLeadId,
}: ChatsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // ─── Read state from URL ──────────────────────────────────────────────────
  const q = params.get("q") ?? "";
  const status = (params.get("status") ?? "")
    .split(",")
    .filter(Boolean) as LeadTemperature[];
  const outcome = (params.get("outcome") ?? "")
    .split(",")
    .filter(Boolean) as LeadOutcome[];
  const country = (params.get("country") ?? "").split(",").filter(Boolean);
  const sort = params.get("sort") ?? "startedAt";
  const dir = (params.get("dir") as SortDir | null) ?? "desc";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function setListParam(key: string, values: string[]) {
    setParam({ [key]: values.length === 0 ? null : values.join(","), page: null });
  }

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return chats.filter((c) => {
      if (status.length > 0 && !status.includes(c.finalTemperature)) return false;
      if (country.length > 0 && (!c.countryCode || !country.includes(c.countryCode)))
        return false;
      if (outcome.length > 0) {
        // Outcome on the chat is via its linked lead's outcome.
        const o = c.leadId ? leadOutcomeByLeadId[c.leadId] : undefined;
        if (!o || !outcome.includes(o)) return false;
      }
      if (ql) {
        const haystack = [
          c.customerName ?? "",
          c.customerPhone ?? "",
          c.customerEmail ?? "",
          ...c.messages.map((m) => m.text),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(ql)) return false;
      }
      return true;
    });
  }, [chats, q, status, country, outcome, leadOutcomeByLeadId]);

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const columns = React.useMemo<ColumnDef<Chat>[]>(() => {
    return [
      {
        key: "startedAt",
        label: "Started",
        sortable: true,
        sortAccessor: (r) => r.startedAt,
        width: 150,
        render: (r) => (
          <div className="flex flex-col leading-tight">
            <span className="text-fg">{formatDate(r.startedAt.slice(0, 10))}</span>
            <span className="text-[11px] text-fg-subtle tabular-nums">
              {formatTime(r.startedAt)}
            </span>
          </div>
        ),
      },
      {
        key: "customer",
        label: "Customer",
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
        key: "country",
        label: "Country",
        sortable: true,
        sortAccessor: (r) => r.countryCode ?? "~",
        width: 110,
        render: (r) =>
          r.countryCode ? (
            <span className="inline-flex items-center justify-center min-w-7 h-5 px-1.5 rounded-sm bg-surface-2 text-[11px] font-mono text-fg-muted">
              {r.countryCode}
            </span>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        key: "messages",
        label: "Msgs",
        sortable: true,
        sortAccessor: (r) => r.messages.length,
        align: "right",
        width: 70,
        render: (r) => <span className="tabular-nums">{r.messages.length}</span>,
      },
      {
        key: "temperature",
        label: "Final temp",
        sortable: true,
        sortAccessor: (r) => r.finalTemperature,
        width: 130,
        render: (r) => <TemperaturePill temperature={r.finalTemperature} />,
      },
      {
        key: "lead",
        label: "Lead",
        sortable: false,
        width: 110,
        render: (r) =>
          r.leadId ? (
            <span className="text-fg-muted tabular-nums">#{r.leadId.replace("lead_", "L-")}</span>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        key: "duration",
        label: "Duration",
        sortable: true,
        sortAccessor: (r) => r.durationSec,
        align: "right",
        width: 110,
        render: (r) => (
          <span className="tabular-nums text-fg-muted">
            {formatDuration(r.durationSec)}
          </span>
        ),
      },
    ];
  }, []);

  const sorted = React.useMemo(
    () => sortRows(filtered, columns, sort, dir),
    [filtered, columns, sort, dir]
  );

  // ─── Paginate ─────────────────────────────────────────────────────────────
  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, lastPage);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visible = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  // Country options derived from data
  const countryOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const c of chats) if (c.countryCode) set.add(c.countryCode);
    return [...set].sort().map((cc) => ({
      value: cc,
      label: `${cc} · ${COUNTRY_LABEL[cc] ?? cc}`,
    }));
  }, [chats]);

  const hasFilters = !!q || status.length > 0 || outcome.length > 0 || country.length > 0;

  function resetFilters() {
    setParam({ q: null, status: null, outcome: null, country: null, page: null });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={q}
          onChange={(v) => setParam({ q: v || null, page: null })}
          placeholder="Search name, phone, message…"
          ariaLabel="Search chats"
        />
        <FilterMultiSelect
          label="Status"
          options={[...TEMPERATURE_OPTIONS]}
          selected={status}
          onChange={(v) => setListParam("status", v)}
        />
        <FilterMultiSelect
          label="Outcome"
          options={[...OUTCOME_OPTIONS]}
          selected={outcome}
          onChange={(v) => setListParam("outcome", v)}
        />
        <FilterMultiSelect
          label="Country"
          options={countryOptions}
          selected={country}
          onChange={(v) => setListParam("country", v)}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={resetFilters}
        >
          Reset filters
        </Button>
      </div>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/chats/${r.id}`)}
          sortKey={sort}
          sortDir={dir}
          onSortChange={(k, d) => setParam({ sort: k, dir: d, page: null })}
          empty={
            <EmptyState
              icon={<MessageCircle />}
              title={
                hasFilters
                  ? "No chats match your filters"
                  : "No chats yet"
              }
              description={
                hasFilters
                  ? "Adjust filters or clear them to see more."
                  : "Conversations from your widget will appear here."
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                ) : undefined
              }
            />
          }
        />
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t border-border px-4 py-2"
          )}
        >
          <Pagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={(p) => setParam({ page: p === 1 ? null : String(p) })}
          />
          <CsvExportButton
            rows={sorted}
            filename={`${tenantSlug}-chats-${formatDate("2026-05-08")}.csv`.replace(/\s+/g, "-")}
            columns={[
              { header: "Started", value: (r) => r.startedAt },
              { header: "Customer", value: (r) => r.customerName ?? "" },
              { header: "Phone", value: (r) => r.customerPhone ?? "" },
              { header: "Email", value: (r) => r.customerEmail ?? "" },
              { header: "Country", value: (r) => r.countryCode ?? "" },
              { header: "Messages", value: (r) => r.messages.length },
              { header: "Final temperature", value: (r) => r.finalTemperature },
              { header: "Lead ID", value: (r) => r.leadId ?? "" },
              { header: "Duration (sec)", value: (r) => r.durationSec },
              {
                header: "Transcript",
                value: (r) =>
                  r.messages.map((m) => `[${m.role}] ${m.text}`).join(" | "),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

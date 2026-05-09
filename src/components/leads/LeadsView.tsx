"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchInput } from "@/components/data/SearchInput";
import { FilterMultiSelect } from "@/components/data/FilterMultiSelect";
import { KanbanBoard } from "./KanbanBoard";
import { LeadsTable } from "./LeadsTable";
import { LeadDrawer } from "./LeadDrawer";
import { LeadsProvider, useLeadsStore } from "./LeadsStore";
import type {
  Chat,
  Lead,
  LeadOutcome,
  LeadTemperature,
  Vehicle,
  VehicleCategory,
} from "@/lib/types";
import type { SortDir } from "@/components/data/DataTable";

const TEMP_OPTIONS = [
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

const CATEGORY_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "Luxury" },
  { value: "van", label: "Van" },
] as const satisfies ReadonlyArray<{ value: VehicleCategory; label: string }>;

interface LeadsViewProps {
  initialLeads: Lead[];
  initialVehicles: Vehicle[];
  chats: Chat[];
  tenantSlug: string;
}

export function LeadsView(props: LeadsViewProps) {
  return (
    <LeadsProvider
      initialLeads={props.initialLeads}
      initialVehicles={props.initialVehicles}
    >
      <LeadsViewInner chats={props.chats} tenantSlug={props.tenantSlug} />
    </LeadsProvider>
  );
}

function LeadsViewInner({
  chats,
  tenantSlug,
}: {
  chats: Chat[];
  tenantSlug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const store = useLeadsStore();

  const view = (params.get("view") ?? "kanban") as "kanban" | "table";
  const status = (params.get("status") ?? "")
    .split(",")
    .filter(Boolean) as LeadTemperature[];
  const outcome = (params.get("outcome") ?? "")
    .split(",")
    .filter(Boolean) as LeadOutcome[];
  const category = (params.get("category") ?? "")
    .split(",")
    .filter(Boolean) as VehicleCategory[];
  const q = params.get("q") ?? "";
  const id = params.get("id");
  const sort = params.get("sort") ?? "updated";
  const dir = (params.get("dir") as SortDir) ?? "desc";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const vehiclesById = React.useMemo(
    () => new Map(store.vehicles.map((v) => [v.id, v])),
    [store.vehicles]
  );
  const chatsById = React.useMemo(
    () => new Map(chats.map((c) => [c.id, c])),
    [chats]
  );

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return store.leads.filter((l) => {
      if (status.length > 0 && !status.includes(l.temperature)) return false;
      if (outcome.length > 0 && !outcome.includes(l.outcome)) return false;
      if (category.length > 0) {
        const cats = new Set(
          l.vehicleInterestIds
            .map((vid) => vehiclesById.get(vid)?.category)
            .filter((c): c is VehicleCategory => !!c)
        );
        let any = false;
        for (const c of category) if (cats.has(c)) any = true;
        if (!any) return false;
      }
      if (ql) {
        const v = vehiclesById.get(l.vehicleInterestIds[0]);
        const haystack = [
          l.customerName,
          l.customerPhone ?? "",
          l.customerEmail ?? "",
          l.managerNotes ?? "",
          v ? `${v.make} ${v.model}` : "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(ql)) return false;
      }
      return true;
    });
  }, [store.leads, q, status, outcome, category, vehiclesById]);

  const counts = React.useMemo(() => {
    const c = { hot: 0, warm: 0, cold: 0 };
    for (const l of filtered) c[l.temperature] += 1;
    return c;
  }, [filtered]);

  const hasFilters =
    !!q || status.length > 0 || outcome.length > 0 || category.length > 0;

  function reset() {
    setParam({ q: null, status: null, outcome: null, category: null, page: null });
  }

  function setListParam(key: string, values: string[]) {
    setParam({ [key]: values.length === 0 ? null : values.join(","), page: null });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className="text-lg font-semibold text-fg leading-tight"
            style={{ letterSpacing: "var(--tracking-tight)" }}
          >
            Leads
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            {filtered.length} active · {counts.hot} hot · {counts.warm} warm ·{" "}
            {counts.cold} cold
          </p>
        </div>
        <SegmentedControl
          ariaLabel="View mode"
          value={view}
          onChange={(v) => setParam({ view: v === "kanban" ? null : v, page: null })}
          options={[
            { value: "kanban", label: "Kanban", icon: <LayoutGrid className="size-3.5" /> },
            { value: "table", label: "Table", icon: <Rows3 className="size-3.5" /> },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={q}
          onChange={(v) => setParam({ q: v || null, page: null })}
          placeholder="Search name, phone, vehicle…"
          ariaLabel="Search leads"
        />
        <FilterMultiSelect
          label="Status"
          options={[...TEMP_OPTIONS]}
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
          label="Vehicle category"
          options={[...CATEGORY_OPTIONS]}
          selected={category}
          onChange={(v) => setListParam("category", v)}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={reset}
        >
          Reset filters
        </Button>
      </div>

      {/* Body */}
      {view === "kanban" ? (
        <KanbanBoard
          leads={filtered}
          vehiclesById={vehiclesById}
          chatsById={chatsById}
          onOpen={(l) => setParam({ id: l.id })}
        />
      ) : (
        <LeadsTable
          leads={filtered}
          vehiclesById={vehiclesById}
          chatsById={chatsById}
          sort={sort}
          dir={dir}
          page={page}
          tenantSlug={tenantSlug}
          onSortChange={(k, d) => setParam({ sort: k, dir: d, page: null })}
          onPageChange={(p) => setParam({ page: p === 1 ? null : String(p) })}
          onOpenLead={(leadId) => setParam({ id: leadId })}
        />
      )}

      <LeadDrawer leadId={id} onClose={() => setParam({ id: null })} />
    </div>
  );
}

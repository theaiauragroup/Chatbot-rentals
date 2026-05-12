"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3, X } from "lucide-react";
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
  const [isFetching, setIsFetching] = React.useState(store.leads.length === 0);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Fetch leads from webhook on mount
  React.useEffect(() => {
    async function fetchLeads(isSilent = false) {
      if (!isSilent) setIsFetching(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/leads");
        if (!response.ok) throw new Error(`Failed to fetch leads: ${response.status}`);
        
        const data = await response.json();
        const rawLeads = Array.isArray(data) ? data : data.leads || [];
        
        // Map webhook data to Lead interface
        const mappedLeads: Lead[] = rawLeads.map((item: any) => mapWebhookLead(item));
        
        if (mappedLeads.length > 0) {
          store.setLeads(mappedLeads);
        }
      } catch (err: any) {
        console.error("Leads fetch error:", err);
        // Only show error toast if it's not a background fetch or if we have no data
        if (!isSilent || store.leads.length === 0) {
          setFetchError(err.message || "An error occurred while fetching leads.");
        }
      } finally {
        setIsFetching(false);
      }
    }

    // Initial load
    fetchLeads();

    // Auto-refresh every 30 seconds for a 'live' feel
    const interval = setInterval(() => fetchLeads(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to map external data to internal Lead interface
  function mapWebhookLead(raw: any): Lead {
    // Debug: Log the raw data to see what column names we're getting from Google Sheets
    console.log("Mapping Lead from Google Sheets:", raw);

    // Normalize all keys in the raw object (trim spaces)
    const normalizedRaw: any = {};
    Object.keys(raw).forEach(key => {
      normalizedRaw[key.trim()] = raw[key];
    });

    // Helper to find a value in 'normalizedRaw' by checking multiple possible keys
    const find = (...keys: string[]) => {
      for (const k of keys) {
        if (normalizedRaw[k] !== undefined && normalizedRaw[k] !== null) return normalizedRaw[k];
        
        const variants = [
          k.toLowerCase(),
          k.toUpperCase(),
          k.trim(),
          k.replace(/ /g, '_').toLowerCase(),
          k.replace(/ /g, '').toLowerCase(),
          k.charAt(0).toUpperCase() + k.slice(1),
        ];

        for (const v of variants) {
          if (normalizedRaw[v] !== undefined && normalizedRaw[v] !== null) return normalizedRaw[v];
        }
      }
      return undefined;
    };

    // Generate a stable fallback ID if "Lead ID" is missing to prevent flickering on refreshes
    const nameFallback = find("Full Name", "customer_name", "name", "Full Name ") || "Unknown";
    const phoneFallback = find("Phone Number", "phone", "customerPhone", "Phone Number ") || "";
    const stableId = `lead_${nameFallback}_${phoneFallback}`.replace(/\s+/g, '_').toLowerCase();

    return {
      id: String(find("Lead ID", "id", "_id") || stableId),
      chatId: String(find("Tenant ID", "chat_id") || ""),
      customerName: nameFallback,
      customerPhone: phoneFallback,
      customerEmail: find("Email Address", "email", "customerEmail", "Email Address "),
      temperature: String(find("Status (Hot/Warm/Cold)", "temperature", "status", "Status") || "cold").toLowerCase() as LeadTemperature,
      outcome: String(find("Outcome (Open/Booked/Lost/No-response)", "outcome", "Outcome") || "open").toLowerCase() as LeadOutcome,
      trip: {
        pickupDate: find("Rental Start Date", "pickup_date", "pickup", "Rental Start Date ") || new Date().toISOString().split('T')[0],
        returnDate: find("Rental End Date", "return_date", "return", "Rental End Date ") || new Date().toISOString().split('T')[0],
        pickupLocation: find("Pickup Location", "pickup_location"),
        dropoffLocation: find("Drop-off Location", "dropoff_location"),
      },
      vehicleInterestIds: find("Car of Interest", "vehicle_ids", "Car of Interest ") 
        ? [String(find("Car of Interest", "vehicle_ids", "Car of Interest "))] 
        : [],
      estimatedValueUsd: Number(String(find("Estimated Value (USD)", "value", "Price", "Estimated Value (USD) ") || "0").replace(/[^0-9.]/g, '')),
      managerNotes: find("Chat Summary", "notes", "Chat Summary ") || "",
      createdAt: find("Created At", "created_at", "Date", "Created At ") || new Date().toISOString(),
      updatedAt: find("Last Activity At", "updated_at", "Timestamp", "Last Activity At ") || new Date().toISOString(),
      source: "web_widget",
    };
  }

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
    <div className="flex flex-col gap-4 relative">
      {/* Silent Refresh Indicator (Premium Progress Bar) */}
      {isFetching && store.leads.length > 0 && (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none">
          <div className="h-full bg-gradient-to-r from-transparent via-accent to-transparent w-full animate-progress-sliding shadow-[0_1px_10px_rgba(var(--accent-rgb),0.4)]"></div>
        </div>
      )}

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

      {/* Fetching overlay */}
      {isFetching && store.leads.length === 0 && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/20 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="size-10 border-[3px] border-accent/10 rounded-full" />
              <div className="absolute inset-0 size-10 border-[3px] border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-semibold text-accent tracking-wide uppercase">Updating Leads</p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {fetchError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-red-500 px-5 py-3 rounded-2xl text-[13px] font-semibold border border-red-100 shadow-[0_10px_40px_rgba(239,68,68,0.12)] z-50 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="size-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="opacity-90">{fetchError}</span>
          <button 
            onClick={() => setFetchError(null)} 
            className="ml-2 size-6 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

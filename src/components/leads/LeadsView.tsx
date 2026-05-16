"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

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
    fetchLeads(store.leads.length > 0);

    // Auto-refresh every 30 seconds for a 'live' feel
    const interval = setInterval(() => fetchLeads(true), 30000);
    return () => clearInterval(interval);
  }, [store.leads.length]);

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
      const allKeys = Object.keys(normalizedRaw);
      for (const k of keys) {
        const val = normalizedRaw[k];
        // 1. Try exact normalized match (case-sensitive)
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
        
        // 2. Try case-insensitive variants
        const lowerK = k.toLowerCase().trim();
        for (const rawKey of allKeys) {
          const lowerRawKey = rawKey.toLowerCase().trim();
          const rawVal = normalizedRaw[rawKey];
          if (lowerRawKey === lowerK && rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
            return rawVal;
          }
          if (lowerRawKey.replace(/[^a-z0-9]/g, '') === lowerK.replace(/[^a-z0-9]/g, '') && rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
            return rawVal;
          }
        }
      }
      return undefined;
    };

    const leadIdRaw = find("Lead ID", "id", "_id", "ID");
    const nameRaw = find("Full Name", "customer_name", "name", "Customer Name", "Name");
    const phoneRaw = find("Phone Number", "phone", "Customer Phone", "Phone");
    
    // Generate a stable fallback ID only if "Lead ID" is completely missing
    const stableId = leadIdRaw ? String(leadIdRaw) : `lead_${(nameRaw || 'anon').replace(/\s+/g, '_').toLowerCase()}_${String(phoneRaw || Date.now()).replace(/\D/g, '')}`;

    return {
      id: stableId,
      chatId: String(find("Tenant ID", "chat_id", "Session ID", "session_id") || ""),
      customerName: nameRaw ? String(nameRaw) : undefined,
      customerPhone: phoneRaw ? String(phoneRaw) : undefined,
      customerEmail: find("Email Address", "email", "Customer Email"),
      temperature: (() => {
        const t = String(find("Status (Hot/Warm/Cold)", "Status", "Temperature", "Lead Temperature", "Lead Status", "temp") || "").toLowerCase();
        if (t.includes("hot")) return "hot";
        if (t.includes("warm")) return "warm";
        if (t.includes("cold")) return "cold";
        return undefined;
      })(),
      rawStatus: find("Status (Hot/Warm/Cold)", "Status", "Temperature", "Lead Temperature", "Lead Status", "temp"),
      outcome: find("Outcome (Open/Booked/Lost/No-response)", "Outcome", "outcome", "Lead Outcome")
        ? (String(find("Outcome (Open/Booked/Lost/No-response)", "Outcome", "outcome", "Lead Outcome")).toLowerCase() as LeadOutcome)
        : undefined,
      trip: {
        pickupDate: find("Rental Start Date", "pickup_date", "Start Date", "Pickup Date"),
        returnDate: find("Rental End Date", "return_date", "End Date", "Return Date"),
        pickupLocation: find("Pickup Location"),
        dropoffLocation: find("Drop-off Location"),
      },
      vehicleInterestIds: find("Vehicle interest", "Car of Interest", "Vehicle", "Car", "Vehicle Name") 
        ? [String(find("Vehicle interest", "Car of Interest", "Vehicle", "Car", "Vehicle Name"))] 
        : [],
      estimatedValueUsd: find("Estimated Value (USD)", "Estimated Value", "value", "Value")
        ? Number(String(find("Estimated Value (USD)", "Estimated Value", "value", "Value")).replace(/[^0-9.]/g, ''))
        : undefined,
      aiSummary: find("Chat Summary", "Summary", "Conversation Summary"),
      managerNotes: find("Manager Notes", "Notes", "Internal Notes"),
      createdAt: find("Created At", "Date", "Created"),
      updatedAt: find("Last Activity At", "Timestamp", "Updated At", "Last Updated"),
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
      if (status.length > 0 && (!l.temperature || !status.includes(l.temperature))) return false;
      if (outcome.length > 0 && (!l.outcome || !outcome.includes(l.outcome))) return false;
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
    for (const l of filtered) {
      if (l.temperature) c[l.temperature] += 1;
    }
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
      {/* Background Refresh Indicator — very subtle top bar */}
      {isFetching && store.leads.length > 0 && (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none opacity-60">
          <div className="h-full bg-accent w-full animate-progress-sliding" />
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
            {isFetching && store.leads.length === 0 ? "Searching for leads..." : `${filtered.length} active · ${counts.hot} hot · ${counts.warm} warm · ${counts.cold} cold`}
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
      {isFetching && store.leads.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : view === "kanban" ? (
        hasHydrated ? (
          <KanbanBoard
            leads={filtered}
            vehiclesById={vehiclesById}
            chatsById={chatsById}
            onOpen={(l) => setParam({ id: l.id })}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        )
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

"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/data/SearchInput";
import { FilterMultiSelect } from "@/components/data/FilterMultiSelect";
import { ChatsTable } from "./ChatsTable";
import { LeadDrawer } from "../leads/LeadDrawer";
import { LeadsProvider, useLeadsStore } from "../leads/LeadsStore";
import {
  Chat,
  Lead,
  LeadOutcome,
  LeadTemperature,
  Vehicle,
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

interface ChatsViewProps {
  initialChats: Chat[];
  initialLeads: Lead[];
  initialVehicles: Vehicle[];
  tenantSlug: string;
}

export function ChatsView(props: ChatsViewProps) {
  return (
    <LeadsProvider 
      initialLeads={props.initialLeads} 
      initialVehicles={props.initialVehicles}
    >
      <ChatsViewInner {...props} />
    </LeadsProvider>
  );
}

function ChatsViewInner(props: ChatsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const store = useLeadsStore();
  
  const [chats, setChats] = React.useState<Chat[]>(props.initialChats);
  const [isInitialLoading, setIsInitialLoading] = React.useState(chats.length === 0);
  const [isBackgroundFetching, setIsBackgroundFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Use the store's leads for mapping and display
  const leads = store.leads;

  // Fetch chats and leads on mount
  React.useEffect(() => {
    async function fetchData(isSilent = false) {
      if (isSilent) setIsBackgroundFetching(true);
      else setIsInitialLoading(true);
      
      setFetchError(null);
      try {
        const [chatsRes, leadsRes] = await Promise.all([
          fetch("/api/chats"),
          fetch("/api/leads")
        ]);

        if (!chatsRes.ok) throw new Error(`Chats fetch failed: ${chatsRes.status}`);
        if (!leadsRes.ok) throw new Error(`Leads fetch failed: ${leadsRes.status}`);

        const chatsData = await chatsRes.json();
        const leadsData = await leadsRes.json();

        const rawChats = Array.isArray(chatsData) ? chatsData : chatsData.chats || [];
        const rawLeads = Array.isArray(leadsData) ? leadsData : leadsData.leads || [];

        const mappedChats: Chat[] = rawChats.map((item: any, idx: number) => mapWebhookChat(item, idx));
        const mappedLeads: Lead[] = rawLeads.map((item: any) => mapWebhookLead(item));

        setChats(mappedChats);
        store.setLeads(mappedLeads);
      } catch (err: any) {
        console.error("Data fetch error:", err);
        // Only show error on screen if we have no data at all
        if (!isSilent || chats.length === 0) {
          setFetchError(err.message || "Failed to load data.");
        }
      } finally {
        setIsInitialLoading(false);
        setIsBackgroundFetching(false);
      }
    }

    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  function mapWebhookChat(raw: any, index: number): Chat {
    const normalizedRaw: any = {};
    Object.keys(raw).forEach(key => {
      normalizedRaw[key.trim()] = raw[key];
    });

    const find = (...keys: string[]) => {
      const allKeys = Object.keys(normalizedRaw);
      for (const k of keys) {
        const val = normalizedRaw[k];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
        
        const lowerK = k.toLowerCase().trim();
        for (const rawKey of allKeys) {
          const lowerRawKey = rawKey.toLowerCase().trim();
          const rawVal = normalizedRaw[rawKey];
          if (lowerRawKey === lowerK && rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
            return rawVal;
          }
        }
      }
      return undefined;
    };

    let rawId = String(find("Lead ID", "Session ID", "id", "session_id") || `chat_${index}_${Date.now()}`);
    // Clean up #unfiltered- or session- prefixes from old data
    const id = rawId.replace(/^#?unfiltered-/, "").replace(/^session-/, "");
    const temp = (find("Status (Hot/Warm/Cold)", "Status", "Temperature", "finalTemperature") || "cold").toLowerCase();
    const leadId = find("Lead ID", "lead_id") || (id.startsWith("lead_") || id.length > 10 ? id : undefined);

    return {
      id,
      startedAt: String(find("Created At", "Date", "Started At", "timestamp") || new Date().toISOString()),
      lastMessageAt: String(find("Last Activity At", "Timestamp", "Last Activity", "updatedAt") || new Date().toISOString()),
      durationSec: Number(find("Total Days", "Duration", "duration_sec") || 0),
      customerName: find("Full Name", "Name", "Customer Name", "customer_name"),
      customerPhone: find("Phone Number", "Phone", "customer_phone", "phone"),
      customerEmail: find("Email Address", "Email", "customer_email", "email"),
      messages: [], 
      leadId,
      vehicleIdsOfInterest: find("Vehicle interest", "Vehicle", "Car", "Vehicle Name") ? [String(find("Vehicle interest", "Vehicle", "Car", "Vehicle Name"))] : [],
      finalTemperature: (temp.includes("hot") ? "hot" : temp.includes("warm") ? "warm" : "cold") as LeadTemperature,
      channel: "web_widget",
      countryCode: find("Country", "country_code"),
      aiSummary: find("Chat Summary", "Summary", "ai_summary"),
    };
  }

  function mapWebhookLead(raw: any): Lead {
    const normalizedRaw: any = {};
    Object.keys(raw).forEach(key => {
      normalizedRaw[key.trim()] = raw[key];
    });

    const find = (...keys: string[]) => {
      const allKeys = Object.keys(normalizedRaw);
      for (const k of keys) {
        const val = normalizedRaw[k];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
        const lowerK = k.toLowerCase().trim();
        for (const rawKey of allKeys) {
          const lowerRawKey = rawKey.toLowerCase().trim();
          const rawVal = normalizedRaw[rawKey];
          if (lowerRawKey === lowerK && rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") return rawVal;
        }
      }
      return undefined;
    };

    return {
      id: String(find("Lead ID", "id") || ""),
      chatId: String(find("Session ID", "session_id") || ""),
      customerName: find("Name", "Customer Name"),
      outcome: (find("Outcome") || "open").toLowerCase() as LeadOutcome,
      temperature: (find("Status", "Temperature") || "cold").toLowerCase() as LeadTemperature,
      trip: {
        pickupDate: find("Rental Start Date", "Start Date", "pickup_date"),
        returnDate: find("Rental End Date", "End Date", "return_date"),
      },
      estimatedValueUsd: Number(String(find("Estimated Value", "Value", "estimated_value") || "0").replace(/[^0-9.]/g, '')),
      vehicleInterestIds: find("Vehicle", "vehicle_id") ? [String(find("Vehicle", "vehicle_id"))] : [],
      source: "web_widget",
    };
  }

  // URL State management
  const q = params.get("q") ?? "";
  const status = (params.get("status") ?? "").split(",").filter(Boolean) as LeadTemperature[];
  const outcome = (params.get("outcome") ?? "").split(",").filter(Boolean) as LeadOutcome[];
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

  const vehiclesById: Record<string, Vehicle> = {};
  for (const v of props.initialVehicles) vehiclesById[v.id] = v;

  const leadsById: Record<string, Lead> = {};
  const leadOutcomeByLeadId: Record<string, LeadOutcome> = {};
  for (const l of leads) {
    leadsById[l.id] = l;
    if (l.outcome) leadOutcomeByLeadId[l.id] = l.outcome;
  }

  const filtered = chats.filter(c => {
    if (status.length > 0 && !status.includes(c.finalTemperature)) return false;
    if (outcome.length > 0) {
      const o = c.leadId ? leadOutcomeByLeadId[c.leadId] : undefined;
      if (!o || !outcome.includes(o)) return false;
    }
    if (q) {
      const haystack = `${c.customerName} ${c.customerPhone} ${c.id}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Silent Refresh Indicator — very subtle top bar */}
      {isBackgroundFetching && (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none opacity-60">
          <div className="h-full bg-accent w-full animate-progress-sliding" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-fg leading-tight">Chat history</h2>
        <p className="text-xs text-fg-muted mt-0.5">
          {filtered.length} conversations found
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={q}
          onChange={(v) => setParam({ q: v || null, page: null })}
          placeholder="Search name, phone, session…"
        />
        <FilterMultiSelect
          label="Status"
          options={[...TEMP_OPTIONS]}
          selected={status}
          onChange={(v) => setParam({ status: v.join(",") || null, page: null })}
        />
        <FilterMultiSelect
          label="Outcome"
          options={[...OUTCOME_OPTIONS]}
          selected={outcome}
          onChange={(v) => setParam({ outcome: v.join(",") || null, page: null })}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!q && status.length === 0 && outcome.length === 0}
          onClick={() => setParam({ q: null, status: null, outcome: null, page: null })}
        >
          Reset filters
        </Button>
      </div>

      {/* Main Table — always visible once loaded */}
      <ChatsTable
        chats={filtered}
        tenantSlug={props.tenantSlug}
        leadOutcomeByLeadId={leadOutcomeByLeadId}
        leadsById={leadsById}
        vehiclesById={vehiclesById}
        onOpenLead={(chatId) => router.push(`/chats/${chatId}`)}
      />

      {/* Initial Loading State — only shown when no data exists */}
      {isInitialLoading && chats.length === 0 && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      )}

      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-between shadow-sm border border-red-100">
          <span>{fetchError}</span>
          <button onClick={() => setFetchError(null)} className="p-1 hover:bg-red-100 rounded-md transition-colors">
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

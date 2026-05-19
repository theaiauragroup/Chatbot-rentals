"use client";

import * as React from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  Play,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  CalendarDays,
  FileText,
  Sparkles,
  Bot,
  Edit2,
  Trash2,
  Save,
  Undo
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { SearchInput } from "@/components/data/SearchInput";
import { InboundCall, OutboundCall } from "@/lib/types";
import { cn, formatDate, formatPhone } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";
import { Skeleton } from "@/components/ui/Skeleton";

function getSentimentVariant(sentiment: string): "success" | "neutral" | "danger" {
  if (sentiment === "positive") return "success";
  if (sentiment === "negative") return "danger";
  return "neutral";
}

// Robust, defensive database schema mappers for live webhooks data mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInboundCall(raw: any): InboundCall {
  const rawId = raw.id || raw["ID"] || raw["Lead ID"] || "";
  const cleanId = rawId ? String(rawId) : `call_in_${Math.random().toString(36).substring(2, 11)}`;
  return {
    id: cleanId,
    leadId: raw.leadId || raw["Lead ID"] || cleanId,
    dateCaptured: raw.dateCaptured || raw["Date Captured"] || new Date().toISOString(),
    fullName: raw.fullName || raw["Full Name"] || "Unknown Customer",
    phoneNumber: raw.phoneNumber || raw["Phone Number"] || "",
    emailAddress: raw.emailAddress || raw["Email Address"] || "",
    vehicleInterest: raw.vehicleInterest || raw["Vehicle Interest"] || "",
    rentalDates: raw.rentalDates || raw["Rental Dates"] || "",
    pickupLocation: raw.pickupLocation || raw["Pickup Location"] || "",
    dropoffLocation: raw.dropoffLocation || raw["Dropoff Location"] || "",
    callSuccessful: raw.callSuccessful !== undefined
      ? (raw.callSuccessful === true || raw.callSuccessful === "true" || raw.callSuccessful === "Success" || raw.callSuccessful === "Successful")
      : (raw["Call Successful"] === true || raw["Call Successful"] === "true" || raw["Call Successful"] === "Success" || raw["Call Successful"] === "Successful"),
    userSentiment: (raw.userSentiment || raw["User Sentiment"] || "neutral") as "positive" | "neutral" | "negative",
    transferRequested: raw.transferRequested !== undefined
      ? (raw.transferRequested === true || raw.transferRequested === "true" || raw.transferRequested === "Yes")
      : (raw["Transfer Requested"] === true || raw["Transfer Requested"] === "true" || raw["Transfer Requested"] === "Yes"),
    nextAction: raw.nextAction || raw["Next Action"] || "",
    conversationSummary: raw.conversationSummary || raw["Conversation Summary"] || "",
    callTranscript: raw.callTranscript || raw["Call Transcript"] || "",
    callSummaryAi: raw.callSummaryAi || raw["Call Summary (AI)"] || raw["Call Summary"] || "",
    leadSource: raw.leadSource || raw["Lead Source"] || "",
    status: (raw.status || raw["Status"] || "new") as "new" | "follow-up" | "closed",
    callRecordingUrl: raw.callRecordingUrl || raw["Call Recording URL"] || "",
    callDurationSec: Number(raw.callDurationSec || raw["Call Duration"] || 60),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOutboundCall(raw: any): OutboundCall {
  const rawId = raw.id || raw["ID"] || raw["Lead ID"] || "";
  const cleanId = rawId ? String(rawId) : `call_out_${Math.random().toString(36).substring(2, 11)}`;
  return {
    id: cleanId,
    leadId: raw.leadId || raw["Lead ID"] || cleanId,
    dateCaptured: raw.dateCaptured || raw["Date Captured"] || new Date().toISOString(),
    fullName: raw.fullName || raw["Full Name"] || "Unknown Customer",
    phoneNumber: raw.phoneNumber || raw["Phone Number"] || "",
    emailAddress: raw.emailAddress || raw["Email Address"] || "",
    vehicleInterest: raw.vehicleInterest || raw["Vehicle Interest"] || "",
    rentalDates: raw.rentalDates || raw["Rental Dates"] || "",
    contactMade: raw.contactMade !== undefined
      ? (raw.contactMade === true || raw.contactMade === "true" || raw.contactMade === "Yes")
      : (raw["Contact Made"] === true || raw["Contact Made"] === "true" || raw["Contact Made"] === "Yes"),
    callOutcome: (raw.callOutcome || raw["Call Outcome"] || "interested") as "interested" | "not_interested" | "no_answer" | "busy" | "scheduled_callback",
    userSentiment: (raw.userSentiment || raw["User Sentiment"] || "neutral") as "positive" | "neutral" | "negative",
    stillInterested: raw.stillInterested !== undefined
      ? (raw.stillInterested === true || raw.stillInterested === "true" || raw.stillInterested === "Yes")
      : (raw["Still Interested"] === true || raw["Still Interested"] === "true" || raw["Still Interested"] === "Yes"),
    followUpScheduled: raw.followUpScheduled || raw["Follow-up Scheduled"] || "",
    doNotCall: raw.doNotCall !== undefined
      ? (raw.doNotCall === true || raw.doNotCall === "true" || raw.doNotCall === "Yes")
      : (raw["Do Not Call"] === true || raw["Do Not Call"] === "true" || raw["Do Not Call"] === "Yes"),
    conversationSummary: raw.conversationSummary || raw["Conversation Summary"] || "",
    callTranscript: raw.callTranscript || raw["Call Transcript"] || "",
    callSummaryAi: raw.callSummaryAi || raw["Call Summary (AI)"] || raw["Call Summary"] || "",
    leadSource: raw.leadSource || raw["Lead Source"] || "",
    callRecordingUrl: raw.callRecordingUrl || raw["Call Recording URL"] || "",
    callDurationSec: Number(raw.callDurationSec || raw["Call Duration"] || 60),
  };
}

export function CallsView() {
  const [activeTab, setActiveTab] = React.useState<"inbound" | "outbound">("inbound");
  const [inboundSearch, setInboundSearch] = React.useState("");
  const [outboundSearch, setOutboundSearch] = React.useState("");
  const [selectedSentiment, setSelectedSentiment] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedOutcome, setSelectedOutcome] = React.useState<string>("all");
  
  const [inboundCalls, setInboundCalls] = React.useState<InboundCall[]>([]);
  const [outboundCalls, setOutboundCalls] = React.useState<OutboundCall[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { success, danger } = useToast();

  const fetchLiveCalls = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [inboundRes, outboundRes] = await Promise.all([
        fetch("/api/calls/inbound"),
        fetch("/api/calls/outbound")
      ]);

      let inboundData = [];
      let outboundData = [];

      if (inboundRes.ok) {
        const res = await inboundRes.json();
        inboundData = Array.isArray(res) ? res : (res.data && Array.isArray(res.data) ? res.data : []);
      } else {
        console.warn("Inbound database webhook failed to fetch:", inboundRes.status);
      }

      if (outboundRes.ok) {
        const res = await outboundRes.json();
        outboundData = Array.isArray(res) ? res : (res.data && Array.isArray(res.data) ? res.data : []);
      } else {
        console.warn("Outbound database webhook failed to fetch:", outboundRes.status);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedInbound = inboundData.map((item: any) => mapInboundCall(item));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedOutbound = outboundData.map((item: any) => mapOutboundCall(item));

      setInboundCalls(mappedInbound);
      setOutboundCalls(mappedOutbound);
      setIsLoading(false);
      
      if (mappedInbound.length > 0 || mappedOutbound.length > 0) {
        success("Loaded active live database call records successfully!");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to load call logs webhooks:", err);
      setErrorMsg("Failed to connect to the n8n database webhook endpoints.");
      setIsLoading(false);
      danger("Failed to fetch live database records.");
    }
  }, [success, danger]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      fetchLiveCalls();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchLiveCalls]);

  // Drawer state
  const [selectedInboundCall, setSelectedInboundCall] = React.useState<InboundCall | null>(null);
  const [selectedOutboundCall, setSelectedOutboundCall] = React.useState<OutboundCall | null>(null);

  // Stats calculation
  const totalInbound = inboundCalls.length;
  const inboundSuccessRate = totalInbound > 0 ? Math.round(
    (inboundCalls.filter((c) => c.callSuccessful).length / totalInbound) * 100
  ) : 0;
  const inboundAvgDuration = totalInbound > 0 ? Math.round(
    inboundCalls.reduce((acc, c) => acc + c.callDurationSec, 0) / totalInbound
  ) : 0;
  const inboundPositivePct = totalInbound > 0 ? Math.round(
    (inboundCalls.filter((c) => c.userSentiment === "positive").length / totalInbound) * 100
  ) : 0;

  const totalOutbound = outboundCalls.length;
  const outboundContactRate = totalOutbound > 0 ? Math.round(
    (outboundCalls.filter((c) => c.contactMade).length / totalOutbound) * 100
  ) : 0;
  const outboundAvgDuration = totalOutbound > 0 ? Math.round(
    outboundCalls.reduce((acc, c) => acc + c.callDurationSec, 0) / totalOutbound
  ) : 0;
  const outboundInterestRate = totalOutbound > 0 ? Math.round(
    (outboundCalls.filter((c) => c.stillInterested).length / totalOutbound) * 100
  ) : 0;

  // Filters logic
  const filteredInbound = inboundCalls.filter((call) => {
    const matchesSearch =
      call.fullName.toLowerCase().includes(inboundSearch.toLowerCase()) ||
      call.phoneNumber.includes(inboundSearch) ||
      call.id.toLowerCase().includes(inboundSearch.toLowerCase()) ||
      call.leadId.toLowerCase().includes(inboundSearch.toLowerCase());
    
    const matchesSentiment = selectedSentiment === "all" || call.userSentiment === selectedSentiment;
    const matchesStatus = selectedStatus === "all" || call.status === selectedStatus;

    return matchesSearch && matchesSentiment && matchesStatus;
  });

  const filteredOutbound = outboundCalls.filter((call) => {
    const matchesSearch =
      call.fullName.toLowerCase().includes(outboundSearch.toLowerCase()) ||
      call.phoneNumber.includes(outboundSearch) ||
      call.id.toLowerCase().includes(outboundSearch.toLowerCase()) ||
      call.leadId.toLowerCase().includes(outboundSearch.toLowerCase());

    const matchesSentiment = selectedSentiment === "all" || call.userSentiment === selectedSentiment;
    const matchesOutcome = selectedOutcome === "all" || call.callOutcome === selectedOutcome;

    return matchesSearch && matchesSentiment && matchesOutcome;
  });

  // Reset all filters
  const resetFilters = () => {
    setInboundSearch("");
    setOutboundSearch("");
    setSelectedSentiment("all");
    setSelectedStatus("all");
    setSelectedOutcome("all");
  };

  return (
    <div className="flex flex-col gap-6 relative max-w-[1440px] mx-auto pb-12">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-fg">Call Logs</h2>
          <p className="text-xs text-fg-subtle mt-1">
            Real-time visual tracking of voice engagement, transcription, and agent performance.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-surface-2 p-1 border border-border">
          <button
            onClick={() => {
              setActiveTab("inbound");
              resetFilters();
            }}
            className={cn(
              "flex items-center gap-2 h-7 px-3 text-xs font-semibold rounded-md transition-all duration-150",
              activeTab === "inbound"
                ? "bg-surface shadow-sm text-fg"
                : "text-fg-muted hover:text-fg"
            )}
          >
            <PhoneIncoming className="size-3 text-emerald-500" />
            Inbound Calls
          </button>
          <button
            onClick={() => {
              setActiveTab("outbound");
              resetFilters();
            }}
            className={cn(
              "flex items-center gap-2 h-7 px-3 text-xs font-semibold rounded-md transition-all duration-150",
              activeTab === "outbound"
                ? "bg-surface shadow-sm text-fg"
                : "text-fg-muted hover:text-fg"
            )}
          >
            <PhoneOutgoing className="size-3 text-sky-500" />
            Outbound Calls
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === "inbound" ? (
          <>
            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Total Inbound</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{totalInbound}</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">↑ 14% vs last week</span>
              </div>
              <span className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PhoneIncoming className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Call Success Rate</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{inboundSuccessRate}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Target exceeded (75%)</span>
              </div>
              <span className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Avg Duration</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{inboundAvgDuration} sec</span>
                <span className="text-[10px] text-fg-muted block mt-1">Consistent engagement</span>
              </div>
              <span className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">User Sentiment (Positive)</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{inboundPositivePct}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">High customer trust</span>
              </div>
              <span className="size-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Bot className="size-5" />
              </span>
            </Card>
          </>
        ) : (
          <>
            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Total Outbound</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{totalOutbound}</span>
                <span className="text-[10px] text-sky-500 font-semibold block mt-1">Lead follow-up calls</span>
              </div>
              <span className="size-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <PhoneOutgoing className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Contact Made Rate</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{outboundContactRate}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Excellent connection rate</span>
              </div>
              <span className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Phone className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Avg Duration</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{outboundAvgDuration} sec</span>
                <span className="text-[10px] text-fg-muted block mt-1">High contact detail rate</span>
              </div>
              <span className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="size-5" />
              </span>
            </Card>

            <Card variant="flat" className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-fg-subtle block">Still Interested Rate</span>
                <span className="text-xl font-bold text-fg block mt-1 tabular-nums">{outboundInterestRate}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Warm pipeline retention</span>
              </div>
              <span className="size-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bot className="size-5" />
              </span>
            </Card>
          </>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={activeTab === "inbound" ? inboundSearch : outboundSearch}
          onChange={(v) => activeTab === "inbound" ? setInboundSearch(v) : setOutboundSearch(v)}
          placeholder="Search name, phone, lead..."
          className="max-w-xs"
        />

        <div className="flex items-center gap-1 bg-surface border border-border rounded-md px-2 h-9 text-xs">
          <span className="text-fg-muted mr-1.5 font-medium">Sentiment:</span>
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="bg-transparent border-none text-fg font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">😊 Positive</option>
            <option value="neutral">😐 Neutral</option>
            <option value="negative">😡 Negative</option>
          </select>
        </div>

        {activeTab === "inbound" ? (
          <div className="flex items-center gap-1 bg-surface border border-border rounded-md px-2 h-9 text-xs">
            <span className="text-fg-muted mr-1.5 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-fg font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="follow-up">Follow-up</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-surface border border-border rounded-md px-2 h-9 text-xs">
            <span className="text-fg-muted mr-1.5 font-medium">Outcome:</span>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="bg-transparent border-none text-fg font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="no_answer">No Answer</option>
              <option value="busy">Busy</option>
              <option value="scheduled_callback">Callback</option>
            </select>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs"
          disabled={
            !(
              (activeTab === "inbound" ? inboundSearch : outboundSearch) ||
              selectedSentiment !== "all" ||
              (activeTab === "inbound" ? selectedStatus !== "all" : selectedOutcome !== "all")
            )
          }
        >
          Reset filters
        </Button>
      </div>

      {/* Main Table Panel */}
      <Card variant="flat" className="overflow-x-auto border border-border">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
            </div>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-b-0">
                <div className="flex flex-col gap-1.5 w-1/4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex flex-col gap-1.5 w-1/4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex gap-2 w-1/4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : errorMsg && inboundCalls.length === 0 && outboundCalls.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ShieldAlert className="size-10 text-rose-500 mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-fg">Database Webhooks Offline</p>
            <p className="text-xs text-fg-subtle mt-1.5 max-w-sm leading-relaxed">
              {errorMsg} Make sure your n8n workflows at n8n.srv1147675.hstgr.cloud are active and connected.
            </p>
            <Button size="sm" variant="primary" onClick={fetchLiveCalls} className="mt-4 flex items-center gap-2">
              <Undo className="size-3.5" />
              Retry Connection
            </Button>
          </div>
        ) : activeTab === "inbound" ? (
          filteredInbound.length === 0 ? (
            <div className="p-12 text-center">
              <Phone className="size-8 text-fg-subtle mx-auto mb-3" />
              <p className="text-sm font-semibold text-fg">No inbound calls match your filters</p>
              <Button size="sm" variant="ghost" onClick={resetFilters} className="mt-2 text-xs">
                Clear Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-fg-subtle font-semibold uppercase tracking-wider text-[10px] h-10 px-4">
                  <th className="py-2.5 px-4 font-semibold">Lead ID</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Rental Info</th>
                  <th className="py-2.5 px-4 font-semibold">Routes (Pickup / Drop)</th>
                  <th className="py-2.5 px-4 font-semibold">Metrics</th>
                  <th className="py-2.5 px-4 font-semibold text-center">AI Summary</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInbound.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedInboundCall(call)}
                    className="hover:bg-surface-2 cursor-pointer transition-colors duration-100 group h-14"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-fg-muted">
                      {call.leadId.replace("lead_", "L-")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-fg flex items-center gap-1.5">
                        {call.fullName}
                      </div>
                      <div className="text-[10px] text-fg-subtle mt-0.5 font-mono">
                        {formatPhone(call.phoneNumber)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-fg">{call.vehicleInterest}</div>
                      <div className="text-[10px] text-fg-subtle mt-0.5 flex items-center gap-1">
                        <Calendar className="size-2.5" /> {call.rentalDates}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-fg-muted leading-relaxed">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{call.pickupLocation || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="size-2.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{call.dropoffLocation || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Badge variant={call.callSuccessful ? "success" : "danger"}>
                          {call.callSuccessful ? "Success" : "Failed"}
                        </Badge>
                        <Badge variant={getSentimentVariant(call.userSentiment)}>
                          {call.userSentiment === "positive" ? "😊 Pos" : call.userSentiment === "neutral" ? "😐 Neu" : "😡 Neg"}
                        </Badge>
                        {call.transferRequested && (
                          <Badge variant="warning">Transfer</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-fg-subtle mt-1 flex items-center gap-1 font-mono">
                        <Clock className="size-2.5" /> {call.callDurationSec}s · {call.status}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-fg-muted line-clamp-2 leading-relaxed">
                        {call.conversationSummary}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {call.callRecordingUrl && (
                          <span
                            aria-hidden
                            className="size-7 rounded-full bg-accent-soft text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="size-3 fill-current" />
                          </span>
                        )}
                        <ChevronRight className="size-4 text-fg-subtle group-hover:text-fg transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredOutbound.length === 0 ? (
            <div className="p-12 text-center">
              <Phone className="size-8 text-fg-subtle mx-auto mb-3" />
              <p className="text-sm font-semibold text-fg">No outbound calls match your filters</p>
              <Button size="sm" variant="ghost" onClick={resetFilters} className="mt-2 text-xs">
                Clear Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-fg-subtle font-semibold uppercase tracking-wider text-[10px] h-10 px-4">
                  <th className="py-2.5 px-4 font-semibold">Lead ID</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Rental Info</th>
                  <th className="py-2.5 px-4 font-semibold">Call Indicators</th>
                  <th className="py-2.5 px-4 font-semibold">Outbound Outcome</th>
                  <th className="py-2.5 px-4 font-semibold text-center">AI Summary</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOutbound.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedOutboundCall(call)}
                    className="hover:bg-surface-2 cursor-pointer transition-colors duration-100 group h-14"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-fg-muted">
                      {call.leadId.replace("lead_", "L-")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-fg flex items-center gap-1.5">
                        {call.fullName}
                      </div>
                      <div className="text-[10px] text-fg-subtle mt-0.5 font-mono">
                        {formatPhone(call.phoneNumber)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-fg">{call.vehicleInterest}</div>
                      <div className="text-[10px] text-fg-subtle mt-0.5 flex items-center gap-1">
                        <Calendar className="size-2.5" /> {call.rentalDates}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Badge variant={call.contactMade ? "success" : "neutral"}>
                          {call.contactMade ? "Connected" : "No Contact"}
                        </Badge>
                        <Badge variant={call.stillInterested ? "success" : "danger"}>
                          {call.stillInterested ? "Interested" : "Cold"}
                        </Badge>
                        {call.doNotCall && (
                          <Badge variant="danger" withDot>DNC</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-fg-subtle mt-1 flex items-center gap-1 font-mono">
                        <Clock className="size-2.5" /> {call.callDurationSec}s · {call.leadSource}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <div className="font-semibold text-fg flex items-center gap-1.5">
                        <Badge variant={call.callOutcome === "interested" ? "success" : call.callOutcome === "scheduled_callback" ? "warning" : "neutral"}>
                          {call.callOutcome.replace("_", " ")}
                        </Badge>
                        <Badge variant={getSentimentVariant(call.userSentiment)}>
                          {call.userSentiment}
                        </Badge>
                      </div>
                      {call.followUpScheduled && (
                        <div className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                          <CalendarDays className="size-2.5" /> {formatDate(call.followUpScheduled, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-fg-muted line-clamp-2 leading-relaxed">
                        {call.conversationSummary}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {call.callRecordingUrl && (
                          <span
                            aria-hidden
                            className="size-7 rounded-full bg-accent-soft text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="size-3 fill-current" />
                          </span>
                        )}
                        <ChevronRight className="size-4 text-fg-subtle group-hover:text-fg transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      {/* Slide-over Call Drawer (Inbound) */}
      <Drawer
        open={!!selectedInboundCall}
        onOpenChange={(open) => {
          if (!open) setSelectedInboundCall(null);
        }}
        width="lg"
        title={
          selectedInboundCall ? (
            <span>
              Inbound Call{" "}
              <span className="text-fg-muted font-normal tabular-nums">
                #{selectedInboundCall.id.replace("call_in_", "IN-")}
              </span>
            </span>
          ) : (
            "Call Details"
          )
        }
      >
        {selectedInboundCall && (
          <CallDrawerBody
            key={selectedInboundCall.id}
            type="inbound"
            call={selectedInboundCall}
            onUpdate={async (updated) => {
              try {
                const res = await fetch("/api/calls/inbound", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated),
                });
                if (!res.ok) throw new Error("Inbound edit webhook failed");
                setInboundCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                setSelectedInboundCall(updated);
                success("Inbound call log updated successfully via database webhook!");
              } catch (err) {
                console.error(err);
                danger("Failed to update inbound call log on database webhook.");
              }
            }}
            onDelete={async (id) => {
              try {
                const originalCall = inboundCalls.find((c) => c.id === id);
                const res = await fetch("/api/calls/inbound", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    id, 
                    leadId: originalCall?.leadId || id 
                  }),
                });
                if (!res.ok) throw new Error("Inbound delete webhook failed");
                setInboundCalls((prev) => prev.filter((c) => c.id !== id));
                setSelectedInboundCall(null);
                success("Inbound call log deleted successfully from database webhook!");
              } catch (err) {
                console.error(err);
                danger("Failed to delete inbound call log from database webhook.");
              }
            }}
          />
        )}
      </Drawer>

      {/* Slide-over Call Drawer (Outbound) */}
      <Drawer
        open={!!selectedOutboundCall}
        onOpenChange={(open) => {
          if (!open) setSelectedOutboundCall(null);
        }}
        width="lg"
        title={
          selectedOutboundCall ? (
            <span>
              Outbound Call{" "}
              <span className="text-fg-muted font-normal tabular-nums">
                #{selectedOutboundCall.id.replace("call_out_", "OUT-")}
              </span>
            </span>
          ) : (
            "Call Details"
          )
        }
      >
        {selectedOutboundCall && (
          <CallDrawerBody
            key={selectedOutboundCall.id}
            type="outbound"
            call={selectedOutboundCall}
            onUpdate={async (updated) => {
              try {
                const res = await fetch("/api/calls/outbound", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated),
                });
                if (!res.ok) throw new Error("Outbound edit webhook failed");
                setOutboundCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                setSelectedOutboundCall(updated);
                success("Outbound call log updated successfully via database webhook!");
              } catch (err) {
                console.error(err);
                danger("Failed to update outbound call log on database webhook.");
              }
            }}
            onDelete={async (id) => {
              try {
                const originalCall = outboundCalls.find((c) => c.id === id);
                const res = await fetch("/api/calls/outbound", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    id, 
                    leadId: originalCall?.leadId || id 
                  }),
                });
                if (!res.ok) throw new Error("Outbound delete webhook failed");
                setOutboundCalls((prev) => prev.filter((c) => c.id !== id));
                setSelectedOutboundCall(null);
                success("Outbound call log deleted successfully from database webhook!");
              } catch (err) {
                console.error(err);
                danger("Failed to delete outbound call log from database webhook.");
              }
            }}
          />
        )}
      </Drawer>
    </div>
  );
}

/* Call Drawer Body and fully interactive audio player with Edit, Update, and Delete actions */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CallDrawerBody({
  type,
  call,
  onUpdate,
  onDelete
}: {
  type: "inbound" | "outbound";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (updated: any) => void;
  onDelete: (id: string) => void;
}) {
  // Editing & deletion confirmation states
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(call);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const { success, danger } = useToast();

  return (
    <div className="px-5 py-4 flex flex-col gap-5 text-xs max-h-full overflow-y-auto pb-16">
      
      {/* 3 Buttons Toolbar (Edit, Delete, Update) */}
      <div className="flex flex-col gap-3 shrink-0">
        {isEditing ? (
          <div className="flex gap-2 justify-end w-full">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setFormData(call);
              }}
              className="flex items-center gap-1.5"
            >
              <Undo className="size-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={async () => {
                await onUpdate(formData);
                setIsEditing(false);
              }}
              className="flex items-center gap-1.5"
            >
              <Save className="size-3.5 text-accent-fg" />
              Update (Save)
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 justify-end w-full">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5"
            >
              <Edit2 className="size-3.5 text-accent" />
              Edit Log
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            >
              <Trash2 className="size-3.5" />
              Delete Log
            </Button>
          </div>
        )}

        {/* Delete Confirmation Alert Card */}
        {showDeleteConfirm && (
          <Card variant="flat" className="p-3 bg-rose-50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/40 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
              <ShieldAlert className="size-4 shrink-0 animate-bounce" />
              <span>Delete Call Log?</span>
            </div>
            <p className="text-[11px] text-fg-muted">
              Are you sure you want to delete this call log? This will remove it from the active dashboard feed.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await onDelete(call.id);
                }}
              >
                Yes, Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Customer Header card */}
      {isEditing ? (
        <div className="flex flex-col gap-3 bg-surface p-3.5 rounded-lg border border-border shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-fg font-semibold border-b border-border pb-2 mb-1">
            <User className="size-4 text-accent" />
            <span>Edit Contact & Sentiment</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2.5 py-1.5 text-xs text-fg font-mono focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Email Address</label>
              <input
                type="text"
                value={formData.emailAddress || ""}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">User Sentiment</label>
              <select
                value={formData.userSentiment}
                onChange={(e) => setFormData({ ...formData, userSentiment: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2.5 py-1.5 text-xs text-fg font-semibold focus:outline-none focus:border-accent"
              >
                <option value="positive">😊 Positive</option>
                <option value="neutral">😐 Neutral</option>
                <option value="negative">😡 Negative</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-surface p-3.5 rounded-lg border border-border shadow-sm shrink-0">
          <span aria-hidden className="size-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
            <User className="size-5" />
          </span>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-semibold text-fg truncate">
              {call.fullName}
            </p>
            <p className="text-xs text-fg-subtle mt-1 font-mono">
              {formatPhone(call.phoneNumber)} {call.emailAddress && `· ${call.emailAddress}`}
            </p>
            <div className="flex flex-wrap gap-1 mt-2.5">
              <Badge variant={getSentimentVariant(call.userSentiment)}>Sentiment: {call.userSentiment}</Badge>
              {type === "inbound" ? (
                <>
                  <Badge variant={call.callSuccessful ? "success" : "danger"}>
                    {call.callSuccessful ? "Successful" : "Unsuccessful"}
                  </Badge>
                  <Badge variant="neutral">{call.status} Inbound</Badge>
                </>
              ) : (
                <>
                  <Badge variant={call.contactMade ? "success" : "neutral"}>
                    {call.contactMade ? "Connected" : "No Contact"}
                  </Badge>
                  <Badge variant={call.stillInterested ? "success" : "danger"}>
                    {call.stillInterested ? "Interested" : "Cold"}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Recording Player */}
      <Card variant="flat" className="p-4 border border-border bg-gradient-to-r from-surface to-surface-2 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 mb-3">
          <Bot className="size-3.5 text-accent animate-pulse" />
          <span className="text-[10px] font-bold text-fg-muted uppercase tracking-wider">Call Recording Player</span>
        </div>

        {call.callRecordingUrl ? (
          <div className="w-full">
            <audio
              src={call.callRecordingUrl}
              controls
              className="w-full h-10 outline-none bg-surface/50 rounded border border-border/80 focus:ring-1 focus:ring-accent"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 border border-dashed border-border rounded text-fg-subtle">
            <ShieldAlert className="size-4" />
            <span>Recording unavailable (No answer / Voicemail left)</span>
          </div>
        )}
      </Card>

      {/* AI summaries section */}
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          {/* Call Summary (human perspective) */}
          <Card variant="flat" className="p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-fg font-semibold border-b border-border pb-1.5">
              <FileText className="size-3.5 text-accent" />
              <span>Call Summary</span>
            </div>
            <textarea
              value={formData.conversationSummary || ""}
              onChange={(e) => setFormData({ ...formData, conversationSummary: e.target.value })}
              className="w-full min-h-[90px] bg-surface-2 border border-border rounded p-2 text-xs text-fg focus:outline-none focus:border-accent resize-y leading-relaxed"
            />
          </Card>

          {/* AI Call Analysis */}
          <Card variant="flat" className="p-3.5 flex flex-col gap-2 bg-accent-soft/20 border-accent-soft">
            <div className="flex items-center gap-1.5 text-accent font-semibold border-b border-accent-soft pb-1.5">
              <Sparkles className="size-3.5 text-accent" />
              <span>AI Call Insights</span>
            </div>
            <textarea
              value={formData.callSummaryAi || ""}
              onChange={(e) => setFormData({ ...formData, callSummaryAi: e.target.value })}
              className="w-full min-h-[90px] bg-surface-2 border border-border rounded p-2 text-xs text-fg focus:outline-none focus:border-accent resize-y leading-relaxed"
            />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          {/* Call Summary (human perspective) */}
          <Card variant="flat" className="p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-fg font-semibold border-b border-border pb-1.5">
              <FileText className="size-3.5 text-accent" />
              <span>Call Summary</span>
            </div>
            <p className="text-fg-muted leading-relaxed font-normal">
              {call.conversationSummary || "No summary captured."}
            </p>
          </Card>

          {/* AI Call Analysis */}
          <Card variant="flat" className="p-3.5 flex flex-col gap-2 bg-accent-soft/20 border-accent-soft">
            <div className="flex items-center gap-1.5 text-accent font-semibold border-b border-accent-soft pb-1.5">
              <Sparkles className="size-3.5 text-accent" />
              <span>AI Call Insights</span>
            </div>
            <p className="text-fg-muted leading-relaxed font-normal">
              {call.callSummaryAi || "AI Summary not yet populated."}
            </p>
          </Card>
        </div>
      )}

      {/* Grid Specs of columns */}
      {isEditing ? (
        <Card variant="flat" className="p-3.5 shrink-0">
          <div className="font-semibold text-fg mb-3 border-b border-border pb-1.5">
            Edit Metadata Columns
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 leading-relaxed">
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Lead ID</label>
              <input
                type="text"
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg font-mono focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Date Captured</label>
              <input
                type="text"
                value={formData.dateCaptured}
                onChange={(e) => setFormData({ ...formData, dateCaptured: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Lead Source</label>
              <input
                type="text"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Vehicle Interest</label>
              <input
                type="text"
                value={formData.vehicleInterest}
                onChange={(e) => setFormData({ ...formData, vehicleInterest: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Rental Dates</label>
              <input
                type="text"
                value={formData.rentalDates}
                onChange={(e) => setFormData({ ...formData, rentalDates: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Duration (seconds)</label>
              <input
                type="number"
                value={formData.callDurationSec}
                onChange={(e) => setFormData({ ...formData, callDurationSec: Number(e.target.value) })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg font-mono focus:outline-none focus:border-accent"
              />
            </div>

            {/* Conditional Inbound/Outbound specs */}
            {type === "inbound" ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickupLocation || ""}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Dropoff Location</label>
                  <input
                    type="text"
                    value={formData.dropoffLocation || ""}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Successful</label>
                  <select
                    value={formData.callSuccessful ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, callSuccessful: e.target.value === "true" })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="true">Successful</option>
                    <option value="false">Unsuccessful</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Transfer Requested</label>
                  <select
                    value={formData.transferRequested ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, transferRequested: e.target.value === "true" })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Next Action</label>
                  <input
                    type="text"
                    value={formData.nextAction || ""}
                    onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                    className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg font-semibold focus:outline-none focus:border-accent w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="new">New</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Outcome</label>
                  <select
                    value={formData.callOutcome}
                    onChange={(e) => setFormData({ ...formData, callOutcome: e.target.value })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="interested">interested</option>
                    <option value="not_interested">not interested</option>
                    <option value="no_answer">no answer</option>
                    <option value="busy">busy</option>
                    <option value="scheduled_callback">scheduled callback</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Still Interested</label>
                  <select
                    value={formData.stillInterested ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, stillInterested: e.target.value === "true" })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Follow-up Scheduled</label>
                  <input
                    type="text"
                    value={formData.followUpScheduled || ""}
                    onChange={(e) => setFormData({ ...formData, followUpScheduled: e.target.value })}
                    placeholder="e.g. 2026-05-20T10:00:00Z"
                    className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Do Not Call (DNC)</label>
                  <select
                    value={formData.doNotCall ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, doNotCall: e.target.value === "true" })}
                    className="bg-surface-2 border border-border rounded px-2.5 py-1 text-xs text-fg focus:outline-none focus:border-accent"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Recording URL</label>
              <input
                type="text"
                value={formData.callRecordingUrl || ""}
                onChange={(e) => setFormData({ ...formData, callRecordingUrl: e.target.value })}
                className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-fg font-mono focus:outline-none focus:border-accent w-full"
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="flat" className="p-3.5 shrink-0">
          <div className="font-semibold text-fg mb-3 border-b border-border pb-1.5">
            Metadata columns
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 leading-relaxed">
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Lead ID</dt>
              <dd className="text-fg font-mono mt-0.5">{call.leadId}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Date Captured</dt>
              <dd className="text-fg mt-0.5">{formatDate(call.dateCaptured, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Lead Source</dt>
              <dd className="text-fg mt-0.5">{call.leadSource}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Vehicle Interest</dt>
              <dd className="text-fg mt-0.5">{call.vehicleInterest}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Rental Dates</dt>
              <dd className="text-fg mt-0.5">{call.rentalDates}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Duration</dt>
              <dd className="text-fg mt-0.5 font-mono">{call.callDurationSec} seconds</dd>
            </div>

            {/* Conditional Inbound/Outbound specs */}
            {type === "inbound" ? (
              <>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Pickup Location</dt>
                  <dd className="text-fg mt-0.5">{call.pickupLocation || "N/A"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Dropoff Location</dt>
                  <dd className="text-fg mt-0.5">{call.dropoffLocation || "N/A"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Transfer Requested</dt>
                  <dd className="text-fg mt-0.5">{call.transferRequested ? "⚠️ Yes" : "No"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Next Action</dt>
                  <dd className="text-fg mt-0.5 font-medium text-accent">{call.nextAction || "N/A"}</dd>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Call Outcome</dt>
                  <dd className="text-fg capitalize mt-0.5">{call.callOutcome.replace("_", " ")}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Still Interested</dt>
                  <dd className="text-fg mt-0.5">{call.stillInterested ? "✅ Yes" : "No"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Follow-up Scheduled</dt>
                  <dd className="text-fg mt-0.5">
                    {call.followUpScheduled ? formatDate(call.followUpScheduled, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-fg-subtle text-[10px] uppercase font-bold tracking-wider">Do Not Call (DNC)</dt>
                  <dd className="text-fg mt-0.5 font-semibold text-rose-500">{call.doNotCall ? "🚨 Yes (DNC Activated)" : "No"}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>
      )}

      {/* Call Transcript Section */}
      {isEditing ? (
        <Card variant="flat" className="p-4 shrink-0">
          <div className="font-semibold text-fg mb-4 border-b border-border pb-1.5 flex items-center gap-1.5">
            <Phone className="size-3.5 text-accent" />
            <span>Edit Call Transcript</span>
          </div>
          <textarea
            value={formData.callTranscript || ""}
            onChange={(e) => setFormData({ ...formData, callTranscript: e.target.value })}
            className="w-full min-h-[160px] bg-surface-2 border border-border rounded p-2.5 text-xs text-fg font-mono focus:outline-none focus:border-accent resize-y leading-relaxed"
            placeholder="[00:12] Concierge: Hello! How can I help you?&#10;[00:25] Customer: Hi, I'm interested in renting..."
          />
        </Card>
      ) : (
        <Card variant="flat" className="p-4 shrink-0">
          <div className="font-semibold text-fg mb-4 border-b border-border pb-1.5 flex items-center gap-1.5">
            <Phone className="size-3.5 text-accent animate-pulse" />
            <span>Call Transcript History</span>
          </div>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
            {call.callTranscript ? (
              call.callTranscript.split("\n").map((line: string, idx: number) => {
                const matches = line.match(/^\[([^\]]+)\]\s+([^:]+):\s+(.*)$/);
                if (matches) {
                  const [, time, speaker, content] = matches;
                  const isAI = speaker.toLowerCase().includes("ai") || speaker.toLowerCase().includes("concierge");
                  
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col gap-1 max-w-[85%] rounded-lg p-2.5 leading-relaxed font-normal shadow-sm",
                        isAI
                          ? "bg-accent-soft/30 text-fg self-start border border-accent-soft/40"
                          : "bg-surface-2 text-fg-muted self-end border border-border"
                      )}
                    >
                      <div className="flex items-center justify-between gap-8 mb-0.5">
                        <span className="font-bold text-[10px] uppercase text-fg-subtle">
                          {speaker}
                        </span>
                        <span className="text-[9px] text-fg-subtle font-mono">
                          {time}
                        </span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed">{content}</p>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="p-2 bg-surface text-fg-subtle italic border border-border rounded text-[11px]">
                    {line}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-fg-subtle">
                No transcript available for this call.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

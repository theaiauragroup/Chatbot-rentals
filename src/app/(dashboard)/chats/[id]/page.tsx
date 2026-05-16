"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Car,
  MessageCircle,
  Clock,
  CheckCircle2,
  FileDown,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { TemperaturePill } from "@/components/leads/StatusPill";
import { TranscriptView } from "@/components/chat/TranscriptView";
import { chatById, leadById, vehicleById } from "@/lib/mock";
import {
  formatDate,
  formatPhone,
  formatUsd,
  outcomeLabel,
} from "@/lib/utils";
import type { Chat } from "@/lib/types";

export default function TranscriptPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [chat, setChat] = React.useState<Chat | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChat() {
      try {
        const mockChat = chatById(id);
        if (mockChat) {
          setChat(mockChat);
          setLoading(false);
          return;
        }

        const res = await fetch("/api/chats");
        const data = await res.json();
        const rawChats = Array.isArray(data) ? data : data.chats || [];
        
        const targetId = id.replace(/^#?unfiltered-/, "").replace(/^session-/, "");
        const found = rawChats.find((c: any) => {
          const cid = String(c["Session ID"] || c["id"] || c["session_id"] || "")
            .replace(/^#?unfiltered-/, "")
            .replace(/^session-/, "");
          return cid === targetId || String(c["Lead ID"] || "") === targetId;
        });

        if (found) {
          setChat({
            id: targetId,
            startedAt: found["Created At"] || found["Date"] || new Date().toISOString(),
            lastMessageAt: found["Last Activity At"] || found["Timestamp"] || new Date().toISOString(),
            durationSec: 0,
            customerName: found["Full Name"] || found["Name"] || "Customer",
            customerPhone: found["Phone Number"] || found["Phone"],
            messages: [], 
            finalTemperature: (String(found["Status"] || found["Temperature"] || "cold").toLowerCase().includes("hot") ? "hot" : "cold") as any,
            channel: "web_widget",
            aiSummary: found["Chat Summary"] || found["Summary"] || found["ai_summary"],
            vehicleIdsOfInterest: found["Vehicle interest"] ? [String(found["Vehicle interest"])] : [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch chat:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchChat();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-8 h-[600px]" />
          <Skeleton className="col-span-4 h-[400px]" />
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="size-12 rounded-full bg-surface-2 flex items-center justify-center text-fg-subtle">
          <MessageCircle className="size-6" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-fg">Chat not found</h2>
          <p className="text-sm text-fg-muted mt-1">This conversation might have been deleted or archived.</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/chats")}>
          Back to history
        </Button>
      </div>
    );
  }

  const lead = chat.leadId ? leadById(chat.leadId) : undefined;
  const vehicleInterest = (lead?.vehicleInterestIds ?? chat.vehicleIdsOfInterest ?? [])
    .map((vid) => vehicleById(vid))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
        <Link
          href="/chats"
          className="inline-flex items-center gap-1 hover:text-fg transition-colors duration-100"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Chats
        </Link>
        <ChevronRight
          className="inline-block size-3 mx-1.5 text-fg-subtle align-middle"
          aria-hidden
        />
        <span className="text-fg-subtle">
          {chat.id.replace("chat_", "TR-")}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg leading-tight">
              Chat with {chat.customerName || "Customer"}
            </h1>
            <p className="text-xs text-fg-muted mt-1 flex items-center gap-2">
              <Clock className="size-3" />
              Started {formatDate(chat.startedAt.slice(0, 10))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 p-6">
          {chat.messages.length > 0 ? (
            <TranscriptView chat={chat as any} />
          ) : chat.aiSummary ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Sparkles className="size-4 text-accent" />
                <h3 className="text-sm font-semibold text-fg">AI Chat Summary</h3>
              </div>
              <div className="prose prose-sm max-w-none text-fg-muted leading-relaxed cw-md">
                <ReactMarkdown>{chat.aiSummary}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <MessageCircle className="size-8 text-fg-subtle opacity-20" />
              <p className="text-sm text-fg-muted">Waiting for transcript or summary...</p>
            </div>
          )}
        </Card>

        <aside className="lg:col-span-4 flex flex-col gap-4">
          <Card>
            <div className="px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-fg">Customer Details</h3>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar name={chat.customerName || "C"} size="md" />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-sm font-medium text-fg truncate">
                    {chat.customerName || "Anonymous"}
                  </span>
                  {chat.customerPhone && (
                    <span className="text-fg-subtle tabular-nums">
                      {formatPhone(chat.customerPhone)}
                    </span>
                  )}
                </div>
              </div>
              <TemperaturePill temperature={chat.finalTemperature} />
            </div>
          </Card>

          {vehicleInterest.length > 0 && (
            <Card>
              <div className="px-4 pt-3 pb-2">
                <h3 className="text-sm font-semibold text-fg">Vehicle Interest</h3>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                {vehicleInterest.map((v) => (
                  <div key={v!.id} className="flex items-center gap-2 text-xs">
                    <Car className="size-3.5 text-fg-subtle" />
                    <span className="text-fg truncate">
                      {v!.make} {v!.model} ({v!.year})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div className="px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-fg">Quick actions</h3>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2">
              <Button variant="secondary" size="sm" className="w-full justify-center">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Mark resolved
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-center">
                <FileDown className="size-3.5" aria-hidden />
                Export PDF
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

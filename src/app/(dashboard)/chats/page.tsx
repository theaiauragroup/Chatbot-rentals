import * as React from "react";
import { ChatsTable } from "@/components/chat/ChatsTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { chats, leads, tenant } from "@/lib/mock";
import type { LeadOutcome } from "@/lib/types";

export const metadata = { title: "Chat history · AIAURA FLEETS" };

export default function ChatsPage() {
  const leadOutcomeByLeadId: Record<string, LeadOutcome> = {};
  for (const l of leads) leadOutcomeByLeadId[l.id] = l.outcome;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2
          className="text-lg font-semibold text-fg leading-tight"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          Chat history
        </h2>
        <p className="text-xs text-fg-muted mt-0.5">
          {chats.length} conversations from your widget
        </p>
      </header>
      <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <ChatsTable
          chats={chats}
          tenantSlug={tenant.slug}
          leadOutcomeByLeadId={leadOutcomeByLeadId}
        />
      </React.Suspense>
    </div>
  );
}

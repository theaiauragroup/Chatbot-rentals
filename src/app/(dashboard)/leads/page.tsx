import * as React from "react";
import { LeadsView } from "@/components/leads/LeadsView";
import { Skeleton } from "@/components/ui/Skeleton";
import { getLeads, getVehicles, getChats } from "@/lib/api";

export const metadata = { title: "Leads · AIAURA FLEETS" };

export default async function LeadsPage() {
  const [leads, vehicles, chats] = await Promise.all([
    getLeads(),
    getVehicles(),
    getChats()
  ]);

  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
      <LeadsView
        initialLeads={leads}
        initialVehicles={vehicles}
        chats={chats}
        tenantSlug="aiaura"
      />
    </React.Suspense>
  );
}

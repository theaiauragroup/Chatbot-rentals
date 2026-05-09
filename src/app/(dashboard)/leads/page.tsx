import * as React from "react";
import { LeadsView } from "@/components/leads/LeadsView";
import { Skeleton } from "@/components/ui/Skeleton";
import { chats, leads, tenant, vehicles } from "@/lib/mock";

export const metadata = { title: "Leads · AIAURA FLEETS" };

export default function LeadsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <LeadsView
        initialLeads={leads}
        initialVehicles={vehicles}
        chats={chats}
        tenantSlug={tenant.slug}
      />
    </React.Suspense>
  );
}

import * as React from "react";
import { ChatsView } from "@/components/chat/ChatsView";
import { Skeleton } from "@/components/ui/Skeleton";
import { chats, leads, tenant, vehicles } from "@/lib/mock";

export const metadata = { title: "Chat history · AIAURA FLEETS" };

export default function ChatsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <ChatsView
        initialChats={chats}
        initialLeads={leads}
        initialVehicles={vehicles}
        tenantSlug={tenant.slug}
      />
    </React.Suspense>
  );
}


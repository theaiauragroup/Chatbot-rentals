import * as React from "react";
import { ChatsView } from "@/components/chat/ChatsView";
import { Skeleton } from "@/components/ui/Skeleton";
import { getChats, getLeads, getVehicles } from "@/lib/api";

export const metadata = { title: "Chat history · AIAURA FLEETS" };

export default async function ChatsPage() {
  const [chats, leads, vehicles] = await Promise.all([
    getChats(),
    getLeads(),
    getVehicles()
  ]);

  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
      <ChatsView
        initialChats={chats}
        initialLeads={leads}
        initialVehicles={vehicles}
        tenantSlug="aiaura"
      />
    </React.Suspense>
  );
}


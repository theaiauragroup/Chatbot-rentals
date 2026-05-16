import { ChatsView } from "@/components/chat/ChatsView";
import { getChats, getLeads, getVehicles } from "@/lib/api";

export const metadata = { title: "Chat history · AIAURA FLEETS" };

export default async function ChatsPage() {
  const [chats, leads, vehicles] = await Promise.all([
    getChats(),
    getLeads(),
    getVehicles()
  ]);

  return (
    <ChatsView
      initialChats={chats}
      initialLeads={leads}
      initialVehicles={vehicles}
      tenantSlug="aiaura"
    />
  );
}


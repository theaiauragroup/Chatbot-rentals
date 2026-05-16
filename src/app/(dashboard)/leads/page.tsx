import { LeadsView } from "@/components/leads/LeadsView";
import { getLeads, getVehicles, getChats } from "@/lib/api";

export const metadata = { title: "Leads · AIAURA FLEETS" };

export default async function LeadsPage() {
  const [leads, vehicles, chats] = await Promise.all([
    getLeads(),
    getVehicles(),
    getChats()
  ]);

  return (
    <LeadsView
      initialLeads={leads}
      initialVehicles={vehicles}
      chats={chats}
      tenantSlug="aiaura"
    />
  );
}

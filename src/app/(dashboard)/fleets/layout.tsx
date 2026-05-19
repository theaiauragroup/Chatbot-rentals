import { FleetProvider } from "@/components/fleets/FleetStore";
import { getVehicles } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FleetsLayout({ children }: { children: React.ReactNode }) {
  const vehicles = await getVehicles();
  
  return (
    <FleetProvider initialVehicles={vehicles}>
      {children}
    </FleetProvider>
  );
}

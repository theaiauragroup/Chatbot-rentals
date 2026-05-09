import * as React from "react";
import { FleetProvider } from "@/components/fleets/FleetStore";
import { vehicles } from "@/lib/mock";

export default function FleetsLayout({ children }: { children: React.ReactNode }) {
  return <FleetProvider initialVehicles={vehicles}>{children}</FleetProvider>;
}

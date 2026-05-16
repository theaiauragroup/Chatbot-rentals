import * as React from "react";
import { FleetProvider } from "@/components/fleets/FleetStore";

export default function FleetsLayout({ children }: { children: React.ReactNode }) {
  return <FleetProvider initialVehicles={[]}>{children}</FleetProvider>;
}

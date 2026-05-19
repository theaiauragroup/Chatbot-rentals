import * as React from "react";
import { FleetView } from "@/components/fleets/FleetView";
import { Skeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Fleet · AIAURA FLEETS" };

export default function FleetsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <FleetView />
    </React.Suspense>
  );
}

import * as React from "react";
import { TuneView } from "@/components/tune/TuneView";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Tune AI · AIAURA FLEETS" };

export default function TunePage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <TuneView />
    </React.Suspense>
  );
}

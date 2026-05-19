import * as React from "react";
import { CallsView } from "@/components/calls/CallsView";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Call Logs · AIAURA FLEETS" };

export default function CallsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <CallsView />
    </React.Suspense>
  );
}

import * as React from "react";
import { SettingsView } from "@/components/settings/SettingsView";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Settings · AIAURA FLEETS" };

export default function SettingsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <SettingsView />
    </React.Suspense>
  );
}

import * as React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page not found · AIAURA FLEETS" };

export default function NotFound() {
  return (
    <div className="flex flex-1 min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center text-center gap-3 max-w-md">
        <span
          aria-hidden
          className="size-10 rounded-full bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
        >
          <Compass className="size-5" aria-hidden />
        </span>
        <p className="text-md font-semibold text-fg">Page not found</p>
        <p className="text-sm text-fg-muted">
          That URL doesn&apos;t match anything we know about.
        </p>
        <Link
          href="/dashboard"
          className={cn(
            "mt-1 inline-flex items-center justify-center h-9 px-4 rounded-md text-base font-medium",
            "bg-accent text-accent-fg hover:bg-accent-hover transition-colors duration-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

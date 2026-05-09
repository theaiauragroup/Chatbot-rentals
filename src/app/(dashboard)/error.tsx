"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center gap-3 max-w-md">
        <span
          aria-hidden
          className="size-10 rounded-full bg-danger-soft inline-flex items-center justify-center text-danger"
        >
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <p className="text-md font-semibold text-fg">Something broke</p>
        <p className="text-sm text-fg-muted">
          We couldn&apos;t load this page. Try refreshing — if it keeps happening, the dev console has the details.
        </p>
        <Button
          variant="primary"
          size="md"
          leadingIcon={<RotateCcw className="size-3.5" />}
          onClick={() => reset()}
        >
          Reload section
        </Button>
        {process.env.NODE_ENV !== "production" && (
          <details className="mt-3 text-left w-full">
            <summary className="text-xs text-fg-subtle cursor-pointer">
              Stack trace
            </summary>
            <pre className="mt-2 px-3 py-2 rounded-md bg-surface-2 border border-border font-mono text-[11px] text-fg-muted overflow-x-auto">
              {error.message}
              {error.stack ? "\n\n" + error.stack : ""}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  // Flat shimmer via opacity pulse — no gradient, complies with anti-pattern §3.
  return (
    <div
      className={cn(
        "rounded-md bg-surface-2 animate-pulse",
        className
      )}
      {...rest}
    />
  );
}

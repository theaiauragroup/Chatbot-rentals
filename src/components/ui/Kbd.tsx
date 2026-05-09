import * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-sm",
        "border border-border bg-surface-2 font-mono text-[10px] text-fg-muted",
        "leading-none",
        className
      )}
      {...rest}
    />
  );
}

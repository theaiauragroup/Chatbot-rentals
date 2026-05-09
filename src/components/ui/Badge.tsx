import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "hot"
  | "warm"
  | "cold";

const variantClass: Record<BadgeVariant, string> = {
  neutral: "bg-surface-2 text-fg-muted",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  hot: "bg-hot-soft text-hot",
  warm: "bg-warm-soft text-warm",
  cold: "bg-cold-soft text-cold",
};

const dotColor: Partial<Record<BadgeVariant, string>> = {
  hot: "bg-hot",
  warm: "bg-warm",
  cold: "bg-cold",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  accent: "bg-accent",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export function Badge({
  variant = "neutral",
  withDot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClass[variant],
        className
      )}
      {...rest}
    >
      {withDot && dotColor[variant] && (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", dotColor[variant])}
        />
      )}
      {children}
    </span>
  );
}

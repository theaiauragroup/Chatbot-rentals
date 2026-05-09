import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-16 gap-3",
        className
      )}
      {...rest}
    >
      {icon && (
        <span className="text-fg-subtle [&_svg]:size-6" aria-hidden>
          {icon}
        </span>
      )}
      <div className="space-y-1">
        <p className="text-md font-medium text-fg">{title}</p>
        {description && (
          <p className="text-sm text-fg-muted max-w-md">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

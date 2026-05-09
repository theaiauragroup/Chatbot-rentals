import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClass: Record<AvatarSize, string> = {
  sm: "size-6 text-xs",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: AvatarSize;
  src?: string;
}

export function Avatar({
  name,
  size = "md",
  src,
  className,
  ...rest
}: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden",
        "bg-accent-soft text-accent font-medium select-none",
        sizeClass[size],
        className
      )}
      {...rest}
    >
      {src ? (
        // Avatar URL is a placeholder; using <img> is fine here vs. next/image
        // because mock-data avatars are unknown remote sources.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}

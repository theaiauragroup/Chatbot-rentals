"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover disabled:bg-accent/50",
  secondary:
    "bg-surface text-fg border border-border hover:border-border-strong hover:bg-surface-2 disabled:opacity-60",
  ghost:
    "bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2 disabled:opacity-60",
  destructive:
    "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50",
  link:
    "bg-transparent text-accent underline-offset-2 hover:underline px-0 h-auto disabled:opacity-60",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-base gap-2",
  lg: "h-11 px-5 text-md gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leadingIcon,
      trailingIcon,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-colors duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:cursor-not-allowed",
          variantClass[variant],
          variant !== "link" && sizeClass[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : leadingIcon ? (
          <span className="inline-flex shrink-0">{leadingIcon}</span>
        ) : null}
        {children}
        {!loading && trailingIcon ? (
          <span className="inline-flex shrink-0">{trailingIcon}</span>
        ) : null}
      </button>
    );
  }
);

import * as React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "flat" | "interactive";

const variantClass: Record<CardVariant, string> = {
  default: "bg-surface border border-border shadow-sm",
  flat: "bg-surface border border-border",
  interactive:
    "bg-surface border border-border shadow-sm hover:shadow-md hover:border-border-strong cursor-pointer transition-all duration-100",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: React.ElementType;
}

export function Card({
  variant = "default",
  className,
  as: Comp = "div",
  ...rest
}: CardProps) {
  return (
    <Comp
      className={cn("rounded-lg overflow-hidden", variantClass[variant], className)}
      {...rest}
    />
  );
}

export function CardHeader({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-5",
        className
      )}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-md font-semibold text-fg", className)}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-fg-muted", className)} {...rest} />
  );
}

export function CardBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border px-6 py-4 text-sm",
        className
      )}
      {...rest}
    />
  );
}

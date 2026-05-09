"use client";

import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = RadixTabs.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabs.List>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.List>
>(function TabsList({ className, ...rest }, ref) {
  return (
    <RadixTabs.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-0 border-b border-border",
        className
      )}
      {...rest}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center h-10 px-4 text-sm font-medium",
        "text-fg-muted hover:text-fg",
        "data-[state=active]:text-fg",
        "after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5",
        "after:bg-transparent data-[state=active]:after:bg-accent",
        "after:transition-colors after:duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
        className
      )}
      {...rest}
    />
  );
});

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(function TabsContent({ className, ...rest }, ref) {
  return (
    <RadixTabs.Content
      ref={ref}
      className={cn("focus-visible:outline-none", className)}
      {...rest}
    />
  );
});

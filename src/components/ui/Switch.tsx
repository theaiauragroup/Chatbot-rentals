"use client";

import * as React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  className?: string;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  SwitchProps
>(function Switch({ className, ...rest }, ref) {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center w-9 h-5 rounded-full",
        "bg-border-strong data-[state=checked]:bg-accent",
        "transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block size-4 rounded-full bg-white shadow-xs",
          "translate-x-0.5 data-[state=checked]:translate-x-[18px]",
          "transition-transform duration-100"
        )}
      />
    </RadixSwitch.Root>
  );
});

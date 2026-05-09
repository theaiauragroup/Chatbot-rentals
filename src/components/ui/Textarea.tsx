"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "block w-full px-3 py-2 rounded-sm bg-surface text-base text-fg",
          "border transition-colors duration-100 resize-y min-h-[88px]",
          "placeholder:text-fg-subtle",
          "outline-none",
          invalid
            ? "border-danger focus:ring-2 focus:ring-danger"
            : "border-border focus:ring-2 focus:ring-accent",
          rest.disabled && "opacity-60 cursor-not-allowed bg-surface-2",
          className
        )}
        {...rest}
      />
    );
  }
);

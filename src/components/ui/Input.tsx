"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, leadingIcon, trailingIcon, invalid, ...rest },
    ref
  ) {
    return (
      <div
        className={cn(
          "relative flex items-center w-full h-9 rounded-sm bg-surface",
          "border transition-colors duration-100",
          invalid
            ? "border-danger focus-within:ring-2 focus-within:ring-danger"
            : "border-border focus-within:ring-2 focus-within:ring-accent",
          rest.disabled && "opacity-60 cursor-not-allowed bg-surface-2",
          className
        )}
      >
        {leadingIcon && (
          <span className="pl-3 text-fg-subtle [&_svg]:size-4" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-full bg-transparent outline-none text-base text-fg",
            "placeholder:text-fg-subtle",
            leadingIcon ? "pl-2" : "pl-3",
            trailingIcon ? "pr-2" : "pr-3"
          )}
          {...rest}
        />
        {trailingIcon && (
          <span className="pr-3 text-fg-subtle [&_svg]:size-4" aria-hidden>
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }
);

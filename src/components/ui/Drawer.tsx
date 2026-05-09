"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  /** "md" = 480px, "lg" = 560px (default md). */
  width?: "md" | "lg";
  /** Sticky footer content (action buttons, etc.). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Optional aria description for screen readers. */
  description?: string;
}

const widthClass = {
  md: "w-[480px]",
  lg: "w-[560px]",
} as const;

export function Drawer({
  open,
  onOpenChange,
  title,
  width = "md",
  footer,
  children,
  description,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          )}
        />
        <Dialog.Content
          aria-describedby={description ? "drawer-desc" : undefined}
          className={cn(
            "fixed right-0 top-0 z-[60] h-screen flex flex-col",
            "bg-surface shadow-lg outline-none",
            "max-w-[100vw]",
            widthClass[width],
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
            "duration-200"
          )}
        >
          {/* Header */}
          {title !== undefined && (
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 h-14 border-b border-border">
              <Dialog.Title className="text-sm font-semibold text-fg leading-none">
                {title}
              </Dialog.Title>
              <Dialog.Close
                className={cn(
                  "size-7 inline-flex items-center justify-center rounded-md",
                  "text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors duration-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>
          )}
          {description && (
            <Dialog.Description id="drawer-desc" className="sr-only">
              {description}
            </Dialog.Description>
          )}
          {/* Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>
          {/* Footer */}
          {footer && (
            <div className="shrink-0 px-5 py-3 border-t border-border bg-surface flex items-center gap-2 justify-end flex-wrap">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

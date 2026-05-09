"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** "confirm" = 480px, "form" = 640px. */
  width?: "confirm" | "form";
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const widthClass = {
  confirm: "w-[480px]",
  form: "w-[640px]",
} as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  width = "confirm",
  footer,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
            "max-w-[calc(100vw-32px)]",
            widthClass[width],
            "rounded-lg bg-surface shadow-lg outline-none flex flex-col max-h-[85vh]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "duration-150"
          )}
        >
          {(title !== undefined || description !== undefined) && (
            <div className="shrink-0 flex items-start justify-between gap-3 px-5 pt-4 pb-3">
              <div className="flex-1 min-w-0">
                {title !== undefined && (
                  <Dialog.Title className="text-md font-semibold text-fg leading-tight">
                    {title}
                  </Dialog.Title>
                )}
                {description !== undefined && (
                  <Dialog.Description className="text-xs text-fg-muted mt-1 leading-relaxed">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className={cn(
                  "size-7 shrink-0 inline-flex items-center justify-center rounded-md",
                  "text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors duration-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>
          )}
          <div className="px-5 pb-4 overflow-y-auto">{children}</div>
          {footer && (
            <div className="shrink-0 px-5 py-3 border-t border-border flex items-center gap-2 justify-end flex-wrap">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

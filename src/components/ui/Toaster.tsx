"use client";

import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "warning" | "danger";

export interface ToastInput {
  id?: string;
  title?: string;
  body?: string;
  variant?: ToastVariant;
  /** Duration ms; default 4000. */
  durationMs?: number;
}

interface ToastInstance extends Required<Pick<ToastInput, "id">> {
  title?: string;
  body?: string;
  variant: ToastVariant;
  durationMs: number;
}

interface Ctx {
  toast: (t: ToastInput) => void;
  success: (body: string, title?: string) => void;
  info: (body: string, title?: string) => void;
  warning: (body: string, title?: string) => void;
  danger: (body: string, title?: string) => void;
}

const ToastCtx = React.createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <Toaster>");
  return ctx;
}

const ICON: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-success" aria-hidden />,
  info: <Info className="size-4 text-info" aria-hidden />,
  warning: <AlertTriangle className="size-4 text-warning" aria-hidden />,
  danger: <AlertCircle className="size-4 text-danger" aria-hidden />,
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastInstance[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((input: ToastInput) => {
    const id =
      input.id ??
      `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const t: ToastInstance = {
      id,
      title: input.title,
      body: input.body,
      variant: input.variant ?? "info",
      durationMs: input.durationMs ?? 4000,
    };
    setToasts((curr) => [...curr, t]);
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      toast,
      success: (body, title) => toast({ body, title, variant: "success" }),
      info: (body, title) => toast({ body, title, variant: "info" }),
      warning: (body, title) => toast({ body, title, variant: "warning" }),
      danger: (body, title) => toast({ body, title, variant: "danger" }),
    }),
    [toast]
  );

  return (
    <ToastCtx.Provider value={value}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            duration={t.durationMs}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
            className={cn(
              "group pointer-events-auto flex items-start gap-3 p-3 pr-2",
              "rounded-lg bg-surface border border-border shadow-lg w-[360px]",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0",
              "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0"
            )}
          >
            <span className="mt-0.5 shrink-0">{ICON[t.variant]}</span>
            <div className="flex-1 min-w-0">
              {t.title && (
                <RadixToast.Title className="text-sm font-semibold text-fg leading-tight">
                  {t.title}
                </RadixToast.Title>
              )}
              {t.body && (
                <RadixToast.Description
                  className={cn(
                    "text-xs text-fg-muted leading-snug",
                    t.title && "mt-0.5"
                  )}
                >
                  {t.body}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              aria-label="Dismiss"
              className={cn(
                "size-6 inline-flex items-center justify-center rounded-md text-fg-subtle shrink-0",
                "hover:bg-surface-2 hover:text-fg transition-colors duration-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              )}
            >
              <X className="size-3.5" aria-hidden />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport
          className="fixed bottom-4 right-4 z-[80] flex flex-col-reverse gap-2 outline-none"
          aria-label="Notifications"
        />
      </RadixToast.Provider>
    </ToastCtx.Provider>
  );
}

"use client";

import * as React from "react";
import { Copy, Check, Bot } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { cn } from "@/lib/utils";

export function WidgetTab() {
  const store = useSettingsStore();
  const toast = useToast();
  const t = store.draftTenant;
  const snippet = `<script
  src="https://widget.aiaurafleets.app/v1/loader.js"
  data-tenant="${t.slug}"
  defer
></script>`;
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard
      .writeText(snippet)
      .then(() => {
        setCopied(true);
        toast.success(toasts.copied());
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        toast.warning(toasts.notImplemented("Clipboard fallback"));
      });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Embed code */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Embed code</h3>
        <p className="text-xs text-fg-muted mt-1">
          Paste this snippet right before the closing &lt;/body&gt; tag of your site. The widget appears as a floating button bottom-right.
        </p>
        <pre
          className={cn(
            "mt-3 px-4 py-3 rounded-md bg-surface-2 border border-border",
            "font-mono text-xs text-fg overflow-x-auto"
          )}
        >
          <code>{snippet}</code>
        </pre>
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={
              copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )
            }
            onClick={copy}
          >
            {copied ? "Copied" : "Copy snippet"}
          </Button>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Preview</h3>
        <p className="text-xs text-fg-muted mt-1">
          How customers will see the widget on your site.
        </p>
        <div className="mt-4 relative h-[280px] rounded-md bg-surface-2 border border-border overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-fg-subtle text-xs italic">
            (your site content)
          </div>
          {/* Floating chat bubble */}
          <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2">
            <div
              className="rounded-lg shadow-md border border-border bg-surface px-3 py-2 max-w-[220px]"
            >
              <p className="text-[10px] font-medium text-fg-subtle leading-none mb-1">
                <Bot className="inline-block size-3 mr-1 align-text-top" aria-hidden />
                {t.businessName}
              </p>
              <p className="text-xs text-fg leading-snug">{t.widget.greetingBadge}</p>
            </div>
            <button
              type="button"
              className="size-12 rounded-full shadow-md inline-flex items-center justify-center"
              style={{ background: t.brandColor, color: "#fff" }}
              aria-label="Open chat"
            >
              <Bot className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </Card>

      {/* Customize */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Customize</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Position" hint="Bottom-right is the only option this pass">
            <select
              disabled
              value={t.widget.position}
              className="h-9 px-3 rounded-sm border border-border bg-surface-2 text-base text-fg-muted outline-none cursor-not-allowed"
            >
              <option value="bottom-right">Bottom right</option>
            </select>
          </Field>
          <Field label="Greeting badge">
            <Input
              value={t.widget.greetingBadge}
              onChange={(e) =>
                store.patchWidget({ greetingBadge: e.target.value })
              }
              placeholder="Hi! Need a car?"
            />
          </Field>
          <Field label="Show on pages" hint="All pages this pass">
            <select
              disabled
              value={t.widget.showOnPages}
              className="h-9 px-3 rounded-sm border border-border bg-surface-2 text-base text-fg-muted outline-none cursor-not-allowed"
            >
              <option value="all">All pages</option>
            </select>
          </Field>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-fg-subtle">{hint}</span>}
    </label>
  );
}

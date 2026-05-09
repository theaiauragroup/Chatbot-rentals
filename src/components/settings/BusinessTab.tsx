"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { cn } from "@/lib/utils";

const TZ_OPTIONS = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const LOCALE_OPTIONS = [
  "en-US",
  "en-GB",
  "en-CA",
  "en-AU",
  "fr-FR",
  "de-DE",
  "es-MX",
  "ja-JP",
];

export function BusinessTab() {
  const store = useSettingsStore();
  const toast = useToast();
  const t = store.draftTenant;

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Identity</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business name">
            <Input
              value={t.businessName}
              onChange={(e) => store.patchTenant({ businessName: e.target.value })}
            />
          </Field>
          <Field
            label="Brand color"
            hint="Used by your widget; dashboard accent stays the same."
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={t.brandColor}
                onChange={(e) => store.patchTenant({ brandColor: e.target.value })}
                aria-label="Brand color"
                className="size-9 rounded-md border border-border cursor-pointer p-0"
              />
              <Input
                value={t.brandColor}
                onChange={(e) => store.patchTenant({ brandColor: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
          </Field>
          <Field label="Logo" hint="JPG/PNG/SVG, ≥ 256×256">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.info(toasts.notImplemented("Logo upload"))
              }
            >
              Upload logo
            </Button>
          </Field>
          <Field label="Currency">
            <Select
              value={t.currency}
              onChange={(e) =>
                store.patchTenant({ currency: e.target.value as "USD" })
              }
            >
              <option value="USD">USD — US Dollar</option>
            </Select>
          </Field>
          <Field label="Time zone">
            <Select
              value={t.timezone}
              onChange={(e) => store.patchTenant({ timezone: e.target.value })}
            >
              {TZ_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Locale">
            <Select
              value={t.locale}
              onChange={(e) => store.patchTenant({ locale: e.target.value })}
            >
              {LOCALE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Contact</h3>
        <p className="text-xs text-fg-muted mt-1">
          Public contact info that the bot can quote to customers.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Public phone">
            <Input
              value={t.publicPhone}
              onChange={(e) => store.patchTenant({ publicPhone: e.target.value })}
            />
          </Field>
          <Field label="Public email">
            <Input
              type="email"
              value={t.publicEmail}
              onChange={(e) => store.patchTenant({ publicEmail: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <Textarea
                value={t.address}
                onChange={(e) => store.patchTenant({ address: e.target.value })}
                className="text-xs"
                rows={2}
              />
            </Field>
          </div>
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

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-9 px-3 rounded-sm border border-border bg-surface text-base text-fg",
        "outline-none focus:ring-2 focus:ring-accent",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
});

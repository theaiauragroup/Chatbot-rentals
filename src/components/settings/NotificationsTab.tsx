"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useSettingsStore } from "./SettingsStore";
import { cn } from "@/lib/utils";

const TRIGGERS = [
  {
    key: "hotLead" as const,
    title: "Hot lead detected",
    body: "Bot sees a buying-intent message and a complete lead profile.",
  },
  {
    key: "humanHandoff" as const,
    title: "Human handoff requested",
    body: "Customer asks for a person.",
  },
  {
    key: "bookingInquiry" as const,
    title: "Booking inquiry with dates",
    body: "Customer asks about a specific car for specific dates.",
  },
  {
    key: "dailySummary" as const,
    title: "Daily summary",
    body: "End-of-day digest of chats, leads and bookings.",
  },
];

export function NotificationsTab() {
  const store = useSettingsStore();
  const n = store.draftTenant.notifications;

  return (
    <div className="flex flex-col gap-4">
      {/* Triggers */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Triggers</h3>
        <p className="text-xs text-fg-muted mt-1">
          Each trigger sends an SMS to your manager phone immediately.
        </p>
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {TRIGGERS.map((t) => (
            <li
              key={t.key}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg">{t.title}</p>
                <p className="text-xs text-fg-muted mt-0.5">{t.body}</p>
                <p className="text-[11px] text-fg-subtle mt-0.5">Default: ON</p>
              </div>
              <Switch
                checked={n[t.key]}
                onCheckedChange={(checked) =>
                  store.patchNotifications({ [t.key]: checked })
                }
                aria-label={t.title}
              />
            </li>
          ))}
        </ul>
      </Card>

      {/* Schedule */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Schedule</h3>
        <p className="text-xs text-fg-muted mt-1">
          Quiet hours apply to the daily summary only — urgent triggers always send.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Daily summary delivery time" hint="In your time zone">
            <Input
              type="time"
              value={n.dailySummaryTime}
              onChange={(e) =>
                store.patchNotifications({ dailySummaryTime: e.target.value })
              }
            />
          </Field>
          <Field label="Quiet hours start">
            <Input
              type="time"
              value={n.quietHoursStart}
              onChange={(e) =>
                store.patchNotifications({ quietHoursStart: e.target.value })
              }
            />
          </Field>
          <Field label="Quiet hours end">
            <Input
              type="time"
              value={n.quietHoursEnd}
              onChange={(e) =>
                store.patchNotifications({ quietHoursEnd: e.target.value })
              }
            />
          </Field>
        </div>
      </Card>

      {/* Channel */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Channel</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Manager phone (E.164)"
            hint="This is where SMS notifications are sent."
          >
            <Input
              value={n.managerPhone}
              onChange={(e) =>
                store.patchNotifications({ managerPhone: e.target.value })
              }
              placeholder="+15555550173"
            />
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
    <label className={cn("flex flex-col gap-1.5")}>
      <span className="text-xs font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-fg-subtle">{hint}</span>}
    </label>
  );
}

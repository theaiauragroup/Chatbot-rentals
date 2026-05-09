"use client";

import * as React from "react";
import { UserRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ChipInput } from "@/components/ui/ChipInput";
import { useTuneStore } from "./TuneStore";
import { tenant } from "@/lib/mock";
import { formatPhone } from "@/lib/utils";

export function EscalationTab() {
  const { draft, patchDraft } = useTuneStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-7 p-5">
        <h3 className="text-sm font-semibold text-fg">Escalation triggers</h3>
        <p className="text-xs text-fg-muted mt-1">
          Phrases that should auto-handoff to you over SMS. Press Enter or comma to add.
        </p>
        <div className="mt-3">
          <ChipInput
            values={draft.escalationTriggers}
            onChange={(next) => patchDraft({ escalationTriggers: next })}
            placeholder="Add a trigger phrase — e.g. talk to a person"
            ariaLabel="Escalation triggers"
          />
        </div>
        <p className="mt-2 text-[11px] text-fg-subtle">
          {draft.escalationTriggers.length} trigger
          {draft.escalationTriggers.length === 1 ? "" : "s"} configured
        </p>
      </Card>

      <Card className="lg:col-span-5 p-5">
        <p className="text-[11px] font-medium text-fg-subtle uppercase tracking-wider">
          SMS preview · sent to {formatPhone(tenant.notifications.managerPhone)}
        </p>
        <div className="mt-3 flex items-start gap-2.5">
          <span
            aria-hidden
            className="size-7 rounded-md bg-accent-soft text-accent inline-flex items-center justify-center shrink-0"
          >
            <UserRound className="size-3.5" />
          </span>
          <div className="flex-1">
            <p className="text-xs text-fg leading-snug">
              <span className="font-medium">Customer needs you:</span> Sarah on
              chat right now. Open dashboard to take over.
            </p>
            <p className="text-[10px] text-fg-subtle mt-1 tabular-nums">
              just now
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

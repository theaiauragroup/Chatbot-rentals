"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTuneStore } from "./TuneStore";

export function BusinessRulesTab() {
  const { draft, patchRules } = useTuneStore();
  const r = draft.businessRules;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-fg">Business rules</h3>
      <p className="text-xs text-fg-muted mt-1">
        These values get injected into the bot’s system prompt so it can quote them accurately.
      </p>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Operating hours" hint="When the bot says “we’re open”">
          <Input
            value={r.operatingHours}
            onChange={(e) => patchRules({ operatingHours: e.target.value })}
            placeholder="Mon–Sun 8:00–22:00"
          />
        </Field>
        <Field label="Deposit policy (USD)" hint="Bot quotes this on price questions">
          <Input
            type="number"
            value={r.depositPolicyUsd}
            onChange={(e) =>
              patchRules({ depositPolicyUsd: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field
          label="Multi-day discount %"
          hint="Applied automatically on rentals ≥ 7 days"
        >
          <Input
            type="number"
            value={r.multiDayDiscountPct}
            onChange={(e) =>
              patchRules({ multiDayDiscountPct: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field
          label="Minimum rental days"
          hint="Bot won’t quote shorter trips"
        >
          <Input
            type="number"
            value={r.minRentalDays}
            onChange={(e) =>
              patchRules({ minRentalDays: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Minimum driver age" hint="Bot mentions this if asked">
          <Input
            type="number"
            value={r.minDriverAge}
            onChange={(e) =>
              patchRules({ minDriverAge: Number(e.target.value) || 21 })
            }
          />
        </Field>
      </div>
    </Card>
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

"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { ChipInput } from "@/components/ui/ChipInput";
import { useTuneStore } from "./TuneStore";

export function OffLimitsTab() {
  const { draft, patchDraft } = useTuneStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-7 p-5">
        <h3 className="text-sm font-semibold text-fg">Off-limits topics</h3>
        <p className="text-xs text-fg-muted mt-1">
          Add topics the bot should refuse politely and steer back to rentals. Press Enter or comma to add.
        </p>
        <div className="mt-3">
          <ChipInput
            values={draft.offLimitsTopics}
            onChange={(next) => patchDraft({ offLimitsTopics: next })}
            placeholder="Add a topic — e.g. insurance disputes"
            ariaLabel="Off-limits topics"
          />
        </div>
        <p className="mt-2 text-[11px] text-fg-subtle">
          {draft.offLimitsTopics.length} topic{draft.offLimitsTopics.length === 1 ? "" : "s"} configured
        </p>
      </Card>

      <Card className="lg:col-span-5 p-5">
        <p className="text-[11px] font-medium text-fg-subtle uppercase tracking-wider">
          Bot deflection preview
        </p>
        <div className="mt-3 flex flex-col gap-2 text-xs">
          <p>
            <span className="text-fg-subtle">Customer:</span>{" "}
            <span className="text-fg">
              {draft.offLimitsTopics[0]
                ? `Can I get help with ${draft.offLimitsTopics[0]}?`
                : "Can I file an insurance claim through chat?"}
            </span>
          </p>
          <p>
            <span className="text-fg-subtle">Bot:</span>{" "}
            <span className="text-fg">
              That’s handled by our team — I’ll have someone reach out within
              the hour. Want me to take your phone for that follow-up?
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

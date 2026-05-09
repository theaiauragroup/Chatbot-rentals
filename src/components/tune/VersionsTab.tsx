"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useTuneStore } from "./TuneStore";
import { formatRelative } from "@/lib/utils";
import type { PromptVersion } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VersionsTab() {
  const store = useTuneStore();
  const [pending, setPending] = React.useState<PromptVersion | null>(null);

  return (
    <Card className="p-0">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-fg">Version history</h3>
        <p className="text-[11px] text-fg-muted mt-0.5">
          Every save creates a snapshot. Rolling back replaces the live bot settings instantly.
        </p>
      </div>
      <ul>
        {store.versions.map((v, i) => {
          const isLast = i === store.versions.length - 1;
          return (
            <li
              key={v.id}
              className={cn(
                "relative flex items-start gap-3 px-5 py-3",
                !isLast && "border-b border-border",
                // Vertical connecting line under each dot except the last
                !isLast &&
                  "before:absolute before:left-[26px] before:top-7 before:bottom-0 before:w-px before:bg-border"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-2.5 rounded-full shrink-0 relative z-10",
                  v.isCurrent
                    ? "bg-accent ring-4 ring-accent-soft"
                    : "bg-surface border-2 border-border-strong"
                )}
              />
              <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-mono text-fg">{v.versionLabel}</span>
                {v.isCurrent && <Badge variant="accent">Current</Badge>}
                <span className="text-[11px] text-fg-subtle tabular-nums">
                  · {formatRelative(v.createdAt)}
                </span>
              </div>
              <p className="text-xs text-fg mt-0.5">{v.summary}</p>
              <p className="text-[11px] text-fg-subtle mt-0.5">
                by {v.authorName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!v.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPending(v)}
                >
                  Roll back
                </Button>
              )}
            </div>
          </li>
          );
        })}
      </ul>

      <Modal
        open={!!pending}
        onOpenChange={(o) => {
          if (!o) setPending(null);
        }}
        title={pending ? `Roll back to ${pending.versionLabel}?` : ""}
        description="Your current draft will be discarded. The bot will use these settings on the next conversation."
        footer={
          pending ? (
            <>
              <Button variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  store.rollback(pending.id);
                  setPending(null);
                }}
              >
                Roll back
              </Button>
            </>
          ) : null
        }
      >
        <></>
      </Modal>
    </Card>
  );
}

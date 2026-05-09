"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useTuneStore } from "./TuneStore";
import { useToast } from "@/components/ui/Toaster";
import { manager } from "@/lib/mock";
import { toasts } from "@/lib/toasts";

export function SaveBar() {
  const store = useTuneStore();
  const toast = useToast();
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [summary, setSummary] = React.useState("");

  if (!store.isDirty) return null;

  function commit() {
    const nextLabel = bumpedLabel(store.current.versionLabel);
    store.save(summary || "Updated bot settings", manager.name);
    setSaveOpen(false);
    setSummary("");
    toast.success(toasts.versionSaved(nextLabel));
  }

  return (
    <>
      <div className="sticky bottom-0 -mx-8 px-8 mt-2 z-30 bg-surface border-t border-border">
        <div className="max-w-[1440px] mx-auto h-14 flex items-center justify-between">
          <p className="text-xs text-fg-muted">
            <span className="text-fg font-medium">Unsaved changes</span> — current
            published is{" "}
            <span className="font-mono text-fg">{store.current.versionLabel}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => store.discard()}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSaveOpen(true)}
            >
              Save & publish
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title={`Save as ${bumpedLabel(store.current.versionLabel)}?`}
        description="A new version will be published and the bot will use it on the next conversation."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={commit}>
              Save & publish
            </Button>
          </>
        }
      >
        <div className="pt-1">
          <label
            htmlFor="save-summary"
            className="block text-xs text-fg-muted mb-1.5"
          >
            What changed? (optional)
          </label>
          <Textarea
            id="save-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Lowered tone slider · added child-seat upsell"
            className="text-xs"
          />
        </div>
      </Modal>
    </>
  );
}

function bumpedLabel(v: string): string {
  const m = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return v + ".1";
  const [, major, minor] = m;
  return `v${major}.${Number(minor) + 1}.0`;
}

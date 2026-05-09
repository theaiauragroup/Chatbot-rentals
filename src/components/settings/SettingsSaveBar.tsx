"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";

export function SettingsSaveBar() {
  const store = useSettingsStore();
  const toast = useToast();
  if (!store.isDirty) return null;

  return (
    <div className="sticky bottom-0 -mx-8 px-8 mt-2 z-30 bg-surface border-t border-border">
      <div className="max-w-[1440px] mx-auto h-14 flex items-center justify-between">
        <p className="text-xs text-fg-muted">
          <span className="text-fg font-medium">Unsaved changes</span> — review and save
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => store.discard()}>
            Discard
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              store.save();
              toast.success(toasts.settingsSaved);
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

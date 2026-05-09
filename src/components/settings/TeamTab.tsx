"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "./SettingsStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { formatPhone } from "@/lib/utils";

export function TeamTab() {
  const store = useSettingsStore();
  const toast = useToast();
  const m = store.manager;

  return (
    <Card className="p-0">
      <div className="px-5 py-3 border-b border-border flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-fg">Team members</h3>
          <p className="text-[11px] text-fg-muted mt-0.5">
            Invite teammates to share access to this dashboard.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<UserPlus className="size-3.5" />}
          onClick={() => toast.info(toasts.notImplemented("Team access"))}
        >
          Invite teammate
        </Button>
      </div>
      <ul>
        <li className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <Avatar name={m.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate">{m.name} <span className="text-fg-subtle font-normal text-[11px]">· you</span></p>
            <p className="text-[11px] text-fg-subtle truncate">
              {m.email} · {formatPhone(m.phone)}
            </p>
          </div>
          <Badge variant="accent">Owner</Badge>
        </li>
        <li className="px-5 py-8 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm font-medium text-fg">No teammates yet</p>
          <p className="text-xs text-fg-muted max-w-md">
            Invite a teammate to share this dashboard. They&apos;ll be able to view leads, respond to chats, and manage the fleet.
          </p>
        </li>
      </ul>
    </Card>
  );
}

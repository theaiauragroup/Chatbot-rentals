"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  Flame,
  UserRound,
  CalendarClock,
  BarChart3,
  CheckCheck,
} from "lucide-react";
import type { Notification, NotificationType } from "@/lib/types";
import { notifications as initialNotifications } from "@/lib/mock";
import { formatRelative, cn } from "@/lib/utils";

interface IconMeta {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  fg: string;
}

const ICON: Record<NotificationType, IconMeta> = {
  hot_lead: { Icon: Flame, bg: "bg-hot-soft", fg: "text-hot" },
  human_handoff: { Icon: UserRound, bg: "bg-accent-soft", fg: "text-accent" },
  booking_inquiry: {
    Icon: CalendarClock,
    bg: "bg-warm-soft",
    fg: "text-warm",
  },
  daily_summary: { Icon: BarChart3, bg: "bg-info-soft", fg: "text-info" },
  system: { Icon: Bell, bg: "bg-surface-2", fg: "text-fg-muted" },
};

export function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = React.useState<Notification[]>(initialNotifications);
  const unreadCount = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((curr) => curr.map((n) => ({ ...n, read: true })));
  }

  function handleClick(n: Notification) {
    setItems((curr) =>
      curr.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
    if (n.refLeadId) router.push(`/leads?id=${n.refLeadId}`);
    else if (n.refChatId) router.push(`/chats/${n.refChatId}`);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative size-9 inline-flex items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-4" aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 inline-flex items-center justify-center size-3.5 rounded-full bg-accent ring-2 ring-surface text-[9px] font-semibold text-accent-fg leading-none"
              aria-hidden
            >
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-[360px] rounded-lg bg-surface border border-border shadow-md overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-fg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline underline-offset-2"
              >
                <CheckCheck className="size-3" aria-hidden />
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-fg">All caught up</p>
              <p className="text-xs text-fg-muted mt-1">
                New SMS triggers will appear here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {items.map((n) => {
                const { Icon, bg, fg } = ICON[n.type];
                return (
                  <li key={n.id}>
                    <DropdownMenu.Item
                      onSelect={() => handleClick(n)}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3 outline-none cursor-pointer",
                        "hover:bg-surface-2 focus:bg-surface-2",
                        !n.read && "bg-accent-soft/40"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "shrink-0 size-7 rounded-md inline-flex items-center justify-center mt-0.5",
                          bg
                        )}
                      >
                        <Icon className={cn("size-3.5", fg)} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-medium text-fg truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-fg-subtle whitespace-nowrap shrink-0 tabular-nums">
                            {formatRelative(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-fg-muted leading-snug mt-0.5">
                          {n.body}
                        </p>
                      </div>
                      {!n.read && (
                        <span
                          aria-label="Unread"
                          className="size-1.5 rounded-full bg-accent shrink-0 mt-2"
                        />
                      )}
                    </DropdownMenu.Item>
                  </li>
                );
              })}
            </ul>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

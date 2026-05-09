"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { manager } from "@/lib/mock";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const toast = useToast();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="size-9 p-0.5 inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Account menu"
        >
          <Avatar name={manager.name} size="md" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-[240px] rounded-lg bg-surface border border-border shadow-md py-1 overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2.5">
            <Avatar name={manager.name} size="md" />
            <div className="flex flex-col leading-tight min-w-0">
              <p className="text-sm font-medium text-fg truncate">
                {manager.name}
              </p>
              <p className="text-[11px] text-fg-subtle truncate">{manager.email}</p>
            </div>
          </div>
          <DropdownMenu.Item asChild>
            <Link
              href="/settings?tab=profile"
              className="flex items-center gap-2 px-3 h-8 text-sm text-fg hover:bg-surface-2 focus:bg-surface-2 outline-none cursor-pointer"
            >
              <User className="size-3.5 text-fg-muted" aria-hidden />
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 h-8 text-sm text-fg hover:bg-surface-2 focus:bg-surface-2 outline-none cursor-pointer"
            >
              <Settings className="size-3.5 text-fg-muted" aria-hidden />
              Settings
            </Link>
          </DropdownMenu.Item>
          <div className="border-t border-border my-1" />
          <DropdownMenu.Item
            onSelect={() => toast.info(toasts.notImplemented("Auth"))}
            className="flex items-center gap-2 px-3 h-8 text-sm text-danger hover:bg-danger-soft focus:bg-danger-soft outline-none cursor-pointer"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Wand2,
  Car,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Kbd } from "@/components/ui/Kbd";
import { manager, tenant } from "@/lib/mock";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  shortcut: string;
  group: "main" | "configure";
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="size-4" />, shortcut: "1", group: "main" },
  { label: "Chats", href: "/chats", icon: <MessageSquare className="size-4" />, shortcut: "2", group: "main" },
  { label: "Leads", href: "/leads", icon: <Sparkles className="size-4" />, shortcut: "3", group: "main" },
  { label: "Tune AI", href: "/tune", icon: <Wand2 className="size-4" />, shortcut: "4", group: "configure" },
  { label: "Fleets", href: "/fleets", icon: <Car className="size-4" />, shortcut: "5", group: "configure" },
  { label: "Settings", href: "/settings", icon: <Settings className="size-4" />, shortcut: "6", group: "configure" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="px-3">
      <p className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 px-3 h-9 rounded-md text-sm transition-colors duration-100",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    active ? "text-accent" : "text-fg-subtle group-hover:text-fg-muted"
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                <Kbd
                  className={cn(
                    "transition-opacity duration-100",
                    active
                      ? "opacity-60"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  ⌘{item.shortcut}
                </Kbd>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const main = NAV.filter((n) => n.group === "main");
  const configure = NAV.filter((n) => n.group === "configure");

  // ⌘1–⌘6 jump shortcuts. Disabled when focus is in an input/textarea so they
  // don't fight typing.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      const idx = NAV.findIndex((n) => n.shortcut === e.key);
      if (idx === -1) return;
      e.preventDefault();
      router.push(NAV[idx].href);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 h-full bg-surface border-r border-border"
      aria-label="Primary navigation"
    >
      {/* Brand block */}
      <div className="h-14 px-5 flex items-center gap-2 border-b border-border">
        <span
          aria-hidden
          className="size-6 rounded-md bg-accent flex items-center justify-center"
        >
          <span className="size-2.5 rounded-sm bg-accent-fg/95" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-fg">
          {tenant.businessName}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-5">
        <NavSection label="Main" items={main} pathname={pathname} />
        <NavSection label="Configure" items={configure} pathname={pathname} />
      </nav>

      {/* Manager footer */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-2 transition-colors duration-100 text-left"
        >
          <Avatar name={manager.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate">
              {manager.name}
            </p>
            <p className="text-xs text-fg-subtle capitalize truncate">
              {manager.role}
            </p>
          </div>
          <MoreHorizontal className="size-4 text-fg-subtle shrink-0" aria-hidden />
        </button>
      </div>
    </aside>
  );
}

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/Kbd";
import { NotificationsBell } from "./NotificationsBell";
import { AccountMenu } from "./AccountMenu";
import { CommandPalette } from "./CommandPalette";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chats": "Chat history",
  "/leads": "Leads",
  "/tune": "Tune AI",
  "/fleets": "Fleet",
  "/fleets/new": "Add vehicle",
  "/settings": "Settings",
};

function titleFor(pathname: string) {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname];
  if (pathname.startsWith("/chats/")) return "Chat";
  if (pathname.startsWith("/fleets/new")) return "Add vehicle";
  if (pathname.startsWith("/fleets/")) return "Vehicle";
  if (pathname.startsWith("/leads")) return "Leads";
  if (pathname.startsWith("/tune")) return "Tune AI";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}

const PRESETS = ["Today", "7 days", "30 days", "Custom"] as const;

export function TopBar() {
  const pathname = usePathname();
  const showDateFilter = ["/dashboard", "/chats", "/leads"].some(
    (p) => pathname === p || pathname.startsWith(p + "?")
  );
  const [range, setRange] = React.useState<(typeof PRESETS)[number]>("7 days");
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // ⌘K / Ctrl+K opens the command palette
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface border-b border-border">
      <div className="h-full px-6 flex items-center gap-6">
        {/* Page title */}
        <h1 className="text-base font-semibold text-fg whitespace-nowrap">
          {titleFor(pathname)}
        </h1>

        {/* Search trigger (opens palette) */}
        <div className="flex-1 max-w-[480px] mx-auto">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open search palette"
            className={cn(
              "w-full h-9 px-3 inline-flex items-center gap-2 rounded-sm text-base",
              "bg-surface border border-border text-fg-subtle",
              "hover:border-border-strong hover:text-fg transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            )}
          >
            <Search className="size-4 text-fg-subtle shrink-0" aria-hidden />
            <span className="flex-1 text-left">
              Search chats, leads, vehicles…
            </span>
            <Kbd>⌘K</Kbd>
          </button>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 ml-auto">
          {showDateFilter && <DateRangeButton range={range} onChange={setRange} />}
          <NotificationsBell />
          <AccountMenu />
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}

function DateRangeButton({
  range,
  onChange,
}: {
  range: string;
  onChange: (r: (typeof PRESETS)[number]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm",
          "bg-surface border border-border text-fg-muted",
          "hover:border-border-strong hover:text-fg transition-colors duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        <span>{range}</span>
        <ChevronDown className="size-3.5" aria-hidden />
      </button>
      {open && (
        <ul
          className="absolute right-0 top-11 z-50 min-w-[160px] py-1 rounded-md bg-surface border border-border shadow-md"
          role="menu"
        >
          {PRESETS.map((p) => (
            <li key={p}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={range === p}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 h-8 text-left text-sm",
                  "flex items-center justify-between",
                  range === p
                    ? "bg-accent-soft text-accent"
                    : "text-fg hover:bg-surface-2"
                )}
              >
                {p}
                {range === p && <span className="size-1.5 rounded-full bg-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

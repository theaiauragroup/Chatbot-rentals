"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Sparkles,
  MessageCircle,
  Car,
  CornerDownLeft,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { leads, chats, vehicles } from "@/lib/mock";
import { Kbd } from "@/components/ui/Kbd";
import { Avatar } from "@/components/ui/Avatar";
import { TemperaturePill } from "@/components/leads/StatusPill";
import { cn, formatPhone, formatRelative } from "@/lib/utils";

interface PaletteItem {
  id: string;
  group: "Leads" | "Chats" | "Vehicles" | "Pages";
  label: string;
  meta?: string;
  href: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const PAGES: PaletteItem[] = [
  { id: "p_dashboard", group: "Pages", label: "Dashboard", href: "/dashboard", icon: <Sparkles className="size-3.5" aria-hidden /> },
  { id: "p_chats", group: "Pages", label: "Chat history", href: "/chats", icon: <MessageCircle className="size-3.5" aria-hidden /> },
  { id: "p_leads", group: "Pages", label: "Leads", href: "/leads", icon: <Sparkles className="size-3.5" aria-hidden /> },
  { id: "p_tune", group: "Pages", label: "Tune AI", href: "/tune", icon: <Sparkles className="size-3.5" aria-hidden /> },
  { id: "p_fleets", group: "Pages", label: "Fleet", href: "/fleets", icon: <Car className="size-3.5" aria-hidden /> },
  { id: "p_settings", group: "Pages", label: "Settings", href: "/settings", icon: <Sparkles className="size-3.5" aria-hidden /> },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Build searchable items
  const items: PaletteItem[] = React.useMemo(() => {
    const ql = q.trim().toLowerCase();

    const leadItems: PaletteItem[] = leads
      .filter((l) =>
        ql
          ? `${l.customerName} ${l.customerPhone ?? ""} ${l.customerEmail ?? ""}`
              .toLowerCase()
              .includes(ql)
          : true
      )
      .slice(0, 6)
      .map((l) => ({
        id: l.id,
        group: "Leads",
        label: l.customerName || "Anonymous",
        meta: [l.customerPhone && formatPhone(l.customerPhone), formatRelative(l.updatedAt)]
          .filter(Boolean)
          .join(" · "),
        href: `/leads?id=${l.id}`,
        icon: <Avatar name={l.customerName || "Anonymous"} size="sm" />,
        rightSlot: <TemperaturePill temperature={l.temperature || "cold"} />,
      }));

    const chatItems: PaletteItem[] = chats
      .filter((c) => {
        if (!ql) return true;
        const hay = [
          c.customerName ?? "",
          c.customerPhone ?? "",
          ...c.messages.map((m) => m.text),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(ql);
      })
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        group: "Chats",
        label: c.customerName ?? "(anonymous)",
        meta: `${c.messages.length} msgs · ${formatRelative(c.startedAt)}`,
        href: `/chats/${c.id}`,
        icon: (
          <span
            aria-hidden
            className="size-7 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
          >
            <MessageCircle className="size-3.5" />
          </span>
        ),
      }));

    const vehicleItems: PaletteItem[] = vehicles
      .filter((v) =>
        ql
          ? `${v.make} ${v.model} ${v.plate} ${v.category}`.toLowerCase().includes(ql)
          : true
      )
      .slice(0, 6)
      .map((v) => ({
        id: v.id,
        group: "Vehicles",
        label: `${v.make} ${v.model}`,
        meta: `${v.plate} · ${v.year}`,
        href: `/fleets/${v.id}`,
        icon: (
          <span
            aria-hidden
            className="size-7 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
          >
            <Car className="size-3.5" />
          </span>
        ),
      }));

    const pageItems = PAGES.filter((p) =>
      ql ? p.label.toLowerCase().includes(ql) : true
    );

    return [...pageItems, ...leadItems, ...chatItems, ...vehicleItems];
  }, [q]);

  // Reset index on items change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(0);
  }, [q]);

  // Reset query on close
  React.useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ("");
  }, [open]);

  function navigateTo(item: PaletteItem) {
    onOpenChange(false);
    router.push(item.href);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) navigateTo(item);
    }
  }

  // Group items for rendering
  const grouped = React.useMemo(() => {
    const out: Record<PaletteItem["group"], PaletteItem[]> = {
      Pages: [],
      Leads: [],
      Chats: [],
      Vehicles: [],
    };
    for (const it of items) out[it.group].push(it);
    return out;
  }, [items]);

  // Compute global index for a per-group local index
  function globalIndexOf(item: PaletteItem) {
    return items.findIndex((x) => x.id === item.id && x.group === item.group);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-[20%] -translate-x-1/2 z-[70] w-[640px] max-w-[calc(100vw-32px)]",
            "rounded-lg bg-surface shadow-lg outline-none flex flex-col max-h-[60vh] overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search command palette</Dialog.Title>
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
            <Search className="size-4 text-fg-subtle shrink-0" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search leads, chats, vehicles, pages…"
              aria-label="Search"
              className="flex-1 bg-transparent outline-none text-base text-fg placeholder:text-fg-subtle"
            />
            <Kbd>Esc</Kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-fg">Nothing matched “{q}”.</p>
                <p className="text-xs text-fg-muted mt-1">
                  Try a customer name, phone, vehicle plate, or section.
                </p>
              </div>
            ) : (
              <>
                {(["Pages", "Leads", "Chats", "Vehicles"] as const).map((group) => {
                  const groupItems = grouped[group];
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group}>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                        {group}
                      </p>
                      <ul>
                        {groupItems.map((it) => {
                          const idx = globalIndexOf(it);
                          const active = idx === activeIdx;
                          return (
                            <li key={it.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIdx(idx)}
                                onClick={() => navigateTo(it)}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-4 py-2 text-left",
                                  "transition-colors duration-100",
                                  active
                                    ? "bg-accent-soft text-accent"
                                    : "text-fg hover:bg-surface-2"
                                )}
                              >
                                {it.icon}
                                <div className="flex-1 min-w-0 leading-tight">
                                  <p className="text-sm truncate">{it.label}</p>
                                  {it.meta && (
                                    <p className="text-[11px] text-fg-subtle truncate tabular-nums">
                                      {it.meta}
                                    </p>
                                  )}
                                </div>
                                {it.rightSlot}
                                {active && (
                                  <CornerDownLeft
                                    className="size-3 text-accent shrink-0"
                                    aria-hidden
                                  />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-border px-4 h-8 flex items-center gap-3 text-[11px] text-fg-subtle">
            <span className="inline-flex items-center gap-1">
              <Kbd>
                <ArrowUp className="size-2.5" aria-hidden />
              </Kbd>
              <Kbd>
                <ArrowDown className="size-2.5" aria-hidden />
              </Kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>
                <CornerDownLeft className="size-2.5" aria-hidden />
              </Kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>Esc</Kbd>
              close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

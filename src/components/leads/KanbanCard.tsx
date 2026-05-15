"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Lead } from "@/lib/types";
import {
  cn,
  formatDateRange,
  formatPhone,
  formatRelative,
  formatUsd,
} from "@/lib/utils";

interface KanbanCardProps {
  lead: Lead;
  vehicleLabel?: string;
  chatMessageCount?: number;
  onOpen: (lead: Lead) => void;
  isOverlay?: boolean;
}

export function KanbanCard({
  lead,
  vehicleLabel,
  chatMessageCount,
  onOpen,
  isOverlay = false,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id, data: { lead } });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Avoid double-open when ending a drag.
        if (isDragging) return;
        e.stopPropagation();
        onOpen(lead);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onOpen(lead);
        }
      }}
      className={cn(
        "group flex flex-col gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5",
        "shadow-xs hover:shadow-md hover:-translate-y-px hover:border-border-strong",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "cursor-grab active:cursor-grabbing",
        "transition-[box-shadow,border-color,transform] duration-150",
        isOverlay && "shadow-md rotate-1"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Avatar name={lead.customerName || "A"} size="sm" />
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-xs font-medium text-fg truncate">
            {lead.customerName || "Anonymous"}
          </p>
          {lead.customerPhone && (
            <p className="text-[10px] text-fg-subtle tabular-nums truncate">
              {formatPhone(lead.customerPhone)}
            </p>
          )}
        </div>
      </div>

      <div className="text-[11px] text-fg-muted leading-tight truncate">
        {vehicleLabel ?? "Browsing"} 
        {(lead.trip.pickupDate || lead.trip.returnDate) && (
          <>
            {" · "}
            {formatDateRange(lead.trip.pickupDate, lead.trip.returnDate)}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-fg font-semibold tabular-nums">
          {formatUsd(lead.estimatedValueUsd)}
        </span>
        <span className="text-fg-subtle inline-flex items-center gap-1">
          {chatMessageCount !== undefined && (
            <>
              <MessageCircle className="size-3" aria-hidden /> {chatMessageCount}
            </>
          )}
          <span aria-hidden>·</span>
          <span className="tabular-nums">{formatRelative(lead.updatedAt)}</span>
        </span>
      </div>
    </article>
  );
}

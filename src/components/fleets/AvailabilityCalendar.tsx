"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingRange, Vehicle } from "@/lib/types";
import { useFleetStore } from "./FleetStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";
import { FleetDailyCalendar } from "./FleetDailyCalendar";

interface AvailabilityCalendarProps {
  vehicle: Vehicle;
}

function dateRangeToDays(start: string, end: string): Date[] {
  const out: Date[] = [];
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d));
  }
  return out;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const REASON_LABEL: Record<BookingRange["reason"], string> = {
  rented: "Rented",
  maintenance: "Maintenance",
  blocked: "Blocked",
};

export function AvailabilityCalendar({ vehicle }: AvailabilityCalendarProps) {
  const store = useFleetStore();
  const today = new Date("2026-05-08T00:00:00");
  const [month, setMonth] = React.useState(today);
  const [selecting, setSelecting] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [viewingHourly, setViewingHourly] = React.useState<Date | null>(null);
  const [editingBlock, setEditingBlock] = React.useState<BookingRange | null>(null);
  const [creating, setCreating] = React.useState<{
    start: string;
    end: string;
  } | null>(null);
  const [reason, setReason] = React.useState<BookingRange["reason"]>("blocked");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("18:00");

  // Compute modifiers from blocks
  const rentedDays: Date[] = [];
  const maintenanceDays: Date[] = [];
  const blockedDays: Date[] = [];
  for (const b of vehicle.blocks) {
    const days = dateRangeToDays(b.start, b.end);
    if (b.reason === "rented") rentedDays.push(...days);
    else if (b.reason === "maintenance") maintenanceDays.push(...days);
    else blockedDays.push(...days);
  }

  function findBlockByDate(d: Date): BookingRange | undefined {
    const t = ymd(d);
    return vehicle.blocks.find((b) => t >= b.start && t <= b.end);
  }

  function handleSelect(range: { from?: Date; to?: Date } | undefined) {
    if (!range) return;
    setSelecting({ from: range.from, to: range.to });
    if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
      setCreating({ start: ymd(range.from), end: ymd(range.to) });
    } else if (range.from && !range.to) {
      // single-day selection — open hourly view
      setViewingHourly(range.from);
      setSelecting({ from: undefined, to: undefined });
    }
  }

  function handleDayClick(d: Date) {
    const block = findBlockByDate(d);
    if (block) {
      setEditingBlock(block);
    }
  }

  async function syncBlocksToWebhook(updatedBlocks: BookingRange[], changedBlock?: BookingRange, isDelete = false) {
    try {
      const blockStr = changedBlock ? `${changedBlock.start} to ${changedBlock.end}` : "";
      await fetch("/api/calender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isDelete ? "unblock" : "block",
          "Car ID": vehicle.id,
          "Vehicle ID": vehicle.id,
          "Make": vehicle.make,
          "Model": vehicle.model,
          "Plate": vehicle.plate,
          "Start Date": changedBlock ? changedBlock.start : "",
          "End Date": changedBlock ? changedBlock.end : "",
          "Start Time": changedBlock ? changedBlock.startTime : "",
          "End Time": changedBlock ? changedBlock.endTime : "",
          "Reason": changedBlock ? changedBlock.reason : "",
          "start": changedBlock ? changedBlock.start : "",
          "end": changedBlock ? changedBlock.end : "",
          "startTime": changedBlock ? changedBlock.startTime : "",
          "endTime": changedBlock ? changedBlock.endTime : "",
          "reason": changedBlock ? changedBlock.reason : "",
          "Blocked Date String": blockStr,
          "Blocked Dates": JSON.stringify(updatedBlocks),
          "Blocks": JSON.stringify(updatedBlocks),
          "blocks": updatedBlocks,
        }),
      });
    } catch (error) {
      console.error("Failed to sync blocks to calendar webhook:", error);
    }
  }

  function commitCreate() {
    if (!creating) return;
    const newBlock: BookingRange = {
      id: `blk_${Date.now()}`,
      start: creating.start,
      end: creating.end,
      startTime,
      endTime,
      reason,
    };
    store.addBlock(vehicle.id, newBlock);
    syncBlocksToWebhook([...vehicle.blocks, newBlock], newBlock, false);

    setCreating(null);
    setSelecting({ from: undefined, to: undefined });
    setReason("blocked");
    setStartTime("09:00");
    setEndTime("18:00");
  }

  function cancelCreate() {
    setCreating(null);
    setSelecting({ from: undefined, to: undefined });
    setReason("blocked");
    setStartTime("09:00");
    setEndTime("18:00");
  }

  return (
    <div>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        month={month}
        onMonthChange={setMonth}
        selected={selecting}
        onSelect={handleSelect}
        onDayClick={handleDayClick}
        showOutsideDays
        modifiers={{
          rented: rentedDays,
          maintenance: maintenanceDays,
          blocked: blockedDays,
          today: [today],
        }}
        modifiersClassNames={{
          rented:
            "bg-accent-soft text-accent font-medium hover:bg-accent-soft hover:text-accent",
          maintenance:
            "bg-warm-soft text-warning font-medium hover:bg-warm-soft hover:text-warning",
          blocked:
            "bg-surface-2 text-fg-muted font-medium hover:bg-surface-2",
          today: "ring-1 ring-accent ring-inset rounded-md",
          selected: "bg-accent text-accent-fg hover:bg-accent",
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="size-4" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            ),
        }}
        classNames={{
          months: "flex gap-6",
          month: "flex flex-col gap-2",
          caption_label: "text-sm font-medium text-fg",
          nav: "flex items-center gap-1",
          button_next:
            "size-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors",
          button_previous:
            "size-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors",
          weekdays: "grid grid-cols-7",
          weekday: "size-9 text-[11px] font-medium text-fg-subtle",
          week: "grid grid-cols-7 gap-y-0.5",
          day: "size-9 inline-flex items-center justify-center text-xs text-fg hover:bg-surface-2 rounded-md cursor-pointer",
          day_button:
            "size-9 inline-flex items-center justify-center text-xs rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent",
          outside: "text-fg-subtle/60",
          disabled: "opacity-30 cursor-not-allowed",
        }}
      />

      {/* Helper + legend */}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-[11px]">
        <p className="text-fg-subtle">
          Drag a range to schedule dates · Click an empty day for hourly report · Click existing schedule to edit
        </p>
        <ul className="flex items-center gap-3 text-fg-muted">
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-sm bg-accent-soft" />
            Rented
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-sm bg-warm-soft" />
            Maintenance
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-sm bg-surface-2" />
            Scheduled
          </li>
        </ul>
      </div>

      {/* Hourly Report Modal */}
      <Modal
        open={!!viewingHourly}
        onOpenChange={(o) => {
          if (!o) setViewingHourly(null);
        }}
        title={`Hourly Report: ${vehicle.make} ${vehicle.model}`}
        description={`Schedule for ${viewingHourly?.toLocaleString("default", { weekday: "long", month: "long", day: "numeric" })}`}
        footer={
          <Button variant="secondary" onClick={() => setViewingHourly(null)}>
            Close
          </Button>
        }
      >
        <div className="pt-2">
          {viewingHourly && (
            <FleetDailyCalendar 
              vehicles={[vehicle]} 
              initialDate={viewingHourly} 
              hideControls={true} 
            />
          )}
        </div>
      </Modal>

      {/* Create modal */}
      <Modal
        open={!!creating}
        onOpenChange={(o) => {
          if (!o) cancelCreate();
        }}
        title="Schedule these dates"
        description={
          creating
            ? `${formatDate(creating.start)} ${startTime} → ${formatDate(creating.end)} ${endTime}`
            : ""
        }
        width="form"
        footer={
          <>
            <Button variant="ghost" onClick={cancelCreate}>
              Cancel
            </Button>
            <Button variant="primary" onClick={commitCreate}>
              Schedule dates
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          {/* Reason */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-fg">Reason</span>
            <select
              value={reason}
              onChange={(e) =>
                setReason(e.target.value as BookingRange["reason"])
              }
              className="h-9 px-3 rounded-sm border border-border bg-surface text-base text-fg outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="blocked">Scheduled (manual)</option>
              <option value="maintenance">Maintenance</option>
              <option value="rented">Rented (manual entry)</option>
            </select>
          </label>

          {/* Pickup + return time */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg">Pickup time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 px-3 rounded-sm border border-border bg-surface text-base text-fg outline-none focus:ring-2 focus:ring-accent tabular-nums"
              />
              <span className="text-[11px] text-fg-subtle">
                On {creating ? formatDate(creating.start) : "—"}
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-fg">Return time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 px-3 rounded-sm border border-border bg-surface text-base text-fg outline-none focus:ring-2 focus:ring-accent tabular-nums"
              />
              <span className="text-[11px] text-fg-subtle">
                On {creating ? formatDate(creating.end) : "—"}
              </span>
            </label>
          </div>
          <p className="text-[11px] text-fg-subtle">
            Times are stored on the booking range and shown to customers when the bot quotes pickup / return.
          </p>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editingBlock}
        onOpenChange={(o) => {
          if (!o) setEditingBlock(null);
        }}
        title="Edit schedule"
        description={
          editingBlock
            ? `${REASON_LABEL[editingBlock.reason]} · ${formatDate(editingBlock.start)}${editingBlock.startTime ? ` ${editingBlock.startTime}` : ""} → ${formatDate(editingBlock.end)}${editingBlock.endTime ? ` ${editingBlock.endTime}` : ""}`
            : ""
        }
        width="form"
        footer={
          editingBlock ? (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  store.removeBlock(vehicle.id, editingBlock.id);
                  const remainingBlocks = vehicle.blocks.filter((b) => b.id !== editingBlock.id);
                  syncBlocksToWebhook(remainingBlocks, editingBlock, true);
                  setEditingBlock(null);
                }}
              >
                Delete schedule
              </Button>
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => setEditingBlock(null)}>
                Done
              </Button>
            </>
          ) : null
        }
      >
        {editingBlock && (
          <div className="flex flex-col gap-3 pt-1 text-sm">
            <p className="text-fg-muted text-xs">
              {editingBlock.reason === "rented" && editingBlock.leadId ? (
                <>
                  Linked to lead{" "}
                  <span className="text-fg font-medium">
                    #{editingBlock.leadId.replace("lead_", "L-")}
                  </span>
                  .
                </>
              ) : (
                <>This schedule is manually maintained on this vehicle.</>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-fg">Start</span>
                <div className="px-3 h-9 rounded-sm border border-border bg-surface-2 text-base text-fg-muted tabular-nums inline-flex items-center">
                  {formatDate(editingBlock.start)}
                </div>
                {editingBlock.startTime ? (
                  <div className="px-3 h-9 rounded-sm border border-border bg-surface-2 text-base text-fg-muted tabular-nums inline-flex items-center">
                    Pickup {editingBlock.startTime}
                  </div>
                ) : (
                  <span className="text-[11px] text-fg-subtle italic">
                    No pickup time set
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-fg">End</span>
                <div className="px-3 h-9 rounded-sm border border-border bg-surface-2 text-base text-fg-muted tabular-nums inline-flex items-center">
                  {formatDate(editingBlock.end)}
                </div>
                {editingBlock.endTime ? (
                  <div className="px-3 h-9 rounded-sm border border-border bg-surface-2 text-base text-fg-muted tabular-nums inline-flex items-center">
                    Return {editingBlock.endTime}
                  </div>
                ) : (
                  <span className="text-[11px] text-fg-subtle italic">
                    No return time set
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles = cn; // satisfy unused-import (cn used internally)
void styles;

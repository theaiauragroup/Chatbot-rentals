"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import type { BookingRange, Vehicle } from "@/lib/types";
import { useFleetStore } from "./FleetStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";

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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const REASON_LABEL: Record<BookingRange["reason"], string> = {
  rented: "Rented",
  maintenance: "Maintenance",
  blocked: "Scheduled",
};

export function AvailabilityCalendar({ vehicle }: AvailabilityCalendarProps) {
  const store = useFleetStore();
  const today = new Date("2026-05-21T00:00:00");
  const [month, setMonth] = React.useState(today);
  const [selecting, setSelecting] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [viewingHourly, setViewingHourly] = React.useState<Date | null>(today); // Show today by default
  const [editingBlock, setEditingBlock] = React.useState<BookingRange | null>(null);
  const [creating, setCreating] = React.useState<{
    start: string;
    end: string;
  } | null>(null);
  const [reason, setReason] = React.useState<BookingRange["reason"]>("blocked");
  const [allDay, setAllDay] = React.useState(true);
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("18:00");

  // Calculate selected hours for highlighting
  const selectedHours = React.useMemo(() => {
    if (!allDay && startTime && endTime) {
      const startHour = parseInt(startTime.split(':')[0], 10);
      const endHour = parseInt(endTime.split(':')[0], 10);
      return { startHour, endHour };
    }
    return null;
  }, [allDay, startTime, endTime]);

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
      // Multi-day range selection - show first date in hourly view
      const startDate = ymd(range.from);
      const endDate = ymd(range.to);
      setCreating({ start: startDate, end: endDate });
      setViewingHourly(range.from); // Show start date in hourly section
    } else if (range.from && range.to && range.from.getTime() === range.to.getTime()) {
      // Single day selected - show in hourly view
      const selectedDate = ymd(range.from);
      setCreating({ start: selectedDate, end: selectedDate });
      setViewingHourly(range.from); // Show this date in hourly section
    } else if (range.from && !range.to) {
      // Single click - open hourly view
      setViewingHourly(range.from);
      setSelecting({ from: undefined, to: undefined });
    }
  }

  function handleDayClick(d: Date) {
    const block = findBlockByDate(d);
    if (block) {
      setEditingBlock(block);
    } else {
      // Single click on empty day - open modal and show in hourly view
      const selectedDate = ymd(d);
      setCreating({ start: selectedDate, end: selectedDate });
      setViewingHourly(d); // Show this date in hourly section
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
      startTime: allDay ? "00:00" : startTime,
      endTime: allDay ? "23:59" : endTime,
      reason,
    };
    store.addBlock(vehicle.id, newBlock);
    syncBlocksToWebhook([...vehicle.blocks, newBlock], newBlock, false);

    // Keep viewing the scheduled date to see the badge appear
    const scheduledDate = new Date(creating.start + "T00:00:00");
    setViewingHourly(scheduledDate);
    
    setCreating(null);
    setSelecting({ from: undefined, to: undefined });
    setReason("blocked");
    setAllDay(true);
    setStartTime("09:00");
    setEndTime("18:00");
  }

  function cancelCreate() {
    setCreating(null);
    setSelecting({ from: undefined, to: undefined });
    setReason("blocked");
    setAllDay(true);
    setStartTime("09:00");
    setEndTime("18:00");
  }

  return (
    <div>
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Calendar Section - 50% width */}
        <div className="w-full xl:w-1/2 shrink-0 flex flex-col">
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
      </div>
      
      {/* Metrics Section - 50% width */}
      <div className="w-full xl:w-1/2 shrink-0 flex flex-col">
        {(() => {
          const viewingDateStr = viewingHourly ? ymd(viewingHourly) : ymd(today);
          const blocksOnViewingDate = vehicle.blocks.filter(b => {
            return viewingDateStr >= b.start && viewingDateStr <= b.end;
          });
          const isAvailable = blocksOnViewingDate.length === 0;

          return (
            <div className="rounded-xl border border-border bg-surface p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-fg">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-xs text-fg-muted mt-0.5">Daily Overview</p>
                </div>
                <span className="text-xs font-medium text-fg-muted bg-surface-2 px-2 py-1 rounded-md">
                  {viewingHourly ? formatDate(ymd(viewingHourly)) : formatDate(ymd(today))}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col p-4 rounded-lg bg-surface-2/50 border border-border/50">
                  <span className="text-xs text-fg-subtle mb-1">Status</span>
                  {isAvailable ? (
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-rose-500" />
                      <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Scheduled</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col p-4 rounded-lg bg-surface-2/50 border border-border/50">
                  <span className="text-xs text-fg-subtle mb-1">Total Scheduled</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-fg">{blocksOnViewingDate.length}</span>
                    <span className="text-xs text-fg-muted">record(s)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-medium text-fg-muted mb-3">Schedule Details</span>
                {blocksOnViewingDate.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {blocksOnViewingDate.map(block => (
                      <li key={block.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-surface-2/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-2 rounded-sm",
                            block.reason === 'rented' ? 'bg-accent' :
                            block.reason === 'maintenance' ? 'bg-warning' : 'bg-surface-2 border border-border'
                          )} />
                          <div>
                            <p className="text-sm text-fg">{REASON_LABEL[block.reason]}</p>
                            <p className="text-[11px] text-fg-muted">
                              {block.startTime || "00:00"} - {block.endTime || "23:59"}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingBlock(block)}
                          className="text-xs h-7 text-accent hover:text-accent-fg"
                        >
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-fg-muted">No schedule records</p>
                    <p className="text-[11px] text-fg-subtle mt-1">This vehicle is free on this date.</p>
                  </div>
                )}
              </div>
              
              <Button 
                variant="secondary" 
                className="w-full mt-6 text-xs"
                onClick={() => {
                  const d = viewingHourly || today;
                  const dateStr = ymd(d);
                  setCreating({ start: dateStr, end: dateStr });
                }}
              >
                + Add Schedule
              </Button>
            </div>
          );
        })()}
      </div>
      </div>
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

          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => {
                const isAllDay = e.target.checked;
                setAllDay(isAllDay);
                if (isAllDay) {
                  setStartTime("00:00");
                  setEndTime("23:59");
                } else {
                  setStartTime("09:00");
                  setEndTime("18:00");
                }
              }}
              className="size-4 rounded-sm border border-border text-accent focus:ring-2 focus:ring-accent accent-accent"
            />
            <span className="text-xs font-medium text-fg">All day (00:00 - 23:59)</span>
          </label>

          {/* Pickup + return time */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
          )}
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

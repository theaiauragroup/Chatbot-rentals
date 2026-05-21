"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Car, Plus } from "lucide-react";
import { Vehicle, BookingRange } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FleetDailyCalendarProps {
  vehicles: Vehicle[];
  initialDate?: Date;
  hideControls?: boolean;
  onAddSchedule?: (date: Date, hour?: number) => void;
}

interface BlockEvent {
  block: BookingRange;
  startHour: number;
  startMinute: number;
  spanMinutes: number;
}

function parseBlockDate(dateStr: string, timeStr?: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hours, minutes);
}

function parseBlockEndDate(dateStr: string, timeStr?: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr || "23:59").split(":").map(Number);
  return new Date(y, m - 1, d, hours, minutes);
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const REASON_STYLE: Record<BookingRange["reason"], { bar: string; bg: string; text: string; sub: string }> = {
  rented:      { bar: "bg-blue-500",   bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",  sub: "text-blue-400"  },
  maintenance: { bar: "bg-amber-400",  bg: "bg-amber-50 border-amber-200", text: "text-amber-700", sub: "text-amber-400" },
  blocked:     { bar: "bg-slate-400",  bg: "bg-slate-50 border-slate-200", text: "text-slate-600", sub: "text-slate-400" },
};

const REASON_LABEL: Record<BookingRange["reason"], string> = {
  rented: "Rented",
  maintenance: "Maintenance",
  blocked: "Scheduled",
};

const HOUR_PX = 52;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  if (h === 0)  return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

function formatTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:${m.toString().padStart(2, "0")} ${period}`;
}

export function FleetDailyCalendar({
  vehicles,
  initialDate,
  hideControls,
  onAddSchedule,
}: FleetDailyCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    const d = new Date(initialDate ?? new Date());
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const now = new Date();
  const isToday = ymd(currentDate) === ymd(now);

  React.useEffect(() => {
    if (scrollRef.current) {
      const target = isToday ? Math.max(now.getHours() - 2, 0) : 7;
      scrollRef.current.scrollTop = target * HOUR_PX;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  React.useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      d.setHours(0, 0, 0, 0);
      setCurrentDate(d);
    }
  }, [initialDate]);

  const nextDay = () => setCurrentDate(p => { const d = new Date(p); d.setDate(d.getDate() + 1); return d; });
  const prevDay = () => setCurrentDate(p => { const d = new Date(p); d.setDate(d.getDate() - 1); return d; });
  const goToToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); setCurrentDate(d); };

  // Merge events from all vehicles for this day
  function getEvents(): BlockEvent[] {
    const todayStr = ymd(currentDate);
    const events: BlockEvent[] = [];
    for (const v of vehicles) {
      for (const block of v.blocks ?? []) {
        if (todayStr < block.start || todayStr > block.end) continue;
        const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
        const dayEnd   = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);
        const bs = parseBlockDate(block.start, block.startTime);
        const be = parseBlockEndDate(block.end, block.endTime);
        const cs = bs < dayStart ? dayStart : bs;
        const ce = be > dayEnd   ? dayEnd   : be;
        const spanMinutes = (ce.getHours() * 60 + ce.getMinutes()) - (cs.getHours() * 60 + cs.getMinutes());
        if (spanMinutes <= 0) continue;
        events.push({ block, startHour: cs.getHours(), startMinute: cs.getMinutes(), spanMinutes });
      }
    }
    return events;
  }

  const events = getEvents();
  const nowTopPx = (now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_PX;

  const dayLabel = currentDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum   = currentDate.getDate();
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      {!hideControls && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          {/* Date badge */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex flex-col items-center justify-center w-10 h-10 rounded-xl select-none",
              isToday ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "bg-slate-100 text-slate-700"
            )}>
              <span className="text-[9px] font-bold tracking-widest uppercase leading-none">{dayLabel}</span>
              <span className="text-base font-bold leading-tight">{dayNum}</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">{monthYear}</p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {events.length === 0 ? "No schedules" : `${events.length} schedule${events.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {onAddSchedule && (
              <button
                onClick={() => onAddSchedule(currentDate)}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-semibold transition-all shadow-sm"
              >
                <Plus className="size-3" />
                Schedule
              </button>
            )}
            <button
              onClick={goToToday}
              className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-500 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
              <button onClick={prevDay} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft className="size-3.5" />
              </button>
              <div className="w-px h-3.5 bg-slate-200" />
              <button onClick={nextDay} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Vehicle pill (single vehicle context) ── */}
      {vehicles.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-slate-50/60">
          <div className="size-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Car className="size-3 text-slate-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">
            {vehicles.map(v => `${v.make} ${v.model}`).join(", ")}
          </span>
          {vehicles[0]?.plate && (
            <span className="text-[10px] text-slate-400 font-mono">{vehicles[0].plate}</span>
          )}
        </div>
      )}

      {/* ── Time grid ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative" style={{ minHeight: 260, maxHeight: 460 }}>
        <div className="relative" style={{ height: HOUR_PX * 24 }}>

          {/* Hour rows */}
          {HOURS.map((hour) => {
            const isCurrent = isToday && hour === now.getHours();
            return (
              <div
                key={hour}
                onClick={() => onAddSchedule && onAddSchedule(currentDate, hour)}
                style={{ top: hour * HOUR_PX, height: HOUR_PX }}
                className={cn(
                  "absolute inset-x-0 flex items-start border-b border-slate-100 transition-colors select-none",
                  isCurrent ? "bg-blue-50/30" : "",
                  onAddSchedule ? "cursor-pointer hover:bg-slate-50 group" : ""
                )}
              >
                {/* Time label */}
                <div className="w-16 shrink-0 flex justify-end pr-3 pt-1">
                  {hour !== 0 && (
                    <span className={cn(
                      "text-[10px] font-medium tabular-nums leading-none",
                      isCurrent ? "text-blue-500 font-semibold" : "text-slate-400"
                    )}>
                      {formatHour(hour)}
                    </span>
                  )}
                </div>

                {/* Cell area */}
                <div className="flex-1 h-full relative border-l border-slate-100">
                  {/* Half-hour divider */}
                  <div className="absolute inset-x-0 border-b border-dashed border-slate-100/80" style={{ top: HOUR_PX / 2 }} />
                  {/* Hover hint */}
                  {onAddSchedule && (
                    <span className="absolute left-2 top-1 text-[10px] text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      + Add schedule
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Event blocks ── */}
          {events.map((ev, i) => {
            const topPx    = (ev.startHour * 60 + ev.startMinute) / 60 * HOUR_PX;
            const heightPx = Math.max(ev.spanMinutes / 60 * HOUR_PX, 22);
            const s = REASON_STYLE[ev.block.reason];
            const isCompact = heightPx < 38;
            const endHour   = ev.startHour + Math.floor((ev.startMinute + ev.spanMinutes) / 60);
            const endMin    = (ev.startMinute + ev.spanMinutes) % 60;
            const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

            return (
              <div
                key={`${ev.block.id}-${i}`}
                style={{ top: topPx + 1, height: heightPx - 2, left: 68, right: 8 }}
                className={cn(
                  "absolute rounded-lg border flex overflow-hidden z-10 shadow-sm",
                  s.bg
                )}
              >
                {/* Left accent bar */}
                <div className={cn("w-1 shrink-0 rounded-l-lg", s.bar)} />
                {/* Content */}
                <div className="flex flex-col justify-center px-2 min-w-0 py-1">
                  <span className={cn("text-[11px] font-semibold leading-tight truncate", s.text)}>
                    {REASON_LABEL[ev.block.reason]}
                  </span>
                  {!isCompact && (
                    <span className={cn("text-[10px] leading-tight mt-0.5 tabular-nums", s.sub)}>
                      {formatTime(ev.block.startTime ?? "00:00")} – {formatTime(ev.block.endTime ?? endTimeStr)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Current time line ── */}
          {isToday && (
            <div
              className="absolute inset-x-0 z-20 pointer-events-none flex items-center"
              style={{ top: nowTopPx }}
            >
              <div className="w-16 flex justify-end pr-2.5">
                <div className="size-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />
              </div>
              <div className="flex-1 h-px bg-red-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

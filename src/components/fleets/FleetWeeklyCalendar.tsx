"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FleetDailyCalendar } from "./FleetDailyCalendar";

interface FleetWeeklyCalendarProps {
  vehicles: Vehicle[];
}

// Helper to get a date string YYYY-MM-DD
function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function FleetWeeklyCalendar({ vehicles }: FleetWeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = React.useState(0);

  // Calculate the start of the week (e.g. Monday) based on current date + weekOffset
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If we want Monday as first day of week:
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() + distanceToMonday + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const [viewingHourly, setViewingHourly] = React.useState<{ vehicle: Vehicle; date: Date } | null>(null);

  const nextWeek = () => setWeekOffset(prev => prev + 1);
  const prevWeek = () => setWeekOffset(prev => prev - 1);
  const goToToday = () => setWeekOffset(0);

  const monthLabel = currentWeekStart.toLocaleString("default", { month: "long", year: "numeric" });

  const isBlocked = (vehicle: Vehicle, dateStr: string) => {
    if (!vehicle.blocks || vehicle.blocks.length === 0) return false;
    return vehicle.blocks.some((block) => {
      return dateStr >= block.start && dateStr <= block.end;
    });
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden bg-surface border border-border">
        {/* Calendar Header / Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-5 text-fg-muted" />
            <h3 className="text-sm font-semibold text-fg">{monthLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={goToToday} className="h-8">
              Today
            </Button>
            <div className="flex items-center rounded-md border border-border bg-surface overflow-hidden">
              <button
                onClick={prevWeek}
                className="p-1.5 hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="w-[1px] h-4 bg-border" />
              <button
                onClick={nextWeek}
                className="p-1.5 hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors"
                title="Next Week"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-border bg-surface-2/30">
              <div className="p-3 text-xs font-medium text-fg-muted flex items-center">
                Vehicle
              </div>
              {weekDays.map((day, i) => {
                const isToday = toDateString(day) === toDateString(today);
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-3 flex flex-col items-center justify-center border-l border-border",
                      isToday ? "bg-accent/5" : ""
                    )}
                  >
                    <span className={cn("text-[10px] font-semibold uppercase", isToday ? "text-accent" : "text-fg-subtle")}>
                      {day.toLocaleString("default", { weekday: "short" })}
                    </span>
                    <span className={cn("text-sm font-medium mt-0.5", isToday ? "text-accent" : "text-fg")}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="flex flex-col">
              {vehicles.length === 0 ? (
                <div className="p-8 text-center text-sm text-fg-muted">
                  No vehicles available.
                </div>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-border last:border-0 hover:bg-surface-2/20 transition-colors">
                    {/* Vehicle Info */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="size-8 rounded-md bg-surface-2 flex items-center justify-center text-fg-subtle shrink-0">
                        <Car className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-fg truncate">
                          {v.make} {v.model}
                        </span>
                        <span className="text-[11px] text-fg-subtle truncate">
                          {v.plate}
                        </span>
                      </div>
                    </div>

                    {/* Day Cells */}
                    {weekDays.map((day, i) => {
                      const dateStr = toDateString(day);
                      const blocked = isBlocked(v, dateStr);
                      const isToday = dateStr === toDateString(today);
                      
                      return (
                        <div
                          key={i}
                          onClick={() => setViewingHourly({ vehicle: v, date: day })}
                          className={cn(
                            "border-l border-border p-1.5 flex items-stretch cursor-pointer hover:opacity-80 transition-opacity",
                            isToday && !blocked ? "bg-accent/5" : ""
                          )}
                        >
                          {blocked ? (
                            <div className="w-full rounded-sm bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center py-1">
                               <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Rented</span>
                            </div>
                          ) : (
                            <div className="w-full rounded-sm bg-green-500/5 border border-green-500/10 border-dashed flex items-center justify-center">
                              <span className="text-[10px] font-medium text-green-600/70">Available</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={!!viewingHourly}
        onOpenChange={(o) => {
          if (!o) setViewingHourly(null);
        }}
        title={`Hourly Report: ${viewingHourly?.vehicle.make} ${viewingHourly?.vehicle.model}`}
        description={`Schedule for ${viewingHourly?.date.toLocaleString("default", { weekday: "long", month: "long", day: "numeric" })}`}
        width="lg"
        footer={
          <Button variant="secondary" onClick={() => setViewingHourly(null)}>
            Close
          </Button>
        }
      >
        <div className="pt-2">
          {viewingHourly && (
            <FleetDailyCalendar 
              vehicles={[viewingHourly.vehicle]} 
              initialDate={viewingHourly.date} 
              hideControls={true} 
            />
          )}
        </div>
      </Modal>
    </>
  );
}

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Vehicle, BookingRange } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FleetDailyCalendarProps {
  vehicles: Vehicle[];
}

function parseBlockDate(dateStr: string, timeStr?: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const time = timeStr || "00:00";
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hours, minutes);
}

function parseBlockEndDate(dateStr: string, timeStr?: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const time = timeStr || "23:59";
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hours, minutes);
}

export function FleetDailyCalendar({ vehicles }: FleetDailyCalendarProps) {
  const [dayOffset, setDayOffset] = React.useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDate = new Date(today);
  currentDate.setDate(today.getDate() + dayOffset);

  const hoursOfDay = Array.from({ length: 24 }).map((_, i) => i);

  const nextDay = () => setDayOffset(prev => prev + 1);
  const prevDay = () => setDayOffset(prev => prev - 1);
  const goToToday = () => setDayOffset(0);

  const dateLabel = currentDate.toLocaleString("default", { 
    weekday: "long", 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  });

  const isBlocked = (vehicle: Vehicle, hour: number) => {
    if (!vehicle.blocks || vehicle.blocks.length === 0) return false;
    
    const hourStart = new Date(currentDate);
    hourStart.setHours(hour, 0, 0, 0);
    
    const hourEnd = new Date(currentDate);
    hourEnd.setHours(hour, 59, 59, 999);

    return vehicle.blocks.some((block) => {
      const blockStart = parseBlockDate(block.start, block.startTime);
      const blockEnd = parseBlockEndDate(block.end, block.endTime);
      return hourStart <= blockEnd && hourEnd >= blockStart;
    });
  };

  const getHourLabel = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  return (
    <Card className="flex flex-col overflow-hidden bg-surface border border-border">
      {/* Calendar Header / Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-5 text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg">{dateLabel}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday} className="h-8">
            Today
          </Button>
          <div className="flex items-center rounded-md border border-border bg-surface overflow-hidden">
            <button
              onClick={prevDay}
              className="p-1.5 hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="w-[1px] h-4 bg-border" />
            <button
              onClick={nextDay}
              className="p-1.5 hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors"
              title="Next Day"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1400px]">
          {/* Hours Header */}
          <div className="grid grid-cols-[250px_repeat(24,1fr)] border-b border-border bg-surface-2/30">
            <div className="p-3 text-xs font-medium text-fg-muted flex items-center">
              Vehicle
            </div>
            {hoursOfDay.map((hour) => {
              const currentRealHour = new Date().getHours();
              const isCurrentHour = dayOffset === 0 && hour === currentRealHour;
              return (
                <div
                  key={hour}
                  className={cn(
                    "p-2 flex flex-col items-center justify-center border-l border-border",
                    isCurrentHour ? "bg-accent/5" : ""
                  )}
                >
                  <span className={cn("text-[10px] font-semibold whitespace-nowrap", isCurrentHour ? "text-accent" : "text-fg-subtle")}>
                    {getHourLabel(hour)}
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
                <div key={v.id} className="grid grid-cols-[250px_repeat(24,1fr)] border-b border-border last:border-0 hover:bg-surface-2/20 transition-colors">
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

                  {/* Hour Cells */}
                  {hoursOfDay.map((hour) => {
                    const blocked = isBlocked(v, hour);
                    const currentRealHour = new Date().getHours();
                    const isCurrentHour = dayOffset === 0 && hour === currentRealHour;
                    
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "border-l border-border p-1 flex items-stretch",
                          isCurrentHour && !blocked ? "bg-accent/5" : ""
                        )}
                      >
                        {blocked ? (
                          <div className="w-full rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center py-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Rented" />
                          </div>
                        ) : (
                          <div className="w-full rounded-sm bg-green-500/5 border border-green-500/10 border-dashed flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" title="Available" />
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
  );
}

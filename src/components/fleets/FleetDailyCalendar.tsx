"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Vehicle, BookingRange } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FleetDailyCalendarProps {
  vehicles: Vehicle[];
  initialDate?: Date;
  hideControls?: boolean;
  onAddSchedule?: (date: Date, hour?: number) => void;
  selectedHours?: { startHour: number; endHour: number } | null;
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

export function FleetDailyCalendar({ vehicles, initialDate, hideControls, onAddSchedule, selectedHours }: FleetDailyCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      d.setHours(0, 0, 0, 0);
      setCurrentDate(d);
    }
  }, [initialDate]);

  React.useEffect(() => {
    // Auto-scroll to current hour or 8 AM on mount
    if (scrollContainerRef.current) {
      const now = new Date();
      const targetHour = currentDate.toDateString() === now.toDateString() ? now.getHours() : 8;
      const hourHeight = 48; // Approximate height of each hour row
      const headerHeight = 60; // Approximate header height
      const scrollPosition = Math.max(0, (targetHour * hourHeight) - headerHeight);
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [currentDate]);

  const hoursOfDay = Array.from({ length: 24 }).map((_, i) => i);

  const nextDay = () => setCurrentDate(prev => {
    const d = new Date(prev);
    d.setDate(d.getDate() + 1);
    return d;
  });
  const prevDay = () => setCurrentDate(prev => {
    const d = new Date(prev);
    d.setDate(d.getDate() - 1);
    return d;
  });
  const goToToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  };

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
    <Card className="flex flex-col overflow-hidden bg-surface border border-border h-full shadow-sm rounded-xl">
      {/* Calendar Header / Controls */}
      {!hideControls && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 shrink-0">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-5 text-fg-muted" />
            <h3 className="text-sm font-semibold text-fg">{dateLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onAddSchedule && (
              <Button variant="primary" size="sm" onClick={() => onAddSchedule(currentDate)} className="h-8 mr-2">
                + Schedule
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={goToToday} className="h-8">
              Today
            </Button>
            <div className="flex items-center rounded-md border border-border bg-surface overflow-hidden shadow-sm">
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
      )}

      <div ref={scrollContainerRef} className="overflow-y-auto overflow-x-hidden flex-1">
        <div className="min-w-0">
          {/* Header Row */}
          <div className="flex border-b border-border bg-surface-2/30 sticky top-0 z-10 backdrop-blur-sm">
            <div className="w-[80px] p-3 text-xs font-medium text-fg-muted flex items-center justify-center border-r border-border shrink-0">
              Time
            </div>
            {vehicles.map(v => (
              <div key={v.id} className="flex-1 p-3 flex items-center gap-3 border-r border-border last:border-0">
                <div className="size-8 rounded-md bg-surface-2 flex items-center justify-center text-fg-subtle shrink-0">
                  <Car className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-fg truncate">{v.make} {v.model}</span>
                  <span className="text-xs text-fg-subtle truncate">{v.plate || "No plate set"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex flex-col pb-4">
            {vehicles.length === 0 ? (
              <div className="p-8 text-center text-sm text-fg-muted">
                No vehicles available.
              </div>
            ) : (
              hoursOfDay.map((hour) => {
                const now = new Date();
                const isCurrentHour = currentDate.toDateString() === now.toDateString() && hour === now.getHours();
                const isSelected = selectedHours && hour >= selectedHours.startHour && hour <= selectedHours.endHour;
                
                return (
                  <div key={hour} className="flex border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors group">
                    {/* Time Cell */}
                    <div className={cn(
                      "w-[80px] p-2 flex flex-col items-center justify-center border-r border-border shrink-0",
                      isCurrentHour ? "bg-accent/5" : "",
                      isSelected ? "bg-green-500/10 border-l-2 border-l-green-500" : ""
                    )}>
                      <span className={cn(
                        "text-xs font-medium whitespace-nowrap",
                        isCurrentHour ? "text-accent" : isSelected ? "text-green-600" : "text-fg-subtle group-hover:text-fg"
                      )}>
                        {getHourLabel(hour)}
                      </span>
                      {isSelected && (
                        <Check className="size-3 text-green-600 mt-0.5" />
                      )}
                    </div>

                    {/* Vehicle Cells */}
                    {vehicles.map((v) => {
                      const blocked = isBlocked(v, hour);
                      
                      return (
                        <div
                          key={v.id}
                          className={cn(
                            "flex-1 p-1.5 flex items-stretch border-r border-border last:border-0",
                            isCurrentHour && !blocked ? "bg-accent/5" : "",
                            isSelected && !blocked ? "bg-green-500/10" : ""
                          )}
                        >
                          {blocked ? (
                            <div className="w-full rounded bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center py-2 shadow-sm">
                               <span className="text-xs font-semibold text-red-600 tracking-wide">Rented</span>
                            </div>
                          ) : (
                            <div 
                              onClick={() => onAddSchedule && onAddSchedule(currentDate, hour)}
                              className={cn(
                                "w-full h-full min-h-[32px] rounded flex items-center justify-center transition-all duration-200 group/cell",
                                onAddSchedule ? "cursor-pointer hover:bg-accent/5 hover:border-accent/20 border border-transparent" : "",
                                isSelected ? "border-green-500/30 bg-green-500/5" : ""
                              )}
                            >
                              {isSelected ? (
                                <Check className="size-4 text-green-600" />
                              ) : (
                                <span className={cn(
                                  "text-xs font-medium transition-opacity",
                                  onAddSchedule ? "opacity-0 group-hover/cell:opacity-100 text-accent/80" : "opacity-0"
                                )}>
                                  {onAddSchedule ? "+ Schedule" : "Available"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

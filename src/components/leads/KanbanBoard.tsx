"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KanbanCard } from "./KanbanCard";
import { useLeadsStore } from "./LeadsStore";
import type { Chat, Lead, LeadTemperature, Vehicle } from "@/lib/types";
import { cn, formatUsd } from "@/lib/utils";
import { tempLabel } from "@/lib/utils";

const COLUMNS: LeadTemperature[] = ["hot", "warm", "cold"];

const COL_TINT: Record<LeadTemperature, string> = {
  hot: "border-t-hot",
  warm: "border-t-warm",
  cold: "border-t-cold",
};

interface KanbanBoardProps {
  leads: Lead[];
  vehiclesById: Map<string, Vehicle>;
  chatsById: Map<string, Chat>;
  onOpen: (lead: Lead) => void;
}

export function KanbanBoard({
  leads,
  vehiclesById,
  chatsById,
  onOpen,
}: KanbanBoardProps) {
  const store = useLeadsStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const grouped = React.useMemo(() => {
    const g: Record<LeadTemperature, Lead[]> = { hot: [], warm: [], cold: [] };
    for (const l of leads) {
      const t = l.temperature || "cold";
      g[t].push(l);
    }
    return g;
  }, [leads]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    const isCol = COLUMNS.includes(overId as LeadTemperature);
    if (!isCol) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    if (lead.temperature !== (overId as LeadTemperature)) {
      store.setTemperature(id, overId as LeadTemperature);
    }
  }

  const active = activeId ? leads.find((l) => l.id === activeId) : undefined;
  const activeVehicle = active
    ? vehiclesById.get(active.vehicleInterestIds[0])
    : undefined;
  const activeChat = active ? chatsById.get(active.chatId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {COLUMNS.map((t) => (
          <KanbanColumn
            key={t}
            temperature={t}
            leads={grouped[t]}
            vehiclesById={vehiclesById}
            chatsById={chatsById}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {active && (
          <KanbanCard
            lead={active}
            vehicleLabel={
              activeVehicle
                ? `${activeVehicle.make} ${activeVehicle.model}`
                : active.vehicleInterestIds[0]
            }
            chatMessageCount={activeChat?.messages.length}
            onOpen={() => {}}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  temperature,
  leads,
  vehiclesById,
  chatsById,
  onOpen,
}: {
  temperature: LeadTemperature;
  leads: Lead[];
  vehiclesById: Map<string, Vehicle>;
  chatsById: Map<string, Chat>;
  onOpen: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: temperature });

  const totalValue = leads.reduce((acc, l) => acc + (l.estimatedValueUsd || 0), 0);
  const avg = leads.length === 0 ? 0 : Math.round(totalValue / leads.length);

  return (
    <Card
      className={cn(
        "flex flex-col border-t-[3px] transition-colors duration-150",
        COL_TINT[temperature],
        isOver && "ring-2 ring-accent ring-offset-0"
      )}
    >
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-fg">{tempLabel(temperature)}</h3>
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-surface-2 text-fg-muted text-[11px] font-medium tabular-nums">
            {leads.length}
          </span>
        </div>
        <span className="text-[11px] text-fg-subtle tabular-nums">
          avg {formatUsd(avg)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 flex flex-col gap-2 min-h-[180px]"
        aria-label={`${tempLabel(temperature)} leads`}
      >
        {leads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <EmptyState
              icon={<Sparkles />}
              title={`No ${temperature} leads`}
              description={`New ${temperature} leads will appear here automatically.`}
            />
          </div>
        ) : (
          leads.map((lead) => {
            const vehicle = vehiclesById.get(lead.vehicleInterestIds[0]);
            const chat = chatsById.get(lead.chatId);
            return (
              <KanbanCard
                key={lead.id}
                lead={lead}
                vehicleLabel={
                  vehicle 
                    ? `${vehicle.make} ${vehicle.model}` 
                    : lead.vehicleInterestIds[0]
                }
                chatMessageCount={chat?.messages.length}
                onOpen={onOpen}
              />
            );
          })
        )}
      </div>
    </Card>
  );
}

"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X, Car, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFleetStore } from "./FleetStore";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import type { Vehicle } from "@/lib/types";
import { ClientOnly } from "@/components/charts/ClientOnly";

const PLACEHOLDERS = [
  "/mock/cars/sedan-silver.jpg",
  "/mock/cars/sedan-silver-2.jpg",
  "/mock/cars/suv-white.jpg",
  "/mock/cars/luxury-black.jpg",
  "/mock/cars/compact-red.jpg",
  "/mock/cars/electric-blue.jpg",
];

interface PhotoManagerProps {
  vehicle: Vehicle;
}

export function PhotoManager({ vehicle }: PhotoManagerProps) {
  const store = useFleetStore();
  const toast = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = vehicle.photos.findIndex((p) => p === active.id);
    const newIndex = vehicle.photos.findIndex((p) => p === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    store.reorderPhotos(vehicle.id, arrayMove(vehicle.photos, oldIndex, newIndex));
  }

  function addPlaceholder() {
    const next = PLACEHOLDERS.find((p) => !vehicle.photos.includes(p)) ?? PLACEHOLDERS[0];
    store.addPhoto(vehicle.id, next);
    toast.info(toasts.notImplemented("Photo upload"));
  }

  const cap = vehicle.photos.length >= 6;

  return (
    <div className="flex flex-col gap-2">
      {/*
        dnd-kit's accessibility layer assigns sequential `aria-describedby` IDs
        whose counter advances differently between server and client renders.
        Wrapping in ClientOnly defers the DndContext mount until after hydration
        and renders an identical-looking static strip in the SSR pass so there
        is no layout shift.
      */}
      <ClientOnly fallback={<StaticStrip vehicle={vehicle} cap={cap} />}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={vehicle.photos} strategy={horizontalListSortingStrategy}>
            <ul className="flex gap-2 flex-wrap">
              {vehicle.photos.map((src, i) => (
                <PhotoTile
                  key={src}
                  src={src}
                  onDelete={() => store.removePhoto(vehicle.id, i)}
                  isHero={i === 0}
                />
              ))}
              {vehicle.photos.length === 0 && <EmptyTile />}
              <li>
                <AddButton onClick={addPlaceholder} disabled={cap} />
              </li>
            </ul>
          </SortableContext>
        </DndContext>
      </ClientOnly>
      <p className="text-[11px] text-fg-subtle">
        {vehicle.photos.length} / 6 photos · drag to reorder · first photo is the hero shot
      </p>
    </div>
  );
}

/**
 * Pre-hydration / SSR-safe placeholder. Visually identical strip with the same
 * dimensions; just no drag handles or click handlers (they activate post-mount).
 */
function StaticStrip({ vehicle, cap }: { vehicle: Vehicle; cap: boolean }) {
  return (
    <ul className="flex gap-2 flex-wrap">
      {vehicle.photos.map((src, i) => (
        <li
          key={src}
          className="relative size-20 rounded-md overflow-hidden bg-surface-2 border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          {i === 0 && (
            <span className="absolute left-1 bottom-1 inline-flex items-center px-1 h-4 rounded-sm bg-fg/70 text-white text-[9px] font-semibold tracking-wider uppercase">
              Hero
            </span>
          )}
        </li>
      ))}
      {vehicle.photos.length === 0 && <EmptyTile />}
      <li>
        <AddButton disabled={cap} />
      </li>
    </ul>
  );
}

function EmptyTile() {
  return (
    <li className="size-20 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle">
      <Car className="size-6" aria-hidden />
    </li>
  );
}

function AddButton({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Maximum 6 photos" : "Add a photo (placeholder)"}
      className={cn(
        "size-20 rounded-md border border-dashed border-border-strong",
        "inline-flex items-center justify-center text-fg-subtle",
        "hover:bg-surface-2 hover:text-fg transition-colors duration-100",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      )}
      aria-label="Add photo"
    >
      <Plus className="size-4" aria-hidden />
    </button>
  );
}

function PhotoTile({
  src,
  onDelete,
  isHero,
}: {
  src: string;
  onDelete: () => void;
  isHero: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: src });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative size-20 rounded-md overflow-hidden bg-surface-2",
        "border border-border"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = "0";
        }}
      />
      {/* Reorder handle (drag) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reorder photo"
        className={cn(
          "absolute left-1 top-1 size-5 rounded-sm bg-fg/60 text-white",
          "inline-flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-grab"
        )}
      >
        <GripVertical className="size-3" aria-hidden />
      </button>
      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete photo"
        className={cn(
          "absolute right-1 top-1 size-5 rounded-sm bg-fg/60 text-white",
          "inline-flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        )}
      >
        <X className="size-3" aria-hidden />
      </button>
      {isHero && (
        <span className="absolute left-1 bottom-1 inline-flex items-center px-1 h-4 rounded-sm bg-fg/70 text-white text-[9px] font-semibold tracking-wider uppercase">
          Hero
        </span>
      )}
    </li>
  );
}

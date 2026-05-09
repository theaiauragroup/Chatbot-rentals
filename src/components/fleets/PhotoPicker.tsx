"use client";

import * as React from "react";
import { Plus, X, Car } from "lucide-react";
import { cn } from "@/lib/utils";

// Curated Unsplash car photos used as placeholder rotation when "Add photo" is
// clicked. Real upload flow lands in pass 2.
const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80",
];

interface PhotoPickerProps {
  photos: string[];
  onChange: (next: string[]) => void;
  /** Hard cap on how many photos can be added. */
  max?: number;
}

export function PhotoPicker({
  photos,
  onChange,
  max = 6,
}: PhotoPickerProps) {
  const cap = photos.length >= max;

  function add() {
    if (cap) return;
    const next =
      PLACEHOLDER_PHOTOS.find((p) => !photos.includes(p)) ??
      PLACEHOLDER_PHOTOS[photos.length % PLACEHOLDER_PHOTOS.length];
    onChange([...photos, next]);
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex gap-2 flex-wrap">
        {photos.map((src, i) => (
          <Tile
            key={src + i}
            src={src}
            onDelete={() => remove(i)}
            isHero={i === 0}
          />
        ))}
        {photos.length === 0 && (
          <li
            aria-hidden
            className="size-20 rounded-md bg-surface-2 inline-flex items-center justify-center text-fg-subtle"
          >
            <Car className="size-6" aria-hidden />
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={add}
            disabled={cap}
            title={cap ? `Maximum ${max} photos` : "Add a photo (placeholder rotation)"}
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
        </li>
      </ul>
      <p className="text-[11px] text-fg-subtle">
        {photos.length} / {max} photos · drag-reorder available after creation
      </p>
    </div>
  );
}

function Tile({
  src,
  onDelete,
  isHero,
}: {
  src: string;
  onDelete: () => void;
  isHero: boolean;
}) {
  return (
    <li className="group relative size-20 rounded-md overflow-hidden bg-surface-2 border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = "0";
        }}
      />
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

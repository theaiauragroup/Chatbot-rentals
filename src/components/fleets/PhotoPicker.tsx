"use client";

import * as React from "react";
import { Plus, X, Car } from "lucide-react";
import { cn } from "@/lib/utils";



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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleAddClick() {
    if (cap) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = max - photos.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    const promises = filesToProcess.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((dataUrls) => {
        onChange([...photos, ...dataUrls]);
      })
      .catch((err) => {
        console.error("Error reading files:", err);
      });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleAddClick}
            disabled={cap}
            title={cap ? `Maximum ${max} photos` : "Add photo from gallery"}
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

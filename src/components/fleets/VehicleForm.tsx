"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useFleetStore } from "./FleetStore";
import { VEHICLE_CATEGORY_LABEL } from "./CategoryBadge";
import { PhotoPicker } from "./PhotoPicker";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import type { Feature, Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

const FEATURE_OPTIONS: ReadonlyArray<{ value: Feature; label: string }> = [
  { value: "ac", label: "AC" },
  { value: "gps", label: "GPS" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "sunroof", label: "Sunroof" },
  { value: "child_seat", label: "Child seat" },
  { value: "all_wheel_drive", label: "AWD" },
  { value: "apple_carplay", label: "Apple CarPlay" },
  { value: "heated_seats", label: "Heated seats" },
];

const CATEGORY_VALUES = Object.keys(VEHICLE_CATEGORY_LABEL) as Vehicle["category"][];

const schema = z.object({
  make: z.string().trim().min(1, "Required").max(40),
  model: z.string().trim().min(1, "Required").max(60),
  year: z.coerce.number().int().min(1990).max(2030),
  plate: z
    .string()
    .trim()
    .min(1, "Required")
    .max(12)
    .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only"),
  category: z.enum(CATEGORY_VALUES as [Vehicle["category"], ...Vehicle["category"][]]),
  dailyRateUsd: z.coerce.number().int().min(0).max(10_000),
  seats: z.coerce.number().int().min(1).max(15),
  transmission: z.enum(["automatic", "manual"]),
  fuel: z.enum(["gasoline", "diesel", "hybrid", "electric"]),
  mileageKm: z.coerce.number().int().min(0).max(1_000_000),
  status: z.enum(["available", "rented", "maintenance", "retired"]),
  features: z.array(z.string()).default([]),
  photos: z.array(z.string()).max(6).default([]),
});

type FormValues = z.infer<typeof schema>;

interface VehicleFormProps {
  initial?: Partial<Vehicle>;
  /** If editing, the vehicle id; otherwise undefined and we create new. */
  editingId?: string;
}

export function VehicleForm({ initial, editingId }: VehicleFormProps) {
  const router = useRouter();
  const store = useFleetStore();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      make: initial?.make ?? "",
      model: initial?.model ?? "",
      year: initial?.year ?? 2024,
      plate: initial?.plate ?? "",
      category: initial?.category ?? "economy",
      dailyRateUsd: initial?.dailyRateUsd ?? 49,
      seats: initial?.seats ?? 5,
      transmission: initial?.transmission ?? "automatic",
      fuel: initial?.fuel ?? "gasoline",
      mileageKm: initial?.mileageKm ?? 0,
      status: initial?.status ?? "available",
      features: (initial?.features ?? ["ac", "bluetooth"]) as string[],
      photos: (initial?.photos ?? []) as string[],
    },
  });

  const features = watch("features");
  const photos = watch("photos");

  function toggleFeature(f: Feature) {
    if (features.includes(f)) {
      setValue("features", features.filter((x) => x !== f), { shouldDirty: true });
    } else {
      setValue("features", [...features, f], { shouldDirty: true });
    }
  }

  function onSubmit(data: FormValues) {
    if (editingId) {
      store.updateVehicle(editingId, {
        ...(data as Partial<Vehicle>),
        features: data.features as Feature[],
        photos: data.photos,
      });
      toast.success(toasts.vehicleUpdated);
      router.push(`/fleets/${editingId}`);
    } else {
      const newId = `veh_${Date.now()}`;
      store.addVehicle({
        id: newId,
        make: data.make,
        model: data.model,
        year: data.year,
        plate: data.plate,
        category: data.category,
        dailyRateUsd: data.dailyRateUsd,
        seats: data.seats,
        transmission: data.transmission,
        fuel: data.fuel,
        mileageKm: data.mileageKm,
        photos: data.photos,
        features: data.features as Feature[],
        status: data.status,
        blocks: [],
        createdAt: new Date().toISOString(),
      });
      toast.success(toasts.vehicleAdded);
      router.push(`/fleets/${newId}`);
    }
  }

  function onCancel() {
    if (isDirty) {
      const ok = window.confirm("Discard changes?");
      if (!ok) return;
    }
    router.push("/fleets");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-8 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Make" error={errors.make?.message}>
            <Input {...register("make")} placeholder="Toyota" invalid={!!errors.make} />
          </Field>
          <Field label="Model" error={errors.model?.message}>
            <Input {...register("model")} placeholder="Corolla" invalid={!!errors.model} />
          </Field>
          <Field label="Year" error={errors.year?.message}>
            <Input
              type="number"
              {...register("year")}
              placeholder="2024"
              invalid={!!errors.year}
            />
          </Field>
          <Field label="License plate" error={errors.plate?.message}>
            <Input {...register("plate")} placeholder="ABC-1234" invalid={!!errors.plate} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Select {...register("category")}>
              {CATEGORY_VALUES.map((c) => (
                <option key={c} value={c}>
                  {VEHICLE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Daily rate (USD)" error={errors.dailyRateUsd?.message}>
            <Input
              type="number"
              {...register("dailyRateUsd")}
              placeholder="49"
              invalid={!!errors.dailyRateUsd}
            />
          </Field>
          <Field label="Seats" error={errors.seats?.message}>
            <Input
              type="number"
              {...register("seats")}
              invalid={!!errors.seats}
            />
          </Field>
          <Field label="Transmission" error={errors.transmission?.message}>
            <Select {...register("transmission")}>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </Select>
          </Field>
          <Field label="Fuel" error={errors.fuel?.message}>
            <Select {...register("fuel")}>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </Select>
          </Field>
          <Field label="Mileage (km)" error={errors.mileageKm?.message}>
            <Input
              type="number"
              {...register("mileageKm")}
              invalid={!!errors.mileageKm}
            />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </Select>
          </Field>
        </div>

        {/* Features */}
        <div className="mt-5">
          <p className="text-sm font-medium text-fg mb-1.5">Features</p>
          <div className="flex flex-wrap gap-1.5">
            {FEATURE_OPTIONS.map((f) => {
              const on = features.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleFeature(f.value)}
                  className={cn(
                    "inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium",
                    "border transition-colors duration-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    on
                      ? "bg-accent-soft border-accent text-accent"
                      : "bg-surface border-border text-fg-muted hover:border-border-strong hover:text-fg"
                  )}
                  aria-pressed={on}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos */}
        <div className="mt-5">
          <p className="text-sm font-medium text-fg mb-1.5">Photos</p>
          <p className="text-[11px] text-fg-subtle mb-3">
            Add up to 6 photos. The first photo is the hero shot on the vehicle card.
          </p>
          <PhotoPicker
            photos={photos}
            onChange={(next) => setValue("photos", next, { shouldDirty: true })}
          />
        </div>
      </Card>

      {/* Right rail: action panel */}
      <Card className="lg:col-span-4 p-5 h-fit sticky top-20">
        <h3 className="text-sm font-semibold text-fg mb-2">
          {editingId ? "Save changes" : "Create vehicle"}
        </h3>
        <p className="text-xs text-fg-muted mb-4 leading-relaxed">
          Photos and the availability calendar are managed on the vehicle detail page after creation.
        </p>
        <div className="flex flex-col gap-2">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {editingId ? "Save changes" : "Add vehicle"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-fg">{label}</span>
      {children}
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </label>
  );
}

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-9 px-3 rounded-sm border border-border bg-surface text-base text-fg",
        "outline-none focus:ring-2 focus:ring-accent",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
});

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Car,
  Edit,
  Archive,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFleetStore } from "./FleetStore";
import { CategoryBadge } from "./CategoryBadge";
import { VehicleStatusPill } from "@/components/leads/StatusPill";
import { PhotoManager } from "./PhotoManager";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { formatUsd } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";
import { toasts } from "@/lib/toasts";
import type { Feature } from "@/lib/types";

const FEATURE_LABEL: Record<Feature, string> = {
  ac: "AC",
  gps: "GPS",
  bluetooth: "Bluetooth",
  sunroof: "Sunroof",
  child_seat: "Child seat",
  all_wheel_drive: "All-wheel drive",
  apple_carplay: "Apple CarPlay",
  heated_seats: "Heated seats",
};

export function VehicleDetail({ id }: { id: string }) {
  const router = useRouter();
  const store = useFleetStore();
  const toast = useToast();
  const vehicle = store.vehicles.find((v) => v.id === id);
  const [archiveOpen, setArchiveOpen] = React.useState(false);

  if (!vehicle) {
    return (
      <Card className="py-8">
        <EmptyState
          icon={<Car />}
          title="Vehicle not found"
          description="It may have been archived. Return to the fleet to find another."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/fleets")}
            >
              Back to fleet
            </Button>
          }
        />
      </Card>
    );
  }

  const heroPhoto = vehicle.photos[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
        <Link
          href="/fleets"
          className="inline-flex items-center gap-1 hover:text-fg transition-colors duration-100"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Fleet
        </Link>
        <ChevronRight
          className="inline-block size-3 mx-1.5 text-fg-subtle align-middle"
          aria-hidden
        />
        <span className="text-fg font-medium">
          {vehicle.make} {vehicle.model} {vehicle.year}
        </span>
      </nav>

      {/* Hero strip */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2
              className="text-lg font-semibold text-fg leading-tight"
              style={{ letterSpacing: "var(--tracking-tight)" }}
            >
              {vehicle.make} {vehicle.model} {vehicle.year}
            </h2>
            <p className="text-xs text-fg-muted mt-0.5 tabular-nums">
              {vehicle.plate} · {vehicle.mileageKm.toLocaleString()} km ·{" "}
              {formatUsd(vehicle.dailyRateUsd)}/day
            </p>
          </div>
          <VehicleStatusPill status={vehicle.status} />
          <CategoryBadge category={vehicle.category} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            leadingIcon={<Edit className="size-3.5" />}
            onClick={() =>
              toast.info(toasts.notImplemented("Inline edit"))
            }
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="md"
            leadingIcon={<Copy className="size-3.5" />}
            onClick={() => toast.info(toasts.notImplemented("Duplicate vehicle"))}
          >
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="md"
            leadingIcon={<Archive className="size-3.5" />}
            onClick={() => setArchiveOpen(true)}
            disabled={vehicle.status === "retired"}
          >
            Archive
          </Button>
          <button
            type="button"
            aria-label="More actions"
            className="size-9 inline-flex items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
            onClick={() => toast.info(toasts.notImplemented("More actions"))}
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Photos + gallery */}
        <Card className="lg:col-span-7">
          <div
            className="aspect-[16/9] relative"
            style={{
              background:
                vehicle.category === "luxury"
                  ? "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)"
                  : "linear-gradient(135deg, var(--color-surface-2), var(--color-bg))",
            }}
          >
            {heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroPhoto}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="absolute inset-0 size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0";
                }}
              />
            ) : (
              <Car
                aria-hidden
                className={
                  "absolute right-8 top-1/2 -translate-y-1/2 size-24 " +
                  (vehicle.category === "luxury"
                    ? "text-white/15"
                    : "text-fg/15")
                }
              />
            )}
          </div>
          <div className="p-4 border-t border-border">
            <p className="text-sm font-semibold text-fg mb-2">Photos</p>
            <PhotoManager vehicle={vehicle} />
          </div>
        </Card>

        {/* Specs */}
        <Card className="lg:col-span-5 p-5">
          <h3 className="text-sm font-semibold text-fg mb-3">Specifications</h3>
          <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <Spec label="Make" value={vehicle.make} />
            <Spec label="Model" value={vehicle.model} />
            <Spec label="Year" value={String(vehicle.year)} />
            <Spec label="Plate" value={vehicle.plate} />
            <Spec label="Category" value={<CategoryBadge category={vehicle.category} />} />
            <Spec label="Daily rate" value={`${formatUsd(vehicle.dailyRateUsd)}/day`} />
            <Spec label="Seats" value={String(vehicle.seats)} />
            <Spec label="Transmission" value={titleCase(vehicle.transmission)} />
            <Spec label="Fuel" value={titleCase(vehicle.fuel)} />
            <Spec
              label="Mileage"
              value={`${vehicle.mileageKm.toLocaleString()} km`}
            />
          </dl>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-fg-muted mb-2">Features</p>
            {vehicle.features.length === 0 ? (
              <p className="text-[11px] text-fg-subtle italic">None recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {vehicle.features.map((f) => (
                  <Badge key={f} variant="neutral">
                    {FEATURE_LABEL[f]}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Availability calendar */}
        <Card className="lg:col-span-12 p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-semibold text-fg">Availability</h3>
            <p className="text-[11px] text-fg-subtle tabular-nums">
              {vehicle.blocks.length} blocks scheduled
            </p>
          </div>
          <AvailabilityCalendar vehicle={vehicle} />
        </Card>
      </div>

      {/* Archive confirm modal */}
      <Modal
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Archive ${vehicle.make} ${vehicle.model}?`}
        description="Customers won't be offered this vehicle anymore. You can change its status back later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                store.setStatus(vehicle.id, "retired");
                setArchiveOpen(false);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <></>
      </Modal>
    </div>
  );
}

function Spec({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="text-fg tabular-nums">{value}</dd>
    </>
  );
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

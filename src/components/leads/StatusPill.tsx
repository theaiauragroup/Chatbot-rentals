import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import type { LeadTemperature, VehicleStatus } from "@/lib/types";
import { tempLabel } from "@/lib/utils";

export function TemperaturePill({
  temperature,
  className,
}: {
  temperature: LeadTemperature;
  className?: string;
}) {
  return (
    <Badge variant={temperature} withDot aria-label={`${tempLabel(temperature)} lead`} className={className}>
      {tempLabel(temperature)}
    </Badge>
  );
}

const VEHICLE_LABEL: Record<VehicleStatus, string> = {
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  retired: "Retired",
};

const VEHICLE_VARIANT: Record<VehicleStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  available: "success",
  rented: "accent",
  maintenance: "warning",
  retired: "neutral",
};

export function VehicleStatusPill({
  status,
  className,
}: {
  status: VehicleStatus;
  className?: string;
}) {
  return (
    <Badge variant={VEHICLE_VARIANT[status]} withDot className={className} aria-label={VEHICLE_LABEL[status]}>
      {VEHICLE_LABEL[status]}
    </Badge>
  );
}

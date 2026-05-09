import * as React from "react";
import type { VehicleCategory } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const LABEL: Record<VehicleCategory, string> = {
  economy: "Economy",
  compact: "Compact",
  suv: "SUV",
  luxury: "Luxury",
  van: "Van",
};

export function CategoryBadge({ category }: { category: VehicleCategory }) {
  return <Badge variant="neutral">{LABEL[category]}</Badge>;
}

export const VEHICLE_CATEGORY_LABEL = LABEL;

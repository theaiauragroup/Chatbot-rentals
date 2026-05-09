import * as React from "react";
import { VehicleDetail } from "@/components/fleets/VehicleDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Vehicle · AIAURA FLEETS · ${id}` };
}

export default async function VehiclePage({ params }: PageProps) {
  const { id } = await params;
  return <VehicleDetail id={id} />;
}

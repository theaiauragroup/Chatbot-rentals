import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { VehicleForm } from "@/components/fleets/VehicleForm";

export const metadata = { title: "Add vehicle · AIAURA FLEETS" };

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-4">
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
        <span className="text-fg font-medium">Add vehicle</span>
      </nav>
      <div>
        <h2
          className="text-lg font-semibold text-fg leading-tight"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          Add vehicle
        </h2>
        <p className="text-xs text-fg-muted mt-0.5">
          Photos and the availability calendar are managed on the detail page after the vehicle is created.
        </p>
      </div>
      <VehicleForm />
    </div>
  );
}

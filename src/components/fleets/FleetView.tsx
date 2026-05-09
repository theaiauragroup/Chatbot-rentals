"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Rows3,
  Plus,
  Upload,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchInput } from "@/components/data/SearchInput";
import { FilterMultiSelect } from "@/components/data/FilterMultiSelect";
import {
  DataTable,
  sortRows,
  type ColumnDef,
  type SortDir,
} from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { CategoryBadge, VEHICLE_CATEGORY_LABEL } from "./CategoryBadge";
import { VehicleStatusPill } from "@/components/leads/StatusPill";
import { VehicleCard } from "./VehicleCard";
import { useFleetStore } from "./FleetStore";
import type {
  Vehicle,
  VehicleCategory,
  VehicleStatus,
} from "@/lib/types";
import { formatUsd, cn } from "@/lib/utils";
import { toasts } from "@/lib/toasts";
import { useToast } from "@/components/ui/Toaster";

const CATEGORY_OPTIONS = (
  Object.keys(VEHICLE_CATEGORY_LABEL) as VehicleCategory[]
).map((v) => ({ value: v, label: VEHICLE_CATEGORY_LABEL[v] }));

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
] as const satisfies ReadonlyArray<{ value: VehicleStatus; label: string }>;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "rate_asc", label: "Price low → high" },
  { value: "rate_desc", label: "Price high → low" },
  { value: "make_asc", label: "Make A → Z" },
  { value: "mileage_asc", label: "Mileage low → high" },
] as const;

const PAGE_SIZE = 25;

export function FleetView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const store = useFleetStore();

  const view = (params.get("view") ?? "grid") as "grid" | "list";
  const category = (params.get("category") ?? "")
    .split(",")
    .filter(Boolean) as VehicleCategory[];
  const status = (params.get("status") ?? "")
    .split(",")
    .filter(Boolean) as VehicleStatus[];
  const sortKey = (params.get("sort") as (typeof SORT_OPTIONS)[number]["value"]) ?? "newest";
  const q = params.get("q") ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const tableSort = params.get("tsort") ?? "createdAt";
  const tableDir = (params.get("tdir") as SortDir) ?? "desc";

  const [csvOpen, setCsvOpen] = React.useState(false);

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function setListParam(key: string, values: string[]) {
    setParam({ [key]: values.length === 0 ? null : values.join(","), page: null });
  }

  // Filter
  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return store.vehicles.filter((v) => {
      if (category.length > 0 && !category.includes(v.category)) return false;
      if (status.length > 0 && !status.includes(v.status)) return false;
      if (ql) {
        const hay =
          `${v.make} ${v.model} ${v.year} ${v.plate} ${v.category}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [store.vehicles, q, category, status]);

  // Grid sort by select
  const gridSorted = React.useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case "rate_asc":
        return arr.sort((a, b) => a.dailyRateUsd - b.dailyRateUsd);
      case "rate_desc":
        return arr.sort((a, b) => b.dailyRateUsd - a.dailyRateUsd);
      case "make_asc":
        return arr.sort((a, b) =>
          `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
        );
      case "mileage_asc":
        return arr.sort((a, b) => a.mileageKm - b.mileageKm);
      case "newest":
      default:
        return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
  }, [filtered, sortKey]);

  const counts = React.useMemo(() => {
    const c: Record<VehicleStatus, number> = {
      available: 0,
      rented: 0,
      maintenance: 0,
      retired: 0,
    };
    for (const v of store.vehicles) c[v.status] += 1;
    return c;
  }, [store.vehicles]);

  const hasFilters = !!q || category.length > 0 || status.length > 0;
  function reset() {
    setParam({ q: null, category: null, status: null, page: null });
  }

  const tableColumns = React.useMemo<ColumnDef<Vehicle>[]>(
    () => [
      {
        key: "vehicle",
        label: "Vehicle",
        sortable: true,
        sortAccessor: (v) => `${v.make} ${v.model}`,
        render: (v) => (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-surface-2 flex items-center justify-center text-fg-subtle shrink-0">
              <Car className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <Link
                href={`/fleets/${v.id}`}
                className="text-fg hover:text-accent text-sm font-medium truncate"
              >
                {v.make} {v.model}
              </Link>
              <span className="text-[11px] text-fg-subtle tabular-nums">
                {v.year} · {v.plate}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        sortAccessor: (v) => v.category,
        width: 120,
        render: (v) => <CategoryBadge category={v.category} />,
      },
      {
        key: "rate",
        label: "Daily rate",
        sortable: true,
        sortAccessor: (v) => v.dailyRateUsd,
        align: "right",
        width: 110,
        render: (v) => (
          <span className="tabular-nums">
            {formatUsd(v.dailyRateUsd)}
            <span className="text-fg-subtle">/d</span>
          </span>
        ),
      },
      {
        key: "mileage",
        label: "Mileage",
        sortable: true,
        sortAccessor: (v) => v.mileageKm,
        align: "right",
        width: 110,
        render: (v) => (
          <span className="tabular-nums text-fg-muted">
            {v.mileageKm.toLocaleString()} km
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        sortAccessor: (v) => v.status,
        width: 140,
        render: (v) => <VehicleStatusPill status={v.status} />,
      },
    ],
    []
  );

  const tableSorted = React.useMemo(
    () => sortRows(filtered, tableColumns, tableSort, tableDir),
    [filtered, tableColumns, tableSort, tableDir]
  );

  const total = view === "list" ? tableSorted.length : gridSorted.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, lastPage);
  const visibleGrid = gridSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );
  const visibleTable = tableSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className="text-lg font-semibold text-fg leading-tight"
            style={{ letterSpacing: "var(--tracking-tight)" }}
          >
            Fleet
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            {store.vehicles.length} vehicles · {counts.available} available ·{" "}
            {counts.rented} rented · {counts.maintenance} maintenance ·{" "}
            {counts.retired} retired
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SegmentedControl
            ariaLabel="View mode"
            value={view}
            onChange={(v) => setParam({ view: v === "grid" ? null : v, page: null })}
            options={[
              { value: "grid", label: "Grid", icon: <LayoutGrid className="size-3.5" /> },
              { value: "list", label: "List", icon: <Rows3 className="size-3.5" /> },
            ]}
          />
          <Button
            variant="secondary"
            size="md"
            leadingIcon={<Upload className="size-4" />}
            onClick={() => setCsvOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Plus className="size-4" />}
            onClick={() => router.push("/fleets/new")}
          >
            Add vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={q}
          onChange={(v) => setParam({ q: v || null, page: null })}
          placeholder="Search make, model, plate…"
          ariaLabel="Search vehicles"
        />
        <FilterMultiSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          selected={category}
          onChange={(v) => setListParam("category", v)}
        />
        <FilterMultiSelect
          label="Status"
          options={[...STATUS_OPTIONS]}
          selected={status}
          onChange={(v) => setListParam("status", v)}
        />
        {view === "grid" && (
          <select
            value={sortKey}
            onChange={(e) => setParam({ sort: e.target.value, page: null })}
            className={cn(
              "h-9 px-3 rounded-md text-sm bg-surface border border-border text-fg-muted",
              "hover:border-border-strong hover:text-fg transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            )}
            aria-label="Sort vehicles"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={reset}
        >
          Reset filters
        </Button>
      </div>

      {/* Body */}
      {view === "grid" ? (
        gridSorted.length === 0 ? (
          <Card className="py-8">
            <EmptyState
              icon={<Car />}
              title={hasFilters ? "No vehicles match your filters" : "No vehicles yet"}
              description={
                hasFilters
                  ? "Adjust filters or clear them to see more."
                  : "Add your first car to start showing it to customers."
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={reset}>
                    Reset filters
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leadingIcon={<Plus className="size-3.5" />}
                    onClick={() => router.push("/fleets/new")}
                  >
                    Add vehicle
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleGrid.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          <DataTable
            columns={tableColumns}
            rows={visibleTable}
            rowKey={(v) => v.id}
            onRowClick={(v) => router.push(`/fleets/${v.id}`)}
            sortKey={tableSort}
            sortDir={tableDir}
            onSortChange={(k, d) => setParam({ tsort: k, tdir: d, page: null })}
            empty={
              <EmptyState
                icon={<Car />}
                title="No vehicles match your filters"
                description="Adjust filters or clear them to see more."
              />
            }
          />
        </Card>
      )}

      {total > 0 && (
        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={(p) => setParam({ page: p === 1 ? null : String(p) })}
        />
      )}

      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </div>
  );
}

function CsvImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();

  function downloadTemplate() {
    const header =
      "make,model,year,plate,category,daily_rate_usd,seats,transmission,fuel,mileage_km,status";
    const sample =
      'Toyota,Corolla,2024,ABC-1234,economy,45,5,automatic,gasoline,12000,available';
    const blob = new Blob([header + "\n" + sample + "\n"], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fleet-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title="Import vehicles from CSV"
      description="Upload a CSV with the columns from our template. We'll preview the parsed rows before importing."
      width="form"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.info(
                toasts.notImplemented(
                  "CSV import — 0 vehicles imported"
                )
              );
              onClose();
            }}
            disabled
          >
            Import vehicles
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <ol className="text-sm text-fg-muted list-decimal pl-5 flex flex-col gap-1.5">
          <li>
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-accent hover:underline underline-offset-2"
            >
              Download the template
            </button>{" "}
            to see the expected columns.
          </li>
          <li>Drop your CSV here or click to browse.</li>
        </ol>
        <div
          className="rounded-md border border-dashed border-border-strong bg-surface-2 px-6 py-10 flex flex-col items-center gap-2 text-fg-subtle"
          aria-label="CSV drop zone"
        >
          <Upload className="size-6" aria-hidden />
          <p className="text-sm text-fg">Drop CSV here</p>
          <p className="text-[11px]">or click to browse — CSV import wired in pass 2</p>
        </div>
      </div>
    </Modal>
  );
}

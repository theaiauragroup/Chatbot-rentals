"use client";

import * as React from "react";
import type { BookingRange, ID, Vehicle, VehicleStatus } from "@/lib/types";

interface State {
  vehicles: Vehicle[];
}

type Action =
  | { type: "add_vehicle"; vehicle: Vehicle }
  | { type: "update_vehicle"; id: ID; patch: Partial<Vehicle> }
  | { type: "set_status"; id: ID; status: VehicleStatus }
  | { type: "add_block"; vehicleId: ID; range: BookingRange }
  | { type: "update_block"; vehicleId: ID; blockId: ID; patch: Partial<BookingRange> }
  | { type: "remove_block"; vehicleId: ID; blockId: ID }
  | { type: "reorder_photos"; id: ID; photos: string[] }
  | { type: "remove_photo"; id: ID; index: number }
  | { type: "add_photo"; id: ID; src: string }
  | { type: "set_vehicles"; vehicles: Vehicle[] }
  | { type: "merge_local_blocks"; blocksMap: Record<ID, BookingRange[]> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "merge_local_blocks":
      return {
        ...state,
        vehicles: state.vehicles.map((v) => {
          const local = action.blocksMap[v.id];
          if (local && local.length > 0) {
            const merged = [...v.blocks];
            local.forEach((lb: BookingRange) => {
              if (!merged.some((mb) => mb.id === lb.id)) {
                merged.push(lb);
              }
            });
            return { ...v, blocks: merged };
          }
          return v;
        }),
      };
    case "add_vehicle":
      return { ...state, vehicles: [action.vehicle, ...state.vehicles] };
    case "update_vehicle":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id ? { ...v, ...action.patch } : v
        ),
      };
    case "set_status":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id ? { ...v, status: action.status } : v
        ),
      };
    case "add_block":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.vehicleId
            ? { ...v, blocks: [...v.blocks, action.range] }
            : v
        ),
      };
    case "update_block":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.vehicleId
            ? {
                ...v,
                blocks: v.blocks.map((b) =>
                  b.id === action.blockId ? { ...b, ...action.patch } : b
                ),
              }
            : v
        ),
      };
    case "remove_block":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.vehicleId
            ? { ...v, blocks: v.blocks.filter((b) => b.id !== action.blockId) }
            : v
        ),
      };
    case "reorder_photos":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id ? { ...v, photos: action.photos } : v
        ),
      };
    case "remove_photo":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id
            ? {
                ...v,
                photos: v.photos.filter((_, i) => i !== action.index),
              }
            : v
        ),
      };
    case "add_photo":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id && v.photos.length < 6
            ? { ...v, photos: [...v.photos, action.src] }
            : v
        ),
      };
    case "set_vehicles":
      let mergedVehicles = action.vehicles;
      try {
        if (typeof window !== "undefined") {
          const backup = localStorage.getItem("vehicle_blocks_backup");
          if (backup) {
            const blocksMap = JSON.parse(backup);
            mergedVehicles = action.vehicles.map((v) => {
              const local = blocksMap[v.id];
              if (local && local.length > 0) {
                const merged = [...v.blocks];
                local.forEach((lb: BookingRange) => {
                  if (!merged.some((mb) => mb.id === lb.id)) {
                    merged.push(lb);
                  }
                });
                return { ...v, blocks: merged };
              }
              return v;
            });
          }
        }
      } catch (e) {
        console.error("Failed to merge local blocks on set_vehicles:", e);
      }
      return { ...state, vehicles: mergedVehicles };
  }
}

interface ContextValue extends State {
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: ID, patch: Partial<Vehicle>) => void;
  setStatus: (id: ID, status: VehicleStatus) => void;
  addBlock: (vehicleId: ID, range: BookingRange) => void;
  updateBlock: (vehicleId: ID, blockId: ID, patch: Partial<BookingRange>) => void;
  removeBlock: (vehicleId: ID, blockId: ID) => void;
  reorderPhotos: (id: ID, photos: string[]) => void;
  removePhoto: (id: ID, index: number) => void;
  addPhoto: (id: ID, src: string) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
}

const Ctx = React.createContext<ContextValue | null>(null);

export function FleetProvider({
  initialVehicles,
  children,
}: {
  initialVehicles: Vehicle[];
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(reducer, { vehicles: initialVehicles });
  const [hasLoadedBackup, setHasLoadedBackup] = React.useState(false);

  // 1. Sync from localStorage on mount
  React.useEffect(() => {
    try {
      const backup = localStorage.getItem("vehicle_blocks_backup");
      if (backup) {
        const blocksMap = JSON.parse(backup);
        dispatch({ type: "merge_local_blocks", blocksMap });
      }
    } catch (e) {
      console.error("Failed to load local blocks backup:", e);
    } finally {
      setHasLoadedBackup(true);
    }
  }, []);

  // 2. Sync to localStorage whenever vehicles state changes
  React.useEffect(() => {
    if (!hasLoadedBackup) return;
    try {
      const blocksMap: Record<string, BookingRange[]> = {};
      state.vehicles.forEach((v) => {
        if (v.blocks && v.blocks.length > 0) {
          blocksMap[v.id] = v.blocks;
        }
      });
      localStorage.setItem("vehicle_blocks_backup", JSON.stringify(blocksMap));
    } catch (e) {
      console.error("Failed to save local blocks backup:", e);
    }
  }, [state.vehicles, hasLoadedBackup]);

  const value = React.useMemo<ContextValue>(
    () => ({
      ...state,
      addVehicle: (v) => dispatch({ type: "add_vehicle", vehicle: v }),
      updateVehicle: (id, patch) =>
        dispatch({ type: "update_vehicle", id, patch }),
      setStatus: (id, status) => dispatch({ type: "set_status", id, status }),
      addBlock: (vehicleId, range) =>
        dispatch({ type: "add_block", vehicleId, range }),
      updateBlock: (vehicleId, blockId, patch) =>
        dispatch({ type: "update_block", vehicleId, blockId, patch }),
      removeBlock: (vehicleId, blockId) =>
        dispatch({ type: "remove_block", vehicleId, blockId }),
      reorderPhotos: (id, photos) =>
        dispatch({ type: "reorder_photos", id, photos }),
      removePhoto: (id, index) => dispatch({ type: "remove_photo", id, index }),
      addPhoto: (id, src) => dispatch({ type: "add_photo", id, src }),
      setVehicles: (vehicles) => dispatch({ type: "set_vehicles", vehicles }),
    }),
    [state]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFleetStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error("useFleetStore must be used inside <FleetProvider>");
  return ctx;
}

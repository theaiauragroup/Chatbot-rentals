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
  | { type: "set_vehicles"; vehicles: Vehicle[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
      return { ...state, vehicles: action.vehicles };
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

"use client";

import * as React from "react";
import type {
  BookingRange,
  ID,
  Lead,
  LeadOutcome,
  LeadTemperature,
  Vehicle,
} from "@/lib/types";

interface State {
  leads: Lead[];
  vehicles: Vehicle[];
}

type Action =
  | { type: "set_temperature"; leadId: ID; temperature: LeadTemperature }
  | { type: "set_outcome"; leadId: ID; outcome: LeadOutcome }
  | { type: "set_notes"; leadId: ID; notes: string }
  | { type: "add_booking_range"; vehicleId: ID; range: BookingRange };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_temperature":
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.leadId
            ? { ...l, temperature: action.temperature, updatedAt: nowIso() }
            : l
        ),
      };
    case "set_outcome":
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.leadId
            ? { ...l, outcome: action.outcome, updatedAt: nowIso() }
            : l
        ),
      };
    case "set_notes":
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.leadId
            ? { ...l, managerNotes: action.notes, updatedAt: nowIso() }
            : l
        ),
      };
    case "add_booking_range":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.vehicleId
            ? { ...v, blocks: [...v.blocks, action.range] }
            : v
        ),
      };
  }
}

function nowIso() {
  return new Date().toISOString();
}

interface ContextValue extends State {
  setTemperature: (leadId: ID, t: LeadTemperature) => void;
  setOutcome: (leadId: ID, o: LeadOutcome) => void;
  setNotes: (leadId: ID, notes: string) => void;
  addBookingRange: (vehicleId: ID, range: BookingRange) => void;
}

const Ctx = React.createContext<ContextValue | null>(null);

export function LeadsProvider({
  initialLeads,
  initialVehicles,
  children,
}: {
  initialLeads: Lead[];
  initialVehicles: Vehicle[];
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(reducer, {
    leads: initialLeads,
    vehicles: initialVehicles,
  });

  const value = React.useMemo<ContextValue>(
    () => ({
      ...state,
      setTemperature: (leadId, temperature) =>
        dispatch({ type: "set_temperature", leadId, temperature }),
      setOutcome: (leadId, outcome) =>
        dispatch({ type: "set_outcome", leadId, outcome }),
      setNotes: (leadId, notes) =>
        dispatch({ type: "set_notes", leadId, notes }),
      addBookingRange: (vehicleId, range) =>
        dispatch({ type: "add_booking_range", vehicleId, range }),
    }),
    [state]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLeadsStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error("useLeadsStore must be used inside <LeadsProvider>");
  }
  return ctx;
}

"use client";

import * as React from "react";
import type { Manager, TenantConfig } from "@/lib/types";

interface State {
  /** Last-saved snapshot of manager + tenant. */
  manager: Manager;
  tenant: TenantConfig;
  /** Working copy that mutations write to. */
  draftManager: Manager;
  draftTenant: TenantConfig;
}

type Action =
  | { type: "patch_manager"; patch: Partial<Manager> }
  | { type: "patch_tenant"; patch: Partial<TenantConfig> }
  | { type: "patch_notifications"; patch: Partial<TenantConfig["notifications"]> }
  | { type: "patch_twilio"; patch: Partial<TenantConfig["twilio"]> }
  | { type: "patch_widget"; patch: Partial<TenantConfig["widget"]> }
  | { type: "save" }
  | { type: "discard" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "patch_manager":
      return { ...state, draftManager: { ...state.draftManager, ...action.patch } };
    case "patch_tenant":
      return { ...state, draftTenant: { ...state.draftTenant, ...action.patch } };
    case "patch_notifications":
      return {
        ...state,
        draftTenant: {
          ...state.draftTenant,
          notifications: {
            ...state.draftTenant.notifications,
            ...action.patch,
          },
        },
      };
    case "patch_twilio":
      return {
        ...state,
        draftTenant: {
          ...state.draftTenant,
          twilio: { ...state.draftTenant.twilio, ...action.patch },
        },
      };
    case "patch_widget":
      return {
        ...state,
        draftTenant: {
          ...state.draftTenant,
          widget: { ...state.draftTenant.widget, ...action.patch },
        },
      };
    case "save":
      return {
        ...state,
        manager: state.draftManager,
        tenant: state.draftTenant,
      };
    case "discard":
      return {
        ...state,
        draftManager: state.manager,
        draftTenant: state.tenant,
      };
  }
}

interface ContextValue extends State {
  isDirty: boolean;
  patchManager: (p: Partial<Manager>) => void;
  patchTenant: (p: Partial<TenantConfig>) => void;
  patchNotifications: (p: Partial<TenantConfig["notifications"]>) => void;
  patchTwilio: (p: Partial<TenantConfig["twilio"]>) => void;
  patchWidget: (p: Partial<TenantConfig["widget"]>) => void;
  save: () => void;
  discard: () => void;
}

const Ctx = React.createContext<ContextValue | null>(null);

export function SettingsProvider({
  initialManager,
  initialTenant,
  children,
}: {
  initialManager: Manager;
  initialTenant: TenantConfig;
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(reducer, {
    manager: initialManager,
    tenant: initialTenant,
    draftManager: initialManager,
    draftTenant: initialTenant,
  });

  const isDirty =
    !shallowEqual(state.manager, state.draftManager) ||
    !shallowEqual(state.tenant, state.draftTenant) ||
    !shallowEqual(state.tenant.notifications, state.draftTenant.notifications) ||
    !shallowEqual(state.tenant.twilio, state.draftTenant.twilio) ||
    !shallowEqual(state.tenant.widget, state.draftTenant.widget);

  const value: ContextValue = {
    ...state,
    isDirty,
    patchManager: (p) => dispatch({ type: "patch_manager", patch: p }),
    patchTenant: (p) => dispatch({ type: "patch_tenant", patch: p }),
    patchNotifications: (p) => dispatch({ type: "patch_notifications", patch: p }),
    patchTwilio: (p) => dispatch({ type: "patch_twilio", patch: p }),
    patchWidget: (p) => dispatch({ type: "patch_widget", patch: p }),
    save: () => dispatch({ type: "save" }),
    discard: () => dispatch({ type: "discard" }),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettingsStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error("useSettingsStore must be used inside <SettingsProvider>");
  return ctx;
}

function shallowEqual(a: object, b: object): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  const ar = a as Record<string, unknown>;
  const br = b as Record<string, unknown>;
  for (const k of ak) if (ar[k] !== br[k]) return false;
  return true;
}

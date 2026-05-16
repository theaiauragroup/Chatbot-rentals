"use client";

import * as React from "react";
import type { PromptSettings, PromptVersion } from "@/lib/types";
import { saveTuneVersion } from "@/lib/api";

const STORAGE_KEY = "aiaura_tune_versions";

interface State {
  versions: PromptVersion[];
  draft: PromptSettings;
  /** Snapshot of the currently-published settings (versions[isCurrent].settings). */
  publishedAt: string;
  isLoaded: boolean;
}

type Action =
  | { type: "load_versions"; versions: PromptVersion[] }
  | { type: "patch_draft"; patch: Partial<PromptSettings> }
  | { type: "patch_rules"; patch: Partial<PromptSettings["businessRules"]> }
  | { type: "discard" }
  | { type: "save"; version: PromptVersion }
  | { type: "rollback"; versionId: string };

function published(versions: PromptVersion[]): PromptVersion {
  return versions.find((v) => v.isCurrent) ?? versions[0];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_versions": {
      const cur = published(action.versions);
      return {
        ...state,
        versions: action.versions,
        draft: structuredClone(cur.settings),
        publishedAt: cur.createdAt,
        isLoaded: true,
      };
    }
    case "patch_draft":
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "patch_rules":
      return {
        ...state,
        draft: {
          ...state.draft,
          businessRules: { ...state.draft.businessRules, ...action.patch },
        },
      };
    case "discard": {
      const cur = published(state.versions);
      return {
        ...state,
        draft: structuredClone(cur.settings),
        publishedAt: cur.createdAt,
      };
    }
    case "save": {
      const nextVersions = [
        action.version,
        ...state.versions.map((v) => ({ ...v, isCurrent: false })),
      ];
      return {
        ...state,
        versions: nextVersions,
        publishedAt: action.version.createdAt,
      };
    }
    case "rollback": {
      const target = state.versions.find((v) => v.id === action.versionId);
      if (!target) return state;
      const versions = state.versions.map((v) => ({
        ...v,
        isCurrent: v.id === action.versionId,
      }));
      return {
        ...state,
        versions,
        draft: structuredClone(target.settings),
        publishedAt: target.createdAt,
      };
    }
  }
}

function bumpVersion(v: string): string {
  // "v1.4.0" → "v1.5.0"
  const m = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return v + ".1";
  const [, major, minor] = m;
  return `v${major}.${Number(minor) + 1}.0`;
}

interface ContextValue extends State {
  current: PromptVersion;
  isDirty: boolean;
  patchDraft: (p: Partial<PromptSettings>) => void;
  patchRules: (p: Partial<PromptSettings["businessRules"]>) => void;
  discard: () => void;
  save: (summary: string, authorName: string) => void;
  rollback: (versionId: string) => void;
}

const Ctx = React.createContext<ContextValue | null>(null);

export function TuneProvider({
  initialVersions,
  children,
}: {
  initialVersions: PromptVersion[];
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(reducer, {
    versions: initialVersions,
    draft: structuredClone(published(initialVersions).settings),
    publishedAt: published(initialVersions).createdAt,
    isLoaded: false,
  });

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "load_versions", versions: parsed });
        } else {
          dispatch({ type: "load_versions", versions: initialVersions });
        }
      } catch (e) {
        dispatch({ type: "load_versions", versions: initialVersions });
      }
    } else {
      dispatch({ type: "load_versions", versions: initialVersions });
    }
  }, [initialVersions]);

  // Persist to localStorage whenever versions change
  React.useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.versions));
    }
  }, [state.versions, state.isLoaded]);

  const current = published(state.versions);
  const isDirty = !shallowEqualSettings(state.draft, current.settings);

  const value: ContextValue = {
    ...state,
    current,
    isDirty,
    patchDraft: (p) => dispatch({ type: "patch_draft", patch: p }),
    patchRules: (p) => dispatch({ type: "patch_rules", patch: p }),
    discard: () => dispatch({ type: "discard" }),
    save: (summary, authorName) => {
      const nextLabel = bumpVersion(current.versionLabel);
      const newVersion: PromptVersion = {
        id: `ver_${Date.now()}`,
        versionLabel: nextLabel,
        createdAt: new Date().toISOString(),
        authorName,
        summary: summary || "Updated bot settings",
        settings: structuredClone(state.draft),
        isCurrent: true,
      };

      // One logic: Save to webhook and local state
      saveTuneVersion({
        versionLabel: nextLabel,
        createdAt: newVersion.createdAt,
        authorName,
        settings: state.draft,
        isRollback: false
      });

      dispatch({ type: "save", version: newVersion });
    },
    rollback: (versionId) => {
      const target = state.versions.find((v) => v.id === versionId);
      if (target) {
        saveTuneVersion({
          versionLabel: target.versionLabel,
          createdAt: new Date().toISOString(),
          authorName: "System (Rollback)",
          settings: target.settings,
          isRollback: true,
          rollbackFrom: current.versionLabel
        });
      }
      dispatch({ type: "rollback", versionId });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTuneStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTuneStore must be used inside <TuneProvider>");
  return ctx;
}

function shallowEqualSettings(a: PromptSettings, b: PromptSettings): boolean {
  return (
    a.toneIndex === b.toneIndex &&
    a.greetingStyle === b.greetingStyle &&
    a.brandVoice === b.brandVoice &&
    a.knowledge === b.knowledge &&
    a.businessRules.operatingHours === b.businessRules.operatingHours &&
    a.businessRules.depositPolicyUsd === b.businessRules.depositPolicyUsd &&
    a.businessRules.multiDayDiscountPct === b.businessRules.multiDayDiscountPct &&
    a.businessRules.minRentalDays === b.businessRules.minRentalDays &&
    a.businessRules.minDriverAge === b.businessRules.minDriverAge &&
    a.offLimitsTopics.length === b.offLimitsTopics.length &&
    a.offLimitsTopics.every((t, i) => t === b.offLimitsTopics[i]) &&
    a.escalationTriggers.length === b.escalationTriggers.length &&
    a.escalationTriggers.every((t, i) => t === b.escalationTriggers[i])
  );
}


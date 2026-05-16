"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { TuneProvider, useTuneStore } from "./TuneStore";
import { PersonalityTab } from "./PersonalityTab";
import { BusinessRulesTab } from "./BusinessRulesTab";
import { KnowledgeTab } from "./KnowledgeTab";
import { OffLimitsTab } from "./OffLimitsTab";
import { EscalationTab } from "./EscalationTab";
import { Playground } from "./Playground";
import { VersionsTab } from "./VersionsTab";
import { SaveBar } from "./SaveBar";
import { promptVersions } from "@/lib/mock";
import { formatRelative } from "@/lib/utils";

const VALID_TABS = [
  "personality",
  "rules",
  "knowledge",
  "off-limits",
  "escalation",
  "playground",
  "versions",
] as const;
type TabValue = (typeof VALID_TABS)[number];

export function TuneView() {
  return (
    <TuneProvider initialVersions={promptVersions}>
      <TuneViewInner />
    </TuneProvider>
  );
}

function TuneViewInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const store = useTuneStore();

  // Wait for persistence to load from localStorage
  if (!store.isLoaded) {
    return <div className="h-[600px] w-full bg-surface animate-pulse rounded-lg border border-border" />;
  }

  const tabParam = params.get("tab") as TabValue | null;
  const tab = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "personality";

  function setTab(next: TabValue) {
    const usp = new URLSearchParams(params.toString());
    if (next === "personality") usp.delete("tab");
    else usp.set("tab", next);
    router.replace(`${pathname}?${usp.toString()}`, { scroll: false });
  }

  // Save bar appears on tabs that mutate settings.
  const showSaveBar = tab !== "playground" && tab !== "versions";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-lg font-semibold text-fg leading-tight"
            style={{ letterSpacing: "var(--tracking-tight)" }}
          >
            Tune AI
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Shape how your bot greets, qualifies, and escalates
          </p>
        </div>
        <div className="text-[11px] text-fg-subtle tabular-nums">
          <span className="font-mono text-fg">{store.current.versionLabel}</span>{" "}
          · last saved {formatRelative(store.publishedAt)}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="rules">Business rules</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="off-limits">Off-limits</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <TabsContent value="personality"><PersonalityTab /></TabsContent>
          <TabsContent value="rules"><BusinessRulesTab /></TabsContent>
          <TabsContent value="knowledge"><KnowledgeTab /></TabsContent>
          <TabsContent value="off-limits"><OffLimitsTab /></TabsContent>
          <TabsContent value="escalation"><EscalationTab /></TabsContent>
          <TabsContent value="playground"><Playground /></TabsContent>
          <TabsContent value="versions"><VersionsTab /></TabsContent>
        </div>
      </Tabs>

      {showSaveBar && <SaveBar />}
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { SettingsProvider, useSettingsStore } from "./SettingsStore";
import { ProfileTab } from "./ProfileTab";
import { NotificationsTab } from "./NotificationsTab";
import { TwilioTab } from "./TwilioTab";
import { BusinessTab } from "./BusinessTab";
import { WidgetTab } from "./WidgetTab";
import { TeamTab } from "./TeamTab";
import { SettingsSaveBar } from "./SettingsSaveBar";
import { manager, tenant } from "@/lib/mock";

const VALID_TABS = [
  "profile",
  "notifications",
  "twilio",
  "business",
  "widget",
  "team",
] as const;
type TabValue = (typeof VALID_TABS)[number];

export function SettingsView() {
  return (
    <SettingsProvider initialManager={manager} initialTenant={tenant}>
      <SettingsViewInner />
    </SettingsProvider>
  );
}

function SettingsViewInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const store = useSettingsStore();

  const tabParam = params.get("tab") as TabValue | null;
  const tab = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "profile";

  function setTab(next: TabValue) {
    const usp = new URLSearchParams(params.toString());
    if (next === "profile") usp.delete("tab");
    else usp.set("tab", next);
    router.replace(`${pathname}?${usp.toString()}`, { scroll: false });
  }

  // Save bar appears on all tabs except Team (no mutations there)
  const showSaveBar = tab !== "team";
  void store;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2
          className="text-lg font-semibold text-fg leading-tight"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          Settings
        </h2>
        <p className="text-xs text-fg-muted mt-0.5">
          Manage your account, notifications, and integrations
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="twilio">Twilio</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="widget">Widget</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="twilio"><TwilioTab /></TabsContent>
          <TabsContent value="business"><BusinessTab /></TabsContent>
          <TabsContent value="widget"><WidgetTab /></TabsContent>
          <TabsContent value="team"><TeamTab /></TabsContent>
        </div>
      </Tabs>

      {showSaveBar && <SettingsSaveBar />}
    </div>
  );
}

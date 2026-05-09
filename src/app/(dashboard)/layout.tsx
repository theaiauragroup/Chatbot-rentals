import * as React from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Non-scrolling shell: page itself never scrolls, only the main column does.
    // Sidebar and TopBar stay pinned to the viewport edges no matter the content height.
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 px-8 pt-6 pb-12 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

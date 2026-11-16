"use client";

import { DemoModeBanner, OfflineBanner } from "@/components/shared/demo-notices";
import { DesktopSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { RequireAuth } from "@/lib/auth/require-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-dvh w-full">
        <DesktopSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <DemoModeBanner />
          <OfflineBanner />
          <main id="main-content" className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}

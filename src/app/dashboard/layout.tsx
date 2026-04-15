"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { ClipboardSyncController } from "@/components/clipboard-sync-controller";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white relative">
      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopBar isTransparent={true} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full scroll-smooth">
            <div className="max-w-[1600px] mx-auto h-full p-4 md:p-8 lg:p-12">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Overlays */}
      <OnboardingWizard />
      <ClipboardSyncController />
    </div>
  );
}

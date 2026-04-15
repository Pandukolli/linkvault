"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { Sidebar } from "@/components/sidebar";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { ClipboardSyncController } from "@/components/clipboard-sync-controller";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white relative">
      {/* Sidebar with Mobile Toggle Support */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0B0F] border-r border-[#1F2129] shadow-2xl transform transition-transform duration-500 ease-[0.16,1,0.3,1] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <Sidebar currentPath={pathname} onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 w-full">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopBar isTransparent={true} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
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

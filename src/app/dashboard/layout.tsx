"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-black transition-all duration-500">
      {/* Desktop Sidebar (Base layer, pure background) */}
      <div className="hidden md:flex w-64 flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-border bg-sidebar text-sidebar-foreground">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <Sidebar
            currentPath={pathname}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Pane (Architectural Elevation) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-2 md:py-3 md:pr-3 overflow-hidden bg-background">
        <div className="flex-1 flex flex-col overflow-hidden bg-card border-[1.5px] border-elegant relative md:rounded-[2.5rem] transition-all duration-500 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)]">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-6 md:p-10 lg:p-12 scroll-smooth relative z-0 selection:bg-primary/20 bg-background/50">
            {children}
          </main>
        </div>
      </div>

      {/* Full Screen Overlays */}
      <OnboardingWizard />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { ClipboardSyncController } from '@/components/clipboard-sync-controller';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Clipboard auto-save engine — mounted once at layout level */}
      <ClipboardSyncController />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopBar
          isTransparent={false}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full scroll-smooth bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto h-full p-6 md:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

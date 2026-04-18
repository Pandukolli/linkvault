'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { ClipboardSyncController } from '@/components/clipboard-sync-controller';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, StickyNote, PenLine, Camera, Layers } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Links", href: "/dashboard", icon: LayoutDashboard },
    { id: "notes", label: "Notes", href: "/dashboard/notes", icon: StickyNote },
    { id: "blogs", label: "Blogs", href: "/dashboard/blogs", icon: PenLine },
    { id: "blog-diary", label: "Diary", href: "/blog-diary", icon: Layers },
    { id: "gallery", label: "Gallery", href: "/dashboard/gallery", icon: Camera },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <ClipboardSyncController />

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-xl font-black tracking-tighter">VAULTOS</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopBar
          isTransparent={false}
          onMenuClick={() => setSidebarOpen(true)}
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

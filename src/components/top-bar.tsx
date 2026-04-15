"use client";

import { Menu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useClipboardSync } from "@/hooks/use-clipboard-sync";

const TABS = [
  { id: "dashboard", label: "LINK", href: "/dashboard", color: "#FF4DFF" },
  { id: "notes", label: "NOTES", href: "/dashboard/notes", color: "#00F5FF" },
  { id: "blogs", label: "BLOGS", href: "/dashboard/blogs", color: "#A3FF3D" },
  { id: "resume", label: "RESUME", href: "/dashboard/resume", color: "#5E7BFF" },
  { id: "gallery", label: "GALLERY", href: "/dashboard/gallery", color: "#A78BFA" },
  { id: "project", label: "PROJECT", href: "/dashboard/projects", color: "#F8FAFC" },
];

interface TopBarProps {
  onMenuClick?: () => void;
  isTransparent?: boolean;
}

export function TopBar({ onMenuClick, isTransparent = false }: TopBarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();
  const { isSyncActive, toggleSync } = useClipboardSync();

  const firstName = profile?.full_name?.split(" ")[0] || "operator";

  return (
    <header className={cn(
      "h-24 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 transition-all duration-700 w-full bg-black border-b border-white/5 shadow-2xl"
    )}>
      {/* Left: Logo */}
      <div className="flex items-center gap-8 w-1/4">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size={32} className="hidden md:flex text-[#5E7BFF]" />
        </Link>
        <div className="md:hidden">
          <Link href="/">
            <Logo size={24} showText={false} className="text-[#5E7BFF]" />
          </Link>
        </div>
      </div>

      {/* Center: Universal Pill Navigation */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#14151B] border border-white/5 shadow-2xl">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || (tab.id === 'dashboard' && pathname === '/dashboard');
            const isActiveLink = tab.id === 'dashboard' && pathname === '/dashboard/links';
            const reallyActive = isActive || isActiveLink;
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 ease-[0.16, 1, 0.3, 1] whitespace-nowrap ${
                  reallyActive 
                    ? "text-black" 
                    : "text-slate-400 hover:text-slate-100"
                }`}
                style={{ 
                  backgroundColor: reallyActive ? tab.color : "transparent",
                }}
              >
                {t(tab.label, tab.label)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: User Settings */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toggleSync(!isSyncActive)}
            title={isSyncActive ? "Neural Sync Active" : "Enable Neural Sync"}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#14151B] border border-white/5 hover:bg-white/5 transition-all outline-none"
          >
            {isSyncActive && (
               <span className="absolute inset-0 rounded-full animate-ping bg-[#A3FF3D]/30" style={{ animationDuration: '2s' }} />
            )}
            <Activity className={`w-4 h-4 transition-colors z-10 ${
              isSyncActive ? "text-[#A3FF3D]" : "text-white/30 group-hover:text-white"
            }`} />
          </button>
          
          <p className="hidden xl:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-2">
            {firstName}
          </p>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

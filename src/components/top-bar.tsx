"use client";

import { Activity, ClipboardPaste, Menu } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useClipboardSync } from "@/hooks/use-clipboard-sync";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TABS = [
  { id: "dashboard", label: "Links", href: "/dashboard" },
  { id: "notes", label: "Notes", href: "/dashboard/notes" },
  { id: "blogs", label: "Blogs", href: "/dashboard/blogs" },
  { id: "blog-diary", label: "Diary", href: "/blog-diary" },
  { id: "resume", label: "Resumes", href: "/dashboard/resumes" },
  { id: "gallery", label: "Gallery", href: "/dashboard/gallery" },
  { id: "project", label: "Projects", href: "/dashboard/projects" },
];

interface TopBarProps {
  onMenuClick?: () => void;
  isTransparent?: boolean;
}

export function TopBar({ onMenuClick, isTransparent = false }: TopBarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useProfile();
  const { isSyncActive, toggleSync, triggerPaste } = useClipboardSync();

  const firstName = profile?.full_name?.split(" ")[0] || "User";

  return (
    <header
      className={cn(
        "h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all duration-300 w-full bg-white border-b border-[#E5E7EB]"
      )}
    >
      {/* Left: Logo & Sidebar Trigger */}
      <div className="flex items-center gap-6 w-1/4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#F1F5F9] rounded-md transition-colors"
        >
          <Menu className="w-5 h-5 text-[#6B7280]" />
        </button>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size={28} showText={false} className="text-[#2563EB]" />
        </Link>
      </div>

      {/* Center: Tabs */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] border border-[#E5E7EB] rounded-md">
          {TABS.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.id === "dashboard" && pathname === "/dashboard");
            const isActiveLink =
              tab.id === "dashboard" && pathname === "/dashboard/links";
            const reallyActive = isActive || isActiveLink;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap",
                  reallyActive
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-white/50"
                )}
              >
                {t(tab.label, tab.label)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <TooltipProvider>
          {/* Clipboard Status */}
          <Tooltip>
            <TooltipTrigger
              onClick={() => toggleSync(!isSyncActive)}
              className={cn(
                "group relative flex items-center gap-2 px-3 h-9 rounded-md border transition-all outline-none",
                isSyncActive 
                  ? "bg-blue-50 border-blue-200 text-[#2563EB]" 
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]"
              )}
            >
              <Activity className={cn("w-3.5 h-3.5", isSyncActive ? "animate-pulse" : "opacity-50")} />
              <span className="hidden xl:block text-[10px] font-bold uppercase tracking-wider">
                {isSyncActive ? "Sync Active" : "Sync Off"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-white border-[#E5E7EB] text-[#111827] text-xs font-semibold">
              {isSyncActive ? "Auto-Save Enabled" : "Click to enable Auto-Save"}
            </TooltipContent>
          </Tooltip>

          {isSyncActive && (
            <Tooltip>
              <TooltipTrigger
                onClick={triggerPaste}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
              >
                <ClipboardPaste className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white border-[#E5E7EB] text-[#111827] text-xs font-semibold">
                Paste Now
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>

        <div className="h-4 w-[1px] bg-[#E5E7EB] mx-1 hidden sm:block" />

        <p className="hidden xl:block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
          {firstName}
        </p>
        <UserMenu />
      </div>
    </header>
  );
}

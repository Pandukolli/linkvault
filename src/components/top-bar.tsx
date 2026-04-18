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
  { id: "gallery", label: "Gallery", href: "/dashboard/gallery" },
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
        "h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all duration-300 w-full bg-surface border-b border-border"
      )}
    >
      {/* Left: Logo & Sidebar Trigger */}
      <div className="flex items-center gap-6 w-1/4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-secondary rounded-md transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size={28} showText={true} className="text-primary" />
        </Link>
      </div>

      {/* Center: Tabs */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <div className="flex items-center gap-2 p-1 bg-secondary border border-border rounded-lg">
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
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
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
                  ? "bg-primary/5 border-primary/20 text-primary" 
                  : "bg-surface border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <Activity className={cn("w-3.5 h-3.5", isSyncActive ? "animate-pulse" : "opacity-50")} />
              <span className="hidden xl:block text-[10px] font-bold uppercase tracking-wider">
                {isSyncActive ? "Sync Active" : "Sync Off"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-surface border-border text-foreground text-xs font-semibold">
              {isSyncActive ? "Auto-Save Enabled" : "Click to enable Auto-Save"}
            </TooltipContent>
          </Tooltip>

          {isSyncActive && (
            <Tooltip>
              <TooltipTrigger
                onClick={triggerPaste}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-surface border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <ClipboardPaste className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-surface border-border text-foreground text-xs font-semibold">
                Paste Now
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>

        <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

        <p className="hidden xl:block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {firstName}
        </p>
        <UserMenu />
      </div>
    </header>
  );
}

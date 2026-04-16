"use client";

import { Activity, ClipboardPaste } from "lucide-react";
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
  { id: "dashboard", label: "LINK", href: "/dashboard", color: "#FF4DFF" },
  { id: "notes", label: "NOTES", href: "/dashboard/notes", color: "#00F5FF" },
  { id: "blogs", label: "BLOGS", href: "/dashboard/blogs", color: "#06B6D4" },
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
  const { profile } = useProfile();
  const { isSyncActive, toggleSync, triggerPaste } = useClipboardSync();

  const firstName = profile?.full_name?.split(" ")[0] || "operator";

  return (
    <header
      className={cn(
        "h-24 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 transition-all duration-700 w-full bg-black border-b border-white/5 shadow-2xl"
      )}
    >
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
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 whitespace-nowrap ${reallyActive
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

      {/* Right: Clipboard controls + User */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <TooltipProvider>
          {/* ── Clipboard Status Indicator ── */}
          <Tooltip>
            {/* TooltipTrigger renders its own <button> — put onClick here, use div inside */}
            <TooltipTrigger
              onClick={() => toggleSync(!isSyncActive)}
              aria-label={
                isSyncActive
                  ? "Clipboard Sync Active — click to disable"
                  : "Enable Clipboard Sync"
              }
              className="group relative flex items-center gap-2 px-3 h-9 rounded-full bg-[#14151B] border border-white/5 hover:bg-white/5 transition-all outline-none"
            >
              {/* Pulsing ring when active */}
              {isSyncActive && (
                <span
                  className="absolute inset-0 rounded-full animate-ping bg-[#06B6D4]/20"
                  style={{ animationDuration: "2s" }}
                />
              )}

              {/* Status dot */}
              <span
                className={cn(
                  "relative z-10 w-2 h-2 rounded-full transition-all duration-500 flex-shrink-0",
                  isSyncActive
                    ? "bg-[#06B6D4] shadow-[0_0_6px_2px_rgba(139,92,246,0.6)] animate-pulse"
                    : "bg-white/20"
                )}
              />

              <Activity
                className={cn(
                  "w-3.5 h-3.5 z-10 transition-colors flex-shrink-0",
                  isSyncActive
                    ? "text-[#06B6D4]"
                    : "text-white/30 group-hover:text-white"
                )}
              />

              {/* Label — only on XL+ */}
              <span
                className={cn(
                  "hidden xl:block text-[9px] font-black uppercase tracking-[0.2em] z-10 transition-colors",
                  isSyncActive ? "text-[#06B6D4]" : "text-white/30 group-hover:text-white"
                )}
              >
                {isSyncActive ? "Sync: Active" : "Sync: Off"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isSyncActive
                ? "Clipboard Sync ACTIVE — links auto-saved. Click to disable."
                : "Click to enable Clipboard Auto-Save"}
            </TooltipContent>
          </Tooltip>

          {/* ── Manual Paste Link button (fallback for production) ── */}
          {isSyncActive && (
            <Tooltip>
              {/* TooltipTrigger is the button — no nested Button component */}
              <TooltipTrigger
                onClick={triggerPaste}
                aria-label="Paste link from clipboard"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#14151B] border border-white/5 hover:bg-[#06B6D4]/10 hover:border-[#06B6D4]/30 transition-all"
              >
                <ClipboardPaste className="w-4 h-4 text-white/50 group-hover:text-[#06B6D4] transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Paste Link — manually trigger clipboard read
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>

        <p className="hidden xl:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
          {firstName}
        </p>
        <UserMenu />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Link2,
  FolderOpen,
  Heart,
  Settings,
  BookOpen,
  PenLine,
  Image as ImageIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useLinks } from "@/hooks/use-links";
import { useCollections } from "@/hooks/use-collections";

const mainNav = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
  { icon: Link2, label: "Links", href: "/dashboard/links" },
  { icon: FolderOpen, label: "Collections", href: "/dashboard/collections" },
  { icon: Heart, label: "Favorites", href: "/dashboard/favorites" },
];

const knowledgeNav = [
  { icon: BookOpen, label: "Notes", href: "/dashboard/notes" },
  { icon: PenLine, label: "Blogs", href: "/dashboard/blogs" },
  { icon: ImageIcon, label: "Gallery", href: "/dashboard/gallery" },
];

interface SidebarProps {
  currentPath: string;
  onNavigate?: () => void;
}

function NavSection({ title, items, currentPath, onNavigate, counts }: {
  title?: string;
  items: typeof mainNav;
  currentPath: string;
  onNavigate?: () => void;
  counts?: Record<string, number | null>;
}) {
  return (
    <div className="space-y-2 mb-10 text-left">
      {title && (
        <div className="px-8 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-2">
          {title}
        </div>
      )}
      <div className="space-y-1 px-4">
        {items.map((item) => {
          const isActive = currentPath === item.href;
          const count = counts?.[item.label] ?? null;

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-500 ${
                  isActive
                    ? "bg-white text-black font-bold shadow-2xl shadow-white/10"
                    : "text-white/40 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-all duration-500 ${
                      isActive ? "scale-110" : "group-hover:translate-x-1 opacity-70 group-hover:opacity-100"
                    }`}
                  />
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                </div>
                
                {count !== null && (isActive || count > 0) && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                    isActive ? "bg-black/10 text-black/50" : "bg-white/5 text-white/20 group-hover:text-white/40"
                  }`}>
                    {count}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const { links } = useLinks();
  const { collections } = useCollections();

  const counts: Record<string, number> = {
    "Links": links.length,
    "Collections": collections.length,
    "Favorites": links.filter(l => l.is_favorite).length,
  };

  return (
    <div className="h-full w-full bg-black flex flex-col pt-12 pb-12 z-10 border-r border-white/5">
      {/* Brand Logo */}
      <div className="px-8 mb-16 text-left">
        <Link href="/" onClick={onNavigate}>
          <Logo size={32} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <NavSection items={mainNav} currentPath={currentPath} onNavigate={onNavigate} counts={counts} />
        <NavSection title={t("Knowledge Base", "Knowledge Base")} items={knowledgeNav} currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      {/* Footer / Account Space */}
      <div className="pt-8 border-t border-white/5 mx-6">
        <Link href="/dashboard/settings" onClick={onNavigate}>
          <div className={`group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 ${
            currentPath === "/dashboard/settings" 
              ? "bg-white text-black font-bold" 
              : "text-white/30 hover:bg-white/5 hover:text-white"
          }`}>
            <Settings className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            <span className="text-[13px] tracking-tight">{t("Settings", "Settings")}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

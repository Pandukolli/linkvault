"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Home,
  Link2,
  FolderOpen,
  Heart,
  Settings,
  User as UserIcon,
  BookOpen,
  PenLine,
  Image as ImageIcon,
  FileText,
  Briefcase,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLinks } from "@/hooks/use-links";
import { useCollections } from "@/hooks/use-collections";

const mainNav = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Link2, label: "Links", href: "/dashboard/links" },
  { icon: FolderOpen, label: "Collections", href: "/dashboard/collections" },
  { icon: Heart, label: "Favorites", href: "/dashboard/favorites" },
];

const createNav = [
  { icon: BookOpen, label: "Notes", href: "/dashboard/notes" },
  { icon: PenLine, label: "Blogs", href: "/dashboard/blogs" },
];

const libraryNav = [
  { icon: ImageIcon, label: "Gallery", href: "/dashboard/gallery" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: Briefcase, label: "Resumes", href: "/dashboard/resumes" },
  { icon: ListMusic, label: "Playlists", href: "/dashboard/playlists" },
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
    <div className="space-y-1 mb-8">
      {title && (
        <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = currentPath === item.href;
          const count = counts?.[item.label] ?? null;

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={`group flex items-center justify-between px-4 py-2.5 mx-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isActive ? "scale-105" : "group-hover:scale-105 opacity-70"
                    }`}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                
                {count !== null && (isActive || count > 0) && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-accent text-accent-foreground group-hover:text-foreground"
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
    <div className="h-full w-full bg-sidebar flex flex-col pt-6 pb-6 border-r-[1px] border-border z-10 transition-colors duration-300">
      {/* Brand */}
      <Link href="/" onClick={onNavigate}>
        <div className="flex items-center gap-3 px-6 mb-10 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Link2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground cursor-pointer">
            LinkVault
          </span>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <NavSection items={mainNav} currentPath={currentPath} onNavigate={onNavigate} counts={counts} />
        <NavSection title={t("Create", "Create")} items={createNav} currentPath={currentPath} onNavigate={onNavigate} />
        <NavSection title={t("Library", "Library")} items={libraryNav} currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      {/* Footer / Account Space */}
      <div className="pt-4 border-t border-border/50 mx-4">
        <Link href="/dashboard/profile" onClick={onNavigate}>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium transition-all duration-300">
            <UserIcon className="w-4 h-4 opacity-70" />
            <span className="truncate">{t("Profile", "Profile")}</span>
          </Button>
        </Link>
        <Link href="/dashboard/settings" onClick={onNavigate}>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium transition-all duration-300 mt-1">
            <Settings className="w-4 h-4 opacity-70" />
            <span className="truncate">{t("Settings", "Settings")}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLinks } from "@/hooks/use-links";
import { useCollections } from "@/hooks/use-collections";
import { LinkCard } from "@/components/link-card";
import { SaveLinkDialog } from "@/components/save-link-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Grid3X3, List, Link2, Folder, Star, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkWithTags } from "@/lib/types";

import { Suspense } from "react";

function LinksContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkWithTags | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { links, isLoading, toggleFavorite, deleteLink } = useLinks(searchQuery);
  const { collections } = useCollections();

  const displayedLinks = useMemo(() => {
    if (activeFilter === "all") return links;
    if (activeFilter === "favorites") return links.filter(l => l.is_favorite);

    if (activeFilter.startsWith("col_")) {
      const colId = activeFilter.split("col_")[1];
      const col = collections.find(c => c.id === colId);
      if (col) {
        return links.filter(l => {
          try {
            const domain = new URL(l.url).hostname.replace("www.", "").split(".")[0];
            return domain.toLowerCase() === col.name.toLowerCase();
          } catch {
            return false;
          }
        });
      }
    }

    return links;
  }, [links, activeFilter, collections]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] pb-32 pt-4 items-start relative h-full">

      {/* Sidebar Section */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8 sticky top-32 z-10">
        <div className="flex flex-col gap-1">
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="h-12 mb-6 w-full gap-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-bold shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Add New Link
          </Button>

          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 mb-2">My Links</span>
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-bold text-sm ${activeFilter === "all" ? "bg-surface text-primary shadow-sm border border-border" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
          >
            <Globe className="w-4 h-4" />
            All Links
            <span className="ml-auto text-xs opacity-60 text-muted-foreground">{links.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter("favorites")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-bold text-sm ${activeFilter === "favorites" ? "bg-surface text-destructive shadow-sm border border-border" : "text-muted-foreground hover:bg-surface hover:text-destructive"}`}
          >
            <Star className={cn("w-4 h-4", activeFilter === "favorites" && "fill-current")} />
            Favorites
            <span className="ml-auto text-xs opacity-60 text-muted-foreground">{links.filter(l => l.is_favorite).length}</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4 mb-2">Smart Collections</span>
          {collections.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveFilter(`col_${col.id}`)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-bold text-sm ${activeFilter === `col_${col.id}` ? "bg-surface text-primary shadow-sm border border-border" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
            >
              <Folder className="w-4 h-4 opacity-70" />
              <span className="truncate">{col.name}</span>
            </button>
          ))}
          {collections.length === 0 && (
            <p className="text-[10px] px-4 text-muted-foreground italic">No smart collections detected.</p>
          )}
        </div>
      </aside>

      {/* Main Grid Content */}
      <main className="flex-1 flex flex-col w-full min-w-0">

        {/* Header Options */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 w-full border-b border-border pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {activeFilter === "all" ? "Vault Artifacts" : activeFilter === "favorites" ? "Starred" : collections.find(c => c.id === activeFilter.split("_")[1])?.name || "Filtered View"}
            </h1>
            <p className="text-muted-foreground text-xs font-semibold">
              Status: <span className="text-success uppercase tracking-widest text-[9px] font-black">All systems nominal</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-secondary border border-border">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("bg-transparent", viewMode === "grid" && "bg-surface text-primary shadow-sm")}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("bg-transparent", viewMode === "list" && "bg-surface text-primary shadow-sm")}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        {isLoading ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className={viewMode === "grid" ? "h-64 rounded-xl bg-secondary animate-pulse" : "h-16 rounded-xl bg-secondary animate-pulse"} />
            ))}
          </div>
        ) : displayedLinks.length > 0 ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            <AnimatePresence mode="popLayout" initial={false}>
              {displayedLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  viewMode={viewMode}
                  onEdit={(l) => { setEditingLink(l); setDialogOpen(true); }}
                  onDelete={(id) => deleteLink.mutate(id)}
                  onToggleFavorite={(id, isFav) => toggleFavorite.mutate({ id, is_favorite: isFav })}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-xl bg-surface border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border shadow-inner">
              <Link2 className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
              {searchQuery ? "No matching records" : "Sector Clear"}
            </h3>
            <p className="text-muted-foreground text-sm font-serif max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? "The vault search was exhaustive, but no artifacts match your entry query."
                : "This sector of your vault is currently empty. Ready to index new digital artifacts?"}
            </p>
          </div>
        )}

      </main>

      {/* Save/Edit Dialog */}
      <SaveLinkDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingLink(null); }}
        editingLink={editingLink}
      />
    </div>
  );
}


export default function LinksPage() {
  return (
    <Suspense fallback={
      <div className="space-y-10 max-w-7xl pb-20 pt-8">
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-md" />)}
        </div>
      </div>
    }>
      <LinksContent />
    </Suspense>
  );
}

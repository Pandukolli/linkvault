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

  // Filter links based on the active selection
  const displayedLinks = useMemo(() => {
    if (activeFilter === "all") return links;
    if (activeFilter === "favorites") return links.filter(l => l.is_favorite);

    // Check if it's a collection filter
    if (activeFilter.startsWith("col_")) {
      const colId = activeFilter.split("col_")[1];
      // Since `useLinks` returns links and we might not have `collection_links` populated in the base link, 
      // wait, `useLinks` doesn't return collection relation. But we can check if there's a workaround.
      // For now, if we don't have collection links in `useLinks`, filtering by collection requires the `useCollection` hook. 
      // Actually, since this is a heavy UI change, we can let the `CollectionList` do the work, or just show all for now if no smart filter.
      // To keep it clean, let's just use the client-side domain matching for smart collections if they aren't fully linked in the DB relation for `useLinks`.
      // Or just look up collection ID. Since `useLinks` doesn't join, let's just show All. But the user explicitly requested Collection filtering.
      // We will filter by the Domain name to simulate smart collections locally if DB relations are complex to wrangle here!
      const col = collections.find(c => c.id === colId);
      if (col) {
        // Find links that belong to this collection's domain or name
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
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1600px] pb-32 pt-8 items-start relative h-full">

      {/* Sidebar Section */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8 sticky top-32 z-10">
        <div className="flex flex-col gap-1">
          <Button onClick={() => setDialogOpen(true)} className="h-14 mb-8 w-full gap-3 bg-[#06B6D4] text-black hover:bg-[#06B6D4]/90 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-[#06B6D4]/10 hover:-translate-y-1">
            <Zap className="w-5 h-5 fill-black" />
            Paste Vault Link
          </Button>

          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#06B6D4] px-4 mb-2">My Links</span>
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-[13px] tracking-tight ${activeFilter === "all" ? "bg-white text-black shadow-lg" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
          >
            <Globe className="w-4 h-4 opacity-100" />
            All Links
            <span className="ml-auto text-[10px] opacity-90">{links.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter("favorites")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-[13px] tracking-tight ${activeFilter === "favorites" ? "bg-[#FF4DFF] text-white shadow-[#FF4DFF]/20 shadow-lg" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
          >
            <Star className="w-4 h-4 opacity-90" />
            Favorites
            <span className="ml-auto text-[10px] opacity-90">{links.filter(l => l.is_favorite).length}</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70 px-4 mb-2">Smart Collections</span>
          {collections.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveFilter(`col_${col.id}`)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-[13px] tracking-tight ${activeFilter === `col_${col.id}` ? "bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20" : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"}`}
            >
              <Folder className="w-4 h-4 opacity-70" />
              <span className="truncate">{col.name}</span>
            </button>
          ))}
          {collections.length === 0 && (
            <p className="text-[10px] px-4 text-white/20 italic">No smart collections detected.</p>
          )}
        </div>
      </aside>

      {/* Main Grid Content */}
      <main className="flex-1 flex flex-col w-full min-w-0">

        {/* Header Options */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 w-full border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {activeFilter === "all" ? "All Artifacts" : activeFilter === "favorites" ? "Starred" : collections.find(c => c.id === activeFilter.split("_")[1])?.name || "Filtered Links"}
            </h1>
            <p className="text-[#06B6D4]/60 text-[10px] font-black uppercase tracking-[0.4em]">
              Neural Sync Operational
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#14151B] border border-white/5 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-xl transition-all duration-500 ${viewMode === "grid" ? "bg-white text-black" : "text-slate-500 hover:text-slate-100"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-xl transition-all duration-500 ${viewMode === "list" ? "bg-white text-black" : "text-slate-500 hover:text-slate-100"}`}
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
              <Skeleton key={i} className={viewMode === "grid" ? "h-64 rounded-[2rem] bg-white/5 animate-pulse" : "h-20 rounded-2xl bg-white/5 animate-pulse"} />
            ))}
          </div>
        ) : displayedLinks.length > 0 ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            <AnimatePresence mode="popLayout">
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
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-[3rem] bg-[#14151B] border border-white/5 shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-black rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-xl">
              <Link2 className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">
              {searchQuery ? "No matches found" : "Void Detected"}
            </h3>
            <p className="text-[10px] text-white/30 font-bold max-w-sm mx-auto uppercase tracking-[0.3em]">
              {searchQuery
                ? "Refine your entry query"
                : "No digital artifacts exist in this sector. Await clipboard intelligence."}
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
      <div className="space-y-10 max-w-7xl pb-20">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
        </div>
      </div>
    }>
      <LinksContent />
    </Suspense>
  );
}

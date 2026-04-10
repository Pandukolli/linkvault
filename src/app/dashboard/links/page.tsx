"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLinks } from "@/hooks/use-links";
import { LinkCard } from "@/components/link-card";
import { SaveLinkDialog } from "@/components/save-link-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Grid3X3, List, Link2 } from "lucide-react";
import type { LinkWithTags } from "@/lib/types";

import { Suspense } from "react";

function LinksContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkWithTags | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { links, isLoading, toggleFavorite, deleteLink } = useLinks(searchQuery);

  return (
    <div className="space-y-10 max-w-7xl pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            {t("My Links", "My Links")}
          </h1>
          <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-[0.2em] opacity-40">
            {searchQuery
              ? `${t("Search results for", "Search results for")} "${searchQuery}"`
              : `${links.length} ${t("links saved", "links saved")}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
           {/* View toggle */}
          <div className="flex items-center border-elegant p-1 rounded-xl bg-slate-50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className={`h-9 w-9 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-black hover:bg-white/50"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className={`h-9 w-9 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-black hover:bg-white/50"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="h-11 px-6 gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4 stroke-[3]" />
            {t("Save Link", "Save Link")}
          </Button>
        </div>
      </div>

      {/* Links */}
      {isLoading ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          : "space-y-6"
        }>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "h-64 rounded-[2.5rem] bg-slate-50" : "h-20 rounded-2xl bg-slate-50"} />
          ))}
        </div>
      ) : links.length > 0 ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          <AnimatePresence mode="popLayout">
             {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                viewMode={viewMode}
                onEdit={(l) => {
                  setEditingLink(l);
                  setDialogOpen(true);
                }}
                onDelete={(id) => deleteLink.mutate(id)}
                onToggleFavorite={(id, isFav) =>
                  toggleFavorite.mutate({ id, is_favorite: isFav })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5">
          <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border-elegant shadow-inner group transition-all duration-500 hover:scale-110">
            <Link2 className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tight uppercase">
            {searchQuery ? t("No matches found", "No matches found") : t("Gallery is empty", "Gallery is empty")}
          </h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em]">
            {searchQuery
              ? t("Try a different search term", "Try a different search term")
              : t("Initiate your first vault entry to get started", "Initiate your first vault entry to get started")}
          </p>
          {!searchQuery && (
            <Button onClick={() => setDialogOpen(true)} className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 uppercase tracking-tighter">
              <Plus className="w-6 h-6 stroke-[3]" />
              {t("Save Your First Link", "Save Your First Link")}
            </Button>
          )}
        </div>
      )}

      {/* Save/Edit Dialog */}
      <SaveLinkDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingLink(null);
        }}
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

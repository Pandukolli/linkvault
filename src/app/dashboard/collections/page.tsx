"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCollections } from "@/hooks/use-collections";
import { CollectionCard } from "@/components/collection-card";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { Collection } from "@/lib/types";

export default function CollectionsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const { collections, isLoading, deleteCollection } = useCollections();

  return (
    <div className="space-y-12 max-w-7xl pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            {t("Collections", "Collections")}
          </h1>
          <p className="text-muted-foreground text-[10px] font-black mt-1 uppercase tracking-[0.2em] opacity-40">
            {collections.length} {t("curated artifact sets", "curated artifact sets")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-11 px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black transition-premium shadow-lg shadow-primary/20 hover:-translate-y-0.5 uppercase text-[11px] tracking-widest active:scale-95">
          <Plus className="w-4 h-4 stroke-[3]" />
          {t("Initialize Set", "Initialize Set")}
        </Button>
      </div>

      {/* Loading skeleton with Enhanced Spacing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-secondary border border-border" />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={(c) => {
                setEditingCollection(c);
                setDialogOpen(true);
              }}
              onDelete={(id) => deleteCollection.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center py-32 rounded-[3.5rem] bg-surface border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-muted border border-border flex items-center justify-center mx-auto mb-8 shadow-inner group transition-premium hover:scale-110">
            <FolderOpen className="w-10 h-10 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tighter uppercase">
            {t("Sector Empty", "Sector Empty")}
          </h3>
          <p className="text-sm text-muted-foreground font-serif max-w-md mx-auto mb-10 leading-relaxed px-6">
            {t("Initialize your first digital set to categorize and secure your artifacts for professional curation.", "Initialize your first digital set to categorize and secure your artifacts for professional curation.")}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 transition-premium hover:-translate-y-1 uppercase tracking-widest text-[11px] active:scale-95">
            <Plus className="w-6 h-6 stroke-[3]" />
            {t("Establish Primary Set", "Establish Primary Set")}
          </Button>
        </motion.div>
      )}

      <CreateCollectionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCollection(null);
        }}
        editingCollection={editingCollection}
      />
    </div>
  );
}

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
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            {t("Collections", "Collections")}
          </h1>
          <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-[0.2em] opacity-40">
            {collections.length} {t("curated sets", "curated sets")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-11 px-6 gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4 stroke-[3]" />
          {t("New Collection", "New Collection")}
        </Button>
      </div>

      {/* Loading skeleton with Enhanced Spacing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-50 border-elegant" />
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-elegant flex items-center justify-center mx-auto mb-8 shadow-inner group transition-all duration-500 hover:scale-110">
            <FolderOpen className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">
            {t("Archival is empty", "Archival is empty")}
          </h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            {t("Establish your first digital repository to categorize and secure your assets for professional curation.", "Establish your first digital repository to categorize and secure your assets for professional curation.")}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 uppercase tracking-tighter">
            <Plus className="w-6 h-6 stroke-[3]" />
            {t("Create Your First Collection", "Create Your First Collection")}
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

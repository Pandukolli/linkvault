"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLinks } from "@/hooks/use-links";
import { LinkCard } from "@/components/link-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { links, isLoading, toggleFavorite, deleteLink } = useLinks();
  const favorites = links.filter((l) => l.is_favorite);

  return (
    <div className="space-y-12 max-w-7xl pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            {t("Favorites", "Favorites")}
          </h1>
          <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-[0.2em] opacity-40 ml-11">
            {isLoading
              ? t("Processing...", "Processing...")
              : `${favorites.length} ${favorites.length === 1 ? t("favorited link", "favorited link") : t("favorited links", "favorited links")}`}
          </p>
        </div>
      </motion.div>

      {/* Loading skeleton with Enhanced Spacing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-50" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {favorites.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={(id) => deleteLink.mutate(id)}
                onToggleFavorite={(id, isFav) =>
                  toggleFavorite.mutate({ id, is_favorite: isFav })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Premium empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-elegant flex items-center justify-center mx-auto mb-8 shadow-inner group transition-all duration-500 hover:scale-110">
            <Heart className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">
            {t("Gallery is empty", "Gallery is empty")}
          </h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-[0.2em]">
            {t("Initiate your first vault entry by selecting favored links to be curated here for quick access. Instant sync activated.", "Initiate your first vault entry by selecting favored links to be curated here for quick access. Instant sync activated.")}
          </p>
          <Link href="/dashboard/links" className="group">
            <Button size="lg" className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 hover:-translate-y-1 uppercase tracking-tighter">
              {t("Browse Your Links", "Browse Your Links")}
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

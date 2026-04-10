"use client";

import { use } from "react";
import { useCollections } from "@/hooks/use-collections";
import { LinkCard } from "@/components/link-card";
import { useLinks } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Share2, ArrowLeft, Globe, Lock, Link2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { useCollection, removeLinkFromCollection } = useCollections();
  const { data: collection, isLoading } = useCollection(id);
  const { toggleFavorite, deleteLink } = useLinks();

  const handleShare = async () => {
    if (collection?.is_public) {
      const url = `${window.location.origin}/explore/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Public collection link copied!");
    } else {
      toast.info("Make this collection public to share it.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 max-w-7xl pb-20">
        <Skeleton className="h-10 w-64 bg-slate-50 rounded-xl" />
        <Skeleton className="h-6 w-32 bg-slate-50 rounded-lg" />
        {/* Loading skeleton with Enhanced Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-50 border-elegant" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5">
        <h2 className="text-2xl font-black text-black mb-4 uppercase">Collection not found</h2>
        <Link href="/dashboard/collections">
          <Button variant="outline" className="h-12 px-8 rounded-xl border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-all uppercase tracking-widest text-xs">
            Back to Collections
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl pb-20">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/collections"
          className="text-[10px] font-black text-slate-400 hover:text-primary flex items-center gap-2 mb-6 transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          Back to Collections
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight">{collection.name}</h1>
            {collection.description && (
              <p className="text-slate-500 font-bold text-sm mt-1">{collection.description}</p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none">
                {collection.links?.length || 0} links
              </Badge>
              <Badge
                variant="secondary"
                className={`text-[10px] font-black uppercase tracking-widest border-none ${
                  collection.is_public
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {collection.is_public ? (
                  <><Globe className="w-3 h-3 mr-1.5" /> Public</>
                ) : (
                  <><Lock className="w-3 h-3 mr-1.5" /> Private</>
                )}
              </Badge>
            </div>
          </div>
          {collection.is_public && (
            <Button variant="outline" className="h-11 px-6 gap-2 rounded-xl border-slate-200 text-black font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Links with Enhanced Spacing */}
      {collection.links && collection.links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {collection.links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onDelete={(linkId) => {
                removeLinkFromCollection.mutate({
                  collectionId: id,
                  linkId,
                });
              }}
              onToggleFavorite={(linkId, isFav) =>
                toggleFavorite.mutate({ id: linkId, is_favorite: isFav })
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5">
          <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border-elegant shadow-inner group transition-all duration-500 hover:scale-110">
            <Link2 className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">{t("Inventory is empty", "Inventory is empty")}</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            Assign digital assets to this repository from the primary gallery to begin curation.
          </p>
        </div>
      )}
    </div>
  );
}

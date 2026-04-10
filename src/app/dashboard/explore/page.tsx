"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CollectionCard } from "@/components/collection-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass } from "lucide-react";
import type { Collection } from "@/lib/types";

export default function ExplorePage() {
  const supabase = createClient();

  const { data: publicCollections = [], isLoading } = useQuery<(Collection & { link_count: number })[]>({
    queryKey: ["public-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, collection_links(count)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((c: Record<string, unknown>) => ({
        ...c,
        link_count: Array.isArray(c.collection_links)
          ? (c.collection_links[0] as { count: number })?.count || 0
          : 0,
      })) as (Collection & { link_count: number })[];
    },
  });

  return (
    <div className="space-y-10 max-w-7xl pb-20">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">
          Explore
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-40">
          Discover public collections from the community
        </p>
      </div>

      {/* Loading skeleton with Enhanced Spacing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-50 border-elegant" />
          ))}
        </div>
      ) : publicCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {publicCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 rounded-[3.5rem] bg-card border-elegant shadow-2xl shadow-primary/5">
          <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border-elegant shadow-inner group transition-all duration-500 hover:scale-110">
            <Compass className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">No public collections yet</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            Be the first to share a collection with the community!
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook for Supabase Realtime subscriptions.
 * Automatically invalidates queries when data changes in the database.
 */
export function useRealtime() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to changes on the links table
    const linksChannel = supabase
      .channel("links-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "links" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["links"] });
        }
      )
      .subscribe();

    // Subscribe to changes on the collections table
    const collectionsChannel = supabase
      .channel("collections-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      )
      .subscribe();

    // Subscribe to collection_links changes
    const collLinksChannel = supabase
      .channel("collection-links-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collection_links" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["collections"] });
          queryClient.invalidateQueries({ queryKey: ["links"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(linksChannel);
      supabase.removeChannel(collectionsChannel);
      supabase.removeChannel(collLinksChannel);
    };
  }, [supabase, queryClient]);
}

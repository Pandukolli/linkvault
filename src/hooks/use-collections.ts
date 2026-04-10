"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Collection, CollectionWithLinks, CreateCollectionInput } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook for collection CRUD operations.
 */
export function useCollections() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch all collections for the current user
  const {
    data: collections = [],
    isLoading,
    error,
  } = useQuery<(Collection & { link_count: number })[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("collections")
        .select("*, collection_links(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((c: Record<string, unknown>) => ({
        ...c,
        link_count: Array.isArray(c.collection_links)
          ? (c.collection_links[0] as { count: number })?.count || 0
          : 0,
      })) as (Collection & { link_count: number })[];
    },
  });

  // Fetch a single collection with its links
  const useCollection = (id: string) => {
    return useQuery<CollectionWithLinks | null>({
      queryKey: ["collections", id],
      queryFn: async () => {
        const { data: collection, error: collError } = await supabase
          .from("collections")
          .select("*")
          .eq("id", id)
          .single();

        if (collError) throw collError;

        const { data: collLinks } = await supabase
          .from("collection_links")
          .select("link_id, links(*)")
          .eq("collection_id", id);

        const links = (collLinks || []).map((cl: Record<string, unknown>) => ({
          ...(cl.links as Record<string, unknown>),
          tags: [],
        }));

        return { ...collection, links } as CollectionWithLinks;
      },
      enabled: !!id,
    });
  };

  // Create a collection
  const createCollection = useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          is_public: input.is_public,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection created!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create collection");
    },
  });

  // Update a collection
  const updateCollection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Collection> & { id: string }) => {
      const { data, error } = await supabase
        .from("collections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update collection");
    },
  });

  // Delete a collection
  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete collection");
    },
  });

  // Add link to collection
  const addLinkToCollection = useMutation({
    mutationFn: async ({ collectionId, linkId }: { collectionId: string; linkId: string }) => {
      const { error } = await supabase
        .from("collection_links")
        .insert({ collection_id: collectionId, link_id: linkId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Link added to collection");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add link to collection");
    },
  });

  // Remove link from collection
  const removeLinkFromCollection = useMutation({
    mutationFn: async ({ collectionId, linkId }: { collectionId: string; linkId: string }) => {
      const { error } = await supabase
        .from("collection_links")
        .delete()
        .eq("collection_id", collectionId)
        .eq("link_id", linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Link removed from collection");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove link");
    },
  });

  return {
    collections,
    isLoading,
    error,
    useCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addLinkToCollection,
    removeLinkFromCollection,
  };
}

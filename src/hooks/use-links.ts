"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Link, LinkWithTags, SaveLinkInput } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook for all link CRUD operations with optimistic updates.
 */
export function useLinks(searchQuery?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch all links for the current user
  const {
    data: links = [],
    isLoading,
    error,
  } = useQuery<LinkWithTags[]>({
    queryKey: ["links", searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch tags for each link
      const linksWithTags: LinkWithTags[] = await Promise.all(
        (data || []).map(async (link: Link) => {
          const { data: tagData } = await supabase
            .from("link_tags")
            .select("tag_id, tags(id, name)")
            .eq("link_id", link.id);

          const tags = tagData?.map((lt: Record<string, unknown>) => {
            const tag = lt.tags as { id: string; name: string } | null;
            return tag ? { id: tag.id, name: tag.name } : null;
          }).filter(Boolean) || [];

          return { ...link, tags: tags as { id: string; name: string }[] };
        })
      );

      return linksWithTags;
    },
  });

  // Save a new link
  const saveLink = useMutation({
    mutationFn: async (input: SaveLinkInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert the link
      const { data: link, error } = await supabase
        .from("links")
        .insert({
          user_id: user.id,
          url: input.url,
          title: input.title || null,
          description: input.description || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Handle tags
      if (input.tags && input.tags.length > 0) {
        for (const tagName of input.tags) {
          // Upsert the tag
          let { data: tag } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagName.toLowerCase().trim())
            .single();

          if (!tag) {
            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ name: tagName.toLowerCase().trim() })
              .select()
              .single();
            if (tagError) continue;
            tag = newTag;
          }

          // Link the tag
          if (tag) {
            await supabase
              .from("link_tags")
              .insert({ link_id: link.id, tag_id: tag.id });
          }
        }
      }

      // Handle collection
      if (input.collection_id) {
        await supabase
          .from("collection_links")
          .insert({ collection_id: input.collection_id, link_id: link.id });
      }

      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Link saved successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save link");
    },
  });

  // Update a link
  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from("links")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update link");
    },
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from("links")
        .update({ is_favorite: !is_favorite })
        .eq("id", id);

      if (error) throw error;
    },
    // Optimistic update — applies to ALL cached link queries
    onMutate: async ({ id, is_favorite }) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      // Snapshot all link queries for rollback
      const previousQueries = queryClient.getQueriesData<LinkWithTags[]>({ queryKey: ["links"] });

      // Optimistically update every cached variant
      queryClient.setQueriesData<LinkWithTags[]>({ queryKey: ["links"] }, (old) =>
        old?.map((link) =>
          link.id === id ? { ...link, is_favorite: !is_favorite } : link
        )
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback all queries
      context?.previousQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error("Failed to update favorite");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  // Delete a link
  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Link deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete link");
    },
  });

  return {
    links,
    isLoading,
    error,
    saveLink,
    updateLink,
    toggleFavorite,
    deleteLink,
  };
}

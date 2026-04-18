"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Link, LinkWithTags, SaveLinkInput } from "@/lib/types";

export function useLinks(searchQuery?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

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
        .select(`
          *,
          link_tags(
            tag:tags(id, name)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((link: any) => ({
        ...link,
        tags: link.link_tags?.map((lt: any) => lt.tag).filter(Boolean) || []
      })) as LinkWithTags[];
    },
  });

  const saveLink = useMutation({
    mutationFn: async (input: SaveLinkInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // MANDATORY FIELDS ONLY based on user's primary schema
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

      if (error) {
        console.error("[useLinks] Save failed:", error);
        throw error;
      }

      // Restore simple Tag and Collection logic
      if (input.tags && input.tags.length > 0) {
        for (const tagName of input.tags) {
          const name = tagName.toLowerCase().trim();
          let { data: tag } = await supabase.from("tags").select("id").eq("name", name).maybeSingle();
          if (!tag) {
            const { data: newTag } = await supabase.from("tags").insert({ name }).select("id").single();
            tag = newTag;
          }
          if (tag) {
            await supabase.from("link_tags").insert({ link_id: link.id, tag_id: tag.id });
          }
        }
      }

      if (input.collection_id) {
        await supabase.from("collection_links").insert({ collection_id: input.collection_id, link_id: link.id });
      }

      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link indexed in Vault");
    },
    onError: (err: any) => {
      console.error("[useLinks] Save detail:", err);
      toast.error(err?.message || "Failed to save link");
    }
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link updated");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update link");
    }
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Artifact erased from Vault");
    },
    onError: (err: any) => {
      console.error("[useLinks] Delete error:", err);
      toast.error(err.message || "Failed to erase artifact");
    }
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from("links")
        .update({ is_favorite: !is_favorite })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Link;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success(data.is_favorite ? "Starred in Vault" : "Removed from Starred");
    },
    onError: (err: any) => {
      console.error("[useLinks] Toggle fav error:", err);
      toast.error(err?.message || "Critical operation failed");
    }
  });

  return { 
    links, 
    isLoading, 
    error, 
    saveLink, 
    updateLink, 
    deleteLink,
    toggleFavorite
  };
}

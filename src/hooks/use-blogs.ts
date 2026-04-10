"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Blog, CreateBlogInput } from "@/lib/types";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

export function useBlogs() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: blogs = [],
    isLoading,
    error,
  } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
  });

  const createBlog = useMutation({
    mutationFn: async (input: CreateBlogInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const baseSlug = input.slug || generateSlug(input.title);
      // Append a short unique suffix to avoid slug collisions
      const suffix = Date.now().toString(36).slice(-5);
      const slug = input.slug ? baseSlug : `${baseSlug}-${suffix}`;

      const { data, error } = await supabase
        .from("blogs")
        .insert({
          user_id: user.id,
          title: input.title,
          slug,
          content: input.content || null,
          status: input.status || "draft",
          seo_title: input.seo_title || null,
          seo_description: input.seo_description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog created");
    },
    onError: () => {
      toast.error("Failed to create blog");
    },
  });

  const updateBlog = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Blog> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
      
      if (updates.status === "published" && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }
      if (updates.title && !updates.slug) {
        updateData.slug = generateSlug(updates.title);
      }

      const { data, error } = await supabase
        .from("blogs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: () => {
      toast.error("Failed to update blog");
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete blog");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Publication erased successfully");
    },
    onError: (err: any) => {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to erase publication");
    },
  });

  return { blogs, isLoading, error, createBlog, updateBlog, deleteBlog };
}

export function usePublicBlog(slug: string) {
  const supabase = createClient();
  
  return useQuery<Blog>({
    queryKey: ["public_blog", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
        
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { GalleryImage } from "@/lib/types";

/**
 * Hook for managing global Gallery images.
 * Restored to original 'user_images' table and 'user-images' bucket.
 */
export function useImages(folder?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: images = [],
    isLoading,
    error,
  } = useQuery<GalleryImage[]>({
    queryKey: ["user-images", folder],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("user_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (folder && folder !== "all") {
        query = query.eq("folder", folder);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const uploadImage = useMutation({
    mutationFn: async ({ 
      file, 
      folder = "general",
      name 
    }: { 
      file: File; 
      folder?: string;
      name?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to user-images bucket
      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("user_images")
        .insert({
          user_id: user.id,
          url: publicUrl,
          title: name || file.name,
          folder: folder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GalleryImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-images"] });
      toast.success("Image uploaded to Gallery");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload image");
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GalleryImage> & { id: string }) => {
      const { data, error } = await supabase
        .from("user_images")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GalleryImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-images"] });
      toast.success("Memory updated");
    },
    onError: (err: any) => {
      console.error("[useImages] Update error:", err);
      toast.error(err.message || "Failed to edit memory");
    }
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-images"] });
      toast.success("Memory erased from Gallery");
    },
    onError: (err: any) => {
      console.error("[useImages] Delete error:", err);
      toast.error(err.message || "Failed to erase memory");
    }
  });

  return { 
    images, 
    isLoading, 
    error, 
    uploadImage, 
    updateImage, 
    deleteImage 
  };
}

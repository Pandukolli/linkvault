"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UserImage } from "@/lib/types";

export function useImages(folder?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: images = [],
    isLoading,
    error,
  } = useQuery<UserImage[]>({
    queryKey: ["images", folder],
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
      return data as UserImage[];
    },
  });

  const uploadImage = useMutation({
    mutationFn: async ({ file, folder: imgFolder, caption }: { file: File; folder?: string; caption?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to Supabase Storage
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      // Get max order_index
      const { data: maxData } = await supabase
        .from("user_images")
        .select("order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = (maxData?.[0]?.order_index ?? -1) + 1;

      // Insert record
      const { data, error } = await supabase
        .from("user_images")
        .insert({
          user_id: user.id,
          url: urlData.publicUrl,
          folder: imgFolder || "general",
          caption: caption || null,
          order_index: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image uploaded");
    },
    onError: () => {
      toast.error("Failed to upload image");
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserImage> & { id: string }) => {
      const { data, error } = await supabase
        .from("user_images")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as UserImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: () => {
      toast.error("Failed to update image");
    },
  });

  const reorderImages = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update each image's order_index
      const promises = orderedIds.map((id, index) =>
        supabase
          .from("user_images")
          .update({ order_index: index })
          .eq("id", id)
          .eq("user_id", user.id)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
    onError: () => {
      toast.error("Failed to reorder images");
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image deleted");
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  return { images, isLoading, error, uploadImage, updateImage, reorderImages, deleteImage };
}

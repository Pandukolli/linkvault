"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UpdateProfileInput } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook for fetching and updating the current user's profile.
 */
export function useProfile() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: input.full_name,
          bio: input.bio,
          avatar_url: input.avatar_url,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (updateError) throw updateError;
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload avatar");
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
  };
}

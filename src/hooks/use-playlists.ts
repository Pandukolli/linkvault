"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Playlist, CreatePlaylistInput } from "@/lib/types";

export function usePlaylists() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: playlists = [],
    isLoading,
    error,
  } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Playlist[];
    },
  });

  const createPlaylist = useMutation({
    mutationFn: async (input: CreatePlaylistInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("playlists")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          items: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Playlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist created");
    },
    onError: () => {
      toast.error("Failed to create playlist");
    },
  });

  const updatePlaylist = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Playlist> & { id: string }) => {
      const { data, error } = await supabase
        .from("playlists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Playlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
  });

  const deletePlaylist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist deleted");
    },
    onError: () => {
      toast.error("Failed to delete playlist");
    },
  });

  return { playlists, isLoading, error, createPlaylist, updatePlaylist, deletePlaylist };
}

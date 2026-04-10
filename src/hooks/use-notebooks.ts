"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Notebook, CreateNotebookInput } from "@/lib/types";

export function useNotebooks() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: notebooks = [],
    isLoading,
    error,
  } = useQuery<Notebook[]>({
    queryKey: ["notebooks"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notebooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notebook[];
    },
  });

  const createNotebook = useMutation({
    mutationFn: async (input: CreateNotebookInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notebooks")
        .insert({
          user_id: user.id,
          name: input.name,
          cover_color: input.cover_color || "#18181b",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Notebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      toast.success("Notebook created");
    },
    onError: () => {
      toast.error("Failed to create notebook");
    },
  });

  const deleteNotebook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notebooks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      toast.success("Notebook deleted");
    },
    onError: () => {
      toast.error("Failed to delete notebook");
    },
  });

  return {
    notebooks,
    isLoading,
    error,
    createNotebook,
    deleteNotebook,
  };
}

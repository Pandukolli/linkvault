"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Note, CreateNoteInput } from "@/lib/types";

export function useNotes(notebookId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery<Note[]>({
    queryKey: ["notes", notebookId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (notebookId) {
        query = query.eq("notebook_id", notebookId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
  });

  const createNote = useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get next page number for the notebook
      let pageNumber = 1;
      if (input.notebook_id) {
        const { count } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("notebook_id", input.notebook_id);
        pageNumber = (count || 0) + 1;
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: input.title || "Untitled",
          content: input.content || null,
          notebook_id: input.notebook_id || null,
          is_daily: input.is_daily || false,
          page_number: pageNumber,
          created_at: input.created_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created");
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      toast.error("Failed to update note");
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
}

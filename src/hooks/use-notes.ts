"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Note } from "@/lib/types";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

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
    mutationFn: async (note: Partial<Note>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Step 1: Minimal insert — only guaranteed columns
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: note.title || "Untitled Note",
          content: note.content || { type: "doc", content: [{ type: "paragraph" }] },
        })
        .select()
        .single();

      if (error) {
        console.error("[useNotes] createNote failed:", JSON.stringify(error));
        throw error;
      }

      // Step 2: Patch optional columns if provided (ignore errors — they just mean the column doesn't exist yet)
      const optionalFields: Record<string, any> = {};
      if (note.notebook_id !== undefined) optionalFields.notebook_id = note.notebook_id;
      if (note.is_daily !== undefined) optionalFields.is_daily = note.is_daily;
      if (note.tags !== undefined) optionalFields.tags = note.tags;
      if (note.metadata !== undefined) optionalFields.metadata = note.metadata;
      if (note.page_number !== undefined) optionalFields.page_number = note.page_number;

      if (Object.keys(optionalFields).length > 0) {
        const { error: patchErr } = await supabase
          .from("notes")
          .update(optionalFields)
          .eq("id", data.id);
        if (patchErr) console.warn("[useNotes] optional column patch failed (columns may not exist):", patchErr.message);
      }

      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note captured in Vault");
    },
    onError: (err: any) => {
      console.error("[useNotes] createNote error:", err);
      toast.error(err?.message || "Failed to create note");
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      // Only send the safe, mutable fields to avoid column-not-found errors
      const safeUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) safeUpdate.title = updates.title;
      if (updates.content !== undefined) safeUpdate.content = updates.content;
      if (updates.is_favorite !== undefined) safeUpdate.is_favorite = updates.is_favorite;
      // Optional columns — silently ignored if they don't exist
      if (updates.notebook_id !== undefined) safeUpdate.notebook_id = updates.notebook_id;
      if (updates.is_daily !== undefined) safeUpdate.is_daily = updates.is_daily;
      if (updates.tags !== undefined) safeUpdate.tags = updates.tags;
      if (updates.metadata !== undefined) safeUpdate.metadata = updates.metadata;
      if (updates.page_number !== undefined) safeUpdate.page_number = updates.page_number;

      const { data, error } = await supabase
        .from("notes")
        .update(safeUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[useNotes] updateNote failed:", JSON.stringify(error));
        throw error;
      }
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: any) => {
      console.error("[useNotes] updateNote error:", err);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note removed");
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ is_favorite: !is_favorite })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  };
}

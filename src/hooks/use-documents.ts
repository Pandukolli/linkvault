"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UserDocument } from "@/lib/types";

export function useDocuments() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery<UserDocument[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserDocument[];
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop()?.toLowerCase() || "file";
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("user_documents")
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          type: ext,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded");
    },
    onError: () => {
      toast.error("Failed to upload document");
    },
  });

  const downloadDocument = async (doc: UserDocument) => {
    const { data, error } = await supabase.storage
      .from("user-documents")
      .download(doc.file_path);

    if (error) {
      toast.error("Failed to download document");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteDocument = useMutation({
    mutationFn: async (doc: UserDocument) => {
      // Delete from storage
      await supabase.storage.from("user-documents").remove([doc.file_path]);
      // Delete from DB
      const { error } = await supabase.from("user_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });

  return { documents, isLoading, error, uploadDocument, downloadDocument, deleteDocument };
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Resume } from "@/lib/types";

export interface ResumeContent {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    period: string;
  }[];
  skills: string[];
}

const DEFAULT_RESUME: ResumeContent = {
  name: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: [{ company: "", role: "", period: "", description: "" }],
  education: [{ institution: "", degree: "", period: "" }],
  skills: [],
};

export function useResumes() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: resumes = [],
    isLoading,
    error,
  } = useQuery<Resume[]>({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Resume[];
    },
  });

  const createResume = useMutation({
    mutationFn: async (title?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: title || "My Resume",
          content: DEFAULT_RESUME,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume created");
    },
    onError: () => {
      toast.error("Failed to create resume");
    },
  });

  const updateResume = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resume> & { id: string }) => {
      const { data, error } = await supabase
        .from("resumes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: () => {
      toast.error("Failed to update resume");
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
    onError: () => {
      toast.error("Failed to delete resume");
    },
  });

  return { resumes, isLoading, error, createResume, updateResume, deleteResume, DEFAULT_RESUME };
}

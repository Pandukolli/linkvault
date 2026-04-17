"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface ResumeContent {
  personalInfo: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    photo: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    period: string;
    description: string;
    location?: string;
    isVisible: boolean;
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    period: string;
    description?: string;
    isVisible: boolean;
  }[];
  skills: {
    category: string;
    items: string[];
    isVisible: boolean;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    link?: string;
    period?: string;
    isVisible: boolean;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    isVisible: boolean;
  }[];
  languages: {
    language: string;
    proficiency: string;
    isVisible: boolean;
  }[];
  customSections: {
    id: string;
    title: string;
    content: string;
    isVisible: boolean;
  }[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_name: string;
  template_color: string;
  content: ResumeContent;
  cover_letter: {
    title: string;
    recipientName: string;
    recipientCompany: string;
    date: string;
    content: string;
  } | null;
  is_favorite: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string;
  version: number;
  parent_resume_id: string | null;
}

export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  personalInfo: { fullName: "", professionalTitle: "", email: "", phone: "", location: "", linkedin: "", website: "", photo: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: [],
};

export const DEMO_RESUME_CONTENT: ResumeContent = {
  personalInfo: {
    fullName: "Alexander Sterling",
    professionalTitle: "Global Solutions Architect",
    email: "alexander.sterling@vaultos.io",
    phone: "+1 (555) 902-ARCH",
    location: "Zurich, Switzerland",
    linkedin: "alex-sterling-global",
    website: "sterling-archives.io",
    photo: ""
  },
  summary: "Multidisciplinary systems architect with 12+ years of experience in engineering high-availability digital infrastructures. Specialist in cryptographically-secure archival protocols and decentralized identity management. Proven track record of delivering $50M+ scale technological milestones for Tier-1 global institutions.",
  experience: [
    {
      id: "exp-1",
      company: "Sterling Global Systems",
      role: "Principal Architect",
      period: "2019 - PRESENT",
      location: "Geneva, CH",
      description: "• Architected 'VaultOS' - a decentralized operating system for private archival management.\n• Orchestrated a 200% increase in system throughput using optimized kernel-level state management.\n• Led a cross-functional team of 40 engineers across three continents.",
      isVisible: true
    },
    {
      id: "exp-2",
      company: "Nexus Defense Intel",
      role: "Security Protocol Lead",
      period: "2014 - 2018",
      location: "London, UK",
      description: "• Pioneered Zero-Knowledge Proof (ZKP) implementations for governmental archival clusters.\n• Reduced security breach surface by 94% through strict protocol invariant enforcement.",
      isVisible: true
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "ETH Zurich",
      degree: "MS in Computer Science (Distributed Systems)",
      period: "2012 - 2014",
      description: "Summa Cum Laude. Focus on Byzantine Fault Tolerance.",
      isVisible: true
    }
  ],
  skills: [
    {
      category: "Architectural Logic",
      items: ["Distributed Systems", "Rust", "C++", "Protocol Design", "ZKP"],
      isVisible: true
    },
    {
      category: "Strategic Execution",
      items: ["Team Leadership", "Budgeting ($50M+)", "Global Stakeholder Management"],
      isVisible: true
    }
  ],
  projects: [],
  certifications: [],
  languages: [],
  customSections: []
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
    mutationFn: async ({ title, template_name = 'modern', template_color = '#2563EB' }: { title?: string, template_name?: string, template_color?: string } = {}) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Set last_used_at to now exactly for consistency
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: title || "Official Record",
          content: DEFAULT_RESUME_CONTENT,
          template_name,
          template_color,
          last_used_at: now,
          updated_at: now,
          created_at: now,
          version: 1
        })
        .select()
        .single();

      if (error) throw error;
      return data as Resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Credential record successfully initialized");
    },
    onError: () => {
      toast.error("Process failure in record creation");
    },
  });

  const seedDemo = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: "Alexander Sterling (Global Professional)",
          content: DEMO_RESUME_CONTENT,
          template_name: "technical",
          template_color: "#2563EB",
          last_used_at: now,
          updated_at: now,
          created_at: now,
          version: 1,
          is_favorite: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as Resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Professional Demo Architecture successfully instantiated");
    },
  });

  const updateResume = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resume> & { id: string }) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("resumes")
        .update({ 
          ...updates, 
          updated_at: now,
          last_used_at: updates.last_used_at || now
        })
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
      toast.error("Logic mapping failure in record update");
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Archive unit permanently purged");
    },
    onError: () => {
      toast.error("Shield failure in purge protocol");
    },
  });

  return { resumes, isLoading, error, createResume, updateResume, deleteResume, seedDemo, DEFAULT_RESUME_CONTENT };
}

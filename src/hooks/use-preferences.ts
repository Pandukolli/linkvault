"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface UserPreferences {
  id?: string;
  user_id: string;
  language: string;
  timezone: string;
  default_view: string;
  items_per_page: number;
  theme: string;
  accent_color: string;
  bg_color: string;
  auto_tagging: boolean;
  smart_summary: boolean;
  ai_model: string;
  semantic_search_strength: string;
  public_profile: boolean;
  allow_public_collections: boolean;
  backup_frequency: string;
  updated_at?: string;
}

const DEFAULTS: Omit<UserPreferences, "user_id" | "id" | "updated_at"> = {
  language: "en",
  timezone: "auto",
  default_view: "grid",
  items_per_page: 50,
  theme: "dark",
  accent_color: "default",
  bg_color: "default",
  auto_tagging: true,
  smart_summary: false,
  ai_model: "gemini-2.5-flash",
  semantic_search_strength: "medium",
  public_profile: false,
  allow_public_collections: false,
  backup_frequency: "auto",
};

/** Merge raw DB row with defaults so no field is ever null */
function mergeWithDefaults(raw: Record<string, unknown>): UserPreferences {
  return {
    id: raw.id as string | undefined,
    user_id: raw.user_id as string,
    updated_at: raw.updated_at as string | undefined,
    language: (raw.language as string) ?? DEFAULTS.language,
    timezone: (raw.timezone as string) ?? DEFAULTS.timezone,
    default_view: (raw.default_view as string) ?? DEFAULTS.default_view,
    items_per_page: (raw.items_per_page as number) ?? DEFAULTS.items_per_page,
    theme: (raw.theme as string) ?? DEFAULTS.theme,
    accent_color: (raw.accent_color as string) ?? DEFAULTS.accent_color,
    bg_color: (raw.bg_color as string) ?? DEFAULTS.bg_color,
    auto_tagging: (raw.auto_tagging as boolean) ?? DEFAULTS.auto_tagging,
    smart_summary: (raw.smart_summary as boolean) ?? DEFAULTS.smart_summary,
    ai_model: (raw.ai_model as string) ?? DEFAULTS.ai_model,
    semantic_search_strength: (raw.semantic_search_strength as string) ?? DEFAULTS.semantic_search_strength,
    public_profile: (raw.public_profile as boolean) ?? DEFAULTS.public_profile,
    allow_public_collections: (raw.allow_public_collections as boolean) ?? DEFAULTS.allow_public_collections,
    backup_frequency: (raw.backup_frequency as string) ?? DEFAULTS.backup_frequency,
  };
}

export function usePreferences() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery<UserPreferences>({
    queryKey: ["preferences"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No row yet — insert defaults
        const { data: newRow, error: insertErr } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, ...DEFAULTS })
          .select()
          .single();

        if (insertErr) throw insertErr;
        return mergeWithDefaults(newRow as Record<string, unknown>);
      }

      if (error) throw error;
      return mergeWithDefaults(data as Record<string, unknown>);
    },
    staleTime: 1000 * 60 * 5,
  });

  const updatePreference = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(
          { user_id: user.id, ...updates, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return mergeWithDefaults(data as Record<string, unknown>);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["preferences"] });
      const previous = queryClient.getQueryData<UserPreferences>(["preferences"]);
      queryClient.setQueryData<UserPreferences>(["preferences"], (old) =>
        old ? { ...old, ...updates } : old
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Settings saved");
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["preferences"], context.previous);
      }
      toast.error("Failed to save settings");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  /** Update a single setting instantly with optimistic UI */
  const set = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    updatePreference.mutate({ [key]: value } as Partial<UserPreferences>);
  };

  return {
    preferences: preferences ?? ({ ...DEFAULTS, user_id: "" } as UserPreferences),
    isLoading,
    error,
    updatePreference,
    set,
  };
}

import { z } from "zod";

// ============================================================
// Core Website Entity Schemas (The Core 5)
// ============================================================

export const profileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().nullish(),
  avatar_url: z.string().nullish(),
  bio: z.string().nullish(),
  updated_at: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;

export const linkSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  image_url: z.string().nullish(),
  favicon: z.string().nullish(),
  notes: z.string().nullish(),
  is_favorite: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Link = z.infer<typeof linkSchema>;

export const notebookSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  cover_color: z.string().default("#f8f1e3"),
  created_at: z.string(),
});
export type Notebook = z.infer<typeof notebookSchema>;

export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  content: z.any().nullable(),                 // Full JSONB support
  notebook_id: z.string().uuid().nullable(),
  page_number: z.number().default(1),
  is_daily: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  is_favorite: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Note = z.infer<typeof noteSchema>;

export const blogPostSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().nullish(),
  content: z.any().nullable(),                 // JSONB editor content
  status: z.enum(["draft", "published"]).default("draft"),
  published_at: z.string().nullish(),
  seo_title: z.string().nullish(),
  seo_description: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;

export const galleryImageSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  order_index: z.number().default(0),
  caption: z.string().nullish(),
  folder: z.string().default("general"),
  title: z.string().nullish(),
  story: z.string().nullish(),
  story_style: z.string().default("retro"),
  is_story: z.boolean().default(false),
  published_at: z.string().nullish(),
  slug: z.string().nullish(),
  created_at: z.string(),
});
export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const collectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullish(),
  is_public: z.boolean().default(false),
  color: z.string().default("#3b82f6"),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Collection = z.infer<typeof collectionSchema>;

export const userDocumentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  file_path: z.string(),
  type: z.string().nullish(),
  size: z.number().nullish(),
  created_at: z.string(),
});
export type UserDocument = z.infer<typeof userDocumentSchema>;

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string(),
});
export type Tag = z.infer<typeof tagSchema>;

export type Blog = BlogPost;
export interface CreateBlogInput {
  title: string;
  slug?: string;
  content?: any;
  status?: "draft" | "published";
  seo_title?: string;
  seo_description?: string;
}

export type CollectionWithLinks = Collection & { links: Link[] };
export interface CreateCollectionInput {
  name: string;
  description?: string;
  is_public?: boolean;
  color?: string;
}

// Helper Types
export type LinkWithTags = Link & { tags?: Tag[] };
export type NoteWithNotebook = Note & { notebook?: Notebook };
export interface SaveLinkInput {
  url: string;
  title?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  collection_id?: string;
}
export interface CreateNotebookInput {
  name: string;
  cover_color?: string;
}
export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}
export interface CreateNoteInput {
  title: string;
  content?: any;
  notebook_id?: string;
  is_daily?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

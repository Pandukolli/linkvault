import { z } from "zod";

// ============================================================
// Zod Schemas — used for runtime validation of forms & API data
// ============================================================

export const profileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const linkSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url("Please enter a valid URL"),
  title: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  favicon: z.string().nullable(),
  notes: z.string().nullable(),
  is_favorite: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Tag name is required"),
});

export const collectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, "Collection name is required"),
  description: z.string().nullable(),
  is_public: z.boolean().default(false),
  created_at: z.string(),
});

// ============================================================
// New Entity Schemas — Personal Life OS
// ============================================================

export const notebookSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, "Notebook name is required"),
  cover_color: z.string().default("#18181b"),
  created_at: z.string(),
});

export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().nullable(),
  content: z.any().nullable(), // TipTap JSON content
  notebook_id: z.string().uuid().nullable(),
  page_number: z.number().default(1),
  is_daily: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const blogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, "Blog title is required"),
  slug: z.string().nullable(),
  content: z.any().nullable(), // TipTap JSON content
  status: z.enum(["draft", "published"]).default("draft"),
  published_at: z.string().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userImageSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  order_index: z.number().default(0),
  caption: z.string().nullable(),
  folder: z.string().default("general"),
  created_at: z.string(),
  // New fields for Gallery Features
  title: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  story_style: z.string().nullable().optional(),
  is_story: z.boolean().default(false).optional(),
  published_at: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
});

export const userDocumentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  file_path: z.string(),
  type: z.string().nullable(),
  size: z.number().nullable(),
  created_at: z.string(),
});

export const resumeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().default("My Resume"),
  content: z.any().nullable(), // Structured resume JSON
  created_at: z.string(),
  updated_at: z.string(),
});

export const playlistSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().nullable(),
  items: z.any().nullable(), // Array of saved items
  created_at: z.string(),
});

// ============================================================
// Form Schemas — used for user input validation
// ============================================================

export const saveLinkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  collection_id: z.string().uuid().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(1, "Name is required").max(100),
});

export const createNotebookSchema = z.object({
  name: z.string().min(1, "Notebook name is required").max(100),
  cover_color: z.string().default("#18181b"),
});

export const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.any().optional(),
  notebook_id: z.string().uuid().optional(),
  is_daily: z.boolean().default(false),
  created_at: z.string().optional(),
});

export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.any().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft").optional(),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
});

export const createPlaylistSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

// ============================================================
// TypeScript Types — inferred from Zod schemas
// ============================================================

export type Profile = z.infer<typeof profileSchema>;
export type Link = z.infer<typeof linkSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type Notebook = z.infer<typeof notebookSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Blog = z.infer<typeof blogSchema>;
export type UserImage = z.infer<typeof userImageSchema>;
export type UserDocument = z.infer<typeof userDocumentSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type Playlist = z.infer<typeof playlistSchema>;

export type SaveLinkInput = z.infer<typeof saveLinkSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;

// Extended types with relations
export type LinkWithTags = Link & {
  tags: Tag[];
};

export type CollectionWithLinks = Collection & {
  links: LinkWithTags[];
  link_count?: number;
};

export type NotebookWithNotes = Notebook & {
  notes: Note[];
  note_count?: number;
};

// URL metadata fetched when saving a link
export type UrlMetadata = {
  title: string | null;
  description: string | null;
  image_url: string | null;
  favicon: string | null;
};

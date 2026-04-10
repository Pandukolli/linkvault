-- ============================================================
-- LinkVault PREMIUM Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Links
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  favicon TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- 4. Link Tags (many-to-many)
CREATE TABLE IF NOT EXISTS public.link_tags (
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

-- 5. Collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Collection Links (many-to-many)
CREATE TABLE IF NOT EXISTS public.collection_links (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, link_id)
);

-- =========================
-- Enable Row Level Security (RLS)
-- =========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_links ENABLE ROW LEVEL SECURITY;

-- =========================
-- Security Policies
-- =========================

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Links RLS
CREATE POLICY "Users can view own links" ON public.links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own links" ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON public.links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON public.links FOR DELETE USING (auth.uid() = user_id);

-- Tags RLS
CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Link Tags RLS
CREATE POLICY "Users can view own link_tags" ON public.link_tags FOR SELECT USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));
CREATE POLICY "Users can insert own link_tags" ON public.link_tags FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));
CREATE POLICY "Users can delete own link_tags" ON public.link_tags FOR DELETE USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_tags.link_id AND links.user_id = auth.uid()));

-- Collections RLS
CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public collections" ON public.collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Collection Links RLS
CREATE POLICY "Users can view own collection_links" ON public.collection_links FOR SELECT USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Anyone can view public collection links" ON public.collection_links FOR SELECT USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.is_public = true));
CREATE POLICY "Users can insert own collection_links" ON public.collection_links FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Users can delete own collection_links" ON public.collection_links FOR DELETE USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_links.collection_id AND collections.user_id = auth.uid()));

-- =========================
-- Automated Profile Trigger
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1), 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to avoid duplication errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- Bio column on profiles
-- =========================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- =========================
-- 7. User Preferences
-- =========================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'auto',
  default_view TEXT DEFAULT 'grid',
  items_per_page INT DEFAULT 50,
  theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT 'indigo',
  ai_auto_tagging BOOLEAN DEFAULT true,
  ai_smart_summary BOOLEAN DEFAULT false,
  ai_model TEXT DEFAULT 'gemini-2.5-flash',
  semantic_search_strength TEXT DEFAULT 'medium',
  public_profile BOOLEAN DEFAULT false,
  public_collections BOOLEAN DEFAULT false,
  backup_frequency TEXT DEFAULT 'auto',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prefs" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prefs" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- =========================
-- 8. Blogs Table & RLS
-- =========================
-- NOTE: If the blogs table was created without RLS policies,
-- run the following in Supabase SQL Editor to enable deletion.

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blogs" ON public.blogs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view published blogs" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Users can insert own blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blogs" ON public.blogs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own blogs" ON public.blogs FOR DELETE USING (auth.uid() = user_id);

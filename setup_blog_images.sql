-- 1. Create the user_images table if you haven't already
CREATE TABLE IF NOT EXISTS public.user_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    folder TEXT DEFAULT 'general',
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own image records
CREATE POLICY "Users can manage their own image records"
ON public.user_images
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Create the "user-images" storage bucket natively
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for "user-images" bucket
CREATE POLICY "Users can upload their own images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'user-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'user-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'user-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view user-images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'user-images');

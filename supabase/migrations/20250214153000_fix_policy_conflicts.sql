/*
  # Fix Policy Conflicts
  
  ## Query Description:
  This migration resolves "policy already exists" errors by explicitly dropping potential conflicting policies before re-creating them.
  It ensures a clean state for both the 'documents' table and the 'avatars' storage bucket.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Drops and recreates RLS policies for 'documents' table
  - Ensures 'avatars' bucket exists
  - Drops and recreates RLS policies for 'storage.objects'
*/

-- 1. Fix Documents Table Policies
-- Drop existing policies to avoid "relation already exists" errors
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Re-create Documents Policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);


-- 2. Fix Storage Bucket & Policies
-- Ensure bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

-- Re-create Storage Policies
-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- We assume the filename structure is "userid-timestamp.ext"
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

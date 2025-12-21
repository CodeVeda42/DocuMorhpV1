/*
  # Fix Schema (Idempotent)
  
  This migration is designed to run safely even if tables already exist.
  It checks for the existence of tables and policies before trying to create them.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Tables: documents, extracted_data
  - RLS: Enabled on all tables
  - Policies: CRUD policies for owners
*/

-- 1. Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  template_id TEXT
);

-- 2. Enable RLS on documents (safe to run multiple times)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Create extracted_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.extracted_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  json_payload JSONB NOT NULL,
  confidence_score DOUBLE PRECISION,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on extracted_data
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;

-- 5. Safely create policies (DO block checks existence first)
DO $$
BEGIN
  -- Policies for documents
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view their own documents') THEN
    CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert their own documents') THEN
    CREATE POLICY "Users can insert their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update their own documents') THEN
    CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete their own documents') THEN
    CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Policies for extracted_data
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extracted_data' AND policyname = 'Users can view their own extracted data') THEN
    CREATE POLICY "Users can view their own extracted data" ON public.extracted_data FOR SELECT USING (
      EXISTS ( SELECT 1 FROM public.documents WHERE id = extracted_data.document_id AND user_id = auth.uid() )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'extracted_data' AND policyname = 'Users can insert extracted data for their docs') THEN
    CREATE POLICY "Users can insert extracted data for their docs" ON public.extracted_data FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM public.documents WHERE id = extracted_data.document_id AND user_id = auth.uid() )
    );
  END IF;
END $$;

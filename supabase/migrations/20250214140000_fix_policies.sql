/*
  # Fix RLS Policies and Schema

  ## Query Description:
  This migration safely sets up the schema and policies, handling cases where they might already exist.
  It ensures the 'documents' and 'extracted_data' tables exist with the correct columns.
  It drops existing policies before recreating them to avoid "policy already exists" errors.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tables: documents, extracted_data
  - Policies: SELECT, INSERT, UPDATE, DELETE for documents; SELECT, INSERT for extracted_data
*/

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_filename TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'processing',
  size BIGINT,
  file_url TEXT,
  template_id TEXT,
  upload_date TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);


-- 2. Extracted Data Table
CREATE TABLE IF NOT EXISTS public.extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  json_payload JSONB,
  confidence_score NUMERIC,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for extracted_data
DROP POLICY IF EXISTS "Users can view extracted data for their documents" ON extracted_data;
CREATE POLICY "Users can view extracted data for their documents" ON extracted_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = extracted_data.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert extracted data for their documents" ON extracted_data;
CREATE POLICY "Users can insert extracted data for their documents" ON extracted_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE documents.id = extracted_data.document_id
      AND documents.user_id = auth.uid()
    )
  );

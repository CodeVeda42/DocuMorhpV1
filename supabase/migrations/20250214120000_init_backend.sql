/*
  # Init Backend Schema for DocuMorphAI

  ## Query Description: 
  This migration rebuilds the backend schema for the new Supabase account.
  It creates the necessary tables for document management and data extraction results.
  
  ## Structure Details:
  - Table: public.documents
    - Stores document metadata (title, type, status, etc.)
    - Linked to auth.users via user_id
  - Table: public.extracted_data
    - Stores the AI analysis results
    - Linked to public.documents via document_id
  
  ## Security Implications:
  - RLS Enabled on all tables
  - Policies ensure users can only CRUD their own documents
*/

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create documents table
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  type text not null,
  size bigint,
  status text not null default 'draft',
  file_url text,
  original_filename text,
  template_id text,
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on documents
alter table public.documents enable row level security;

-- Create policies for documents
create policy "Users can view their own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- Create extracted_data table
create table if not exists public.extracted_data (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references public.documents(id) on delete cascade not null,
  json_payload jsonb,
  confidence_score float,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on extracted_data
alter table public.extracted_data enable row level security;

-- Create policies for extracted_data
-- Users can access extracted data if they own the parent document
create policy "Users can view extracted data of their documents" on public.extracted_data
  for select using (
    exists (
      select 1 from public.documents
      where public.documents.id = public.extracted_data.document_id
      and public.documents.user_id = auth.uid()
    )
  );

create policy "Users can insert extracted data for their documents" on public.extracted_data
  for insert with check (
    exists (
      select 1 from public.documents
      where public.documents.id = public.extracted_data.document_id
      and public.documents.user_id = auth.uid()
    )
  );

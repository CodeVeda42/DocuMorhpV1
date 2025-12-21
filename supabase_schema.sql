-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create documents table
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  type text not null,
  size bigint not null,
  word_count bigint default 0,
  status text not null check (status in ('draft', 'processing', 'completed', 'failed')),
  file_url text,
  original_filename text,
  template_id text,
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create extracted_data table
create table if not exists public.extracted_data (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  json_payload jsonb not null,
  confidence_score double precision,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;
alter table public.extracted_data enable row level security;

-- Policies for documents
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Policies for extracted_data
create policy "Users can view data for their documents"
  on public.extracted_data for select
  using (
    exists (
      select 1 from public.documents
      where documents.id = extracted_data.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert data for their documents"
  on public.extracted_data for insert
  with check (
    exists (
      select 1 from public.documents
      where documents.id = extracted_data.document_id
      and documents.user_id = auth.uid()
    )
  );

-- Storage Bucket Setup
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' );

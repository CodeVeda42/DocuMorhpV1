-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. DOCUMENTS TABLE
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  type text not null,
  size bigint not null,
  status text not null default 'processing',
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  file_url text,
  original_filename text,
  template_id text
);

-- 2. EXTRACTED DATA TABLE
create table if not exists public.extracted_data (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  json_payload jsonb not null,
  confidence_score float,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table public.documents enable row level security;
alter table public.extracted_data enable row level security;

-- 4. POLICIES FOR DOCUMENTS
-- (Using DO blocks in migrations usually, but here is the definition)
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

-- 5. POLICIES FOR EXTRACTED DATA
create policy "Users can view their own extracted data"
  on public.extracted_data for select
  using (
    exists (
      select 1 from public.documents
      where public.documents.id = public.extracted_data.document_id
      and public.documents.user_id = auth.uid()
    )
  );

create policy "Users can insert extracted data for their documents"
  on public.extracted_data for insert
  with check (
    exists (
      select 1 from public.documents
      where public.documents.id = public.extracted_data.document_id
      and public.documents.user_id = auth.uid()
    )
  );

-- 6. STORAGE SETUP
-- Create avatars bucket
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

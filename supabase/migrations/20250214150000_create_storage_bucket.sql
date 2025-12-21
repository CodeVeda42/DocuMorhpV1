/*
  # Storage Bucket Setup
  
  1. Storage
    - Creates 'avatars' bucket if it doesn't exist
    - Sets it to public
  
  2. Security
    - Adds policies for public read access
    - Adds policies for authenticated upload/update/delete
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public View
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Avatar Public View'
    ) THEN
        CREATE POLICY "Avatar Public View"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'avatars' );
    END IF;
END
$$;

-- Policy: Authenticated Upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Avatar Upload'
    ) THEN
        CREATE POLICY "Avatar Upload"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;
END
$$;

-- Policy: Authenticated Update
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Avatar Update'
    ) THEN
        CREATE POLICY "Avatar Update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;
END
$$;

-- Policy: Authenticated Delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Avatar Delete'
    ) THEN
        CREATE POLICY "Avatar Delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;
END
$$;

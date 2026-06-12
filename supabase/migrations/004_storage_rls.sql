-- Migration 004: Storage RLS policies for avatars and covers buckets
-- Execute in Supabase SQL Editor
-- (Buckets already exist, this adds/enables security policies)
-- Note: PostgreSQL does not support IF NOT EXISTS for CREATE POLICY,
-- so we drop existing policies first to make this idempotent.

-- Avatars bucket: public read, authenticated upload/update for own files
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_own_upload" ON storage.objects;
CREATE POLICY "avatars_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_own_update" ON storage.objects;
CREATE POLICY "avatars_own_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Covers bucket: public read, authenticated upload/update for own files
DROP POLICY IF EXISTS "covers_public_read" ON storage.objects;
CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "covers_own_upload" ON storage.objects;
CREATE POLICY "covers_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "covers_own_update" ON storage.objects;
CREATE POLICY "covers_own_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

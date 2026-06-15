-- Migration 006: Built-in covers with real UUIDs + RLS on covers table
-- Execute in Supabase SQL Editor

-- Ensure is_builtin column exists
ALTER TABLE covers ADD COLUMN IF NOT EXISTS is_builtin BOOLEAN DEFAULT false;

-- Enable RLS on covers table (idempotent)
ALTER TABLE covers ENABLE ROW LEVEL SECURITY;

-- RLS policies for covers table
DROP POLICY IF EXISTS "covers_public_select" ON covers;
CREATE POLICY "covers_public_select" ON covers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "covers_own_insert" ON covers;
CREATE POLICY "covers_own_insert" ON covers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "covers_own_update" ON covers;
CREATE POLICY "covers_own_update" ON covers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "covers_own_delete" ON covers;
CREATE POLICY "covers_own_delete" ON covers
  FOR DELETE USING (auth.uid() = user_id);

-- Insert 6 built-in covers with fixed UUIDs (idempotent via ON CONFLICT)
INSERT INTO covers (id, url, is_premium, is_builtin, user_id)
VALUES
  ('c0a00001-0001-4000-8000-000000000001', '', false, true, null),
  ('c0a00002-0002-4000-8000-000000000002', '', false, true, null),
  ('c0a00003-0003-4000-8000-000000000003', '', false, true, null),
  ('c0a00004-0004-4000-8000-000000000004', '', true,  true, null),
  ('c0a00005-0005-4000-8000-000000000005', '', true,  true, null),
  ('c0a00006-0006-4000-8000-000000000006', '', true,  true, null)
ON CONFLICT (id) DO NOTHING;

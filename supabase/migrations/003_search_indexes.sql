-- Migration 003: Full-text search indexes for sermons
-- Execute this in Supabase SQL Editor before using the advanced search feature

-- Add tsvector column for full-text search on title + plain_text
-- Uses Portuguese text search configuration for proper stemming
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(plain_text, ''))
  ) STORED;

-- GIN index on the tsvector for fast full-text search queries
CREATE INDEX IF NOT EXISTS idx_sermons_search_vector
  ON sermons USING GIN (search_vector);

-- Composite index for preacher filtering (common filter criterion)
-- Partial index skips archived records, reducing index size
CREATE INDEX IF NOT EXISTS idx_sermons_user_preacher
  ON sermons (user_id, preacher)
  WHERE archived = false;

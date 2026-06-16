-- Migration 007: Add notifications_enabled column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

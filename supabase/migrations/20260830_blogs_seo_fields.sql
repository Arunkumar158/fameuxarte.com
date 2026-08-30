-- ============================================================
-- FAMEUXARTE: Blogs Table SEO Fields
-- Adds minimal SEO fields to the legacy blogs table.
-- SAFE: Additive only — preserves all existing rows and columns.
-- The capital-S "Slug" column is intentionally preserved.
-- ============================================================

ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Art Intelligence',
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Index for category filtering
CREATE INDEX IF NOT EXISTS blogs_category_idx ON blogs (category);

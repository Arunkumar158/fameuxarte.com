-- ============================================================
-- FAMEUXARTE: Blogs Editorial Fields (Fallback support)
-- Adds editorial content blocks to the legacy blogs table.
-- SAFE: Additive only — no destructive changes.
-- ============================================================

-- Key Takeaways: array of short bullet points
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS key_takeaways text[] DEFAULT '{}'::text[];

-- FAQ: structured array of {question, answer} objects
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;

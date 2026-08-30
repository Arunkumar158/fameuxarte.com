-- ============================================================
-- FAMEUXARTE: Insights Editorial Fields
-- Adds editorial content blocks and SEO quality fields.
-- SAFE: Additive only — no destructive changes.
-- ============================================================

-- Key Takeaways: array of short bullet points (3–7 recommended)
ALTER TABLE insights
  ADD COLUMN IF NOT EXISTS key_takeaways text[] DEFAULT '{}'::text[];

-- FAQ: structured array of {question, answer} objects
ALTER TABLE insights
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;

-- CTA Block: editable commerce call-to-action per article
ALTER TABLE insights
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS cta_description text;

-- Computed read time (in minutes) — optionally stored to avoid re-computation
ALTER TABLE insights
  ADD COLUMN IF NOT EXISTS read_time integer;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insights_updated_at ON insights;
CREATE TRIGGER insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insights_updated_at();

-- Index for category filtering on the blog listing
CREATE INDEX IF NOT EXISTS insights_category_idx ON insights (category);
CREATE INDEX IF NOT EXISTS insights_status_published_at_idx ON insights (status, published_at DESC);

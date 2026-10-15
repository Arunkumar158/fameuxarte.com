-- ============================================================
-- FAMEUXARTE: Blog & Insights Full Schema Synchronization
-- Creates public.insights with all columns, indexes, and RLS.
-- Upgrades public.blogs with full SEO & editorial column support.
-- SAFE & IDEMPOTENT: Uses IF NOT EXISTS throughout.
-- ============================================================

-- ── 1. Create insights table ──
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image text,
  featured_image_alt text,
  featured_image_caption text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text DEFAULT 'Art Intelligence',
  tags text[] DEFAULT '{}'::text[],
  status text DEFAULT 'draft',
  meta_title text,
  meta_description text,
  canonical_url text,
  keywords text[] DEFAULT '{}'::text[],
  og_image text,
  schema_type text DEFAULT 'BlogPosting',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Editorial blocks
  key_takeaways text[] DEFAULT '{}'::text[],
  faq jsonb DEFAULT '[]'::jsonb,
  cta_label text,
  cta_url text,
  cta_description text,
  read_time integer DEFAULT 4
);

-- Ensure all columns exist on insights (if table already existed with fewer columns)
ALTER TABLE public.insights
  ADD COLUMN IF NOT EXISTS featured_image_alt text,
  ADD COLUMN IF NOT EXISTS featured_image_caption text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Art Intelligence',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'BlogPosting',
  ADD COLUMN IF NOT EXISTS key_takeaways text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS cta_description text,
  ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 4,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ── 2. Add RLS Policies for insights ──
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insights' AND policyname = 'Insights are viewable by everyone') THEN
    CREATE POLICY "Insights are viewable by everyone" ON public.insights
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insights' AND policyname = 'Admins can insert insights') THEN
    CREATE POLICY "Admins can insert insights" ON public.insights
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'founder')
        ) OR auth.jwt() ->> 'role' = 'service_role'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insights' AND policyname = 'Admins can update insights') THEN
    CREATE POLICY "Admins can update insights" ON public.insights
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'founder')
        ) OR auth.jwt() ->> 'role' = 'service_role'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insights' AND policyname = 'Admins can delete insights') THEN
    CREATE POLICY "Admins can delete insights" ON public.insights
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'founder')
        ) OR auth.jwt() ->> 'role' = 'service_role'
      );
  END IF;
END $$;

-- ── 3. Upgrade blogs table with full column support ──
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Art Intelligence',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'BlogPosting',
  ADD COLUMN IF NOT EXISTS key_takeaways text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS cta_description text,
  ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 4,
  ADD COLUMN IF NOT EXISTS featured_image_alt text,
  ADD COLUMN IF NOT EXISTS featured_image_caption text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure RLS on blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Blogs are viewable by everyone') THEN
    CREATE POLICY "Blogs are viewable by everyone" ON public.blogs
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Admins can manage blogs') THEN
    CREATE POLICY "Admins can manage blogs" ON public.blogs
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'founder')
        ) OR auth.jwt() ->> 'role' = 'service_role'
      );
  END IF;
END $$;

-- ── 4. Indexes ──
CREATE INDEX IF NOT EXISTS insights_category_idx ON public.insights (category);
CREATE INDEX IF NOT EXISTS insights_status_published_at_idx ON public.insights (status, published_at DESC);
CREATE INDEX IF NOT EXISTS insights_slug_idx ON public.insights (slug);

CREATE INDEX IF NOT EXISTS blogs_category_idx ON public.blogs (category);
CREATE INDEX IF NOT EXISTS blogs_status_idx ON public.blogs (status);

-- ── 5. Auto-sync existing blogs into insights ──
INSERT INTO public.insights (
  id,
  title,
  slug,
  content,
  featured_image,
  author_id,
  published_at,
  created_at,
  updated_at,
  key_takeaways,
  faq,
  status,
  category
)
SELECT
  b.id,
  COALESCE(b.title, 'Untitled Article'),
  COALESCE(NULLIF(TRIM(b."Slug"), ''), b.id::text),
  b.content,
  b.image_url,
  b.author_id,
  COALESCE(b.published_at, b.created_at, now()),
  COALESCE(b.created_at, now()),
  COALESCE(b.updated_at, now()),
  COALESCE(b.key_takeaways, '{}'::text[]),
  COALESCE(b.faq, '[]'::jsonb),
  'published',
  'Art Intelligence'
FROM public.blogs b
WHERE NOT EXISTS (
  SELECT 1 FROM public.insights i WHERE i.id = b.id OR i.slug = COALESCE(NULLIF(TRIM(b."Slug"), ''), b.id::text)
);

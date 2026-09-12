-- Migration: Create digital_products table

CREATE TABLE IF NOT EXISTS digital_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    category TEXT NOT NULL,
    cover_image_url TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'INR',
    gumroad_url TEXT,
    gumroad_product_id TEXT,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_digital_products_slug ON digital_products(slug);
CREATE INDEX IF NOT EXISTS idx_digital_products_status ON digital_products(status);
CREATE INDEX IF NOT EXISTS idx_digital_products_category ON digital_products(category);
CREATE INDEX IF NOT EXISTS idx_digital_products_is_featured ON digital_products(is_featured);

-- Enable RLS
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Public can view published products
CREATE POLICY "Digital products are viewable by everyone if published" ON digital_products
  FOR SELECT USING (status = 'published');

-- 2. Admins can view all products (including drafts and archived)
CREATE POLICY "All digital products viewable by admins" ON digital_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Admins can insert products
CREATE POLICY "Digital products are insertable by admins" ON digital_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Admins can update products
CREATE POLICY "Digital products are updatable by admins" ON digital_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Admins can delete products
CREATE POLICY "Digital products are deletable by admins" ON digital_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed Data from static resources.ts
INSERT INTO digital_products (
  id, title, slug, short_description, price, currency, category, is_featured, gumroad_url, status
) VALUES 
(
  gen_random_uuid(),
  'Art Pricing Calculator',
  'art-pricing-calculator',
  'Estimate artwork prices with a practical pricing framework.',
  499,
  'INR',
  'Calculator',
  true,
  NULL,
  'published'
),
(
  gen_random_uuid(),
  'Artist Notion OS',
  'artist-notion-os',
  'Organize your artwork, ideas, content, clients, and creative workflow.',
  999,
  'INR',
  'Template',
  false,
  NULL,
  'published'
),
(
  gen_random_uuid(),
  'Artist Business Guide',
  'artist-ebook',
  'A practical guide to building a stronger professional art practice.',
  499,
  'INR',
  'Ebook',
  false,
  NULL,
  'published'
),
(
  gen_random_uuid(),
  'Artist Copy Swipe File',
  'copy-swipe-file',
  'Ready-to-adapt copy ideas for artwork listings, social posts, emails, and promotions.',
  299,
  'INR',
  'Swipe File',
  false,
  NULL,
  'published'
) ON CONFLICT (slug) DO NOTHING;

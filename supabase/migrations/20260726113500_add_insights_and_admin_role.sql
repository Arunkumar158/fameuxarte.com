-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  slug text UNIQUE,
  excerpt text,
  content text,
  featured_image text,
  author_id uuid REFERENCES profiles(id),
  category text,
  tags text[],
  status text,
  meta_title text,
  meta_description text,
  canonical_url text,
  keywords text[],
  og_image text,
  schema_type text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for insights (adjust as needed for public read access)
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insights are viewable by everyone" ON insights
  FOR SELECT USING (true);

CREATE POLICY "Insights are insertable by admins" ON insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Insights are updatable by admins" ON insights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Insights are deletable by admins" ON insights
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

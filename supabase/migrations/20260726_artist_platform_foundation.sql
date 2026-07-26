/* Migration to support Artist Platform Foundation */

/* 1. Profiles Table Enhancements */
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'artist', 'admin')),
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS artist_statement text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS art_styles text[],
ADD COLUMN IF NOT EXISTS mediums text[],
ADD COLUMN IF NOT EXISTS years_of_experience integer;

/* 2. Artist Collections Table */
CREATE TABLE IF NOT EXISTS artist_collections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    cover_image text,
    slug text NOT NULL,
    seo_description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (artist_id, slug)
);

/* RLS for artist_collections */
ALTER TABLE artist_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections are viewable by everyone" 
ON artist_collections FOR SELECT USING (true);

CREATE POLICY "Artists can insert their own collections" 
ON artist_collections FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own collections" 
ON artist_collections FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own collections" 
ON artist_collections FOR DELETE USING (auth.uid() = artist_id);


/* 3. Artworks Table Enhancements */
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS dimensions jsonb, /* e.g. {"width": 24, "height": 36, "depth": 2, "unit": "in"} */
ADD COLUMN IF NOT EXISTS medium text,
ADD COLUMN IF NOT EXISTS orientation text CHECK (orientation IN ('portrait', 'landscape', 'square', 'other')),
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES artist_collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS story text,
ADD COLUMN IF NOT EXISTS creation_year integer,
ADD COLUMN IF NOT EXISTS style text,
ADD COLUMN IF NOT EXISTS certificate_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS frame_included boolean DEFAULT false;

/* 4. Update Status Constraint */
/* We need to drop the old check constraint for status and create a new one. */
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'artworks'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%';
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE artworks DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE artworks
ADD CONSTRAINT artworks_status_check 
CHECK (status IN ('available', 'sold', 'reserved', 'draft', 'hidden'));

/* Migration for Sprint 2: Artist Trust & Real-Time Metrics */

/* 1. Add view count tracking to artworks */
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0 NOT NULL;

/* 2. Add view count tracking to profiles */
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_views_count integer DEFAULT 0 NOT NULL;

/* 3. Add robust error tracking to certificates */
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS error_message text;

/* Make pdf_url nullable so we can create 'pending' or 'failed' records without a PDF */
ALTER TABLE certificates
ALTER COLUMN pdf_url DROP NOT NULL;

/* 4. Atomic Increment RPCs */
-- Function to safely increment artwork views
CREATE OR REPLACE FUNCTION increment_artwork_view(p_artwork_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run as definer lets anyone increment without being the owner.
AS $$
BEGIN
  UPDATE artworks
  SET views_count = views_count + 1
  WHERE id = p_artwork_id;
END;
$$;

-- Function to safely increment profile views
CREATE OR REPLACE FUNCTION increment_profile_view(p_artist_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET profile_views_count = profile_views_count + 1
  WHERE id = p_artist_id;
END;
$$;

/* Note on RLS for these columns:
   Both artworks.views_count and profiles.profile_views_count 
   are automatically covered by existing SELECT policies allowing public access. 
   The RPCs are SECURITY DEFINER so anonymous/authenticated users can increment 
   the counter without needing UPDATE privileges on the underlying tables.
*/

-- =============================================================
-- FIX: Allow public read access to profiles of artists/founders
-- who have publicly visible artworks (available or sold).
--
-- Previously, only profiles with role = 'artist' were publicly
-- selectable, which blocked non-admin visitors from seeing the
-- founder/admin artist's full_name on artwork & share cards.
-- =============================================================

DROP POLICY IF EXISTS "Public artwork artist profiles are viewable" ON public.profiles;

CREATE POLICY "Public artwork artist profiles are viewable"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.artworks a
    WHERE a.artist_id = profiles.id
      AND a.status IN ('available', 'sold')
  )
);

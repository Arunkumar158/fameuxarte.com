-- =============================================================
-- Migration: Secure Artist Lifecycle
-- =============================================================

-- 1. Update verification_status constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find existing verification_status check constraint
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%verification_status%';
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE profiles
ADD CONSTRAINT profiles_verification_status_check 
CHECK (verification_status IN ('pending', 'identity_submitted', 'under_review', 'verified', 'rejected', 'suspended', 'premium', 'featured'));


-- 2. Update the profile security trigger
CREATE OR REPLACE FUNCTION protect_profile_restricted_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service role (backend operations where auth.uid() is null)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Allow admins to modify anything
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Prevent non-admins from modifying verification_status
  -- EXCEPTION: allow user to submit their own documents (pending/rejected -> identity_submitted)
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF OLD.verification_status IN ('pending', 'rejected') 
       AND NEW.verification_status = 'identity_submitted' 
       AND auth.uid() = NEW.id THEN
      NULL; -- Allow this specific transition
    ELSE
      RAISE EXCEPTION 'Not authorized to modify verification_status';
    END IF;
  END IF;

  -- Block other restricted fields for non-admins
  IF NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
    RAISE EXCEPTION 'Not authorized to modify verified_at';
  END IF;

  IF NEW.trust_score IS DISTINCT FROM OLD.trust_score THEN
    RAISE EXCEPTION 'Not authorized to modify trust_score';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Not authorized to modify role';
  END IF;

  IF NEW.verification_notes IS DISTINCT FROM OLD.verification_notes THEN
    RAISE EXCEPTION 'Not authorized to modify verification_notes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Enforce Artworks RLS
-- We must ensure that only Verified Artists can insert/update artworks with a public status.
-- For drafts, we could allow them, but the prompt says: 
-- "For V1: DO NOT allow unverified applicants to publish. Prefer hiding/disabling artwork creation entirely until verified."
-- Let's secure the table fully.

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Safely drop existing artist policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "Artists can insert own artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can update own artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can delete own artworks" ON artworks;
DROP POLICY IF EXISTS "Verified artists can insert own artworks" ON artworks;
DROP POLICY IF EXISTS "Verified artists can update own artworks" ON artworks;
DROP POLICY IF EXISTS "Verified artists can delete own artworks" ON artworks;

-- Helper function to check if user is a verified artist
CREATE OR REPLACE FUNCTION public.is_verified_artist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'artist' 
      AND verification_status = 'verified'
  );
$$;

-- Policy: Only verified artists can insert artworks
CREATE POLICY "Verified artists can insert own artworks"
ON artworks FOR INSERT
WITH CHECK (
  auth.uid() = artist_id 
  AND public.is_verified_artist()
);

-- Policy: Only verified artists can update their own artworks
CREATE POLICY "Verified artists can update own artworks"
ON artworks FOR UPDATE
USING (
  auth.uid() = artist_id 
  AND public.is_verified_artist()
)
WITH CHECK (
  auth.uid() = artist_id 
  AND public.is_verified_artist()
);

-- Policy: Only verified artists can delete their own artworks
CREATE POLICY "Verified artists can delete own artworks"
ON artworks FOR DELETE
USING (
  auth.uid() = artist_id 
  AND public.is_verified_artist()
);

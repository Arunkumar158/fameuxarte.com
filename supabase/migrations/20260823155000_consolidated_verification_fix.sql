-- =============================================================
-- ALL-IN-ONE VERIFICATION SYSTEM FIX
-- Run this entire script in Supabase SQL Editor → Run button
-- =============================================================


-- ---------------------------------------------------------------
-- PART 1: FIX RLS ON PROFILES TABLE (with SECURITY DEFINER 
--         to prevent infinite recursion)
-- ---------------------------------------------------------------

-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Artist profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a SECURITY DEFINER function to check admin status
-- This runs as the DB owner (postgres), bypassing RLS — no infinite loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Enable RLS (safe to re-run)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Each user can read their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Admins can read ALL profiles (uses SECURITY DEFINER — no recursion)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Policy 3: Artist profiles are publicly readable (for /artists page)
CREATE POLICY "Artist profiles are publicly viewable"
ON public.profiles FOR SELECT
USING (role = 'artist');

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 5: Admins can update any profile (for verification approve/reject)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------
-- PART 2: FIX TRIGGER — allow artists to set identity_submitted
-- The original trigger blocked ALL verification_status changes
-- for non-admins. We update it to allow the one safe transition.
-- ---------------------------------------------------------------

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
  -- EXCEPTION: allow an artist to submit their own documents (pending → identity_submitted)
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF OLD.verification_status = 'pending' 
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

-- Reattach trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS enforce_profile_security ON profiles;
CREATE TRIGGER enforce_profile_security
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_restricted_fields();


-- ---------------------------------------------------------------
-- PART 3: FIX STORAGE RLS — allow admins to view identity docs
-- ---------------------------------------------------------------

DROP POLICY IF EXISTS "Allow admins to view all identity documents" ON storage.objects;

CREATE POLICY "Allow admins to view all identity documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'identity_documents' 
  AND public.is_admin()
);

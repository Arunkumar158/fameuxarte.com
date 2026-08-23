-- =============================================================
-- FIX: Missing RLS policies on the profiles table.
-- 
-- ROOT CAUSE: The `profiles` table has RLS enabled (Supabase default)
-- but NO SELECT policy was ever defined for admins to read all profiles.
-- This caused ALL admin dashboard queries to silently return 0 results:
--   - Verification queue shows "No artists found"
--   - Artist count metrics show 0
--   - All dashboard stats read 0
-- =============================================================

-- 1. Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to read their OWN profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Allow ADMINS to read ALL profiles (critical for Verification & Artists pages)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 4. Allow all users to view artist profiles publicly (for the /artists page)
DROP POLICY IF EXISTS "Artist profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Artist profiles are publicly viewable"
ON public.profiles FOR SELECT
USING (role = 'artist');

-- 5. Allow users to UPDATE their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 6. Allow admins to UPDATE any profile (for verification status changes)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

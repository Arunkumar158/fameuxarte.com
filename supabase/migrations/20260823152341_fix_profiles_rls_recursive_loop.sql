-- =============================================================
-- FIX: RLS Infinite Recursion on profiles table
--
-- PROBLEM: The previous migration created a policy like:
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- This subquery hits `profiles` itself, which triggers RLS again,
-- causing infinite recursion → Supabase blocks all access → "Access Denied"
--
-- SOLUTION:
-- 1. Drop ALL the broken policies from the previous migration
-- 2. Create a SECURITY DEFINER function `is_admin()` that bypasses RLS
--    when checking admin status — this breaks the recursive loop
-- 3. Recreate clean policies using this function
-- =============================================================

-- Step 1: Drop all policies we created in the previous (broken) migration
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Artist profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Step 2: Create a SECURITY DEFINER helper function.
-- SECURITY DEFINER means this function runs as the function OWNER (postgres),
-- bypassing RLS entirely. This breaks the infinite recursion.
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

-- Step 3: Recreate all policies using is_admin() — no recursion possible

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow admins to read ALL profiles (uses SECURITY DEFINER — no recursion)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Allow anyone to view artist profiles (needed for public /artists page)
CREATE POLICY "Artist profiles are publicly viewable"
ON public.profiles FOR SELECT
USING (role = 'artist');

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile (for verification approve/reject)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

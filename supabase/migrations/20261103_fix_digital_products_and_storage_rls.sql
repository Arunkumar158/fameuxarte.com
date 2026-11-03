-- Migration: Fix digital_products and storage RLS policies for admins and founders
-- Date: 2026-11-03

-- 1. Ensure public.is_admin() recognizes both 'admin' and 'founder' roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'founder')
  ) OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'founder');
$$;

-- 2. Drop existing digital_products policies to refresh with full admin/founder coverage
DROP POLICY IF EXISTS "Digital products are viewable by everyone if published" ON digital_products;
DROP POLICY IF EXISTS "All digital products viewable by admins" ON digital_products;
DROP POLICY IF EXISTS "Digital products are insertable by admins" ON digital_products;
DROP POLICY IF EXISTS "Digital products are updatable by admins" ON digital_products;
DROP POLICY IF EXISTS "Digital products are deletable by admins" ON digital_products;

-- Allow public to view published products
CREATE POLICY "Digital products are viewable by everyone if published" ON digital_products
  FOR SELECT USING (status = 'published');

-- Allow admins/founders to view all products (including drafts and archived)
CREATE POLICY "All digital products viewable by admins" ON digital_products
  FOR SELECT USING (public.is_admin());

-- Allow admins/founders to insert products
CREATE POLICY "Digital products are insertable by admins" ON digital_products
  FOR INSERT WITH CHECK (public.is_admin());

-- Allow admins/founders to update products
CREATE POLICY "Digital products are updatable by admins" ON digital_products
  FOR UPDATE USING (public.is_admin());

-- Allow admins/founders to delete products
CREATE POLICY "Digital products are deletable by admins" ON digital_products
  FOR DELETE USING (public.is_admin());

-- 3. Storage policies for admins/founders on 'artworks' and 'blog-images'
DROP POLICY IF EXISTS "Allow admins to manage artworks storage" ON storage.objects;
CREATE POLICY "Allow admins to manage artworks storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id IN ('artworks', 'blog-images') 
  AND public.is_admin()
)
WITH CHECK (
  bucket_id IN ('artworks', 'blog-images') 
  AND public.is_admin()
);


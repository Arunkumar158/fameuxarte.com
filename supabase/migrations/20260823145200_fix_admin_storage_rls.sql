-- Fix Admin Storage RLS to reliably allow admins to read identity documents

-- Drop existing policy
DROP POLICY IF EXISTS "Allow admins to view all identity documents" ON storage.objects;

-- Create more robust policy checking both profiles table and JWT metadata
CREATE POLICY "Allow admins to view all identity documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'identity_documents' 
  AND (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

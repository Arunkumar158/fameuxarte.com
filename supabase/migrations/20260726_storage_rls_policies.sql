/* Migration to fix storage RLS policies for the artworks bucket */

/* Ensure authenticated users can upload to their own folder inside the 'artworks' bucket */
CREATE POLICY "Allow authenticated uploads to user folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artworks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

/* Ensure authenticated users can update files in their own folder */
CREATE POLICY "Allow authenticated updates to user folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'artworks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

/* Ensure authenticated users can delete files from their own folder */
CREATE POLICY "Allow authenticated deletes from user folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'artworks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

/* Ensure everyone (public) can read files from the artworks bucket */
CREATE POLICY "Allow public read access to artworks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artworks');

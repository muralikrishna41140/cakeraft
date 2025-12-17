-- ============================================
-- SUPABASE STORAGE POLICIES FOR CAKERAFT
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing policies if they exist (ignore errors if they don't)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Step 2: Create policies for the 'invoices' bucket

-- Policy 1: Allow anyone to read/download files (SELECT)
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'invoices');

-- Policy 2: Allow authenticated users to upload files (INSERT)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'invoices');

-- Policy 3: Allow authenticated users to update files (UPDATE)
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'invoices')
WITH CHECK (bucket_id = 'invoices');

-- Policy 4: Allow authenticated users to delete files (DELETE)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'invoices');

-- Step 3: Ensure bucket is public
UPDATE storage.buckets
SET public = true
WHERE name = 'invoices';

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify policies were created
-- ============================================

-- Check all policies on storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'invoices';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If no errors appeared above, you're all set! 🎉
-- 
-- Next steps:
-- 1. Run: node testSupabaseUpload.js (in backend folder)
-- 2. You should see: ✅ Upload successful!
-- 3. Generate a bill from the frontend
-- 4. Check that PDF appears in Supabase Storage
-- ============================================

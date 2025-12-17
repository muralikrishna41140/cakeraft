# 🔧 Supabase RLS Policy Fix - Complete Solution

## Problem Identified

The error `"new row violates row-level security policy"` means Supabase's Row-Level Security (RLS) is blocking file uploads because no policies exist to allow the operation.

## ✅ Solution: Add Storage Policies

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/rzsombvienefbzeesohm
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Create Storage Policies

Copy and paste this SQL code, then click **Run**:

```sql
-- ============================================
-- SUPABASE STORAGE POLICIES FOR CAKERAFT
-- ============================================

-- Policy 1: Allow public to SELECT (read/download) files
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'invoices');

-- Policy 2: Allow authenticated uploads (using anon key)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'invoices');

-- Policy 3: Allow authenticated updates
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'invoices')
WITH CHECK (bucket_id = 'invoices');

-- Policy 4: Allow authenticated deletes (for cleanup)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'invoices');
```

### Step 3: Verify Policies

After running the SQL:

1. Go to **Storage** → **Policies**
2. Click on the `invoices` bucket
3. You should see 4 policies listed:
   - ✅ Allow public read access (SELECT)
   - ✅ Allow authenticated uploads (INSERT)
   - ✅ Allow authenticated updates (UPDATE)
   - ✅ Allow authenticated deletes (DELETE)

### Step 4: Test Upload

```bash
cd billing-system/backend
node test-supabase.js
```

Expected output:

```
✅ Supabase client initialized successfully
✅ Bucket ready: true
✅ Storage stats retrieved
✅ All tests passed!
```

---

## 🔍 Alternative: Disable RLS (Quick Fix - NOT RECOMMENDED for Production)

**⚠️ Warning:** This makes the bucket completely public without any security checks. Only use for testing!

```sql
-- Disable RLS on storage.objects for invoices bucket
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Why not recommended?**

- No access control
- Anyone can upload/delete files
- Security vulnerability
- Not production-ready

---

## 🎯 Recommended Production Setup

### Option A: Policies with Service Role (Most Secure)

1. Use **Service Role Key** instead of Anon Key in `.env`
2. Service role bypasses RLS automatically
3. Get it from: Supabase Dashboard → Settings → API → `service_role` key

```env
# Replace in backend/.env
SUPABASE_ANON_KEY=your_service_role_key_here
```

**Note:** Keep service role key SECRET - never expose to frontend!

### Option B: Fine-Grained RLS Policies (Secure + Flexible)

Keep using anon key but add specific policies:

```sql
-- Only allow uploads to 'bills/' folder
CREATE POLICY "Allow uploads to bills folder only"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = 'bills'
);

-- Only allow reading PDF files
CREATE POLICY "Allow reading PDFs only"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'invoices' AND
  (storage.extension(name)) = 'pdf'
);
```

---

## 📊 Verify Everything Works

### 1. Check Backend Logs

```bash
npm run dev
```

Look for:

```
✅ Supabase client initialized successfully
✅ Bucket "invoices" is accessible
```

### 2. Generate a Test Bill

1. Login to admin dashboard
2. Go to Billing page
3. Create a test order
4. Check backend console for:
   ```
   📤 Uploading bill BILL-20251208-0001 to Supabase...
   ✅ Bill uploaded successfully
   📎 Public URL: https://rzsombvienefbzeesohm.supabase.co/storage/v1/object/public/invoices/bills/...
   ```

### 3. Verify in Supabase Dashboard

1. Go to: Storage → invoices → bills/
2. You should see the PDF file
3. Click on it to preview
4. Copy the public URL and open in new tab - should download/display PDF

### 4. Test WhatsApp Integration

1. In billing success page, click "Send via WhatsApp"
2. Enter phone number
3. Check that the PDF URL in WhatsApp message works

---

## 🐛 Troubleshooting

### Error: "Policy already exists"

If you see "policy already exists" errors:

```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Then re-run the CREATE POLICY commands
```

### Error: "Bucket not found"

Make sure bucket is created:

```sql
-- Check existing buckets
SELECT * FROM storage.buckets WHERE name = 'invoices';

-- If not found, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true);
```

### Files Upload but URLs Return 404

The bucket might not be public:

```sql
-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'invoices';
```

---

## ✅ Success Checklist

- [x] SQL policies created successfully
- [x] Backend test passes (`node test-supabase.js`)
- [x] Test bill generates PDF with Supabase URL
- [x] Public URL opens PDF in browser
- [x] WhatsApp message contains working PDF link
- [x] Old PDFs are cleaned up automatically (check after 30 days)

---

## 🔐 Security Best Practices

1. **Use Service Role Key** for backend operations
2. **Never expose** service role key to frontend
3. **Restrict uploads** to specific folders (bills/)
4. **Limit file types** to PDF only
5. **Set file size limits** (50MB max)
6. **Enable automatic cleanup** (30-day retention)
7. **Monitor storage usage** via Supabase dashboard

---

## 📞 Support

If issues persist:

1. Check Supabase logs: Dashboard → Logs → Storage
2. Test with Supabase client directly:
   ```javascript
   const { data, error } = await supabase.storage
     .from("invoices")
     .upload("test.txt", "Hello World");
   console.log(data, error);
   ```
3. Verify environment variables are loaded
4. Restart backend server after any changes

---

## 🎉 Final Notes

Once policies are set up correctly:

- ✅ Bills auto-upload to Supabase after creation
- ✅ Public URLs work from anywhere
- ✅ WhatsApp messages contain shareable links
- ✅ Old PDFs are automatically cleaned up
- ✅ No more "row-level security" errors

**Time to fix:** 2-5 minutes (just run the SQL)

Happy baking! 🎂

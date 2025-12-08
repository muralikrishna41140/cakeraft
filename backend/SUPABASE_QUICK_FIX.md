`# 🚀 Quick Fix: Supabase Upload Errors

## The Problem

When generating bills, you see this error:

```
❌ new row violates row-level security policy
```

This happens because Supabase's Row-Level Security (RLS) is blocking file uploads.

## ✅ Solution (5 minutes)

### Option 1: Run SQL Policies (Recommended)

1. **Open Supabase SQL Editor**

   - Go to: https://app.supabase.com/project/rzsombvienefbzeesohm
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Copy the SQL file**

   - Open `supabase-setup.sql` in this folder
   - Copy ALL the content
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Success**

   - You should see "Success. No rows returned"
   - Check the verification queries at the bottom show 4 policies

4. **Test Upload**

   ```bash
   node testSupabaseUpload.js
   ```

   Expected output:

   ```
   ✅ Upload successful!
   📎 Public URL: https://...
   ✅ Public URL is accessible!
   ```

### Option 2: Use Service Role Key (Advanced)

1. **Get Service Role Key**

   - Go to: https://app.supabase.com/project/rzsombvienefbzeesohm/settings/api
   - Copy the `service_role` key (⚠️ Keep this SECRET!)

2. **Update .env file**

   ```env
   # Comment out or remove:
   # SUPABASE_ANON_KEY=...

   # Add instead:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart backend**

   ```bash
   npm run dev
   ```

4. **Test**
   ```bash
   node testSupabaseUpload.js
   ```

**Note:** Service role bypasses ALL security policies. Only use in backend (never expose to frontend).

## 🧪 How to Test

### Test 1: Basic Upload

```bash
node testSupabaseUpload.js
```

Should show:

- ✅ Configuration OK
- ✅ Bucket ready
- ✅ Upload successful
- ✅ Public URL accessible

### Test 2: Generate Real Bill

1. Start backend: `npm run dev`
2. Login to admin dashboard (http://localhost:3000)
3. Go to Billing page
4. Add products and create a bill
5. Check backend console for:
   ```
   📤 Uploading bill BILL-20251208-0001 to Supabase...
   ✅ Bill uploaded successfully
   📎 Public URL: https://...
   ```

### Test 3: WhatsApp Link

1. After creating a bill, click "Send via WhatsApp"
2. Enter phone number
3. Click Send
4. Open the WhatsApp message
5. Click the PDF link - it should open/download

## ✅ Success Checklist

- [ ] SQL policies created (no errors in SQL Editor)
- [ ] `testSupabaseUpload.js` passes all tests
- [ ] Bill generation shows Supabase upload confirmation
- [ ] Public URL opens PDF in browser
- [ ] WhatsApp PDF link works

## 🐛 Troubleshooting

### Error: "Policy already exists"

The SQL tries to drop existing policies first. If you still get this error:

```sql
-- Run this first:
DROP POLICY "Allow public read access" ON storage.objects;
DROP POLICY "Allow authenticated uploads" ON storage.objects;
DROP POLICY "Allow authenticated updates" ON storage.objects;
DROP POLICY "Allow authenticated deletes" ON storage.objects;

-- Then re-run the CREATE POLICY commands
```

### Error: "Bucket not found"

Create the bucket manually:

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `invoices`
4. Public: ✓ (checked)
5. Click "Create bucket"

Then re-run the SQL policies.

### Test passes but bills don't upload

Check backend logs when creating a bill. You should see:

```
📤 Uploading bill ... to Supabase...
```

If you don't see this:

1. Restart backend server
2. Check `.env` has `SUPABASE_URL` and key
3. Verify `supabaseService.isConfigured()` returns true

### Public URL returns 404

The bucket might not be public:

```sql
UPDATE storage.buckets
SET public = true
WHERE name = 'invoices';
```

## 📚 Documentation

- Full guide: `../SUPABASE_RLS_FIX.md`
- Setup guide: `../SUPABASE_SETUP_GUIDE.md`
- Integration notes: `../SUPABASE_INTEGRATION_COMPLETE.md`

## 🆘 Still Having Issues?

1. Check Supabase logs: Dashboard → Logs → Storage
2. Verify environment variables are loaded
3. Test with `node test-supabase.js` for basic connection
4. Check bucket permissions in Dashboard → Storage → invoices
5. Ensure you're using the correct project (rzsombvienefbzeesohm)

---

**Time to fix:** 5 minutes  
**Difficulty:** Easy (just copy-paste SQL)  
**Required:** SQL policies OR service role key

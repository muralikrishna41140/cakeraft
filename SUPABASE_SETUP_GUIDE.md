# 📦 Supabase Storage Setup Guide for CakeRaft

## Overview

This guide will help you set up Supabase Storage for hosting PDF bills with automatic cleanup and WhatsApp integration.

## Prerequisites

✅ Supabase account created  
✅ Backend `.env` configured with credentials  
✅ @supabase/supabase-js package installed

## Step 1: Create Storage Bucket in Supabase Dashboard

1. **Go to Supabase Dashboard**

   - Visit: https://app.supabase.com
   - Select your project: `rzsombvienefbzeesohm`

2. **Navigate to Storage**

   - Click **Storage** in the left sidebar
   - Click **Create a new bucket**

3. **Configure Bucket Settings**

   ```
   Bucket Name: invoices
   Public bucket: ✓ (IMPORTANT: Must be checked)
   File size limit: 50MB
   Allowed MIME types: application/pdf
   ```

4. **Create the Bucket**
   - Click **Create bucket**
   - You should see the `invoices` bucket in the list

## Step 2: Verify Environment Variables

Ensure your `backend/.env` has these variables:

```env
# Supabase Configuration
SUPABASE_URL=https://rzsombvienefbzeesohm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6c29tYnZpZW5lZmJ6ZWVzb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQ5MjksImV4cCI6MjA4MDc2MDkyOX0._iIB6GSN9oKbtEqDc97c1xUmM5t95k_53smABsQbxvs
SUPABASE_BUCKET_NAME=invoices
PDF_RETENTION_DAYS=30
```

## Step 3: Test Supabase Connection

### Option A: Via API Endpoint (Recommended)

1. **Start the backend server:**

   ```bash
   cd billing-system/backend
   npm run dev
   ```

2. **Test the connection:**

   - Login to your admin dashboard
   - Open browser console and run:

   ```javascript
   fetch("http://localhost:5001/api/revenue/supabase/test", {
     headers: {
       Authorization: "Bearer YOUR_JWT_TOKEN",
     },
   })
     .then((r) => r.json())
     .then(console.log);
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Supabase connection successful",
     "bucketName": "invoices",
     "retentionDays": 30,
     "bucketReady": true,
     "stats": {
       "totalFiles": 0,
       "totalSizeMB": "0.00"
     }
   }
   ```

### Option B: Manual Test Script

Create `test-supabase.js` in backend folder:

```javascript
import supabaseService from "./src/services/supabaseService.js";

async function test() {
  console.log("🧪 Testing Supabase connection...\n");

  // Check configuration
  console.log("Configuration:", {
    configured: supabaseService.isConfigured(),
    bucket: supabaseService.bucketName,
    retention: supabaseService.retentionDays,
  });

  // Test bucket
  const bucketTest = await supabaseService.ensureBucketExists();
  console.log("Bucket test:", bucketTest ? "✅ Success" : "❌ Failed");

  // Get stats
  const stats = await supabaseService.getStorageStats();
  console.log("Storage stats:", stats);

  // List files
  const files = await supabaseService.listPDFs();
  console.log("Files:", files);
}

test();
```

Run: `node test-supabase.js`

## Step 4: How It Works

### Automatic Upload on Bill Creation

When a bill is created in the checkout:

1. **Bill Generated** → MongoDB saves bill
2. **PDF Created** → pdfService generates PDF
3. **Auto Upload** → Supabase receives PDF in background
4. **URL Stored** → Bill document updated with `supabaseUrl`
5. **WhatsApp Ready** → Public URL available for sharing

### Manual WhatsApp Send Flow

1. Customer completes checkout
2. Admin clicks "Send via WhatsApp"
3. System checks if `supabaseUrl` exists
4. WhatsApp Web opens with:
   - Customer greeting
   - Link to public bill page: `www.cakeraft.in/bill/BILL-ID`
   - Bill page has download button with Supabase PDF URL
5. Customer clicks → PDF downloads directly

## Step 5: Storage Management

### View Storage Stats

```bash
# API endpoint (requires admin auth)
GET /api/revenue/supabase/test
```

Returns:

```json
{
  "stats": {
    "totalFiles": 15,
    "totalSizeMB": "2.34",
    "bucketName": "invoices",
    "retentionDays": 30
  },
  "recentFiles": [...]
}
```

### Manual Cleanup (Delete Old PDFs)

```bash
# Delete PDFs older than 30 days (default)
POST /api/revenue/supabase/cleanup

# Or specify custom days
POST /api/revenue/supabase/cleanup
Body: { "days": 60 }
```

Response:

```json
{
  "success": true,
  "message": "Cleaned up PDFs older than 30 days",
  "deletedCount": 5,
  "deletedFiles": ["bill_BILL-20250101-0001_1234567.pdf", ...]
}
```

### Automated Cleanup (Future Enhancement)

You can set up a cron job to run cleanup automatically:

**Option 1: Node-cron (Backend)**

Install: `npm install node-cron`

Add to `server.js`:

```javascript
import cron from "node-cron";
import supabaseService from "./services/supabaseService.js";

// Run cleanup daily at 3 AM
cron.schedule("0 3 * * *", async () => {
  console.log("🧹 Running scheduled PDF cleanup...");
  const result = await supabaseService.deleteOldPDFs();
  console.log(`Deleted ${result.deletedCount} old PDFs`);
});
```

**Option 2: Vercel Cron (Frontend)**

Create `app/api/cron/cleanup/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call backend cleanup endpoint
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/revenue/supabase/cleanup`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    }
  );

  return NextResponse.json(await response.json());
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Step 6: Troubleshooting

### Issue: "Bucket not found"

**Solution:**

1. Go to Supabase Dashboard → Storage
2. Verify bucket name is exactly `invoices`
3. Check bucket is marked as **Public**
4. Restart backend server

### Issue: "Failed to upload PDF"

**Check:**

- ✅ `SUPABASE_URL` is correct
- ✅ `SUPABASE_ANON_KEY` is valid (not expired)
- ✅ Bucket has public access enabled
- ✅ PDF file exists before upload

**Debug:**

```javascript
// Add to checkoutController.js
console.log("PDF path:", pdfPath);
console.log("File exists:", fs.existsSync(pdfPath));
console.log("Supabase configured:", supabaseService.isConfigured());
```

### Issue: "Public URL returns 404"

**Check:**

1. File actually uploaded (check Supabase Dashboard → Storage → invoices)
2. Bucket is public (not private)
3. URL format: `https://PROJECT.supabase.co/storage/v1/object/public/invoices/bills/FILENAME.pdf`

**Fix Public Access:**

```sql
-- Run in SQL Editor
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invoices');
```

### Issue: PDFs not auto-uploading

**Check:**

1. Backend server restarted after adding env variables
2. No errors in backend console
3. `uploadBillToSupabase()` function is called

**Test manually:**

```javascript
// In backend console or test script
import supabaseService from "./services/supabaseService.js";
import Bill from "./models/Bill.js";
import pdfService from "./services/pdfService.js";

const bill = await Bill.findOne().populate("items.productId");
const pdfPath = await pdfService.generateBillPDF(bill);
const result = await supabaseService.uploadPDF(pdfPath, bill.billNumber);
console.log(result);
```

## Step 7: Production Deployment

### Vercel (Frontend)

No additional configuration needed - Supabase URLs work automatically.

### Render.com (Backend)

Add environment variables in Render Dashboard:

1. Go to your service → Environment
2. Add all `SUPABASE_*` variables
3. Click **Save Changes**
4. Service will auto-redeploy

### Database (MongoDB Atlas)

Bill documents now include:

```javascript
{
  _id: ObjectId(...),
  billNumber: "BILL-20250108-0001",
  supabaseUrl: "https://rzsombvienefbzeesohm.supabase.co/storage/v1/object/public/invoices/bills/bill_BILL-20250108-0001_1736332800.pdf",
  // ... other fields
}
```

## Features Summary

✅ **Auto-upload**: PDFs automatically uploaded after bill creation  
✅ **Public URLs**: Shareable links that work anywhere  
✅ **WhatsApp Integration**: Direct PDF links in messages  
✅ **Auto-cleanup**: Delete PDFs older than 30 days  
✅ **Storage stats**: Monitor usage via API  
✅ **Manual management**: Upload/delete PDFs manually  
✅ **Zero localhost dependency**: Works in production globally

## API Endpoints Reference

| Endpoint                        | Method | Auth | Description                 |
| ------------------------------- | ------ | ---- | --------------------------- |
| `/api/revenue/supabase/test`    | GET    | ✓    | Test connection & get stats |
| `/api/revenue/supabase/cleanup` | POST   | ✓    | Delete old PDFs             |
| `/api/bills/:id/pdf`            | GET    | ✗    | Download PDF (public)       |
| `/api/bills/:id`                | GET    | ✗    | View bill details (public)  |

## Cost Management

**Supabase Free Tier:**

- Storage: 1 GB
- Bandwidth: 2 GB/month
- No credit card required

**Estimate:**

- Average PDF: 50 KB
- 30-day retention
- ~20 bills/day = 30 MB/month
- **Free tier sufficient for ~1,000 bills/month**

**Optimize:**

- Run cleanup regularly (every 30 days)
- Compress PDFs if needed
- Monitor usage in Supabase Dashboard

## Next Steps

1. ✅ Create `invoices` bucket in Supabase
2. ✅ Test connection via API endpoint
3. ✅ Generate a test bill and verify upload
4. ✅ Send test WhatsApp message
5. ✅ Set up automated cleanup (optional)
6. ✅ Deploy to production with env variables

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs
2. Check backend console for errors
3. Test connection with API endpoint
4. Verify environment variables loaded

**Happy Baking! 🎂**

# 🔧 Google Sheets Export Troubleshooting Guide

## Current Situation

**Problem**: Google Sheets export returns 500 error in production  
**Status**: Code fixed locally, needs production verification  
**Last Fix**: Added `dotenv` import to `googleSheetsService.js` (commit 8dbdae6)

---

## ✅ Step-by-Step Resolution

### Step 1: Redeploy Backend on Render.com

**CRITICAL**: The latest code fixes are in GitHub but not yet deployed to Render.com

1. Go to https://dashboard.render.com/
2. Login with your account
3. Click on your backend service (likely named `cakeraft-backend`)
4. Click **"Manual Deploy"** button (top right)
5. Select **"Deploy latest commit"**
6. Wait 3-5 minutes for deployment to complete
7. Look for **"Live"** status indicator

**Why This Matters**: Commit 8dbdae6 added `dotenv.config()` to googleSheetsService.js - this fix is NOT in production yet.

---

### Step 2: Verify Environment Variables

Check that these are set on Render.com:

1. In Render.com dashboard → Your backend service
2. Click **"Environment"** tab
3. Verify these variables exist:

```plaintext
GOOGLE_SHEETS_SPREADSHEET_ID=1zOa9loQwHqg-fC8skSyE39XP1gZtsm-f7RXyd9lBQzc
GOOGLE_APPLICATION_CREDENTIALS=./src/config/google-credentials.json
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb+srv://...your_connection_string...
```

**If Missing**: Click "Add Environment Variable" and add them.

---

### Step 3: Verify Google Credentials File

The `google-credentials.json` file must exist in production.

**Check in Render.com**:
1. Dashboard → Your service → "Shell" tab
2. Run: `ls -la src/config/google-credentials.json`
3. Should show the file exists

**If File Missing**:
- The file should be in your Git repository at `backend/src/config/google-credentials.json`
- Make sure it's committed (not in `.gitignore`)
- If it's in `.gitignore`, you need to use environment variable approach instead

---

### Step 4: Use Diagnostic Endpoint

I just added a new diagnostic endpoint to help troubleshoot:

**In Frontend** (or Postman):
```javascript
// Login first to get token
const response = await fetch('https://cakeraft-backend.onrender.com/api/revenue/export/diagnostic', {
  headers: {
    'Authorization': `Bearer ${your_jwt_token}`
  }
});
const diagnostic = await response.json();
console.log(diagnostic);
```

**What It Checks**:
- ✅ Spreadsheet ID configured
- ✅ Credentials path set
- ✅ Credentials file exists
- ✅ Credentials file is valid JSON
- ✅ Authentication to Google works
- ✅ Spreadsheet is accessible

---

### Step 5: Check Render.com Logs

1. Render.com dashboard → Your service
2. Click **"Logs"** tab
3. Try the export again
4. Look for error messages in real-time

**Look for**:
- `❌ Error in revenue export:`
- Google API error messages
- Authentication errors
- File not found errors

---

## 🔍 Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading 'config')"

**Cause**: `dotenv` not imported in googleSheetsService.js  
**Solution**: Already fixed in commit 8dbdae6 - REDEPLOY backend

### Issue 2: "GOOGLE_SHEETS_SPREADSHEET_ID is not defined"

**Cause**: Environment variable not set on Render.com  
**Solution**: Add in Render.com Environment tab

### Issue 3: "google-credentials.json not found"

**Two Solutions**:

**Option A - File Approach** (current):
```bash
# Make sure file is in Git
git add backend/src/config/google-credentials.json
git commit -m "Add Google credentials"
git push
# Then redeploy on Render.com
```

**Option B - Environment Variable Approach** (more secure):
1. Copy entire contents of `google-credentials.json`
2. In Render.com → Environment → Add variable:
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Paste entire JSON content
3. Update `googleSheetsService.js`:
```javascript
let credentials;
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
} else {
  credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
}
```

### Issue 4: "The caller does not have permission"

**Cause**: Spreadsheet not shared with service account  
**Solution**:
1. Open https://docs.google.com/spreadsheets/d/1zOa9loQwHqg-fC8skSyE39XP1gZtsm-f7RXyd9lBQzc
2. Click **Share** button
3. Add: `sheets-service-account@cakeraft.iam.gserviceaccount.com`
4. Set permission: **Editor**
5. Uncheck "Notify people"
6. Click **Share**

### Issue 5: "Cold start timeout"

**Cause**: Render.com free tier has cold starts (10-30 seconds)  
**Solution**: Already implemented - frontend timeout set to 120 seconds

---

## 🧪 Testing After Fixes

### Test 1: Diagnostic Check
```bash
# Frontend console
const token = localStorage.getItem('token');
const res = await fetch('https://cakeraft-backend.onrender.com/api/revenue/export/diagnostic', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
```

### Test 2: Connection Test
```bash
const token = localStorage.getItem('token');
const res = await fetch('https://cakeraft-backend.onrender.com/api/revenue/export/test', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
```

### Test 3: Full Export
```bash
# Use the Analytics page Export button
# Or from console:
const token = localStorage.getItem('token');
const res = await fetch('https://cakeraft-backend.onrender.com/api/revenue/export', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
console.log(await res.json());
```

---

## 📊 What Success Looks Like

**Diagnostic Endpoint** should return:
```json
{
  "success": true,
  "diagnostic": {
    "checks": {
      "spreadsheetId": { "configured": true },
      "credentialsFile": { "exists": true },
      "credentialsValid": { 
        "hasProjectId": true,
        "hasClientEmail": true,
        "hasPrivateKey": true,
        "clientEmail": "sheets-service-account@cakeraft.iam.gserviceaccount.com"
      },
      "authentication": { "success": true },
      "spreadsheetAccess": { "success": true }
    }
  }
}
```

**Export Endpoint** should return:
```json
{
  "success": true,
  "message": "Successfully exported X days of revenue data",
  "exportedDays": 5,
  "deletedBills": 10,
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "totalRevenue": 606
}
```

---

## 🚨 If Still Failing After All Steps

1. **Share Render.com logs**:
   - Go to Logs tab
   - Copy the error output
   - Look for the actual Google API error

2. **Run diagnostic locally**:
```bash
cd backend
node -e "import('./src/services/googleSheetsService.js').then(s => s.default.testConnection()).then(console.log).catch(console.error)"
```

3. **Check Google Cloud Console**:
   - Go to https://console.cloud.google.com
   - Select project: cakeraft
   - Check API usage and quotas
   - Verify service account is active

4. **Alternative: Manual Google Sheets Setup**:
   - Create new service account
   - Download fresh credentials
   - Share spreadsheet again
   - Update environment variables

---

## 📝 Commit History

- **8dbdae6**: Added dotenv import to googleSheetsService.js ⭐ KEY FIX
- **fbc3be2**: Added favicon and production deployment guide
- **Earlier**: Initial Google Sheets implementation

---

## 🎯 Next Steps After Resolution

1. **Set up UptimeRobot** (prevent cold starts):
   - URL: https://cakeraft-backend.onrender.com/api/revenue/today
   - Interval: 5 minutes
   - Follow: KEEP_BACKEND_WARM.md

2. **Monitor export logs**:
   - Check Render.com logs weekly
   - Verify data appears in Google Sheets
   - Confirm old bills are deleted from MongoDB

3. **Consider upgrades**:
   - Render.com paid tier ($7/mo) - no cold starts
   - MongoDB Atlas dedicated cluster - better performance
   - Cloudinary paid tier - more transformations

---

## 🔗 Related Documentation

- [PRODUCTION_DEPLOYMENT_STEPS.md](./PRODUCTION_DEPLOYMENT_STEPS.md) - Complete deployment guide
- [KEEP_BACKEND_WARM.md](./KEEP_BACKEND_WARM.md) - Cold start prevention
- [CLOUDINARY_SETUP_GUIDE.md](./CLOUDINARY_SETUP_GUIDE.md) - Image storage setup

---

**Last Updated**: Current session  
**Status**: Awaiting backend redeploy on Render.com

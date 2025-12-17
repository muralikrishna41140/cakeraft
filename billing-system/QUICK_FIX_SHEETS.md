# 🚨 QUICK FIX - Google Sheets Error

## THE PROBLEM:
Your backend can't write to the Google Sheet because it doesn't have permission!

## THE 5-MINUTE FIX:

### 1️⃣ Open Your Google Sheet
Go to: https://docs.google.com/spreadsheets/d/1zOa9loQwHqg-fC8skSyE39XP1gZtsm-f7RXyd9lBQzc

### 2️⃣ Click "Share" Button (Top Right)

### 3️⃣ Add This Email:
```
sheets-service-account@cakeraft.iam.gserviceaccount.com
```

### 4️⃣ Set Permission:
- Choose: **Editor**
- Uncheck: "Notify people"
- Click: **Share**

### 5️⃣ Restart Backend:
```powershell
# In your backend terminal
Ctrl + C    # Stop server
npm run dev # Start again
```

### 6️⃣ Test Export:
- Go to: http://localhost:3000/dashboard
- Click: "Export Old Revenue"
- Should work! ✅

---

## 🎯 That's It!

**Why this happens:**
- Your backend uses a "service account" (robot user) to access Google Sheets
- Service accounts need permission just like real users
- You need to "share" the sheet with the robot's email

**After sharing:**
- Backend can read/write to the sheet ✅
- Export will work ✅  
- Data will be archived ✅

---

## 📞 Need Help?

Read the detailed guide: `GOOGLE_SHEETS_FIX.md`

**Common issues solved there:**
- Creating a new spreadsheet
- Finding spreadsheet ID
- Troubleshooting errors
- Testing the connection

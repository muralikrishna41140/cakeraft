# 🚀 CakeRaft Deployment Guide

## Repository
**GitHub:** https://github.com/muralikrishna41140/cakeraft

---

## 📦 Backend Deployment on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `muralikrishna41140/cakeraft`
3. Configure the service:

   ```
   Name: cakeraft-backend
   Environment: Node
   Region: Select closest to your users
   Branch: main
   Root Directory: billing-system/backend
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

### Step 3: Environment Variables
Add these in Render dashboard under **"Environment"**:

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/cakeraft
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=30d
ADMIN_EMAIL=admin@cakeraft.com
ADMIN_PASSWORD=YourSecurePassword@123
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
LOYALTY_FREQUENCY=3
LOYALTY_DISCOUNT_PERCENTAGE=10
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Optional (if using WhatsApp):**
```env
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

**Optional (if using Google Sheets):**
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend will be at: `https://cakeraft-backend.onrender.com`

### Step 5: Configure MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Add: `0.0.0.0/0` (allow all) OR add Render's specific IPs
5. Click **"Confirm"**

---

## 🌐 Frontend Deployment on Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access repositories

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `muralikrishna41140/cakeraft`
3. Configure:

   ```
   Framework Preset: Next.js
   Root Directory: billing-system/frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### Step 3: Environment Variables
Add in Vercel dashboard under **"Settings" → "Environment Variables"**:

```env
NEXT_PUBLIC_API_URL=https://cakeraft-backend.onrender.com/api
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Your frontend will be at: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
Go back to Render and update the `FRONTEND_URL` variable:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔧 Post-Deployment Configuration

### 1. Update Backend CORS Settings
If needed, manually update `backend/src/server.js`:

```javascript
const corsOptions = {
  origin: [
    'https://your-app.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. Test Your Deployment
1. Visit your frontend URL
2. Login with admin credentials
3. Test product management
4. Test billing system
5. Verify MongoDB connection

### 3. Change Default Credentials
1. Login to your deployed app
2. Go to Settings/Profile
3. Change admin password immediately

---

## 📁 File Storage Solutions

Render's free tier has **ephemeral storage** (files are lost on restart).

### Option 1: Cloudinary (Recommended - Free Tier Available)

1. **Sign up**: [cloudinary.com](https://cloudinary.com)
2. **Get credentials** from dashboard
3. **Add to Render environment**:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Option 2: AWS S3
1. Create S3 bucket
2. Get IAM credentials
3. Add to environment variables

### Option 3: Render Persistent Disk (Paid)
Upgrade to paid plan for persistent storage

---

## 🔒 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable MongoDB IP whitelist
- [ ] Use HTTPS only (automatic on Render/Vercel)
- [ ] Set proper CORS origins
- [ ] Review and limit API rate limits
- [ ] Keep dependencies updated
- [ ] Enable monitoring/logging

---

## 🐛 Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB URI is correct
- Check MongoDB Network Access whitelist

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running (no cold start)

### Database Connection Issues
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### File Upload Issues
- On free tier, files are temporary
- Use Cloudinary or S3 for persistence
- Check upload folder permissions

---

## 🔄 Continuous Deployment

Both Render and Vercel auto-deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Render and Vercel will automatically deploy!
```

---

## 📊 Monitoring

### Render Dashboard
- View logs
- Monitor performance
- Check deployment status

### Vercel Dashboard
- View build logs
- Monitor analytics
- Check error rates

---

## 💰 Cost Estimates

### Free Tier (Good for development/testing)
- **Render Free**: $0/month (with cold starts)
- **Vercel Free**: $0/month (generous limits)
- **MongoDB Atlas Free**: $0/month (512MB storage)
- **Cloudinary Free**: $0/month (25GB storage)

### Production (Paid)
- **Render Starter**: $7/month (no cold starts)
- **Vercel Pro**: $20/month (more bandwidth)
- **MongoDB Shared**: $9/month (2GB storage)

---

## 📞 Support

- **GitHub Issues**: https://github.com/muralikrishna41140/cakeraft/issues
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.atlas.mongodb.com

---

**Built with ❤️ - Happy Deploying! 🎂**

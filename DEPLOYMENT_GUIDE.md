# 🚀 DEPLOYMENT GUIDE - Portfolio on Vercel & Render

## ✅ Pre-Deployment Checklist

All deployment files have been created and configured! Here's what was prepared:

### Files Created:

- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.production` - Production environment template
- ✅ `.env.example` - Environment variable examples
- ✅ `backend/.env.example` - Backend environment template

### Code Fixed:

- ✅ CORS configured for Vercel deployments
- ✅ Server configured for production hosting (0.0.0.0)
- ✅ Environment variables properly handled
- ✅ .gitignore updated

---

## 🎯 DEPLOYMENT STEPS

# PART 1: Deploy Backend on Render

## Step 1: Prepare Backend Repository

### Option A: Deploy from main repository (Recommended)

```bash
# No action needed - Render will use the /backend folder
```

### Option B: Separate backend repository (Alternative)

```bash
# Only if you want a separate repo for backend
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin <your-backend-repo-url>
git push -u origin main
```

## Step 2: Create Render Account & Deploy

1. **Go to Render**: https://render.com
2. **Sign Up/Login** with GitHub
3. **Click "New +"** → Select **"Web Service"**

4. **Connect Repository:**

   - Connect your GitHub repository
   - If using main repo, Render will detect the backend folder

5. **Configure Web Service:**

   ```
   Name: dev-portfolio-backend
   Region: Choose closest to you (e.g., Oregon, Frankfurt)
   Branch: main
   Root Directory: backend (if using main repo)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

6. **Set Instance Type:**

   - Select: **Free** (or paid if needed)

7. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"

   ```
   MONGODB_URI = mongodb+srv://sohan119singh_db_user:pG60MR2helJOSBz6@cluster0.enthnc5.mongodb.net/?appName=Cluster0

   PORT = 5000

   NODE_ENV = production

   FRONTEND_URL = https://your-frontend.vercel.app
   (You'll update this after deploying frontend)

   RATE_LIMIT_WINDOW_MS = 900000

   RATE_LIMIT_MAX_REQUESTS = 5
   ```

8. **Click "Create Web Service"**

9. **Wait for Deployment** (2-5 minutes)

   - Watch the logs for any errors
   - Once deployed, you'll get a URL like: `https://dev-portfolio-backend.onrender.com`

10. **Test Backend:**
    ```
    https://your-backend.onrender.com/health
    ```
    Should return: `{"success": true, "message": "Server is running"}`

---

# PART 2: Deploy Frontend on Vercel

## Step 1: Update Frontend Environment Variable

1. **Open `.env.production`** (already created)
2. **Update with your Render backend URL:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

## Step 2: Test Build Locally (Optional but Recommended)

```bash
# Install dependencies
npm install

# Test production build
npm run build

# Preview the build
npm run preview
```

If build succeeds, you're ready!

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with GitHub
3. **Click "Add New"** → **"Project"**
4. **Import Git Repository:**

   - Select your GitHub repository
   - Click "Import"

5. **Configure Project:**

   ```
   Framework Preset: Vite
   Root Directory: ./ (leave as root)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

6. **Add Environment Variable:**

   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend.onrender.com
     ```

7. **Click "Deploy"**

8. **Wait for Deployment** (1-3 minutes)
   - Once done, you'll get a URL like: `https://dev-portfolio-xyz.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? dev-portfolio
# - Directory? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

## Step 4: Update Backend with Frontend URL

1. **Go back to Render Dashboard**
2. **Select your backend service**
3. **Go to Environment**
4. **Update FRONTEND_URL:**
   ```
   FRONTEND_URL = https://your-frontend.vercel.app
   ```
5. **Save Changes**
6. **Render will automatically redeploy**

---

# PART 3: Final Verification

## Test Your Live Application

### 1. Test Backend Health:

```
https://your-backend.onrender.com/health
```

✅ Should show: Server is running

### 2. Test Frontend:

```
https://your-frontend.vercel.app
```

✅ Should load your portfolio

### 3. Test Contact Form:

1. Go to your live site
2. Navigate to Contact page
3. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Testing Live Form
   - Message: This is a test message for the live deployment.
4. Click "Send Message"
5. ✅ Should show success message

### 4. Verify Database:

1. Go to MongoDB Atlas
2. Check "contacts" collection
3. ✅ You should see the test entry

---

# 🔧 Troubleshooting

## Issue 1: CORS Error

**Symptoms:** Contact form shows network error

**Fix:**

1. Check Render environment variables
2. Ensure FRONTEND_URL matches your Vercel URL exactly
3. Redeploy backend on Render

## Issue 2: Backend Not Starting

**Symptoms:** Render shows "Service Unavailable"

**Check Render Logs:**

1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors (usually MongoDB connection issues)

**Common fixes:**

- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (0.0.0.0/0)
- Ensure MongoDB user has correct permissions

## Issue 3: Frontend Build Fails

**Symptoms:** Vercel deployment fails

**Check Vercel Logs:**

1. Go to Vercel Dashboard
2. Click your project
3. Click failed deployment
4. Check build logs

**Common fixes:**

- Ensure all dependencies are in package.json
- Check for TypeScript errors
- Verify vite.config.js is correct

## Issue 4: Environment Variables Not Working

**Symptoms:** Frontend uses localhost instead of live backend

**Fix:**

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure VITE_API_URL is set
3. Redeploy (Deployments tab → Click "..." → "Redeploy")

---

# 📊 Post-Deployment Setup

## 1. Custom Domain (Optional)

### Vercel:

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Render:

1. Go to Service → Settings → Custom Domain
2. Add your domain
3. Update DNS records

## 2. MongoDB Atlas Security

1. **Whitelist Render IPs:**

   - Go to MongoDB Atlas → Network Access
   - Add: 0.0.0.0/0 (or specific Render IPs)

2. **Create Production Database:**
   - Consider separate DB for production
   - Update MONGODB_URI in Render

## 3. Monitoring

### Render:

- Dashboard shows metrics, logs, and health
- Set up email alerts for downtime

### Vercel:

- Analytics available in dashboard
- Speed insights and performance metrics

---

# 🎉 SUCCESS CHECKLIST

Before announcing your portfolio:

- ✅ Backend health endpoint works
- ✅ Frontend loads correctly
- ✅ All pages navigate properly
- ✅ Contact form submits successfully
- ✅ Data saves to MongoDB
- ✅ CORS is properly configured
- ✅ No console errors in browser
- ✅ Mobile responsive works
- ✅ SSL certificates are active (HTTPS)
- ✅ Performance is good (test with Lighthouse)

---

# 🔗 Quick Reference

## Your URLs (Update after deployment):

```
Frontend: https://your-app.vercel.app
Backend:  https://your-backend.onrender.com
Database: MongoDB Atlas
```

## Important Dashboards:

```
Vercel:   https://vercel.com/dashboard
Render:   https://dashboard.render.com
MongoDB:  https://cloud.mongodb.com
```

## Support:

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com

---

# 🚀 You're Ready to Deploy!

Everything is configured and ready. Follow the steps above to deploy your portfolio live!

**Time Estimate:**

- Backend deployment: ~5-10 minutes
- Frontend deployment: ~3-5 minutes
- Total setup: ~15-20 minutes

Good luck! 🎉

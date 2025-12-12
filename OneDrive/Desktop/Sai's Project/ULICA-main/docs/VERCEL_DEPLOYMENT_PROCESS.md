# Complete Vercel Deployment Process Guide

## 📋 Overview

This guide walks you through deploying both **Frontend** and **Backend** to Vercel. You'll need to create **two separate Vercel projects** - one for frontend and one for backend.

---

## 🚀 Step-by-Step Deployment Process

### **PART 1: Deploy Backend First**

#### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Upgrade ESLint: Backend to v9, Frontend to v8.57.0"
git push origin main
```

#### Step 2: Create Backend Project in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Backend Project**
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub repository
   - **Important:** Choose the **`backend`** folder as the root directory
   - Project Name: `ulica-backend` (or your preferred name)

3. **Configure Build Settings**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build` (IMPORTANT: Must include Prisma generate)
   - **Output Directory:** (Leave EMPTY - we're using serverless functions, not static output)
   - **Install Command:** `npm install`
   
   **⚠️ CRITICAL:** The build command must run `prisma generate` before TypeScript compilation.
   Our `package.json` has: `"build": "prisma generate && tsc"`

4. **Set Environment Variables**
   - Click **"Environment Variables"** tab
   - Add all variables from `docs/VERCEL_BACKEND_ENV_VARIABLES.md`
   - **Important variables to set:**
     ```
     NODE_ENV=production
     PORT=5001
     DATABASE_URL=your_database_url
     JWT_SECRET=your_jwt_secret_min_32_chars
     JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
     BACKEND_URL=https://your-backend-url.vercel.app
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
     ```
   - Set for: **Production, Preview, Development** (or at least Production)

5. **Deploy Backend**
   - Click **"Deploy"**
   - Wait for build to complete
   - **Copy the deployment URL** (e.g., `https://ulica-backend-xxx.vercel.app`)

#### Step 3: Update Backend URL
- Note your backend deployment URL
- You'll need this for frontend environment variables

---

### **PART 2: Deploy Frontend**

#### Step 4: Create Frontend Project in Vercel

1. **Import Frontend Project**
   - Click **"Add New..."** → **"Project"** (again)
   - Select the **same GitHub repository**
   - **Important:** Choose the **`frontend`** folder as the root directory
   - Project Name: `ulica-frontend` (or your preferred name)

2. **Configure Build Settings**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install`

3. **Set Environment Variables**
   - Click **"Environment Variables"** tab
   - Add variables from `docs/VERCEL_FRONTEND_ENV_VARIABLES.md`
   - **Critical variables:**
     ```
     NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
     NEXT_PUBLIC_SITE_URL=https://your-frontend-url.vercel.app
     ```
   - **Important:** Use the backend URL from Step 3
   - Set for: **Production, Preview, Development**

4. **Deploy Frontend**
   - Click **"Deploy"**
   - Wait for build to complete
   - **Copy the frontend deployment URL**

---

### **PART 3: Update URLs and Redeploy**

#### Step 5: Update Backend Environment Variables

1. **Go back to Backend Project**
   - Open your backend project in Vercel
   - Go to **Settings** → **Environment Variables**
   - Update these variables with actual URLs:
     ```
     BACKEND_URL=https://your-actual-backend-url.vercel.app
     FRONTEND_URL=https://your-actual-frontend-url.vercel.app
     ALLOWED_ORIGINS=https://your-actual-frontend-url.vercel.app
     ```
   - Click **"Redeploy"** to apply changes

#### Step 6: Verify Deployment

1. **Test Backend**
   - Visit: `https://your-backend-url.vercel.app/health`
   - Should return: `{"status":"ok"}`

2. **Test Frontend**
   - Visit: `https://your-frontend-url.vercel.app`
   - Should load your application

3. **Test API Connection**
   - Open browser console on frontend
   - Check for API connection errors
   - Test login/registration

---

## 🔧 Vercel Dashboard Settings

### Backend Project Settings

**General Tab:**
- Project Name: `ulica-backend`
- Framework: Other
- Root Directory: `backend`

**Build & Development Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Environment Variables:**
- See `docs/VERCEL_BACKEND_ENV_VARIABLES.md` for complete list

### Frontend Project Settings

**General Tab:**
- Project Name: `ulica-frontend`
- Framework: Next.js
- Root Directory: `frontend`

**Build & Development Settings:**
- Build Command: `npm run build` (auto)
- Output Directory: `.next` (auto)
- Install Command: `npm install`

**Environment Variables:**
- See `docs/VERCEL_FRONTEND_ENV_VARIABLES.md` for complete list

---

## 📝 Important Notes

### 1. **Two Separate Projects**
- Frontend and Backend are **separate Vercel projects**
- Each has its own deployment URL
- Each has its own environment variables

### 2. **Environment Variables**
- **Backend:** Set `BACKEND_URL` and `FRONTEND_URL` to actual deployment URLs
- **Frontend:** Set `NEXT_PUBLIC_BACKEND_URL` to backend deployment URL
- Use **Production** environment for live site

### 3. **Database Migrations**
- After first deployment, run migrations:
  ```bash
  # Connect to your production database
  npx prisma migrate deploy
  ```
- Or use Vercel CLI:
  ```bash
  vercel env pull .env.production
  npx prisma migrate deploy
  ```

### 4. **Custom Domain (Optional)**
- Go to **Settings** → **Domains**
- Add your custom domain
- Update environment variables with new domain

### 5. **Redeploy After Changes**
- Any environment variable changes require **Redeploy**
- Go to **Deployments** tab → Click **"..."** → **"Redeploy"**

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check `package.json` scripts are correct
- Ensure `prisma generate` runs before `tsc` in build command

### 404 Error on All Routes
- **Check Root Directory:** Must be set to `backend` (not root of repo)
- **Check Build Command:** Must be `npm run build` (which includes Prisma generate)
- **Check Output Directory:** Should be EMPTY (not `dist`) for serverless functions
- **Verify api/index.ts exists:** Should be at `backend/api/index.ts`
- **Check vercel.json:** Routes should point to `/api/index.ts`
- **Check Build Logs:** Ensure build completes successfully
- **Verify dist/index.js exists:** Check build logs to confirm TypeScript compiled

### API Not Connecting
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check CORS settings in backend
- Verify `ALLOWED_ORIGINS` includes frontend URL

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`

### Environment Variables Not Working
- Variables must start with `NEXT_PUBLIC_` for frontend
- Redeploy after adding/changing variables
- Check variable names match exactly

---

## ✅ Deployment Checklist

- [ ] Backend project created in Vercel
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Backend health check works (`/health`)
- [ ] Frontend project created in Vercel
- [ ] Frontend environment variables set (with backend URL)
- [ ] Frontend deployed successfully
- [ ] Frontend loads correctly
- [ ] API calls work from frontend
- [ ] Database migrations run
- [ ] Custom domain configured (if applicable)
- [ ] All integrations tested (payments, shipping, etc.)

---

## 🎯 Quick Reference

**Backend Deployment URL:**
```
https://your-backend-project.vercel.app
```

**Frontend Deployment URL:**
```
https://your-frontend-project.vercel.app
```

**Backend Health Check:**
```
https://your-backend-project.vercel.app/health
```

**Update Environment Variables:**
1. Settings → Environment Variables
2. Add/Edit variables
3. Redeploy project

---

## 📚 Additional Resources

- Backend Environment Variables: `docs/VERCEL_BACKEND_ENV_VARIABLES.md`
- Frontend Environment Variables: `docs/VERCEL_FRONTEND_ENV_VARIABLES.md`
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)

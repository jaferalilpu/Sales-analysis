# Fixing 404 Error on Vercel Backend Deployment

## Problem
Getting 404 errors when accessing backend API routes on Vercel.

## Solution

### 1. Vercel Build Settings

In your Vercel project settings, ensure:

**Build & Development Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist` (or leave empty)
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

**Root Directory:**
- Set to: `backend`

### 2. Environment Variables

Make sure these are set in Vercel:
- `NODE_ENV=production`
- `DATABASE_URL=your_database_url`
- `JWT_SECRET=your_secret`
- `JWT_REFRESH_SECRET=your_refresh_secret`
- `BACKEND_URL=https://your-backend.vercel.app`
- `FRONTEND_URL=https://your-frontend.vercel.app`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### 3. Verify File Structure

Your backend should have:
```
backend/
├── api/
│   └── index.ts          # Vercel serverless function entry
├── src/
│   └── index.ts          # Express app
├── vercel.json           # Vercel configuration
├── package.json
└── tsconfig.json
```

### 4. Build Process

The build command (`npm run build`) should:
1. Generate Prisma client: `prisma generate`
2. Compile TypeScript: `tsc`
3. Output to `dist/` folder

### 5. Testing the Deployment

After deployment, test:
- Health check: `https://your-backend.vercel.app/health`
- API route: `https://your-backend.vercel.app/api/products`

### 6. Common Issues

**Issue: 404 on all routes**
- Check that `api/index.ts` exists
- Verify `vercel.json` routes configuration
- Check build logs for errors

**Issue: Build fails**
- Ensure Prisma client is generated
- Check TypeScript compilation errors
- Verify all dependencies are in package.json

**Issue: Routes not found**
- Verify Express routes are properly mounted
- Check that routes start with `/api/`
- Verify CORS settings

### 7. Debugging

Check Vercel deployment logs:
1. Go to your project in Vercel dashboard
2. Click on the deployment
3. Check "Build Logs" for errors
4. Check "Function Logs" for runtime errors

### 8. Alternative: Use Vercel CLI

Test locally with Vercel CLI:
```bash
npm install -g vercel
cd backend
vercel dev
```

This will simulate the Vercel environment locally.

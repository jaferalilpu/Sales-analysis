# Frontend Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Build Test
```bash
cd frontend
npm run build
```
**Expected:** Build should complete successfully (warnings are OK, errors are not)

**Common Issues:**
- ❌ Build fails → Check TypeScript errors
- ❌ Missing dependencies → Run `npm install`
- ⚠️ Sitemap fetch errors → Normal if backend not running (will work in Vercel)

### 2. Environment Variables Check

**Required Variables:**
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (MUST be set)
- `NEXT_PUBLIC_SITE_URL` - Frontend URL (optional but recommended)

**Verify in code:**
- Check `frontend/lib/api-config.ts` - Should use `NEXT_PUBLIC_BACKEND_URL`
- Check `frontend/src/utils/validateEnv.ts` - Validates required vars

### 3. API Configuration

**Files using API:**
- ✅ `lib/api-config.ts` - Centralized config (CORRECT)
- ⚠️ Some routes use `process.env.BACKEND_URL` directly (should use `getBackendUrl()`)

**Priority Order:**
1. `NEXT_PUBLIC_BACKEND_URL` (preferred)
2. `NEXT_PUBLIC_API_URL` (fallback)
3. `BACKEND_URL` (server-side only)
4. Hardcoded fallback (development only)

---

## 🚀 Vercel Dashboard Settings

### Critical Settings

1. **Root Directory:** `frontend` ⚠️ **MUST BE SET**
2. **Framework Preset:** Next.js (auto-detected)
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `.next` (auto-detected)
5. **Install Command:** `npm install` (auto-detected)

### Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

**Required:**
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

**Optional (but recommended):**
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

**Set for:** Production, Preview, Development (or at least Production)

---

## 🔍 Common Issues & Solutions

### Issue 1: Build Fails with "Cannot find module"

**Solution:**
- Ensure Root Directory is set to `frontend`
- Check that `package.json` exists in `frontend/` directory
- Verify all dependencies are in `package.json`

### Issue 2: API Calls Fail (404 or CORS errors)

**Solution:**
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check backend CORS settings include frontend URL
- Ensure backend is deployed and accessible
- Check browser console for actual API URL being used

### Issue 3: Images Not Loading

**Solution:**
- Check `next.config.js` - `images.remotePatterns` includes your domains
- Verify image URLs are correct
- Check if images are served from backend or external CDN

### Issue 4: Environment Variables Not Working

**Solution:**
- Variables MUST start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for correct environment (Production/Preview/Development)

### Issue 5: Sitemap Generation Errors

**Solution:**
- Errors during build are normal if backend isn't running
- Sitemap will generate correctly in Vercel (backend will be available)
- If persistent, check `app/sitemap.xml/route.ts` error handling

---

## 📋 Deployment Checklist

Before deploying:

- [ ] Root Directory set to `frontend` in Vercel
- [ ] `NEXT_PUBLIC_BACKEND_URL` environment variable set
- [ ] `NEXT_PUBLIC_SITE_URL` environment variable set (optional)
- [ ] Backend is deployed and accessible
- [ ] Build completes successfully locally (`npm run build`)
- [ ] No critical TypeScript errors
- [ ] ESLint warnings are acceptable (can be fixed later)

After deploying:

- [ ] Frontend loads without errors
- [ ] API calls work (check browser console)
- [ ] Images load correctly
- [ ] Authentication works
- [ ] All pages are accessible
- [ ] No CORS errors in console

---

## 🔧 Configuration Files

### `next.config.js`
- ✅ Image domains configured
- ✅ SWC minification enabled
- ✅ Security headers configured

### `package.json`
- ✅ Build script: `next build`
- ✅ Start script: `next start`
- ✅ All dependencies listed

### `.eslintrc.json`
- ✅ Next.js ESLint config
- ✅ TypeScript rules configured

---

## 🐛 Debugging

### Check Build Logs
1. Go to Vercel Dashboard
2. Select your deployment
3. Click "Build Logs"
4. Look for errors or warnings

### Check Function Logs
1. Go to Vercel Dashboard
2. Select your deployment
3. Click "Function Logs"
4. Check for runtime errors

### Test Locally with Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel dev
```

### Verify Environment Variables
```bash
# In Vercel dashboard, check:
# Settings → Environment Variables
# Make sure NEXT_PUBLIC_BACKEND_URL is set
```

---

## 📝 Notes

1. **Next.js 14** is used - fully compatible with Vercel
2. **Static Generation** - Some pages are statically generated
3. **API Routes** - Next.js API routes proxy to backend
4. **Image Optimization** - Next.js Image component used
5. **Environment Variables** - Must use `NEXT_PUBLIC_` prefix for client-side

---

## ✅ Success Indicators

After successful deployment:
- ✅ Frontend URL loads
- ✅ No console errors
- ✅ API calls succeed
- ✅ Pages render correctly
- ✅ Images load
- ✅ Authentication works

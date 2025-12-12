# Frontend Environment Variables for Vercel

## 🔴 REQUIRED Variables (Must be set)

### Backend API URL (REQUIRED)
```
NEXT_PUBLIC_BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
```

**Alternative names (if NEXT_PUBLIC_BACKEND_URL is not set):**
```
NEXT_PUBLIC_API_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
```

**Note:** For server-side API routes, you can also use:
```
BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
```

### Frontend Site URL (REQUIRED)
```
NEXT_PUBLIC_SITE_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
```

**Alternative:**
```
FRONTEND_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
```

---

## 📋 Complete Copy-Paste Template for Vercel

### Minimum Required (Recommended):
```
NEXT_PUBLIC_BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
NEXT_PUBLIC_SITE_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
```

### With Optional Fallback (Optional - only if you want redundancy):
```
NEXT_PUBLIC_BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
NEXT_PUBLIC_API_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
NEXT_PUBLIC_SITE_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
```

**Note:** `NEXT_PUBLIC_API_URL` is optional - it's only used as a fallback if `NEXT_PUBLIC_BACKEND_URL` is not set. You only need the 2 required variables above.

---

## 📝 Variable Priority Order

### For Backend URL:
1. `NEXT_PUBLIC_BACKEND_URL` (highest priority)
2. `NEXT_PUBLIC_API_URL` (fallback)
3. `BACKEND_URL` (server-side only)
4. Default: `https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app`

### For Frontend URL:
1. `NEXT_PUBLIC_SITE_URL` (highest priority)
2. `FRONTEND_URL` (fallback)
3. Default: `https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app`

---

## 🎯 Quick Setup in Vercel

1. Go to **Vercel Dashboard** → Your Frontend Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Add each variable:

### Variable 1:
- **Name:** `NEXT_PUBLIC_BACKEND_URL`
- **Value:** `https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app`
- **Environments:** Production, Preview, Development (select all)

### Variable 2:
- **Name:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app`
- **Environments:** Production, Preview, Development (select all)

5. Click **Save** for each variable
6. **Redeploy** your project

---

## ✅ Verification Checklist

After setting environment variables, verify:

- [ ] `NEXT_PUBLIC_BACKEND_URL` is set correctly
- [ ] `NEXT_PUBLIC_SITE_URL` is set correctly
- [ ] Frontend can connect to backend API
- [ ] All API routes work correctly
- [ ] Sitemap and robots.txt generate correctly
- [ ] Product pages load correctly
- [ ] Metadata (SEO) works correctly

---

## 🔍 How to Verify

### Check in Browser Console:
```javascript
// Should show your backend URL
console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
```

### Check Network Tab:
- Open browser DevTools → Network tab
- Make an API call
- Verify requests go to `https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app`

---

## ⚠️ Important Notes

1. **NEXT_PUBLIC_ prefix:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser
2. **Security:** Never put sensitive data in `NEXT_PUBLIC_` variables
3. **Redeploy Required:** After adding/changing environment variables, you must redeploy
4. **Case Sensitive:** Variable names are case-sensitive
5. **No Quotes:** Don't wrap values in quotes in Vercel (they're added automatically)

---

## 🚀 Current URLs

- **Frontend:** `https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app`
- **Backend:** `https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app`

---

## 📚 Additional Optional Variables

These are optional and only needed if you're using specific features:

### Analytics (Optional)
```
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Low Stock Threshold (Optional)
```
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=5
```

---

## 🔄 After Setting Variables

1. **Save** all environment variables
2. **Redeploy** your frontend project
3. **Test** the deployment
4. **Verify** API calls work correctly

---

## 🆘 Troubleshooting

### Issue: API calls failing
- **Check:** `NEXT_PUBLIC_BACKEND_URL` is set correctly
- **Check:** Backend CORS allows your frontend URL
- **Check:** Backend is deployed and running

### Issue: Metadata not working
- **Check:** `NEXT_PUBLIC_SITE_URL` is set correctly
- **Check:** URL format is correct (no trailing slash)

### Issue: Build fails
- **Check:** All required variables are set
- **Check:** No typos in variable names
- **Check:** Values don't have extra quotes

---

## 📖 Related Documentation

- `docs/VERCEL_BACKEND_ENV_VARIABLES.md` - Backend environment variables
- `docs/DATABASE_URL_FOR_VERCEL.md` - Database configuration
- `docs/DATABASE_SCHEMA.sql` - Database schema


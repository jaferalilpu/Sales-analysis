# 🚀 Quick Start Guide for Next Time

## Starting the Servers

### Option 1: Start Both Servers Together
```bash
npm run dev
```
This will start:
- **Backend** on `http://localhost:5001`
- **Frontend** on `http://localhost:3000`

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ⚠️ Port Issues

If you see "port already in use" errors:

1. **Kill all Node processes:**
   ```bash
   killall -9 node
   ```

2. **Or kill specific ports:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5001 | xargs kill -9
   ```

3. **Check what's using ports:**
   ```bash
   lsof -i:3000
   lsof -i:5001
   ```

## 🔧 Current Configuration

- **Frontend Port:** 3000 (standard)
- **Backend Port:** 5001 (standard)
- **Environment:** Development mode

## 📝 Environment Variables

Frontend `.env.local` is configured with:
- `NEXT_PUBLIC_API_URL=http://localhost:5001`
- `BACKEND_URL=http://localhost:5001`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## 🐛 If Pages Don't Load

1. **Clear Next.js cache:**
   ```bash
   cd frontend
   rm -rf .next
   ```

2. **Restart the frontend server**

3. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)

## ✅ Pages Available

- Homepage: `http://localhost:3000/`
- Login: `http://localhost:3000/login`
- Cart: `http://localhost:3000/cart`
- Wishlist: `http://localhost:3000/wishlist`
- Privacy: `http://localhost:3000/privacy`

---

**Note:** If port 3000 is blocked by a persistent process (like PID 24777), you may need to restart your computer to fully clear it, or we can use port 3001 as a workaround.



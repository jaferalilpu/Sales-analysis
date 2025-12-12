# Frontend Server Fix Instructions

## Issue
The frontend server is not running on port 3001, causing 404 errors.

## Solution

### Option 1: Start on Port 3001 (Recommended for your current setup)

1. **Open a new terminal window/tab**

2. **Navigate to the frontend directory:**
   ```bash
   cd /Users/saicharan/Downloads/Ulica/frontend
   ```

3. **Start the dev server on port 3001:**
   ```bash
   npx next dev -p 3001
   ```

4. **Wait for the "Ready" message** - it should show something like:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3001
   - Ready in 2.5s
   ```

5. **Then refresh your browser** at `http://localhost:3001`

### Option 2: Access Port 3000 (if server is already running there)

If something is already running on port 3000, try accessing:
```
http://localhost:3000
```

### Option 3: Kill existing process and restart

1. **Find and kill any existing Next.js processes:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

2. **Start fresh:**
   ```bash
   cd /Users/saicharan/Downloads/Ulica/frontend
   npm run dev
   ```

3. **Access at:** `http://localhost:3000`

## Troubleshooting

If you still see 404 errors:

1. **Clear browser cache:**
   - Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
   - Or use Incognito/Private mode

2. **Check for compilation errors:**
   - Look at the terminal where you started the server
   - Fix any TypeScript or build errors shown

3. **Verify the server is running:**
   ```bash
   curl http://localhost:3001
   # Should return HTML content, not 404
   ```


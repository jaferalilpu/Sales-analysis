# 📱 Mobile Testing Guide

**Date**: January 21, 2025  
**Status**: **Servers Starting**  
**Purpose**: Testing mobile components

---

## 🚀 Server Status

### Backend Server
- **URL**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **Status**: ✅ **RUNNING**
- **Logs**: Check terminal for backend output

### Frontend Server
- **URL**: http://localhost:3000
- **Status**: ⏳ **Starting or Already Running**
- **Note**: Port 3000 may already be in use

---

## 📱 Mobile Components Available

### Components Ready for Testing:
1. **MobileBottomNav.tsx** - Bottom navigation bar
   - Fixed at bottom on mobile (< 768px)
   - Icons: Home, Shop, Wishlist, Account
   - Badge support for wishlist

2. **MobileDrawer.tsx** - Mobile drawer menu
   - Swipe to close
   - Backdrop overlay
   - Smooth animations

3. **MobileModal.tsx** - Mobile-optimized modal
   - Centered on desktop
   - Full-screen on mobile
   - Smooth animations

4. **MobileProductCard.tsx** - Mobile product cards
   - Touch-friendly
   - Optimized image loading
   - Quick actions

5. **MobileImageCarousel.tsx** - Image carousel
   - Touch/swipe support
   - Mobile-optimized

---

## 🧪 Testing Mobile Components

### Browser Testing:
1. **Open Browser**: http://localhost:3000
2. **Open DevTools**: F12 or Right-click → Inspect
3. **Toggle Device Toolbar**: Ctrl+Shift+M (Windows) or Cmd+Shift+M (Mac)
4. **Select Mobile Device**: iPhone, iPad, or custom size
5. **Test Components**: Check mobile navigation, drawer, modals

### Real Device Testing:
1. **Find Your Local IP**: 
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```
2. **Connect Device**: Same WiFi network
3. **Access**: http://YOUR_IP:3000

---

## 🔧 Making Mobile Changes

### Component Locations:
- **Navigation**: `frontend/components/mobile/MobileBottomNav.tsx`
- **Drawer**: `frontend/components/mobile/MobileDrawer.tsx`
- **Modal**: `frontend/components/mobile/MobileModal.tsx`
- **Product Card**: `frontend/components/mobile/MobileProductCard.tsx`
- **Image Carousel**: `frontend/components/mobile/MobileImageCarousel.tsx`

### Quick Edit Workflow:
1. Edit component file
2. Save file
3. Frontend auto-reloads (hot reload)
4. Test in browser
5. Repeat

---

## 📊 Mobile Component Status

### Current Implementation:
- ✅ Mobile bottom navigation created
- ✅ Mobile drawer component ready
- ✅ Mobile modal component ready
- ✅ Mobile product cards ready
- ⏳ Awaiting user requirements for changes

### Pending Changes:
- User will provide requirements
- Changes to be implemented based on feedback
- See `MOBILE_NAVIGATION_CHANGES_PENDING.md`

---

## 🎯 Testing Checklist

### Mobile Navigation:
- [ ] Bottom nav shows on mobile viewport
- [ ] Bottom nav hidden on desktop
- [ ] Icons work correctly
- [ ] Badge shows wishlist count
- [ ] Active state highlights correctly

### Mobile Drawer:
- [ ] Drawer opens smoothly
- [ ] Swipe to close works
- [ ] Backdrop overlay works
- [ ] Content scrolls correctly

### Mobile Modal:
- [ ] Modal opens smoothly
- [ ] Full-screen on mobile
- [ ] Centered on desktop
- [ ] Close button works
- [ ] Backdrop click works

### Mobile Product Cards:
- [ ] Touch-friendly buttons
- [ ] Images load correctly
- [ ] Wishlist toggle works
- [ ] Card links work
- [ ] Badges display correctly

---

## 🔍 Debugging

### Check Server Logs:
- **Backend**: Check terminal running `npm run dev` in backend folder
- **Frontend**: Check terminal running `npm run dev` in frontend folder

### Common Issues:
1. **Port Already in Use**:
   - Backend: Change PORT in .env or kill process on port 5001
   - Frontend: Change port in package.json or kill process on port 3000

2. **Component Not Showing**:
   - Check browser console for errors
   - Check Network tab for failed requests
   - Verify component is imported correctly

3. **Mobile View Not Working**:
   - Verify viewport meta tag in layout.tsx
   - Check Tailwind responsive classes
   - Test in actual mobile device

---

## 📝 Quick Commands

### Start Backend:
```bash
cd backend && npm run dev
```

### Start Frontend:
```bash
cd frontend && npm run dev
```

### Start Both:
```bash
npm run dev
```

### Check Ports:
```bash
# Check if ports are in use
lsof -ti:5001  # Backend
lsof -ti:3000  # Frontend
```

### Kill Process on Port:
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## ✅ Server URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **API Docs**: Check API_DOCUMENTATION.md

---

**Status**: ✅ **Backend Running - Frontend Starting - Ready for Mobile Testing**

**Next**: Open http://localhost:3000 in browser and test mobile components


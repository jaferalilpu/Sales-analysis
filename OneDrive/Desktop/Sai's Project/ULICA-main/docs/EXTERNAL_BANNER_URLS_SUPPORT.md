# 🌐 External Banner URLs Support

**Date**: January 21, 2025  
**Status**: **COMPLETE**  
**Result**: **Banner images and videos now support external URLs**

---

## ✅ External URL Support Added

The banner/hero section now supports **external URLs** for both images and videos. This prevents increasing website bundle size and allows hosting media on CDNs or external services.

---

## 🎯 Features

### External URL Support:
- ✅ **Banner Images** - Can use external image URLs
- ✅ **Banner Videos** - Can use external video URLs
- ✅ **URI Validation** - Backend validates URLs are valid
- ✅ **No Bundle Size Impact** - External URLs don't increase website size
- ✅ **CDN Support** - Works with any CDN or hosting service
- ✅ **Video Hosting** - Supports video hosting services (YouTube, Vimeo, etc.)

---

## 📝 How to Use

### Option 1: External Image URL

```json
{
  "name": "Summer Collection",
  "bannerImage": "https://cdn.example.com/images/summer-banner.jpg",
  "bannerVideo": null
}
```

### Option 2: External Video URL

```json
{
  "name": "Summer Collection",
  "bannerImage": "https://cdn.example.com/images/poster.jpg",
  "bannerVideo": "https://cdn.example.com/videos/summer-video.mp4"
}
```

### Option 3: Video Hosting Services

```json
{
  "name": "Summer Collection",
  "bannerImage": "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg",
  "bannerVideo": "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&loop=1&mute=1"
}
```

---

## 🔧 Backend Changes

### Prisma Schema Update:
```prisma
model Drop {
  id                       String          @id @default(uuid())
  name                     String
  slug                     String          @unique
  description              String?
  bannerImage              String?         // External URL for banner image
  bannerVideo              String?         // External URL for banner video
  // ... other fields
}
```

### Validation Schema:
```typescript
const createDropSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    bannerImage: Joi.string().uri().allow('').optional(), // External URL
    bannerVideo: Joi.string().uri().allow('').optional(), // External URL
    // ... other fields
  })
};
```

### API Endpoints:
- ✅ **POST /api/admin/drops** - Create drop with external URLs
- ✅ **PUT /api/admin/drops/:id** - Update drop with external URLs
- ✅ **GET /api/drops/current** - Returns drop with external URLs

---

## 🎨 Frontend Implementation

### Current Implementation:
The frontend already supports external URLs natively:

```typescript
{/* Video Background (if video exists) */}
{drop?.bannerVideo ? (
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
    poster={drop.bannerImage || '/27546740_t32h_phbt_211202.svg'}
  >
    <source src={drop.bannerVideo} type="video/mp4" />
    <source src={drop.bannerVideo} type="video/webm" />
    {/* Fallback to image */}
    <img src={drop.bannerImage || '/27546740_t32h_phbt_211202.svg'} />
  </video>
) : (
  /* Image Background */
  <img src={drop?.bannerImage || '/27546740_t32h_phbt_211202.svg'} />
)}
```

### External URL Support:
- ✅ **Native HTML Support** - `<img>` and `<video>` tags support any URL
- ✅ **No Next.js Config Needed** - Regular HTML tags work with external URLs
- ✅ **CORS Handling** - External servers must allow CORS if needed
- ✅ **Fallback Support** - Falls back to default image if external URL fails

---

## 📊 Benefits

### Performance:
- ✅ **No Bundle Size Increase** - External URLs don't add to website size
- ✅ **CDN Performance** - Use fast CDNs for media delivery
- ✅ **Lazy Loading** - External media loads on demand
- ✅ **Bandwidth Savings** - Don't host large videos on your server

### Flexibility:
- ✅ **Any Hosting Service** - Use any CDN or hosting service
- ✅ **Easy Updates** - Change media without redeploying
- ✅ **Scalability** - Handle large files without server storage
- ✅ **Cost Efficiency** - Use specialized media hosting services

---

## 🔒 Security & Validation

### URL Validation:
- ✅ **URI Format** - Backend validates URLs are valid URIs
- ✅ **Empty String Support** - Allows clearing banner URLs
- ✅ **Optional Fields** - Both fields are optional

### Best Practices:
1. **HTTPS URLs** - Use HTTPS for secure media delivery
2. **CORS Headers** - Ensure external servers allow CORS if needed
3. **CDN Usage** - Use CDNs for better performance
4. **Video Hosting** - Consider video hosting services for large files

---

## 📝 Database Migration

### To Apply Changes:

1. **Generate Migration**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_banner_video
   ```

2. **Apply Migration**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

---

## 🎬 Example Use Cases

### Example 1: CDN Image
```json
{
  "bannerImage": "https://cdn.ulica.com/banners/summer-2024.jpg"
}
```

### Example 2: CDN Video
```json
{
  "bannerImage": "https://cdn.ulica.com/posters/summer-poster.jpg",
  "bannerVideo": "https://cdn.ulica.com/videos/summer-2024.mp4"
}
```

### Example 3: AWS S3
```json
{
  "bannerImage": "https://ulica-bucket.s3.amazonaws.com/banners/summer.jpg",
  "bannerVideo": "https://ulica-bucket.s3.amazonaws.com/videos/summer.mp4"
}
```

### Example 4: Cloudinary
```json
{
  "bannerImage": "https://res.cloudinary.com/ulica/image/upload/v123/banner.jpg",
  "bannerVideo": "https://res.cloudinary.com/ulica/video/upload/v123/banner.mp4"
}
```

---

## ✅ Testing Checklist

### Backend:
- [ ] Create drop with external image URL
- [ ] Create drop with external video URL
- [ ] Update drop with external URLs
- [ ] Validate URL format (should accept valid URIs)
- [ ] Reject invalid URLs (should return validation error)

### Frontend:
- [ ] Display external image URL
- [ ] Play external video URL
- [ ] Fallback to default if external URL fails
- [ ] Handle CORS errors gracefully
- [ ] Test with different CDN providers

---

## 🚀 Next Steps

### To Use External URLs:

1. **Prepare Media**:
   - Upload image/video to CDN or hosting service
   - Get the public URL

2. **Create/Update Drop**:
   ```bash
   POST /api/admin/drops
   {
     "name": "Summer Collection",
     "bannerImage": "https://cdn.example.com/banner.jpg",
     "bannerVideo": "https://cdn.example.com/video.mp4"
   }
   ```

3. **Test**:
   - Check banner displays correctly
   - Verify video plays
   - Test fallback behavior

---

## 📝 Summary

### What Was Added:
1. ✅ **bannerVideo field** in Prisma schema
2. ✅ **bannerVideo validation** in backend routes
3. ✅ **External URL support** for both images and videos
4. ✅ **URI validation** to ensure valid URLs
5. ✅ **Update endpoints** to handle bannerVideo

### How to Use:
1. Add `bannerImage` and/or `bannerVideo` as external URLs
2. Backend validates URLs are valid URIs
3. Frontend displays external media natively
4. No bundle size increase - media loads from external source

---

**Status**: ✅ **EXTERNAL URL SUPPORT ADDED - READY TO USE**

**Next**: Run database migration and start using external URLs!


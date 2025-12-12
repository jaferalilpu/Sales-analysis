# Complete Backend Environment Variables for Vercel

## 🔴 REQUIRED Variables (Must be set)

### Server Configuration
```
NODE_ENV=production
PORT=5001
HOST=0.0.0.0
```

### Database (REQUIRED)
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```
**Example (Supabase):**
```
DATABASE_URL=postgresql://postgres.fnmypthchobllrrwtozh:your_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?schema=public
```

### JWT Authentication (REQUIRED - Must be at least 32 characters)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
```

### URLs (REQUIRED)
```
BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
FRONTEND_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
```

### CORS (REQUIRED for production)
```
ALLOWED_ORIGINS=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app,http://localhost:3000,http://localhost:3001
```

---

## 💳 Payment Gateways

### Razorpay
```
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### PhonePe
```
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_ENVIRONMENT=production
```
**Note:** Use `sandbox` for testing, `production` for live

---

## 📧 Email Configuration

### SMTP (Standard Email)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ulicastreet25@gmail.com
SMTP_PASS=bpgc taxh smtj jnox
FROM_EMAIL=noreply@ulica.com
FROM_NAME=ULICA
```

### Gmail (Alternative/Additional)
```
GMAIL_USER=ulicastreet25@gmail.com
GMAIL_APP_PASSWORD=bpgc taxh smtj jnox
```

### Admin Email
```
ADMIN_EMAIL=admin@ulica.com
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from Google Account settings
3. Use that app password (not your regular password)

---

## 🚚 Shipping (Shiprocket)

```
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_PICKUP_PINCODE=110001
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_WAREHOUSE_ID=your-warehouse-id
```

---

## ☁️ AWS S3 (File Uploads)

```
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ulica-uploads
AWS_S3_DOMAIN=your-bucket-name.s3.ap-south-1.amazonaws.com
```

---

## 🔴 Redis (Caching & Sessions) - Optional

```
REDIS_URL=redis://user:password@host:6379
```

**Example (Upstash Redis):**
```
REDIS_URL=rediss://default:password@host.upstash.io:6379
```

---

## 🔒 Security

```
APP_ENCRYPTION_KEY=your-encryption-key-32-chars-minimum
```

---

## 📊 Analytics

```
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 📱 Social Media Integration (Optional)

### Facebook
```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Instagram
```
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
```

### Twitter/X
```
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_CLIENT_ID=your-twitter-client-id
```

### LinkedIn
```
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### TikTok
```
TIKTOK_APP_ID=your-tiktok-app-id
TIKTOK_APP_SECRET=your-tiktok-app-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
```

### YouTube
```
YOUTUBE_API_KEY=your-youtube-api-key
GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📬 Email Marketing (Mailchimp) - Optional

```
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_BASE_URL=https://us1.api.mailchimp.com/3.0
MAILCHIMP_LIST_ID=your-mailchimp-list-id
MAILCHIMP_FROM_NAME=ULICA
MAILCHIMP_REPLY_TO=noreply@ulica.com
```

---

## 📈 Monitoring & Alerts

```
LOW_STOCK_THRESHOLD=5
LOW_STOCK_MONITOR_ENABLED=true
LOW_STOCK_MONITOR_INTERVAL_MINUTES=15
DROP_STATUS_MONITOR_ENABLED=true
DROP_STATUS_MONITOR_INTERVAL_MINUTES=60
```

---

## 📋 Complete Copy-Paste Template for Vercel

Copy this entire block and paste into Vercel Environment Variables:

```
NODE_ENV=production
PORT=5001
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
BACKEND_URL=https://ulica-ibww-guesd6zvg-charansai0108s-projects.vercel.app
FRONTEND_URL=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app
ALLOWED_ORIGINS=https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app,http://localhost:3000,http://localhost:3001
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
PHONEPE_MERCHANT_ID=your-phonepe-merchant-id
PHONEPE_SALT_KEY=your-phonepe-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_ENVIRONMENT=production
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_PICKUP_PINCODE=110001
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_WAREHOUSE_ID=your-warehouse-id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ulicastreet25@gmail.com
SMTP_PASS=bpgc taxh smtj jnox
FROM_EMAIL=noreply@ulica.com
FROM_NAME=ULICA
GMAIL_USER=ulicastreet25@gmail.com
GMAIL_APP_PASSWORD=bpgc taxh smtj jnox
ADMIN_EMAIL=admin@ulica.com
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=ulica-uploads
AWS_S3_DOMAIN=your-bucket-name.s3.ap-south-1.amazonaws.com
REDIS_URL=redis://user:password@host:6379
APP_ENCRYPTION_KEY=your-encryption-key-32-chars-minimum
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
LOW_STOCK_THRESHOLD=5
LOW_STOCK_MONITOR_ENABLED=true
LOW_STOCK_MONITOR_INTERVAL_MINUTES=15
DROP_STATUS_MONITOR_ENABLED=true
DROP_STATUS_MONITOR_INTERVAL_MINUTES=60
```

---

## ⚠️ Important Notes

1. **Required Variables:** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` are mandatory
2. **JWT Secrets:** Must be at least 32 characters long
3. **Database:** Use a production database (Supabase, AWS RDS, Railway, etc.)
4. **Payment Gateways:** Only add if you're using them
5. **Email:** Either SMTP or Gmail configuration is needed for email features
6. **Optional Variables:** Social media, Mailchimp, Redis are optional - only add if using

---

## 🔐 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use strong secrets** for JWT (at least 32 characters, random)
3. **Rotate secrets** periodically
4. **Use environment-specific** values (production vs development)
5. **Restrict access** to environment variables in Vercel

---

## 📝 How to Set in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter **Name** and **Value**
5. Select **Environments** (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project for changes to take effect

---

## ✅ Verification Checklist

After setting environment variables, verify:

- [ ] Database connection works
- [ ] JWT authentication works
- [ ] CORS allows frontend requests
- [ ] Email sending works (if configured)
- [ ] Payment gateways work (if configured)
- [ ] File uploads work (if using S3)
- [ ] All API endpoints respond correctly

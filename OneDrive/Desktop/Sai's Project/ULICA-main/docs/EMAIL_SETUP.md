# Email (SMTP) Configuration Guide

## Gmail SMTP Setup

Your Gmail SMTP credentials have been configured. Add these to your `backend/.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="ulicastreet25@gmail.com"
SMTP_PASS="bpgc taxh smtj jnox"

# Gmail Configuration (for email verification)
GMAIL_USER="ulicastreet25@gmail.com"
GMAIL_APP_PASSWORD="bpgc taxh smtj jnox"
```

## Important Notes

⚠️ **Security Warning:**
- Never commit your `.env` file to version control
- The `.env` file should be in `.gitignore`
- The password provided is a Gmail App Password (not your regular Gmail password)

## Steps to Configure

1. **Create or update `backend/.env` file:**
   ```bash
   cd backend
   # If .env doesn't exist, copy from env.example
   cp env.example .env
   ```

2. **Add the SMTP credentials to `backend/.env`:**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="ulicastreet25@gmail.com"
   SMTP_PASS="bpgc taxh smtj jnox"
   GMAIL_USER="ulicastreet25@gmail.com"
   GMAIL_APP_PASSWORD="bpgc taxh smtj jnox"
   ```

3. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

## Testing Email

After configuration, you can test email sending by:
1. Registering a new user (should receive verification email)
2. Using the "Resend OTP" feature
3. Checking backend logs for email sending status

## Troubleshooting

### Email not sending?
- Check if `SMTP_USER` and `SMTP_PASS` are set correctly
- Verify the Gmail App Password is correct (no spaces, all lowercase)
- Check backend logs for SMTP errors
- Ensure Gmail account has "Less secure app access" enabled OR using App Password

### Gmail App Password
If you need to generate a new App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use the 16-character password (without spaces)

## Email Features Enabled

With SMTP configured, the following features will work:
- ✅ User registration email verification
- ✅ Password reset emails
- ✅ Order confirmation emails
- ✅ OTP/Verification code emails
- ✅ Email marketing campaigns (if configured)


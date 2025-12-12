# OTP Email Troubleshooting Guide

## ✅ SMTP Configuration Status

SMTP credentials have been added to `backend/.env`:
- **SMTP_HOST**: smtp.gmail.com
- **SMTP_PORT**: 587
- **SMTP_USER**: ulicastreet25@gmail.com
- **SMTP_PASS**: bpgc taxh smtj jnox

## 🔄 Next Steps

### 1. **Restart Backend Server**
The backend server needs to be restarted to load the new SMTP credentials:

```bash
cd backend
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Check Backend Logs**
After restarting, check the backend console for:
- ✅ `SMTP credentials configured` message (or similar)
- ❌ Any SMTP connection errors

### 3. **Test Registration**
1. Try registering a new user
2. Check backend logs for:
   - `✅ Verification email sent to [email] with code: [6-digit code]`
   - OR `⚠️ VERIFICATION CODE for [email]: [6-digit code]` (if email fails)

### 4. **Check Email Logs**
The system logs all email attempts in the database. Check:
- Email status (sent/failed/pending)
- Error messages
- Retry attempts

## 🔍 Debugging

### If OTP Still Not Sending:

1. **Check Backend Console Logs**
   - Look for `❌ Failed to send verification email` messages
   - Check for `⚠️ VERIFICATION CODE` - this shows the code even if email fails

2. **Verify SMTP Credentials**
   - Ensure Gmail App Password is correct (no spaces)
   - Check if 2-Step Verification is enabled on Gmail account
   - Verify App Password is generated for "Mail"

3. **Check Gmail Account Settings**
   - "Less secure app access" should be enabled OR
   - Use App Password (recommended)

4. **Test SMTP Connection**
   ```bash
   # In backend directory
   node -e "const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: 'ulicastreet25@gmail.com', pass: 'bpgc taxh smtj jnox' } }); transporter.verify().then(() => console.log('✅ SMTP connection successful')).catch(e => console.error('❌ SMTP connection failed:', e.message));"
   ```

## 📧 Email Features

Once SMTP is working, these features will be enabled:
- ✅ User registration email verification
- ✅ Resend OTP functionality
- ✅ Password reset emails
- ✅ Order confirmation emails

## 🚨 Important Notes

- **Verification codes are logged in backend console** - Check logs if email doesn't arrive
- **Codes don't expire** - The system doesn't track expiration (no `emailVerificationExpires` field)
- **Email sending is async** - Registration succeeds even if email fails (code is still generated)

## 🔐 Security

- Never commit `.env` file to version control
- Gmail App Passwords are safer than regular passwords
- Consider using environment-specific SMTP credentials for production


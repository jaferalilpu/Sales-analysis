# Gmail App Password Setup Guide

This guide will help you set up Gmail app passwords for email authentication in the ULICA application.

## Prerequisites

- A Gmail account
- 2-Step Verification enabled on your Gmail account

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification
5. You'll need a phone number to receive verification codes

## Step 2: Generate App Password

1. Once 2-Step Verification is enabled, go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
3. You may need to sign in again
4. Select **Mail** from the dropdown
5. Select **Other (custom name)** and enter "ULICA Backend"
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your Gmail credentials:
   ```env
   # Gmail Configuration for Email Verification
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-16-character-app-password"
   ```

   **Important Notes:**
   - Use your full Gmail address for `GMAIL_USER`
   - Use the 16-character app password (without spaces) for `GMAIL_APP_PASSWORD`
   - Never use your regular Gmail password

## Step 4: Test Email Configuration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. The email service will automatically test the Gmail connection on startup
3. Check the console logs for "Gmail SMTP connection verified successfully"

## Email Features Implemented

### 1. Email Verification
- **When**: User registers a new account
- **What**: Sends verification email with secure token
- **Expiry**: 24 hours
- **Template**: Professional HTML email with ULICA branding

### 2. Password Reset
- **When**: User requests password reset
- **What**: Sends reset link with secure token
- **Expiry**: 30 minutes
- **Template**: Secure reset email with clear instructions

### 3. Welcome Email
- **When**: User successfully verifies email
- **What**: Welcome message with next steps
- **Template**: Branded welcome email with shopping link

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register with email verification
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Frontend Pages
- `/verify-email` - Email verification page
- `/forgot-password` - Password reset request page
- `/reset-password` - Password reset form page

## Security Features

1. **Token Expiry**: All email tokens have expiration times
2. **Secure Tokens**: Random tokens generated for each request
3. **Rate Limiting**: Built-in protection against spam
4. **Input Validation**: All inputs are validated and sanitized
5. **Error Handling**: Graceful error handling without exposing sensitive info

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check if 2-Step Verification is enabled
   - Verify the app password is correct (16 characters, no spaces)
   - Ensure `GMAIL_USER` is your full email address

2. **"Connection timeout"**
   - Check your internet connection
   - Verify firewall isn't blocking SMTP (port 587)

3. **"Invalid credentials"**
   - Generate a new app password
   - Double-check the credentials in `.env`

### Testing Email Functionality

1. **Test Registration**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Check Email**: Look for verification email in the inbox

3. **Verify Email**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token":"your-verification-token"}'
   ```

## Production Considerations

1. **Use Environment Variables**: Never hardcode credentials
2. **Monitor Email Delivery**: Set up email delivery monitoring
3. **Backup SMTP**: Consider having a backup email service
4. **Rate Limiting**: Implement rate limiting for email endpoints
5. **Logging**: Monitor email sending logs for issues

## Email Templates

The application includes professional HTML email templates with:
- ULICA branding and colors
- Responsive design
- Clear call-to-action buttons
- Security notices
- Professional typography

Templates are located in `backend/src/services/emailService.ts` and can be customized as needed.

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your Gmail app password setup
3. Test with a simple email first
4. Contact support if problems persist

---

**Security Note**: Never commit your `.env` file to version control. Keep your Gmail app password secure and don't share it with others.

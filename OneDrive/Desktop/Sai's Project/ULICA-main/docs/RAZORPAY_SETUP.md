# Razorpay Payment Gateway Setup Guide

## Overview
To enable Razorpay payments (Credit/Debit Card, UPI, Net Banking) in your ULICA application, you need to configure Razorpay credentials.

## Required Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"
```

## Step-by-Step Setup

### 1. Create a Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create an account
3. Complete the KYC verification process

### 2. Get Your API Keys

1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. You'll see two keys:
   - **Key ID** (Public Key) - This is your `RAZORPAY_KEY_ID`
   - **Key Secret** (Private Key) - This is your `RAZORPAY_KEY_SECRET`

### 3. Set Up Webhook Secret

1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Add a webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - For local development: `http://localhost:5001/api/webhooks/razorpay` (using ngrok or similar)
3. Select events to listen to:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the **Webhook Secret** - This is your `RAZORPAY_WEBHOOK_SECRET`

### 4. Configure Environment Variables

#### For Backend (`.env` file in `backend/` directory):

```env
# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"  # Replace with your Key ID
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"  # Replace with your Key Secret
RAZORPAY_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxx"  # Replace with your Webhook Secret
```

#### For Frontend (`.env.local` file in `frontend/` directory):

The frontend doesn't need Razorpay credentials directly, but make sure `BACKEND_URL` is set:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5001"
```

### 5. Test Mode vs Live Mode

- **Test Mode**: Use test keys (start with `rzp_test_`)
  - No real money transactions
  - Use test cards: [https://razorpay.com/docs/payments/test-cards/](https://razorpay.com/docs/payments/test-cards/)

- **Live Mode**: Use live keys (start with `rzp_live_`)
  - Real money transactions
  - Requires account activation and KYC completion

### 6. Test Cards for Development

Use these test cards in Razorpay test mode:

| Card Number | CVV | Expiry | Result |
|------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any | Any future date | Success |
| 5555 5555 5555 4444 | Any | Any future date | Success |
| 4000 0000 0000 0002 | Any | Any future date | Failure |

### 7. Restart Your Backend Server

After adding the environment variables:

```bash
cd backend
npm run dev
```

### 8. Verify Setup

1. Try to create an order with Razorpay payment
2. Check backend logs for any Razorpay errors
3. Test with a test card number

## Troubleshooting

### Error: "Failed to create Razorpay order"
- Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set correctly
- Verify the keys are from the same account (test/live)
- Check backend logs for detailed error messages

### Error: "Invalid webhook signature"
- Verify `RAZORPAY_WEBHOOK_SECRET` matches the one in Razorpay dashboard
- Ensure webhook URL is correctly configured

### Payment Modal Not Opening
- Check browser console for JavaScript errors
- Verify Razorpay checkout script is loading: `https://checkout.razorpay.com/v1/checkout.js`
- Check if `RAZORPAY_KEY_ID` is being sent to frontend correctly

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env` files** to version control
2. **Never expose `RAZORPAY_KEY_SECRET`** in frontend code
3. **Use environment variables** for all sensitive data
4. **Rotate keys** if they're accidentally exposed
5. **Use test keys** during development
6. **Switch to live keys** only in production

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)
- [Razorpay Webhooks Guide](https://razorpay.com/docs/webhooks/)

## Support

If you encounter issues:
1. Check Razorpay Dashboard → **Logs** for API errors
2. Review backend logs for detailed error messages
3. Contact Razorpay Support: [support@razorpay.com](mailto:support@razorpay.com)


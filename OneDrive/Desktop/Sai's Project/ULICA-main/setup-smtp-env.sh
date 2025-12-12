#!/bin/bash

# Script to add SMTP credentials to backend/.env file

BACKEND_ENV="backend/.env"
ENV_EXAMPLE="env.example"

echo "🔧 Setting up SMTP configuration..."

# Check if backend/.env exists
if [ ! -f "$BACKEND_ENV" ]; then
    echo "📝 Creating backend/.env from env.example..."
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$BACKEND_ENV"
    else
        echo "⚠️  env.example not found. Creating new .env file..."
        touch "$BACKEND_ENV"
    fi
fi

# Update SMTP configuration
echo "✉️  Adding SMTP credentials..."

# Remove old SMTP settings if they exist
sed -i.bak '/^SMTP_HOST=/d' "$BACKEND_ENV" 2>/dev/null || true
sed -i.bak '/^SMTP_PORT=/d' "$BACKEND_ENV" 2>/dev/null || true
sed -i.bak '/^SMTP_USER=/d' "$BACKEND_ENV" 2>/dev/null || true
sed -i.bak '/^SMTP_PASS=/d' "$BACKEND_ENV" 2>/dev/null || true
sed -i.bak '/^GMAIL_USER=/d' "$BACKEND_ENV" 2>/dev/null || true
sed -i.bak '/^GMAIL_APP_PASSWORD=/d' "$BACKEND_ENV" 2>/dev/null || true

# Add new SMTP settings
cat >> "$BACKEND_ENV" << EOF

# Email Configuration (SMTP) - Configured
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="ulicastreet25@gmail.com"
SMTP_PASS="bpgc taxh smtj jnox"

# Gmail Configuration for Email Verification
GMAIL_USER="ulicastreet25@gmail.com"
GMAIL_APP_PASSWORD="bpgc taxh smtj jnox"
EOF

echo "✅ SMTP configuration added to $BACKEND_ENV"
echo ""
echo "📋 Next steps:"
echo "1. Review the credentials in $BACKEND_ENV"
echo "2. Restart your backend server: cd backend && npm run dev"
echo "3. Test email by registering a new user or using 'Resend OTP'"
echo ""
echo "⚠️  Remember: Never commit .env files to version control!"


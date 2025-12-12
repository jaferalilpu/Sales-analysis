# How to Generate JWT Secret Keys

JWT secrets must be **at least 32 characters long** and should be **random and secure**.

## 🔐 Method 1: Using Node.js (Recommended)

### Quick Command
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This generates a 128-character hexadecimal string (very secure).

### Alternative (Base64)
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

This generates a 64-character base64 string.

---

## 🔐 Method 2: Using OpenSSL (Terminal)

### Generate 64-byte hex string (128 characters)
```bash
openssl rand -hex 64
```

### Generate 48-byte base64 string (64 characters)
```bash
openssl rand -base64 48
```

### Generate 32-byte hex string (64 characters - minimum)
```bash
openssl rand -hex 32
```

---

## 🔐 Method 3: Using Online Generators

### Option A: Random.org
1. Go to: https://www.random.org/strings/
2. Set:
   - **Length:** 64 characters
   - **Character set:** Alphanumeric or Hexadecimal
   - **Quantity:** 1
3. Click **Generate**
4. Copy the generated string

### Option B: 1Password Secret Key Generator
1. Go to: https://1password.com/password-generator/
2. Set length to 64+ characters
3. Generate and copy

### Option C: LastPass Password Generator
1. Go to: https://www.lastpass.com/features/password-generator
2. Set length to 64+ characters
3. Generate and copy

---

## 🔐 Method 4: Using Python

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

This generates a 64-character URL-safe base64 string.

---

## 🔐 Method 5: Using PowerShell (Windows)

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

Or using .NET:
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📝 Step-by-Step: Generate Both Secrets

### For JWT_SECRET:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### For JWT_REFRESH_SECRET:
```bash
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Generate Both at Once:
```bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

---

## ✅ Example Output

```
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234
JWT_REFRESH_SECRET=fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedc
```

**Note:** These are example outputs. **Always generate your own unique secrets!**

---

## 🎯 Quick Copy-Paste Commands

### Generate JWT_SECRET (128 chars)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate JWT_REFRESH_SECRET (128 chars)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate APP_ENCRYPTION_KEY (64 chars)
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## ⚠️ Important Security Notes

1. **Never share** your JWT secrets publicly
2. **Never commit** secrets to Git
3. **Use different secrets** for:
   - Development
   - Staging/Preview
   - Production
4. **Rotate secrets** periodically (every 6-12 months)
5. **Store securely** in Vercel environment variables
6. **Minimum length:** 32 characters (but 64+ is recommended)

---

## 🔄 How to Rotate Secrets

If you need to rotate secrets:

1. **Generate new secrets** using any method above
2. **Update in Vercel** environment variables
3. **Redeploy** your application
4. **All existing tokens** will become invalid (users need to re-login)
5. **Old secrets** can be removed after confirming new ones work

---

## 📋 Complete Setup Example

```bash
# Generate all secrets at once
echo "=== JWT Secrets ==="
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo ""
echo "=== Encryption Key ==="
echo "APP_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")"
```

Copy the output and paste into Vercel environment variables.

---

## 🛠️ Alternative: Create a Script

Create a file `generate-secrets.sh`:

```bash
#!/bin/bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "APP_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")"
```

Make it executable:
```bash
chmod +x generate-secrets.sh
```

Run it:
```bash
./generate-secrets.sh
```

---

## ✅ Verification

After generating, verify:
- ✅ Length is at least 32 characters (64+ recommended)
- ✅ Contains random characters (not predictable)
- ✅ Different for JWT_SECRET and JWT_REFRESH_SECRET
- ✅ Stored securely in Vercel (not in code)

---

## 🚀 Quick Start

**Fastest way to generate both secrets:**

```bash
# Run this in your terminal
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste directly into Vercel environment variables!

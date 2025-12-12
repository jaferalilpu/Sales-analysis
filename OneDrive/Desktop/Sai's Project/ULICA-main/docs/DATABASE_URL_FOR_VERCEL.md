# Database URL for Vercel

## Your DATABASE_URL

**IMPORTANT:** The password contains special characters (`#` and `@`) which must be URL-encoded in the connection string.

### URL-Encoded Version (Use this in Vercel):

```
DATABASE_URL=postgresql://postgres:PrabhasPappu%23%40143@db.xdrplqejuaqlmqbnvuko.supabase.co:5432/postgres?schema=public
```

**Password encoding:**
- `#` → `%23`
- `@` → `%40`

### Connection Details:
- **Host:** `db.xdrplqejuaqlmqbnvuko.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** `postgres`
- **Password:** `PrabhasPappu#@143` (URL-encoded as `PrabhasPappu%23%40143`)

---

## How to Set in Vercel

1. Go to **Vercel Dashboard** → Your Backend Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:PrabhasPappu%23%40143@db.xdrplqejuaqlmqbnvuko.supabase.co:5432/postgres?schema=public`
   - **Environments:** Production, Preview, Development (select all)
5. Click **Save**
6. **Redeploy** your project

---

## Security Note

⚠️ **Keep this password secure!** 
- Never commit this to Git
- Only use in Vercel environment variables
- Consider rotating the password periodically

---

## Test Connection

After setting the environment variable, you can test the connection by:

1. **Using Prisma Studio:**
   ```bash
   cd backend
   npx prisma studio
   ```

2. **Running migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Or create the schema directly:**
   ```bash
   psql "postgresql://postgres:PrabhasPappu%23%40143@db.xdrplqejuaqlmqbnvuko.supabase.co:5432/postgres" -f docs/DATABASE_SCHEMA.sql
   ```

---

## Alternative: Using Connection Pooler (Recommended for Supabase)

Supabase provides a connection pooler. You might want to use:

```
DATABASE_URL=postgresql://postgres.fnmypthchobllrrwtozh:PrabhasPappu%23%40143@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?schema=public
```

Check your Supabase dashboard for the correct pooler URL.


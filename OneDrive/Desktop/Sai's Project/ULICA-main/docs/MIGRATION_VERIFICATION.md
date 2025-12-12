# Database Migration Verification Guide

This guide helps verify that all database migrations have been applied correctly.

## Prerequisites

- PostgreSQL database running
- `DATABASE_URL` environment variable set
- Prisma CLI installed (`npm install -g prisma` or `npx prisma`)

## Verification Steps

### 1. Check Migration Status

```bash
cd backend
npx prisma migrate status
```

**Expected Output:**
```
Database schema is up to date!
```

If migrations are pending, you'll see:
```
X migrations found in prisma/migrations
X migrations applied to database
```

### 2. List All Migrations

```bash
npx prisma migrate list
```

**Expected Migrations:**
1. `20251112134817_init` - Initial schema
2. `20251112134906_add_user_name_field` - User name field
3. `20251112142000_add_drops_and_inventory_alerts` - Drops and inventory
4. `20251112153000_enforce_order_status_enums` - Order status enums
5. `20251112160000_add_payment_transactions` - Payment transactions
6. `20251112173000_add_email_logs` - Email logs

### 3. Verify Schema Sync

```bash
npx prisma db pull
npx prisma generate
```

This ensures:
- Prisma client is in sync with database
- All models are available in code

### 4. Test Database Connection

```bash
cd backend
npm run db:generate
```

**Expected:** No errors, Prisma client generated successfully

### 5. Verify Critical Tables

Connect to your database and verify these tables exist:

```sql
-- Check critical tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'User', 'Product', 'ProductVariant', 'Order', 
  'OrderItem', 'CartItem', 'PaymentTransaction',
  'EmailLog', 'Drop', 'Category'
);
```

**Expected:** All tables should exist

### 6. Verify Enums

```sql
-- Check OrderStatus enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'OrderStatus'
);

-- Check PaymentStatus enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'PaymentStatus'
);
```

**Expected OrderStatus values:**
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- returned

**Expected PaymentStatus values:**
- pending
- paid
- failed
- refunded

### 7. Verify Relations

```sql
-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Expected:** All foreign key relationships should be present

### 8. Verify Indexes

```sql
-- Check indexes on critical columns
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('User', 'Product', 'Order', 'OrderItem')
ORDER BY tablename, indexname;
```

**Expected:** Indexes on:
- `User.email` (unique)
- `Product.slug` (unique)
- `Order.orderNumber` (unique)
- `Order.userId`
- `OrderItem.orderId`

## Troubleshooting

### Migration Failed

If a migration fails:

1. **Check Error Message**
   ```bash
   npx prisma migrate status
   ```

2. **Rollback (if needed)**
   ```bash
   # Manual rollback - connect to DB and drop failed migration
   # Or restore from backup
   ```

3. **Retry Migration**
   ```bash
   npx prisma migrate deploy
   ```

### Schema Drift

If schema is out of sync:

1. **Reset (Development Only)**
   ```bash
   npx prisma migrate reset
   ```
   ⚠️ **WARNING**: This deletes all data!

2. **Create New Migration**
   ```bash
   npx prisma migrate dev --name fix_schema_drift
   ```

### Missing Tables

If tables are missing:

1. **Apply All Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify Prisma Client**
   ```bash
   npx prisma generate
   ```

## Production Deployment

### Pre-Deployment

1. **Backup Database**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **Test Migrations on Staging**
   ```bash
   DATABASE_URL=$STAGING_DB_URL npx prisma migrate deploy
   ```

3. **Verify Staging**
   - Run all verification steps above
   - Test critical user flows
   - Check logs for errors

### Deployment

1. **Apply Migrations**
   ```bash
   DATABASE_URL=$PRODUCTION_DB_URL npx prisma migrate deploy
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Verify**
   ```bash
   npx prisma migrate status
   ```

### Post-Deployment

1. **Run Health Check**
   ```bash
   ./scripts/production-health-check.sh
   ```

2. **Monitor Logs**
   - Check for migration-related errors
   - Verify application starts correctly
   - Test database queries

## Migration Best Practices

1. **Always test migrations on staging first**
2. **Backup database before production migrations**
3. **Use transactions for data migrations**
4. **Keep migrations small and focused**
5. **Never modify existing migrations**
6. **Document breaking changes**

## Quick Reference

```bash
# Check status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# View migration history
npx prisma migrate list

# Create new migration (dev only)
npx prisma migrate dev --name migration_name
```

## Support

If you encounter issues:
1. Check Prisma documentation: https://www.prisma.io/docs
2. Review migration files in `backend/prisma/migrations/`
3. Check application logs for detailed error messages


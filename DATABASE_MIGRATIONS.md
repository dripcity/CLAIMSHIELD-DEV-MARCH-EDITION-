# Database Migrations Guide

This guide covers database schema management and migrations for ClaimShield DV.

## Overview

ClaimShield DV uses:
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit

## Schema Structure

### Tables

1. **users**
   - Stores user account information
   - Links to Clerk authentication
   - Tracks subscription and reports remaining

2. **appraisals**
   - Main appraisal data
   - JSONB fields for complex nested data
   - Foreign key to users with cascade delete

3. **comparable_vehicles**
   - Comparable vehicle data for valuations
   - Foreign key to appraisals with cascade delete
   - Includes adjustment calculations

### Indexes

- `appraisals_user_id_idx` - Fast user queries
- `appraisals_status_idx` - Status filtering
- `comparables_appraisal_id_idx` - Appraisal joins

## Migration Workflow

### 1. Making Schema Changes

Edit `lib/db/schema.ts`:

```typescript
// Example: Adding a new field
export const users = pgTable('users', {
  // ... existing fields
  newField: text('new_field'), // Add new field
});
```

### 2. Generate Migration

```bash
npm run db:generate
```

This creates a new migration file in `drizzle/migrations/` with SQL statements.

### 3. Review Migration

Check the generated SQL file:

```sql
-- Example migration file
ALTER TABLE "users" ADD COLUMN "new_field" text;
```

**Important**: Always review migrations before applying!

### 4. Apply Migration

#### Development

```bash
npm run db:migrate
```

#### Production

```bash
# Set production database URL
DATABASE_URL="production-url" npm run db:migrate
```

### 5. Verify Changes

```bash
# Open Drizzle Studio to inspect database
npm run db:studio
```

## Common Migration Scenarios

### Adding a Column

```typescript
// 1. Update schema
export const users = pgTable('users', {
  // ... existing fields
  phoneNumber: text('phone_number'),
});

// 2. Generate and apply
npm run db:generate
npm run db:migrate
```

### Adding a Table

```typescript
// 1. Define new table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Generate and apply
npm run db:generate
npm run db:migrate
```

### Adding an Index

```typescript
// 1. Add index to schema
export const notificationsUserIdIdx = index('notifications_user_id_idx')
  .on(notifications.userId);

// 2. Generate and apply
npm run db:generate
npm run db:migrate
```

### Modifying a Column

```typescript
// 1. Update schema (e.g., make field required)
export const users = pgTable('users', {
  // ... existing fields
  email: text('email').notNull(), // Added .notNull()
});

// 2. Generate migration
npm run db:generate

// 3. Review generated SQL - may need manual adjustment
// 4. Apply migration
npm run db:migrate
```

### Renaming a Column

**Warning**: Drizzle will drop and recreate the column, losing data!

Manual approach:

```sql
-- Create custom migration file
-- drizzle/migrations/0001_rename_column.sql
ALTER TABLE "users" RENAME COLUMN "old_name" TO "new_name";
```

Then update schema to match.

### Dropping a Column

```typescript
// 1. Remove from schema
export const users = pgTable('users', {
  // ... removed field
});

// 2. Generate and apply
npm run db:generate
npm run db:migrate
```

## Migration Best Practices

### Before Migration

1. **Backup Database**
   ```bash
   # Neon provides automatic backups
   # Create manual snapshot in Neon Console
   ```

2. **Test in Development**
   ```bash
   # Always test migrations locally first
   npm run db:migrate
   ```

3. **Review SQL**
   - Check generated SQL files
   - Verify no data loss
   - Check for breaking changes

### During Migration

1. **Use Transactions**
   - Drizzle migrations are transactional by default
   - If migration fails, it rolls back

2. **Monitor Progress**
   ```bash
   # Watch migration logs
   npm run db:migrate
   ```

3. **Verify Success**
   ```bash
   # Check database after migration
   npm run db:studio
   ```

### After Migration

1. **Test Application**
   - Verify all features work
   - Check data integrity
   - Test API endpoints

2. **Monitor Errors**
   - Check application logs
   - Monitor error tracking (Sentry)

3. **Document Changes**
   - Update schema documentation
   - Note breaking changes
   - Update API documentation if needed

## Rollback Strategy

### Automatic Rollback

If migration fails, Drizzle automatically rolls back the transaction.

### Manual Rollback

1. **Identify Migration**
   ```bash
   # Check migration history
   ls drizzle/migrations/
   ```

2. **Create Rollback SQL**
   ```sql
   -- Example: Rollback adding column
   ALTER TABLE "users" DROP COLUMN "new_field";
   ```

3. **Apply Rollback**
   ```bash
   # Connect to database and run SQL
   psql $DATABASE_URL -c "ALTER TABLE users DROP COLUMN new_field;"
   ```

4. **Update Schema**
   - Revert schema.ts changes
   - Remove migration file

### Point-in-Time Recovery

Neon supports point-in-time recovery:

1. Go to Neon Console
2. Select project
3. Click "Restore"
4. Choose restore point (up to 7 days)

## Troubleshooting

### Migration Fails

**Error**: "relation already exists"

```bash
# Solution: Drop and recreate
npm run db:push --force
```

**Error**: "column does not exist"

```bash
# Solution: Check schema matches database
npm run db:studio
# Manually fix discrepancies
```

### Schema Drift

If schema and database are out of sync:

```bash
# Push schema to database (overwrites)
npm run db:push

# Warning: This can cause data loss!
```

### Connection Issues

**Error**: "connection refused"

```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Verify Neon database is running
# Check Neon Console
```

## Advanced Topics

### Custom Migrations

For complex migrations, create custom SQL:

```bash
# Create migration file manually
touch drizzle/migrations/0001_custom.sql
```

```sql
-- drizzle/migrations/0001_custom.sql
BEGIN;

-- Your custom SQL here
UPDATE users SET role = 'individual' WHERE role IS NULL;

COMMIT;
```

### Data Migrations

For migrating data:

```typescript
// scripts/migrate-data.ts
import { db } from './lib/db';
import { users } from './lib/db/schema';

async function migrateData() {
  // Example: Update all users
  await db.update(users)
    .set({ role: 'individual' })
    .where(eq(users.role, null));
}

migrateData();
```

Run with:
```bash
tsx scripts/migrate-data.ts
```

### Zero-Downtime Migrations

For production with zero downtime:

1. **Add new column (nullable)**
2. **Deploy code that writes to both old and new**
3. **Backfill data**
4. **Deploy code that reads from new**
5. **Remove old column**

## Monitoring

### Check Migration Status

```bash
# List applied migrations
ls drizzle/migrations/

# Check database schema
npm run db:studio
```

### Performance Monitoring

After migrations, monitor:
- Query performance
- Index usage
- Table sizes

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For migration issues:
- Check Drizzle Discord
- Review Neon documentation
- Contact DevOps team

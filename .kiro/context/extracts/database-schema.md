# Database Schema Requirements

## Missing Indexes

From comprehensive report - these indexes are required but not in schema:
```typescript
// lib/db/schema.ts - ADD THESE

export const appraisals = pgTable('appraisals', {
  // ... existing fields
}, (table) => ({
  // ADD these indexes
  userIdIdx: index('appraisals_user_id_idx').on(table.userId),
  statusIdx: index('appraisals_status_idx').on(table.status),
}));

export const comparableVehicles = pgTable('comparable_vehicles', {
  // ... existing fields
}, (table) => ({
  // ADD this index
  appraisalIdIdx: index('comparable_vehicles_appraisal_id_idx').on(table.appraisalId),
}));
```

## Migration Generation

After adding indexes:
```bash
npm run drizzle-kit generate:pg
```

This creates migration files in `drizzle/` directory.

## Seed Script

Create `scripts/seed.ts`:
```typescript
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';

export async function seed() {
  // Insert test users
  await db.insert(users).values([
    { clerkId: 'test_user_1', email: 'test@example.com', role: 'individual' },
  ]);
  
  // Insert test appraisals
  // ...
}

if (require.main === module) {
  seed().then(() => console.log('Seeded'));
}
```

Add to `package.json`:
```json
"scripts": {
  "db:seed": "tsx scripts/seed.ts"
}
```

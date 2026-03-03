# ClaimShield DV - Master Task Roadmap
## 24/7 Agent-Driven Development Plan

**Generated**: March 2, 2026  
**Methodology**: Zero-tolerance gap analysis against master specifications  
**Development Model**: Parallel multi-agent execution with 12-hour human oversight rotations

---

## PHASE 0: CRITICAL BLOCKERS (MUST COMPLETE FIRST)
**Duration**: 1 day  
**Blocking**: ALL other work  
**Agent Assignment**: Primary agent only

### Task ID: P0-001
**Priority**: P0 - LAUNCH BLOCKER  
**Category**: Bug Fix  
**Phase**: 0  
**Estimated Agent-Hours**: 0.25  
**Dependencies**: None  
**Assignable to Agent Type**: Code Generation

**Description**:
Fix ESLint errors in resources/page.tsx preventing build from completing.

**Acceptance Criteria**:
- [ ] All 32 ESLint errors resolved
- [ ] `npm run build` completes successfully with zero errors
- [ ] No warnings about unescaped entities

**Files to Modify**:
- `app/(dashboard)/resources/page.tsx`

**Technical Approach**:
Replace all unescaped quotes with HTML entities:
- `'` → `&apos;` or `&#39;`
- `"` → `&quot;` or `&#34;`

Or use proper JSX escaping with template literals.

**Validation Method**:
```bash
npm run build
# Must complete with exit code 0
```

**Risks/Blockers**: None

---

### Task ID: P0-002
**Priority**: P0 - CRITICAL SECURITY  
**Category**: Security  
**Phase**: 0  
**Estimated Agent-Hours**: 0.5  
**Dependencies**: None  
**Assignable to Agent Type**: Code Generation

**Description**:
Remove exposed API keys from repository and rotate all compromised credentials.

**Acceptance Criteria**:
- [ ] Delete `.agent/env.local` from repository
- [ ] Add `*.env.local` and `.env.local` to `.gitignore`
- [ ] Verify file is not tracked in git
- [ ] Document key rotation requirements for human operator

**Files to Modify**:
- `.gitignore` (add entries)
- `.agent/env.local` (DELETE)

**Technical Approach**:
1. Add to `.gitignore`:
```
# Environment files
.env.local
.env*.local
*.env.local
```

2. Remove from git:
```bash
git rm --cached .agent/env.local
git commit -m "Remove exposed API keys"
```

3. Create rotation checklist for human:
- Clerk: Rotate secret key at dashboard.clerk.com
- Stripe: Rotate secret key at dashboard.stripe.com

**Validation Method**:
```bash
git status
# Should not show .agent/env.local as tracked
```

**Risks/Blockers**: 
- Requires human to rotate keys in external dashboards
- Must update deployment environment variables

---

### Task ID: P0-003
**Priority**: P0 - LAUNCH BLOCKER  
**Category**: Testing  
**Phase**: 0  
**Estimated Agent-Hours**: 3  
**Dependencies**: None  
**Assignable to Agent Type**: Code Generation

**Description**:
Fix hanging test suite by configuring test database and environment.

**Acceptance Criteria**:
- [ ] All 9 test files execute without hanging
- [ ] Test database configured with proper connection
- [ ] Tests pass or fail with clear results (not timeout)
- [ ] `npm run test:run` completes in under 30 seconds

**Files to Modify**:
- `vitest.config.ts` (create if missing)
- `tests/setup.ts` (create)
- `.env.test` (create)

**Technical Approach**:
1. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

2. Create `tests/setup.ts`:
```typescript
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.GEMINI_API_KEY = 'test-key';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

3. Mock database connections in tests

**Validation Method**:
```bash
npm run test:run
# Should complete with results, not hang
```

**Risks/Blockers**:
- May need to set up test database
- Some tests may require external API mocks

---

### Task ID: P0-004
**Priority**: P0 - CONFIGURATION  
**Category**: Architecture  
**Phase**: 0  
**Estimated Agent-Hours**: 0.5  
**Dependencies**: None  
**Assignable to Agent Type**: Code Generation

**Description**:
Create vercel.json configuration for PDF generation timeout extension.

**Acceptance Criteria**:
- [ ] `vercel.json` file created
- [ ] PDF generation route configured with 60s timeout
- [ ] Memory allocation set to 3008MB

**Files to Modify**:
- `vercel.json` (CREATE)

**Technical Approach**:
Create `vercel.json` in project root:
```json
{
  "functions": {
    "app/api/appraisals/[id]/generate-pdf/route.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

**Validation Method**:
- File exists and is valid JSON
- Matches specification from Greenfield Phase 6, Task 6.3

**Risks/Blockers**: None

---

## PHASE 1: DATABASE SCHEMA COMPLETION
**Duration**: 1-2 days  
**Dependencies**: Phase 0 complete  
**Parallel Tracks**: Can run 2 agents simultaneously

### Task ID: P1-001
**Priority**: P1 - REVENUE RISK  
**Category**: Database  
**Phase**: 1  
**Estimated Agent-Hours**: 2  
**Dependencies**: P0-001, P0-002, P0-003  
**Assignable to Agent Type**: Database

**Description**:
Add missing fields to users table to match specification.

**Acceptance Criteria**:
- [ ] `fullName` text field added
- [ ] `onboardingComplete` boolean field added (default false)
- [ ] `reportsRemaining` renamed to `reportsAvailable`
- [ ] Migration generated and applied
- [ ] Verified in Neon console

**Files to Modify**:
- `lib/db/schema.ts`

**Technical Approach**:
1. Update schema:
```typescript
export const users = pgTable('users', {
  // ... existing fields ...
  fullName: text('full_name'),  // ADD
  onboardingComplete: boolean('onboarding_complete').default(false),  // ADD
  reportsAvailable: integer('reports_available').default(0),  // RENAME from reportsRemaining
  // ... rest of fields ...
});
```

2. Generate migration:
```bash
npm run db:generate
```

3. Apply migration:
```bash
npm run db:push
```

**Validation Method**:
- Check Neon console for new fields
- Query database to verify schema

**Risks/Blockers**:
- Renaming field may require data migration
- Existing code references `reportsRemaining` must be updated

---

### Task ID: P1-002
**Priority**: P1 - REVENUE RISK  
**Category**: Database  
**Phase**: 1  
**Estimated Agent-Hours**: 2  
**Dependencies**: P0-001, P0-002, P0-003  
**Assignable to Agent Type**: Database

**Description**:
Add missing fields to appraisals table to match specification.

**Acceptance Criteria**:
- [ ] `ownerState` text field added
- [ ] `aiExtractionData` JSONB field added
- [ ] Index created on `ownerState` for legal citation lookups
- [ ] Migration generated and applied

**Files to Modify**:
- `lib/db/schema.ts`

**Technical Approach**:
1. Update schema:
```typescript
export const appraisals = pgTable('appraisals', {
  // ... existing fields ...
  ownerState: text('owner_state').notNull(),  // ADD
  aiExtractionData: jsonb('ai_extraction_data').$type<AIExtractionData>(),  // ADD
  // ... rest of fields ...
}, (table) => ({
  // ... existing indexes ...
  ownerStateIdx: index('appraisals_owner_state_idx').on(table.ownerState),  // ADD
}));
```

2. Define AIExtractionData type in types file (see Task P1-005)

3. Generate and apply migration

**Validation Method**:
- Verify fields exist in Neon console
- Verify index created

**Risks/Blockers**:
- Requires types/ directory to be created first
- Existing appraisals may need default values


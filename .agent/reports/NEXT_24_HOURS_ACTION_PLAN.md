# ClaimShield DV - Next 24 Hours Action Plan
## Immediate Priorities for Agent Execution

**Generated**: March 2, 2026  
**Objective**: Unblock development and establish foundation for parallel workstreams  
**Success Criteria**: Build passes, tests run, security vulnerabilities closed

---

## HOUR 0-1: CRITICAL SECURITY & BUILD FIXES

### Action 1: Fix Build Failure (15 minutes)
**Agent**: Code Generation  
**Task ID**: P0-001

**Steps**:
1. Open `app/(dashboard)/resources/page.tsx`
2. Find all instances of unescaped `'` and `"`
3. Replace with HTML entities or proper JSX escaping
4. Run `npm run build` to verify
5. Commit: "fix: escape quotes in resources page for ESLint compliance"

**Verification**:
```bash
npm run build
# Exit code must be 0
```

---

### Action 2: Remove Exposed API Keys (15 minutes)
**Agent**: Code Generation  
**Task ID**: P0-002

**Steps**:
1. Add to `.gitignore`:
```
# Environment files
.env.local
.env*.local
*.env.local
.agent/env.local
```

2. Remove from git:
```bash
git rm --cached .agent/env.local
git add .gitignore
git commit -m "security: remove exposed API keys and update gitignore"
```

3. Create `SECURITY_ALERT.md` for human operator:
```markdown
# SECURITY ALERT - API Key Rotation Required

The following API keys were exposed in the repository and MUST be rotated immediately:

## Clerk
- Dashboard: https://dashboard.clerk.com
- Action: Rotate secret key
- Old key (compromised): sk_test_UNHuI...

## Stripe  
- Dashboard: https://dashboard.stripe.com/apikeys
- Action: Rotate secret key
- Old key (compromised): sk_test_51SWa...

After rotation, update:
1. .env.local (local development)
2. Vercel environment variables (production)
```

**Verification**:
```bash
git status
# .agent/env.local should not appear
```

---

## HOUR 1-4: TEST SUITE CONFIGURATION

### Action 3: Configure Test Environment (3 hours)
**Agent**: Code Generation  
**Task ID**: P0-003

**Steps**:
1. Create `vitest.config.ts` (see task details)
2. Create `tests/setup.ts` with mocks
3. Create `.env.test` with test credentials
4. Run tests: `npm run test:run`
5. Debug any remaining failures
6. Document test setup in README

**Verification**:
```bash
npm run test:run
# Should complete in < 30 seconds
# Tests may fail but should not hang
```

---

### Action 4: Create Vercel Configuration (30 minutes)
**Agent**: Code Generation  
**Task ID**: P0-004

**Steps**:
1. Create `vercel.json` in project root
2. Configure PDF generation timeout
3. Commit: "config: add vercel.json for PDF generation timeout"

**Verification**:
- File exists and is valid JSON

---

## HOUR 4-8: DATABASE SCHEMA FIXES

### Action 5: Fix Users Table Schema (2 hours)
**Agent**: Database  
**Task ID**: P1-001

**Steps**:
1. Update `lib/db/schema.ts` - users table
2. Add `fullName`, `onboardingComplete` fields
3. Rename `reportsRemaining` to `reportsAvailable`
4. Generate migration: `npm run db:generate`
5. Review migration SQL
6. Apply: `npm run db:push`
7. Verify in Neon console

**Verification**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

---

### Action 6: Fix Appraisals Table Schema (2 hours)
**Agent**: Database  
**Task ID**: P1-002

**Steps**:
1. Create `types/appraisal.ts` with AIExtractionData interface
2. Update `lib/db/schema.ts` - appraisals table
3. Add `ownerState`, `aiExtractionData` fields
4. Add index on `ownerState`
5. Generate and apply migration
6. Verify in Neon console

**Verification**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appraisals';
```

---

## HOUR 8-12: MISSING DEPENDENCIES & TYPES

### Action 7: Install Missing Dependencies (30 minutes)
**Agent**: Code Generation

**Steps**:
1. Install date-fns:
```bash
npm install date-fns
```

2. Verify no breaking changes with Zod 4.x:
```bash
npm run build
npm run test:run
```

3. If Zod 4.x causes issues, downgrade:
```bash
npm install zod@3.23.8
```

4. Update package.json and commit

---

### Action 8: Create Types Directory Structure (1 hour)
**Agent**: Code Generation

**Steps**:
1. Create `types/` directory
2. Create `types/appraisal.ts` with all JSONB interfaces
3. Create `types/ai.ts` with AI extraction types
4. Create `types/roles.ts` with RBAC types
5. Create `types/index.ts` with exports
6. Update imports across codebase

**Files to Create**:
- `types/appraisal.ts`
- `types/ai.ts`
- `types/roles.ts`
- `types/index.ts`

---

### Action 9: Create Missing Environment Variables (30 minutes)
**Agent**: Code Generation

**Steps**:
1. Update `.env.local.example`:
```bash
# Add missing variables:
CLERK_WEBHOOK_SECRET="whsec_..."
USE_MOCK_SCRAPING="true"
```

2. Document in README.md

---

### Action 10: Run Full Verification (1 hour)
**Agent**: Code Generation

**Steps**:
1. Run build: `npm run build` (must pass)
2. Run tests: `npm run test:run` (must complete)
3. Run linter: `npm run lint` (must pass)
4. Check database schema in Neon console
5. Verify all P0 tasks complete
6. Generate status report

**Verification Checklist**:
- [ ] Build passes with zero errors
- [ ] Tests run without hanging
- [ ] No exposed API keys in repository
- [ ] Database schema matches specification
- [ ] All missing dependencies installed
- [ ] Types directory created

---

## HOUR 12-24: FOUNDATION FOR PARALLEL WORK

### Action 11: Create Missing Route Structure (2 hours)
**Agent**: Code Generation

**Steps**:
1. Create wizard route: `app/(dashboard)/appraisals/[id]/wizard/page.tsx`
2. Create preview route: `app/(dashboard)/appraisals/[id]/preview/page.tsx`
3. Create templates route: `app/(dashboard)/appraisals/[id]/templates/page.tsx`
4. Add placeholder components
5. Verify routing works

---

### Action 12: Create Narratives Directory (2 hours)
**Agent**: Code Generation

**Steps**:
1. Create `lib/narratives/` directory
2. Create `legal-citations.ts` with state-specific logic
3. Create `repair-analysis.ts` with narrative generation
4. Create `market-stigma.ts` with stigma narratives
5. Add unit tests for each

---

### Action 13: Document Progress (1 hour)
**Agent**: Documentation

**Steps**:
1. Update PROGRESS.md with completed tasks
2. Update README.md with setup instructions
3. Create KNOWN_ISSUES.md with remaining gaps
4. Generate metrics:
   - Features completed: X/30
   - Tests passing: X/Y
   - Build status: PASSING
   - Security issues: RESOLVED

---

## SUCCESS METRICS FOR 24 HOURS

At the end of 24 hours, the following MUST be true:

✅ **Build Status**: PASSING
- `npm run build` completes with exit code 0
- Zero TypeScript errors
- Zero ESLint errors

✅ **Security Status**: SECURE
- No API keys in repository
- All exposed keys rotated
- .gitignore properly configured

✅ **Test Status**: FUNCTIONAL
- Tests run without hanging
- Test environment configured
- At least 50% of tests passing

✅ **Database Status**: COMPLIANT
- All required fields present
- Migrations applied successfully
- Schema matches specification

✅ **Foundation Status**: READY
- Types directory created
- Missing routes scaffolded
- Dependencies installed
- Ready for parallel agent work

---

## HANDOFF TO NEXT SHIFT

At hour 24, create handoff document with:
1. Completed tasks (with verification)
2. Blocked tasks (with blockers identified)
3. Next priorities for incoming shift
4. Any issues requiring human decision

**Template**:
```markdown
# Shift Handoff - Hour 24

## Completed
- [x] P0-001: Build fixed
- [x] P0-002: Security resolved
- [x] P0-003: Tests configured
...

## Blocked
- [ ] Task X: Waiting for API key rotation (human required)
...

## Next Priorities
1. Task Y: Ready to start
2. Task Z: Dependencies met
...

## Human Decisions Needed
- Decision 1: ...
- Decision 2: ...
```


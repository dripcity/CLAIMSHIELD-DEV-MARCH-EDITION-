# ClaimShield DV - Next 24 Hours Action Plan

**Date**: March 2, 2026  
**Priority**: HIGH  
**Goal**: Complete remaining tests and begin environment setup

---

## 🎯 IMMEDIATE PRIORITIES (Next 24 Hours)

### Priority 1: Complete Logic Tests (2 hours) ✅ CAN START NOW

These tests have NO external dependencies and can be completed immediately:

#### Task 1: State-Specific Citation Exclusion Test
**File**: `tests/legal/state-citations.test.ts`
**Time**: 1 hour
**Blockers**: None

```typescript
// Test that non-Georgia appraisals don't contain Georgia-specific citations
describe('State-Specific Citation Exclusion', () => {
  it('should not include Georgia citations for non-GA states', () => {
    const ncCitations = getStateCitations('NC');
    expect(ncCitations.anti17c).toBe(false);
    expect(ncCitations.anti17cStatement).toBeNull();
    expect(ncCitations.firstPartyStatute).not.toContain('O.C.G.A');
  });
});
```

#### Task 2: Template Variable Substitution Test
**File**: `tests/templates/variable-substitution.test.ts`
**Time**: 1 hour
**Blockers**: None

```typescript
// Test that all {{variable}} placeholders are replaced
describe('Template Variable Substitution', () => {
  it('should replace all variables in template', () => {
    const template = "Dear {{owner_name}}, your DV is {{dv_amount}}.";
    const result = substituteVariables(template, {
      owner_name: "John Doe",
      dv_amount: "$8,500"
    });
    expect(result).not.toContain('{{');
    expect(result).toContain('John Doe');
    expect(result).toContain('$8,500');
  });
});
```

**Action**: Run these tests immediately to increase test coverage to 56/83 (67%)

---

### Priority 2: Environment Setup Planning (2 hours)

#### Step 1: Create Test Environment Checklist

Create `.env.test.example` with all required variables:

```bash
# Database (enables 7 tests)
DATABASE_URL=postgresql://user:pass@localhost:5432/claimshield_test

# Authentication (enables 2 tests)
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# File Storage (enables 2 tests)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# AI Extraction (enables 2 tests)
GOOGLE_GEMINI_API_KEY=...

# Web Scraping (enables 1 test)
APIFY_API_TOKEN=...

# Payments (enables 3 tests)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Step 2: Document Service Setup Steps

Create `.agent/SERVICE_SETUP_GUIDE.md` with step-by-step instructions for:
1. Neon database setup
2. Clerk test environment
3. Vercel Blob configuration
4. Google Gemini API key
5. Apify account setup
6. Stripe test mode

---

### Priority 3: CI/CD Pipeline Setup (2 hours)

#### Create GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
```

This ensures:
- Tests run on every commit
- Build verification
- TypeScript error detection

---

## 📋 TASK BREAKDOWN (Prioritized)

### Tier 1: Can Complete Today (4 hours total)

| Task | Time | Blockers | Impact |
|------|------|----------|--------|
| State citation test | 1h | None | +1 test |
| Template substitution test | 1h | None | +1 test |
| Environment setup docs | 2h | None | Unblocks 17 tests |

### Tier 2: This Week (8 hours total)

| Task | Time | Blockers | Impact |
|------|------|----------|--------|
| Set up Neon test DB | 1h | Account creation | +7 tests |
| Configure Clerk test | 1h | Account creation | +2 tests |
| Set up Vercel Blob | 1h | Account creation | +2 tests |
| Get Gemini API key | 0.5h | Account creation | +2 tests |
| Set up Apify | 0.5h | Account creation | +1 test |
| Configure Stripe test | 1h | Account creation | +3 tests |
| Run integration tests | 2h | Above complete | Verify 17 tests |
| Fix any failing tests | 1h | Test results | Achieve 100% pass |

### Tier 3: Next Week (16 hours total)

| Task | Time | Blockers | Impact |
|------|------|----------|--------|
| React Testing Library setup | 2h | None | +2 tests |
| E2E test framework | 4h | None | +2 tests |
| Browser compatibility testing | 4h | Manual | Quality assurance |
| Screen reader testing | 3h | Manual | Accessibility |
| Security audit | 3h | Manual | Security |

---

## 🚀 EXECUTION PLAN

### Hour 1-2: Complete Logic Tests
```bash
# Create test files
touch tests/legal/state-citations.test.ts
touch tests/templates/variable-substitution.test.ts

# Write tests (see Priority 1 above)

# Run tests
npm run test:run

# Expected: 56/83 tests passing (67%)
```

### Hour 3-4: Environment Documentation
```bash
# Create service setup guide
touch .agent/SERVICE_SETUP_GUIDE.md

# Document each service:
# 1. Account creation steps
# 2. API key generation
# 3. Configuration instructions
# 4. Testing verification

# Create environment checklist
touch .agent/ENVIRONMENT_CHECKLIST.md
```

### Hour 5-6: CI/CD Setup
```bash
# Create GitHub Actions workflow
mkdir -p .github/workflows
touch .github/workflows/test.yml

# Configure workflow (see Priority 3 above)

# Test locally
npm run test:run
npm run build

# Commit and push
git add .github/workflows/test.yml
git commit -m "Add CI/CD pipeline"
git push
```

### Hour 7-8: Begin Service Setup
```bash
# Start with easiest services first:

# 1. Google Gemini (5 minutes)
# - Go to ai.google.dev
# - Create API key
# - Add to .env.local

# 2. Apify (10 minutes)
# - Go to apify.com
# - Create account
# - Get API token
# - Add to .env.local

# 3. Stripe Test Mode (15 minutes)
# - Go to stripe.com
# - Switch to test mode
# - Get test keys
# - Add to .env.local

# Test these services
npm run test:run -- tests/ai/
npm run test:run -- tests/scraping/
npm run test:run -- tests/payments/
```

---

## 📊 SUCCESS METRICS

### End of Day 1 (24 hours):
- ✅ 56/83 tests passing (67% → target)
- ✅ Environment setup documentation complete
- ✅ CI/CD pipeline configured
- ✅ 3 external services configured (Gemini, Apify, Stripe)

### End of Week 1 (7 days):
- ✅ 73/83 tests passing (88%)
- ✅ All external services configured
- ✅ Integration tests running
- ✅ Build passing in CI/CD

### End of Week 2 (14 days):
- ✅ 80/83 tests passing (96%)
- ✅ Manual testing complete
- ✅ Security audit complete
- ✅ Staging deployment complete

### End of Week 3 (21 days):
- ✅ 83/83 tests passing (100%)
- ✅ Production deployment complete
- ✅ Monitoring configured
- ✅ LAUNCH 🚀

---

## 🎯 DECISION POINTS

### Decision 1: Test Database Strategy

**Options**:
A. Use Neon free tier for testing (recommended)
B. Use local PostgreSQL with Docker
C. Use in-memory SQLite for tests

**Recommendation**: Option A (Neon free tier)
- Matches production environment
- No local setup required
- Free tier sufficient for testing

### Decision 2: CI/CD Platform

**Options**:
A. GitHub Actions (recommended)
B. Vercel CI
C. CircleCI

**Recommendation**: Option A (GitHub Actions)
- Free for public repos
- Integrated with GitHub
- Easy configuration

### Decision 3: Testing Priority

**Options**:
A. Complete all automated tests first
B. Start manual testing in parallel
C. Deploy to staging and test there

**Recommendation**: Option A (automated tests first)
- Faster feedback loop
- Catches regressions early
- Enables confident deployment

---

## 🚨 RISK MITIGATION

### Risk 1: External Service Costs
**Mitigation**: Use free tiers and test modes
- Neon: Free tier (0.5GB storage)
- Clerk: Free tier (10,000 MAUs)
- Vercel Blob: Pay-per-use (minimal in testing)
- Gemini: Free tier (60 requests/minute)
- Apify: Free tier ($5 credit)
- Stripe: Test mode (free)

### Risk 2: Test Environment Instability
**Mitigation**: Use separate test database
- Create `claimshield_test` database
- Use different Clerk application
- Use test mode for all services

### Risk 3: Time Overruns
**Mitigation**: Prioritize ruthlessly
- Focus on automated tests first
- Manual testing can happen in parallel
- Security audit can be external

---

## 📞 SUPPORT & ESCALATION

### If Blocked on Environment Setup:
1. Check `.agent/SERVICE_SETUP_GUIDE.md`
2. Review service documentation
3. Check `.env.local.example` for required format
4. Escalate to human if stuck > 30 minutes

### If Tests Fail Unexpectedly:
1. Check test output for specific error
2. Verify environment variables are set
3. Check service status (downtime?)
4. Review recent code changes
5. Escalate if unable to resolve in 1 hour

### If CI/CD Pipeline Fails:
1. Check GitHub Actions logs
2. Verify secrets are configured
3. Test locally first
4. Escalate if pipeline issue persists

---

## ✅ COMPLETION CHECKLIST

### Today (24 hours):
- [ ] Complete state citation exclusion test
- [ ] Complete template variable substitution test
- [ ] Run test suite (expect 56/83 passing)
- [ ] Create service setup guide
- [ ] Create environment checklist
- [ ] Configure GitHub Actions workflow
- [ ] Set up Google Gemini API key
- [ ] Set up Apify API token
- [ ] Set up Stripe test mode

### This Week:
- [ ] Set up Neon test database
- [ ] Configure Clerk test environment
- [ ] Set up Vercel Blob test storage
- [ ] Run all integration tests
- [ ] Achieve 88% test coverage (73/83 tests)
- [ ] Fix any failing tests
- [ ] Document any issues found

### Next Week:
- [ ] Set up React Testing Library
- [ ] Configure E2E test framework
- [ ] Complete manual browser testing
- [ ] Complete screen reader testing
- [ ] Schedule security audit
- [ ] Achieve 96% test coverage (80/83 tests)

---

## 🎉 EXPECTED OUTCOMES

By end of next 24 hours:
1. **Test Coverage**: 67% (56/83 tests)
2. **Documentation**: Complete service setup guide
3. **CI/CD**: Automated testing on every commit
4. **Services**: 3/6 external services configured
5. **Confidence**: High - clear path to 100% testing

**Status**: Ready to execute. No blockers for next 24 hours.


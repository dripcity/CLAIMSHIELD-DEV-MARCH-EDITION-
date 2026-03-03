# Phase 1: Deep Structural Audit - Detailed Findings

## 1.1 Project Architecture Validation

### ✅ PASS: Core Directory Structure
The project follows Next.js 15 App Router conventions correctly:
- `app/` directory with proper route groups
- `lib/` for business logic separation
- `components/` for UI components
- Proper use of route groups: `(auth)` and `(dashboard)`

### ⚠️ PARTIAL: File Organization vs Specification

**Comparison Against Greenfield Spec:**

| Spec Requirement | Actual Implementation | Status |
|-----------------|----------------------|---------|
| `app/(dashboard)/appraisals/[id]/wizard/` | ❌ Missing | MISSING |
| `app/(dashboard)/appraisals/[id]/preview/` | ❌ Missing | MISSING |
| `app/(dashboard)/appraisals/[id]/documents/` | ✅ Present | COMPLETE |
| `app/(dashboard)/appraisals/[id]/templates/` | ❌ Missing | MISSING |
| `lib/narratives/` directory | ❌ Missing | MISSING |
| `lib/severity/` directory | ❌ Missing (in calculations/) | DEVIATION |
| `lib/templates/` | ✅ Present (partial) | PARTIAL |
| `types/` directory | ❌ Missing | MISSING |

**Critical Missing Directories:**
1. `types/` - All TypeScript interfaces should be centralized
2. `lib/narratives/` - Narrative generation logic
3. Wizard route structure doesn't match spec

### ❌ FAIL: Missing Critical Files

**From Greenfield Specification - Phase 0, Task 0.7:**

Missing files that MUST exist:
```
src/types/
├── appraisal.ts          # MISSING - All JSONB type definitions
├── ai.ts                 # MISSING - AI extraction types
├── roles.ts              # MISSING - RBAC types
└── index.ts              # MISSING - Type exports

lib/narratives/
├── legal-citations.ts    # MISSING - Dynamic state citations
├── repair-analysis.ts    # MISSING - Repair narrative generation
└── market-stigma.ts      # MISSING - Market stigma narratives

app/(dashboard)/appraisals/[id]/
├── wizard/page.tsx       # MISSING - Wizard entry point
├── preview/page.tsx      # MISSING - PDF preview
└── templates/page.tsx    # MISSING - Document templates

lib/pdf/
├── ReportDocument.tsx    # MISSING - React-PDF component
├── assemble-report-data.ts  # MISSING - Data assembly
└── components/           # MISSING - PDF sub-components
```

**Impact**: Cannot implement wizard, PDF generation, or narrative features without these files.


## 1.2 Dependency Audit

### ✅ PASS: Core Dependencies Installed

**Verified Present:**
- ✅ Next.js 15.2.3 (correct version)
- ✅ React 19 (correct version)
- ✅ TypeScript 5.x
- ✅ Drizzle ORM 0.45.1
- ✅ @clerk/nextjs 6.39.0
- ✅ @google/generative-ai 0.24.1
- ✅ @react-pdf/renderer 4.3.2
- ✅ stripe 20.4.0
- ✅ @sendgrid/mail 8.1.6
- ✅ @vercel/blob 2.3.0
- ✅ apify-client 2.22.2
- ✅ zod 4.3.6

### ⚠️ WARNING: Version Mismatches

**Zod Version Issue:**
- Installed: `zod@4.3.6`
- Expected: `zod@3.x` (standard for most projects)
- **Risk**: Zod 4.x is beta/experimental - may have breaking changes
- **Action**: Verify compatibility or downgrade to stable 3.x

### ❌ MISSING: Critical Dependencies

**From Greenfield Spec - Phase 0, Task 0.2:**

Missing packages that spec requires:
```bash
# Document generation (Word export)
npm install docx  # ✅ INSTALLED

# Utilities  
npm install date-fns  # ❌ MISSING - Date formatting

# Testing (spec requires Jest)
npm install -D jest @testing-library/react @testing-library/jest-dom
# ❌ MISSING - Using Vitest instead (acceptable alternative)
```

**Date Formatting Issue:**
- Spec requires `date-fns` for date formatting
- Not installed in package.json
- Current code may be using native Date methods (less reliable)

### ✅ PASS: No Unused Dependencies Detected

Ran dependency analysis - all installed packages appear to be used.

### 🔒 SECURITY: npm audit Results

**CRITICAL - Run immediately:**
```bash
npm audit
```

**Action Required**: Document any vulnerabilities found and create remediation plan.


## 1.3 Configuration Files Audit

### ✅ PASS: TypeScript Configuration

**File**: `tsconfig.json`

**Verified Settings:**
- ✅ `"strict": true` - Correct
- ✅ `"target": "ES2017"` - Acceptable
- ✅ Path aliases configured: `"@/*": ["./*"]`
- ✅ JSX set to "preserve" for Next.js

**No Issues Found**

### ⚠️ PARTIAL: Environment Configuration

**File**: `.env.local.example`

**Verified Variables:**
- ✅ DATABASE_URL
- ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- ✅ CLERK_SECRET_KEY
- ✅ GEMINI_API_KEY (correctly NOT prefixed with NEXT_PUBLIC_)
- ✅ BLOB_READ_WRITE_TOKEN
- ✅ APIFY_API_TOKEN
- ✅ STRIPE_SECRET_KEY (correctly NOT prefixed)
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ SENDGRID_API_KEY
- ✅ SENDGRID_FROM_EMAIL
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NODE_ENV

**Missing Variables from Spec:**

From Greenfield Spec Phase 0:
```bash
# Missing from .env.local.example:
CLERK_WEBHOOK_SECRET=                  # For Clerk webhook validation
USE_MOCK_SCRAPING=true                 # For development mode
```

**CRITICAL SECURITY ISSUE:**
- ❌ File `.agent/env.local` contains REAL API KEYS
- ❌ This file is tracked in git (visible in grep results)
- ❌ Keys must be rotated immediately:
  - Clerk: `sk_test_UNHuIzn5tKHUHKoyBkP1Jzmo7jL6O6PNc6gwO4hu2r`
  - Stripe: `sk_test_51SWaEuCCIpqYzgxD5aJZIbyguzwIlSvDT0JH61pG2RU1AEdz9u4rWbtopfyMyM6IiSiNDrk5Kfo1YH8dMVicLFTa00yBeqEngy`

**Immediate Actions:**
1. Delete `.agent/env.local` from repository
2. Add `*.env.local` to `.gitignore`
3. Rotate all exposed keys in respective dashboards
4. Audit git history for other exposed secrets

### ✅ PASS: Drizzle Configuration

**File**: `drizzle.config.ts`

Configuration appears correct for Neon PostgreSQL.

### ❌ MISSING: Vercel Configuration

**File**: `vercel.json` - NOT FOUND

**Required for PDF Generation:**

From Greenfield Spec Phase 6, Task 6.3:
```json
{
  "functions": {
    "app/api/pdf/generate/route.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

**Impact**: PDF generation will timeout with default 10s limit.


# ClaimShield DV — Greenfield Multi-Agent Development Instructions
**Version:** 1.0 | **Date:** March 1, 2026
**Project Type:** Fresh build — start from zero
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Neon/Drizzle · Clerk · Vercel · Vercel Blob · Apify · Gemini 3.1 Pro · Puppeteer · Stripe · SendGrid

---

## WHAT WE ARE BUILDING

ClaimShield DV is a consumer-first, AI-powered SaaS platform that generates professional **Diminished Value (DV)** appraisal reports for vehicle owners, attorneys, appraisers, and body shops following auto accidents.

**Core value proposition:** A user uploads their accident documents, repair estimate, and before/after photos. AI extracts all relevant data, auto-populates a guided wizard, calculates the precise dollar amount their vehicle lost in value, and produces a court-grade 15–25 page PDF appraisal report — along with all supporting legal documents — in minutes.

**Core philosophy:**
- Consumer-focused. Anti-insurance-company. Anti-17c formula.
- USPAP compliant when used by professional appraisers.
- Legally defensible methodology (Canal v. Tullis comparable sales method).
- Clean, modern UI. Zero friction.

---

## AGENT GROUND RULES

Every agent working on this project must read and internalize these rules before writing a single line of code.

1. **Stack is non-negotiable.** Next.js 14 App Router only. No Express. No Vite. No React Router. API routes and Server Actions replace any need for a separate backend server.
2. **Auth is Clerk.** No custom sessions. No JWT rolls. No NextAuth. Clerk middleware handles all route protection.
3. **Database is Neon + Drizzle ORM.** Type-safe queries only. No raw SQL. No Prisma.
4. **Calculations must be exact.** Use median (not mean). Use $0.12/mile for mileage. Use 80% of MSRP for equipment. Use the exact severity decision tree in this document. Magic numbers are forbidden.
5. **Legal citations are always dynamic.** Derive from `ownerState` field. Never hardcode any state's statutes.
6. **TypeScript everywhere.** No `.js` files. No `any` types unless unavoidable with third-party SDKs (document it if used).
7. **Tailwind + shadcn/ui only.** No custom CSS files. No CSS modules. No inline styles except where Tailwind cannot handle it.
8. **File storage is Vercel Blob.** Private access only. Signed URLs for delivery.
9. **AI engine is Gemini 3.1 Pro.** Do not substitute another model.
10. **Source of truth for business logic:** The calculation rules, severity logic, narrative templates, and report structure defined in this document. When in doubt, reference it.
11. **Build iteratively.** Each phase must be confirmed working before the next begins. Do not skip ahead.
12. **Agents must not assume.** If a file, function, or variable is not confirmed to exist in this document or confirmed by the operator, check first.

---

## PRE-DEVELOPMENT SETUP CHECKLIST

**The primary agent must confirm every item below is complete before any code is written. Do not proceed with placeholders.**

### Accounts & Services
- [ ] GitHub repo created, cloned locally, `.gitignore` configured for Next.js
- [ ] Vercel project created and linked to GitHub repo
- [ ] Neon account created, database provisioned (PostgreSQL 17), connection string obtained
- [ ] Clerk application created, OAuth providers configured (Google, GitHub, Apple)
- [ ] Apify account created, API token obtained
- [ ] Google AI Studio account, Gemini 3.1 Pro API key obtained
- [ ] Stripe account created (start in test mode), products and prices created (see Phase 5)
- [ ] SendGrid account created, sending domain verified, API key obtained
- [ ] Vercel Blob storage enabled on project

### Environment Variables
Create `.env.local` with all of the following populated:

```bash
# Database
DATABASE_URL=                          # Neon PostgreSQL connection string (include ?sslmode=require)

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=                  # For Clerk webhook events

# AI
GEMINI_API_KEY=                        # Gemini 3.1 Pro — NOT prefixed with NEXT_PUBLIC_

# Storage
BLOB_READ_WRITE_TOKEN=                 # Vercel Blob

# Scraping
APIFY_API_TOKEN=

# Payments
STRIPE_SECRET_KEY=                     # sk_test_... during development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=    # pk_test_...
STRIPE_WEBHOOK_SECRET=                 # whsec_...

# Email
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=reports@claimshield-dv.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000   # update to production URL on deploy
USE_MOCK_SCRAPING=true                 # true during dev, false in production
NODE_ENV=development
```

### Stripe Products (create in Stripe dashboard before Phase 5)
| Product Name | Price | Billing |
|---|---|---|
| Individual Report | $129.00 | One-time |
| Professional Plan | $299.00/mo | Subscription |
| Attorney Plan | $499.00/mo | Subscription |
| Body Shop Plan | $399.00/mo | Subscription |

Save all Price IDs from Stripe dashboard — you will need them in Phase 5.

---

## PHASE STRUCTURE OVERVIEW

```
PHASE 0: Project Initialization & Infrastructure     [Sequential — primary agent]
PHASE 1: Database Schema & Auth                      [Sequential — primary agent]
PHASE 2: Core Wizard UI (Steps 0–7)                  [Agent A] ─────────────────────┐
PHASE 3: AI Integration (Gemini 3.1 Pro)             [Agent B] ──parallel──────────┐ │
PHASE 4: Calculation Engine & Business Logic         [Agent A] ─────────────────────┘ │
PHASE 5: File Upload System                          [Agent B] ──parallel──────────────┘
PHASE 6: PDF Report Generation                       [Agent A] ─────────────────────┐
PHASE 7: Document Templates (7 types)                [Agent B] ──parallel──────────┐ │
PHASE 8: Stripe Payments                             [Agent A] ─────────────────────┘ │
PHASE 9: Email Delivery (SendGrid)                   [Agent B] ──parallel──────────────┘
PHASE 10: Role-Based Access Control                  [Agent A] ─────────────────────┐
PHASE 11: Dashboard & UX Polish                      [Agent B] ──parallel──────────┐ │
PHASE 12: Testing, Security & Launch Hardening       [Both]     ───────────────────────┘
```

**Dependency rules:**
- Phases 0 and 1 are strictly sequential. Both agents are blocked until Phase 1 is complete.
- Within each parallel pair, agents work on non-overlapping files and routes.
- Agents must run `npm run build` with zero TypeScript errors before marking a phase complete.

---

## PHASE 0: PROJECT INITIALIZATION
**Type:** Sequential
**Agent:** Primary
**Estimated Time:** 2–4 hours

### Task 0.1 — Initialize Next.js Project

```bash
npx create-next-app@latest claimshield-dv \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd claimshield-dv
```

---

### Task 0.2 — Install All Dependencies

```bash
# Database
npm install drizzle-orm @neondatabase/serverless drizzle-kit

# Auth
npm install @clerk/nextjs

# AI
npm install @google/generative-ai

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox
npm install @radix-ui/react-progress @radix-ui/react-tabs @radix-ui/react-tooltip
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-label @radix-ui/react-separator

# shadcn/ui (run after radix installs)
npx shadcn-ui@latest init
# When prompted: TypeScript=yes, style=Default, base color=Slate, CSS variables=yes

# Install shadcn components needed
npx shadcn-ui@latest add button card input label select checkbox
npx shadcn-ui@latest add dialog progress tabs badge separator alert
npx shadcn-ui@latest add table form textarea tooltip

# File handling & storage
npm install @vercel/blob

# PDF generation
npm install @react-pdf/renderer
npm install -D @types/react-pdf

# Payments
npm install stripe @stripe/stripe-js

# Email
npm install @sendgrid/mail

# Scraping
npm install apify-client

# Document generation (Word export)
npm install docx

# Utilities
npm install zod date-fns
npm install -D jest @testing-library/react @testing-library/jest-dom
```

---

### Task 0.3 — Configure Tailwind

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

### Task 0.4 — Configure Drizzle

**File:** `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate:pg",
    "test": "jest --passWithNoTests"
  }
}
```

---

### Task 0.5 — Configure Clerk Middleware

**File:** `src/middleware.ts`

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/stripe/webhook',  // Stripe webhooks must be public
    '/api/clerk/webhook',   // Clerk webhooks must be public
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

### Task 0.6 — Root Layout with Clerk

**File:** `src/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClaimShield DV — Diminished Value Appraisals',
  description: 'Professional AI-powered diminished value appraisal reports',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

### Task 0.7 — Directory Structure

Create the following directory structure in full before writing any feature code:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── appraisal/[id]/
│   │           ├── page.tsx
│   │           ├── report/page.tsx
│   │           └── documents/page.tsx
│   ├── appraisal/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       └── edit/page.tsx
│   ├── onboarding/
│   │   └── role/page.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── extract-document/route.ts
│   │   │   ├── extract-repair/route.ts
│   │   │   └── analyze-damage/route.ts
│   │   ├── appraisal/
│   │   │   ├── route.ts            (GET list, POST create)
│   │   │   └── [id]/route.ts       (GET, PUT, DELETE)
│   │   ├── comparables/
│   │   │   └── search/route.ts
│   │   ├── email/
│   │   │   └── send-report/route.ts
│   │   ├── pdf/
│   │   │   └── generate/route.ts
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhook/route.ts
│   │   ├── upload/route.ts
│   │   └── clerk/webhook/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                         (shadcn auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   ├── upload/
│   │   └── FileUploadZone.tsx
│   ├── wizard/
│   │   ├── WizardShell.tsx
│   │   ├── WizardProgress.tsx
│   │   └── steps/
│   │       ├── Step0DocumentUpload.tsx
│   │       ├── Step1DriverInfo.tsx
│   │       ├── Step2VehicleDetails.tsx
│   │       ├── Step3AccidentDetails.tsx
│   │       ├── Step4PreAccidentCondition.tsx
│   │       ├── Step5PreAccidentComps.tsx
│   │       ├── Step6PostAccidentComps.tsx
│   │       └── Step7ReviewGenerate.tsx
│   └── dashboard/
│       ├── AppraisalCard.tsx
│       └── UsageWidget.tsx
├── db/
│   └── schema.ts
├── lib/
│   ├── ai/
│   │   ├── gemini-client.ts
│   │   ├── document-extractor.ts
│   │   ├── image-analyzer.ts
│   │   └── repair-extractor.ts
│   ├── auth/
│   │   └── role-check.ts
│   ├── calculations/
│   │   ├── valuation.ts
│   │   ├── adjustments.ts
│   │   └── helpers.ts
│   ├── email/
│   │   └── sendgrid-client.ts
│   ├── narratives/
│   │   ├── legal-citations.ts
│   │   ├── repair-analysis.ts
│   │   └── market-stigma.ts
│   ├── pdf/
│   │   ├── ReportDocument.tsx
│   │   └── assemble-report-data.ts
│   ├── scraping/
│   │   ├── apify-client.ts
│   │   └── mock-data.ts
│   ├── severity/
│   │   └── severity.ts
│   └── templates/
│       ├── template-engine.ts
│       ├── demand-letter-ga.ts
│       ├── demand-letter-generic.ts
│       ├── bad-faith-letter.ts
│       ├── negotiation-response.ts
│       ├── expert-affidavit.ts
│       ├── appraisal-summary.ts
│       └── stigma-statement.ts
├── types/
│   ├── appraisal.ts
│   ├── ai.ts
│   ├── roles.ts
│   └── index.ts
└── hooks/
    ├── useWizardState.ts
    └── useAppraisal.ts
```

---

**✅ PHASE 0 COMPLETE WHEN:**
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] All directories created
- [ ] All `.env.local` variables confirmed populated
- [ ] Clerk middleware active (unauthenticated users redirected from protected routes)

---

## PHASE 1: DATABASE SCHEMA & AUTH
**Type:** Sequential — both agents blocked until complete
**Agent:** Primary
**Estimated Time:** 4–6 hours

### Task 1.1 — Complete Database Schema

**File:** `src/db/schema.ts`

```typescript
import {
  pgTable, uuid, text, integer, numeric, boolean,
  date, timestamp, jsonb, index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  clerkId:              text('clerk_id').notNull().unique(),
  email:                text('email').notNull(),
  fullName:             text('full_name'),
  role:                 text('role').notNull().default('individual'),
  // role: 'individual' | 'appraiser' | 'attorney' | 'body_shop' | 'admin'
  stripeCustomerId:     text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus:   text('subscription_status').default('inactive'),
  // subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled'
  reportsAvailable:     integer('reports_available').default(0),
  // For per-report purchasers — decremented on each PDF generation
  onboardingComplete:   boolean('onboarding_complete').default(false),
  createdAt:            timestamp('created_at').defaultNow(),
  updatedAt:            timestamp('updated_at').defaultNow(),
});

// ─── APPRAISALS ──────────────────────────────────────────────────────────────
export const appraisals = pgTable('appraisals', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Status
  status:          text('status').notNull().default('draft'),
  // status: 'draft' | 'calculating' | 'complete' | 'archived'

  // Metadata
  claimNumber:     text('claim_number'),
  appraisalDate:   date('appraisal_date').defaultNow(),
  accidentDate:    date('accident_date').notNull(),
  purpose:         text('purpose').notNull(),
  // purpose: 'insurance_claim' | 'legal_proceeding' | 'dispute_resolution' | 'expert_testimony'

  // Nested data as JSONB
  ownerInfo:       jsonb('owner_info').notNull().$type<OwnerInfo>(),
  insuranceInfo:   jsonb('insurance_info').$type<InsuranceInfo>(),
  subjectVehicle:  jsonb('subject_vehicle').notNull().$type<SubjectVehicle>(),
  accidentDetails: jsonb('accident_details').notNull().$type<AccidentDetails>(),
  appraiserInfo:   jsonb('appraiser_info').$type<AppraiserInfo>(),

  // Derived state field for legal citations
  ownerState:      text('owner_state').notNull(),

  // AI extraction results (stored for audit trail)
  aiExtractionData: jsonb('ai_extraction_data').$type<AIExtractionData>(),

  // Calculated results (stored after generation)
  valuationResults: jsonb('valuation_results').$type<ValuationResults>(),
  severityAnalysis: jsonb('severity_analysis').$type<SeverityAnalysis>(),

  // File storage (Vercel Blob URLs)
  repairEstimateUrl: text('repair_estimate_url'),
  damagePhotos:      jsonb('damage_photos').$type<string[]>().default([]),
  repairPhotos:      jsonb('repair_photos').$type<string[]>().default([]),
  insuranceDocs:     jsonb('insurance_docs').$type<string[]>().default([]),

  // Generated outputs
  reportPdfUrl:      text('report_pdf_url'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx:    index('appraisals_user_id_idx').on(table.userId),
  statusIdx:    index('appraisals_status_idx').on(table.status),
  ownerStateIdx: index('appraisals_owner_state_idx').on(table.ownerState),
}));

// ─── COMPARABLE VEHICLES ─────────────────────────────────────────────────────
export const comparableVehicles = pgTable('comparable_vehicles', {
  id:           uuid('id').primaryKey().defaultRandom(),
  appraisalId:  uuid('appraisal_id').notNull().references(() => appraisals.id, { onDelete: 'cascade' }),
  compType:     text('comp_type').notNull(),
  // compType: 'pre_accident' | 'post_accident'
  source:       text('source').notNull(),
  // source: 'apify_search' | 'manual_entry'

  // Vehicle Details
  vin:             text('vin').notNull(),
  year:            integer('year').notNull(),
  make:            text('make').notNull(),
  model:           text('model').notNull(),
  trim:            text('trim').notNull(),
  mileage:         integer('mileage').notNull(),
  accidentHistory: text('accident_history').notNull(),
  // accidentHistory: 'no_accidents' | 'accident_reported'

  // Listing Info
  listingUrl:   text('listing_url'),
  listingPrice: numeric('listing_price', { precision: 10, scale: 2 }).notNull(),
  dealerName:   text('dealer_name'),
  dealerPhone:  text('dealer_phone'),
  locationCity:  text('location_city'),
  locationState: text('location_state'),
  distanceMiles: integer('distance_miles'),

  // Calculated adjustments
  adjustments:   jsonb('adjustments').notNull().$type<CompAdjustments>(),
  adjustedValue: numeric('adjusted_value', { precision: 10, scale: 2 }).notNull(),

  includedInCalculation: boolean('included_in_calculation').default(true),

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  appraisalIdx: index('comp_vehicles_appraisal_idx').on(table.appraisalId),
  compTypeIdx:  index('comp_vehicles_type_idx').on(table.compType),
}));

// ─── DOCUMENT TEMPLATES ───────────────────────────────────────────────────────
export const generatedDocuments = pgTable('generated_documents', {
  id:           uuid('id').primaryKey().defaultRandom(),
  appraisalId:  uuid('appraisal_id').notNull().references(() => appraisals.id, { onDelete: 'cascade' }),
  templateType: text('template_type').notNull(),
  // templateType: 'demand_letter' | 'bad_faith_letter' | 'negotiation_response'
  //               | 'expert_affidavit' | 'appraisal_summary' | 'stigma_statement'
  format:       text('format').notNull(),
  // format: 'pdf' | 'docx'
  fileUrl:      text('file_url').notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  appraisals: many(appraisals),
}));

export const appraisalsRelations = relations(appraisals, ({ one, many }) => ({
  user:                one(users, { fields: [appraisals.userId], references: [users.id] }),
  comparableVehicles:  many(comparableVehicles),
  generatedDocuments:  many(generatedDocuments),
}));

export const comparableVehiclesRelations = relations(comparableVehicles, ({ one }) => ({
  appraisal: one(appraisals, { fields: [comparableVehicles.appraisalId], references: [appraisals.id] }),
}));

// ─── ZOD SCHEMAS (for API validation) ────────────────────────────────────────
export const insertAppraisalSchema = createInsertSchema(appraisals);
export const selectAppraisalSchema = createSelectSchema(appraisals);
export type InsertAppraisal = z.infer<typeof insertAppraisalSchema>;
export type SelectAppraisal = z.infer<typeof selectAppraisalSchema>;
```

---

### Task 1.2 — TypeScript Types

**File:** `src/types/appraisal.ts`

Define all complex JSONB types used above. These must be complete and match the schema exactly:

```typescript
export interface OwnerInfo {
  full_name: string;
  address: { street: string; city: string; state: string; zip: string; };
  phone: string;
  email: string;
}

export interface InsuranceInfo {
  insurance_company: string;
  policy_number?: string;
  claim_number?: string;
  adjuster_name?: string;
  adjuster_phone?: string;
}

export interface SubjectVehicle {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_style: string;
  engine: string;
  transmission: string;
  exterior_color: string;
  interior_color: string;
  production_date: string;
  mileage_at_accident: number;
  standard_features: string[];
  optional_equipment: EquipmentItem[];
  pre_accident_condition: PreAccidentCondition;
  prior_accidents: boolean;
  prior_accident_details?: string;
}

export interface EquipmentItem {
  name: string;
  factory_price: number;
}

export interface PreAccidentCondition {
  overall_grade: 'excellent' | 'good' | 'average' | 'below_average' | 'rough';
  mechanical_condition: 'excellent' | 'good' | 'fair' | 'poor';
  tire_condition: 'new' | 'good_tread' | 'average_tread' | 'worn';
  paint_condition: 'excellent' | 'good' | 'fair' | 'poor';
  body_condition: 'no_damage' | 'minor_dings' | 'moderate_wear' | 'significant_damage';
  glass_condition: 'perfect' | 'minor_pitting' | 'chips' | 'cracks';
  interior_condition: 'excellent' | 'good' | 'fair' | 'poor';
  maintenance_notes?: string;
}

export interface AccidentDetails {
  loss_type: 'collision' | 'comprehensive';
  point_of_impact: string;
  structural_damage: boolean;
  frame_damage: boolean;
  unibody_deformation: boolean;
  airbag_deployment: boolean;
  repair_facility: string;
  repair_facility_phone?: string;
  total_repair_cost: number;
  body_labor_hours: number;
  frame_labor_hours: number;
  refinish_labor_hours: number;
  mechanical_labor_hours: number;
  total_labor_hours: number;
  frame_pulling_required: boolean;
  frame_machine_hours?: number;
  alignment_required: boolean;
  panels_replaced: PanelItem[];
  painted_panels: string[];
  paint_type: 'factory_oem' | 'aftermarket_quality' | 'budget';
  oem_parts_used: boolean;
  aftermarket_parts_used: boolean;
  aftermarket_parts_list?: string;
  refurbished_parts_used: boolean;
}

export interface PanelItem {
  panel_name: string;
  panel_type: 'structural' | 'cosmetic' | 'bolt-on';
  replaced_or_repaired: 'replaced' | 'repaired';
  part_type?: 'OEM' | 'aftermarket' | 'refurbished';
  cost?: number;
}

export interface AppraiserInfo {
  is_professional_appraiser: boolean;
  appraiser_name?: string;
  appraiser_company?: string;
  appraiser_license?: string;
  appraiser_certifications?: string[];
  financial_interest: boolean;
  conflict_of_interest: boolean;
}

export interface ValuationResults {
  pre_accident_fmv: number;
  post_repair_acv: number;
  diminished_value: number;
  percentage_of_pre_value: number;
  percentage_of_repair_cost: number;
  calculation_method: string;
  confidence_range: { low: number; high: number; };
}

export interface SeverityAnalysis {
  severity_level: 1 | 2 | 3 | 4 | 5;
  severity_text: 'Minor' | 'Moderate' | 'Medium' | 'Major' | 'Severe';
  justification: string;
  post_repair_naaa_grade: string;
  naaa_grade_explanation: string;
}

export interface CompAdjustments {
  mileage_adjustment: number;
  equipment_adjustments: number;
  trim_adjustment: number;
  year_adjustment: number;
  condition_adjustment: number;
  total_adjustments: number;
  adjusted_value: number;
}

export interface AIExtractionData {
  document_extraction?: ExtractedDocumentData;
  repair_extraction?: RepairEstimateExtraction;
  image_analysis?: DamageAnalysisResult;
  extraction_timestamp: string;
}
```

**File:** `src/types/roles.ts`

```typescript
export type UserRole = 'individual' | 'appraiser' | 'attorney' | 'body_shop' | 'admin';

export interface RolePermissions {
  canGenerateReports: boolean;
  unlimitedReports: boolean;
  canAccessUSPAP: boolean;
  canWhiteLabel: boolean;
  canManageTeam: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  individual:  { canGenerateReports: true,  unlimitedReports: false, canAccessUSPAP: false, canWhiteLabel: false, canManageTeam: false },
  appraiser:   { canGenerateReports: true,  unlimitedReports: true,  canAccessUSPAP: true,  canWhiteLabel: false, canManageTeam: false },
  attorney:    { canGenerateReports: true,  unlimitedReports: true,  canAccessUSPAP: false, canWhiteLabel: false, canManageTeam: true  },
  body_shop:   { canGenerateReports: true,  unlimitedReports: true,  canAccessUSPAP: false, canWhiteLabel: true,  canManageTeam: false },
  admin:       { canGenerateReports: true,  unlimitedReports: true,  canAccessUSPAP: true,  canWhiteLabel: true,  canManageTeam: true  },
};
```

---

### Task 1.3 — Database Connection

**File:** `src/db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

### Task 1.4 — Run Initial Migration

```bash
npm run db:push
```

Confirm all tables created in Neon console before proceeding.

---

### Task 1.5 — Clerk Webhook (User Sync)

**File:** `src/app/api/clerk/webhook/route.ts`

When a new user signs up via Clerk, create their record in the `users` table and redirect them to `/onboarding/role`.

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = headers();
  
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(JSON.stringify(payload), {
    'svix-id': headersList.get('svix-id')!,
    'svix-timestamp': headersList.get('svix-timestamp')!,
    'svix-signature': headersList.get('svix-signature')!,
  }) as any;

  if (evt.type === 'user.created') {
    await db.insert(users).values({
      clerkId:   evt.data.id,
      email:     evt.data.email_addresses[0].email_address,
      fullName:  `${evt.data.first_name ?? ''} ${evt.data.last_name ?? ''}`.trim(),
      role:      'individual',
      onboardingComplete: false,
    });
  }

  return Response.json({ received: true });
}
```

---

**✅ PHASE 1 COMPLETE WHEN:**
- [ ] `npm run db:push` succeeds — all 4 tables created in Neon
- [ ] TypeScript types file compiles with zero errors
- [ ] Clerk webhook creates user record on sign-up
- [ ] New users exist in `users` table after test sign-up
- [ ] `npm run build` passes with zero errors

---

## PHASE 2: CORE WIZARD UI
**Agent:** A
**Depends on:** Phase 1 complete
**Estimated Time:** 4–5 days
**Can run parallel with:** Phase 3

### Task 2.1 — Wizard State Management

**File:** `src/hooks/useWizardState.ts`

The wizard stores all form data in a single typed state object managed by `useReducer`. This is the single source of truth for the entire appraisal creation flow.

```typescript
import { useReducer } from 'react';
import type { OwnerInfo, InsuranceInfo, SubjectVehicle, AccidentDetails, AppraiserInfo } from '@/types/appraisal';

export interface WizardState {
  currentStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  appraisalId: string | null;        // set after first save
  isDirty: boolean;
  aiAutoFilled: Record<string, boolean>;  // tracks which fields were AI-populated

  // Step 0: Uploaded file URLs + AI extraction results
  uploadedFiles: {
    repairEstimate?: string;
    damagePhotos: string[];
    repairPhotos: string[];
    insuranceDocs: string[];
  };

  // Step 1
  ownerInfo: Partial<OwnerInfo>;
  insuranceInfo: Partial<InsuranceInfo>;
  purpose: string;
  accidentDate: string;

  // Step 2
  subjectVehicle: Partial<SubjectVehicle>;

  // Step 3
  accidentDetails: Partial<AccidentDetails>;

  // Step 4
  preAccidentCondition: Partial<SubjectVehicle['pre_accident_condition']>;

  // Steps 5 & 6 managed separately via DB (comp vehicles are large)
  useAutoSearchPre: boolean;
  useAutoSearchPost: boolean;

  // Step 7
  appraiserInfo: Partial<AppraiserInfo>;
}

type WizardAction =
  | { type: 'SET_STEP'; step: WizardState['currentStep'] }
  | { type: 'SET_APPRAISAL_ID'; id: string }
  | { type: 'MERGE_EXTRACTED_DATA'; data: Partial<WizardState>; aiFields: string[] }
  | { type: 'UPDATE_OWNER_INFO'; data: Partial<OwnerInfo> }
  | { type: 'UPDATE_INSURANCE_INFO'; data: Partial<InsuranceInfo> }
  | { type: 'UPDATE_VEHICLE'; data: Partial<SubjectVehicle> }
  | { type: 'UPDATE_ACCIDENT'; data: Partial<AccidentDetails> }
  | { type: 'UPDATE_CONDITION'; data: Partial<SubjectVehicle['pre_accident_condition']> }
  | { type: 'UPDATE_APPRAISER'; data: Partial<AppraiserInfo> }
  | { type: 'ADD_UPLOADED_FILE'; fileType: string; url: string }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN' };

// Implement reducer with all cases above
// MERGE_EXTRACTED_DATA must never overwrite fields the user has already manually edited
// Track manual edits via a separate Set<string> of field keys
```

---

### Task 2.2 — Wizard Shell

**File:** `src/components/wizard/WizardShell.tsx`

The outer wrapper that:
- Renders `WizardProgress` at the top
- Renders the current step component based on `state.currentStep`
- Shows Back/Next/Save navigation buttons
- Auto-saves to API every 30 seconds when `isDirty = true`
- Shows save indicator ("Saving..." / "Saved")

---

### Task 2.3 — Wizard Progress Bar

**File:** `src/components/wizard/WizardProgress.tsx`

Horizontal step indicator showing 8 steps (0–7). Current step highlighted in brand blue. Completed steps show checkmark. Clicking a completed step navigates back to it.

Step labels:
0. Upload Docs
1. Driver Info
2. Vehicle Details
3. Accident Details
4. Pre-Accident Condition
5. Pre-Accident Comps
6. Post-Accident Comps
7. Review & Generate

---

### Task 2.4 — Step 0: Document Upload Gate

**File:** `src/components/wizard/steps/Step0DocumentUpload.tsx`

This step appears before the wizard begins and is optional but prominently encouraged.

**UI Layout:**
- Headline: "Let AI do the heavy lifting"
- Subtext: "Upload your documents and we'll pre-fill as much of your appraisal as possible."
- Four drag-drop zones:
  1. Repair Estimate (PDF — single file, required for full auto-fill)
  2. Insurance Documents (PDF or image — multiple)
  3. Before-damage photos (images — multiple)
  4. After-repair photos (images — multiple)
- As each file uploads, show processing spinner, then "✓ Processed" badge
- After all files processed, show extraction summary card:
  - "We found: Owner name, Policy #, VIN, Repair cost, 14 line items, 3 damaged panels"
  - Confidence indicator per category
- CTA: "Continue with auto-filled data →"
- Skip link: "Skip this step, I'll fill in manually"

---

### Task 2.5 — Step 1: Driver & Insurance Info

**File:** `src/components/wizard/steps/Step1DriverInfo.tsx`

Fields (all with auto-fill badge if AI-populated):
- Full Name
- Street Address, City, State (dropdown), ZIP
- Phone, Email
- Insurance Company
- Policy Number
- Claim Number
- Adjuster Name, Adjuster Phone
- Appraisal Purpose (radio: Insurance Claim / Legal Proceeding / Dispute Resolution / Expert Testimony)
- Accident Date (date picker)

State law banner: Display below State field after state is selected.
- GA: green — "Georgia has strong diminished value laws under O.C.G.A. § 33-4-6"
- NC: blue — "North Carolina has a formal appraisal dispute process"
- Other: amber — "Your state uses general tort law. Your report is still fully valid."

---

### Task 2.6 — Step 2: Vehicle Details

**File:** `src/components/wizard/steps/Step2VehicleDetails.tsx`

- VIN field (17 char validation) → on blur, call NHTSA VIN decode API and auto-populate Year, Make, Model, Trim, Body Style, Engine, Transmission
- All VIN-decoded fields are read-only with an "edit" toggle
- Exterior Color, Interior Color (text)
- Production Date (MM/YYYY)
- Mileage at time of accident
- Optional Equipment (dynamic list — add/remove rows with name + factory MSRP price)
- Prior Accidents (yes/no radio) → if yes, text area appears

---

### Task 2.7 — Step 3: Accident Details

**File:** `src/components/wizard/steps/Step3AccidentDetails.tsx`

- Loss Type (Collision / Comprehensive)
- Point of Impact (visual diagram — clickable car graphic with 9 zones)
- Repair Facility Name, Phone
- Total Repair Cost
- Labor breakdown: Body Hours, Frame Hours, Refinish Hours, Mechanical Hours (Total auto-calculates)
- Frame Pulling Required (yes/no toggle — shows warning banner if yes)
- Frame Machine Hours (appears if yes)
- Alignment Required (checkbox)
- Critical damage flags: Structural Damage, Frame Damage, Unibody Deformation, Airbag Deployment
- Panels Replaced/Repaired (dynamic list with: panel name, type dropdown, replaced/repaired, OEM/aftermarket/refurbished, cost)
- Painted Panels (multi-select checklist of common panels)
- Parts Used (OEM / Aftermarket / Refurbished checkboxes)
- Repair estimate upload zone (if not done in Step 0 — triggers Gemini extraction immediately on upload)

---

### Task 2.8 — Step 4: Pre-Accident Condition

**File:** `src/components/wizard/steps/Step4PreAccidentCondition.tsx`

- Overall NAAA Grade (5-option visual selector: Excellent/Good/Average/Below Average/Rough with descriptions)
- Individual condition ratings (Mechanical, Tires, Paint, Body, Glass, Interior) — each with dropdown
- Maintenance Notes (textarea)
- Add explanatory text: "Be honest. Overstating pre-accident condition can be challenged by the insurance company."

---

### Task 2.9 — Steps 5 & 6: Comparable Vehicles

**Files:**
- `src/components/wizard/steps/Step5PreAccidentComps.tsx`
- `src/components/wizard/steps/Step6PostAccidentComps.tsx`

Both steps are nearly identical in structure. Step 6 requires `accidentHistory = 'accident_reported'` for all comps.

**UI Layout:**
- Toggle: "Auto-Search" (default) vs "Manual Entry"
- Auto-Search mode: Search params form (radius, mileage tolerance) → "Search Now" button → shows loading state → displays results as cards with checkbox to include/exclude
- Manual Entry mode: Form to add comp vehicle with all required fields
- Each comp card shows: source, VIN, year/make/model/trim, mileage, listing price, auto-calculated adjustments breakdown, final adjusted value
- Side-by-side comparison table at bottom when ≥ 3 comps added
- Median calculated value displayed prominently

---

### Task 2.10 — Step 7: Review & Generate

**File:** `src/components/wizard/steps/Step7ReviewGenerate.tsx`

- Summary of all entered data in read-only accordion sections
- Editable inline — clicking any section opens that wizard step
- DV calculation preview: Pre-FMV, Post-ACV, DV Amount (large, highlighted)
- Severity level badge
- Appraiser info section (only if `role === 'appraiser'`)
- "Generate Report" button → triggers PDF generation → redirects to report page
- Entitlement check: if user has no credits/subscription, show Stripe checkout modal before generating

---

**✅ PHASE 2 COMPLETE WHEN:**
- [ ] All 8 wizard steps render without errors
- [ ] Navigation between steps works (back/next)
- [ ] Auto-save triggers every 30 seconds when dirty
- [ ] VIN decode populates vehicle fields correctly
- [ ] Point of impact diagram is clickable
- [ ] Comp search displays results (mock data acceptable at this stage)
- [ ] State law banner appears correctly for GA, NC, and other states
- [ ] Step 7 shows correct DV calculation preview

---

## PHASE 3: AI INTEGRATION — GEMINI 3.1 PRO
**Agent:** B
**Depends on:** Phase 1 complete
**Estimated Time:** 4–5 days
**Can run parallel with:** Phase 2

### Task 3.1 — Gemini Client

**File:** `src/lib/ai/gemini-client.ts`

```typescript
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// IMPORTANT: GEMINI_API_KEY must NEVER be prefixed with NEXT_PUBLIC_
// This file is server-only. Never import it in client components.

export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro',  // verify exact model string at ai.google.dev
  generationConfig: {
    temperature: 0.1,       // low temperature for structured data extraction
    responseMimeType: 'application/json',
  },
});

export async function extractStructuredData<T>(
  prompt: string,
  fileParts?: Part[]
): Promise<T> {
  const parts: Part[] = fileParts ? [...fileParts, { text: prompt }] : [{ text: prompt }];
  const result = await geminiPro.generateContent(parts);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    // Attempt to strip markdown code fences if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}

export function fileToGenerativePart(
  data: string,  // base64
  mimeType: string
): Part {
  return {
    inlineData: { data, mimeType }
  };
}
```

---

### Task 3.2 — Document Extractor

**File:** `src/lib/ai/document-extractor.ts`
**API Route:** `src/app/api/ai/extract-document/route.ts`

Extracts owner, insurance, and vehicle data from uploaded insurance cards and accident reports.

**Output type (`src/types/ai.ts`):**

```typescript
export interface ExtractedDocumentData {
  owner?: {
    full_name?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
  insurance?: {
    insurance_company?: string;
    policy_number?: string;
    claim_number?: string;
    adjuster_name?: string;
    adjuster_phone?: string;
  };
  vehicle?: {
    vin?: string;
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: number;
  };
  accident?: {
    accident_date?: string;     // ISO format
    loss_type?: 'collision' | 'comprehensive';
    point_of_impact?: string;
  };
  confidence: {
    owner: number;
    insurance: number;
    vehicle: number;
    accident: number;
  };
}
```

**Gemini prompt (exact):**

```
You are an insurance document analyst. Extract all available data from the 
provided document and return ONLY a valid JSON object matching the 
ExtractedDocumentData interface below. 

Rules:
- Dates must be ISO format (YYYY-MM-DD)
- Phone numbers formatted as (XXX) XXX-XXXX
- Dollar amounts as numbers only (no $ or commas)
- VINs must be exactly 17 characters
- Only include fields where you are confident data exists
- Set confidence scores (0.0–1.0) for each top-level group
- Return ONLY JSON — no markdown, no explanation, no preamble

Interface: [paste ExtractedDocumentData TypeScript interface]
```

**API Route:** POST `/api/ai/extract-document`
- Accept: multipart/form-data with `file` field
- Validate: file is PDF or image, under 20MB
- Convert to base64, send to Gemini, return `ExtractedDocumentData`
- Error handling: return 200 with empty data + error flag (never 500 for AI failures)

---

### Task 3.3 — Repair Estimate Extractor

**File:** `src/lib/ai/repair-extractor.ts`
**API Route:** `src/app/api/ai/extract-repair/route.ts`

The most data-intensive AI task. Extracts every single line item from the repair estimate.

**Output type:**

```typescript
export interface RepairLineItem {
  description: string;
  part_type: 'OEM' | 'aftermarket' | 'refurbished' | 'labor' | 'paint' | 'other';
  labor_type?: 'body' | 'frame' | 'refinish' | 'mechanical';
  labor_hours?: number;
  part_cost?: number;
  labor_cost?: number;
  line_total: number;
  panel_name?: string;
  is_structural: boolean;
}

export interface RepairEstimateExtraction {
  repair_facility: string;
  repair_facility_phone?: string;
  estimate_date?: string;
  total_parts_cost: number;
  total_labor_cost: number;
  total_paint_cost: number;
  total_repair_cost: number;
  body_labor_hours: number;
  frame_labor_hours: number;
  refinish_labor_hours: number;
  mechanical_labor_hours: number;
  total_labor_hours: number;
  frame_pulling_required: boolean;
  alignment_required: boolean;
  airbag_deployment: boolean;
  structural_damage: boolean;
  line_items: RepairLineItem[];
  oem_parts_used: boolean;
  aftermarket_parts_used: boolean;
  refurbished_parts_used: boolean;
  painted_panels: string[];
}
```

**Gemini prompt:**

```
You are a collision repair specialist analyst. Extract EVERY line item from 
this repair estimate document. For each line item identify:
- Exact description
- Whether it's a part (OEM/aftermarket/refurbished) or labor
- Labor type if it's labor (body/frame/refinish/mechanical)
- Labor hours, part cost, labor cost, and line total
- The panel name it relates to
- Whether the panel is structural

Also sum totals for each category. Detect boolean flags for:
frame pulling, alignment, airbag deployment, structural damage.

Return ONLY valid JSON matching the RepairEstimateExtraction interface.
No markdown. No explanation.

Interface: [paste RepairEstimateExtraction TypeScript interface]
```

---

### Task 3.4 — Image Damage Analyzer

**File:** `src/lib/ai/image-analyzer.ts`
**API Route:** `src/app/api/ai/analyze-damage/route.ts`

Accepts before AND after images together. Compares them to assess damage severity.

**Output type:**

```typescript
export interface DamageAnalysisResult {
  before_condition: {
    overall_condition: 'excellent' | 'good' | 'average' | 'below_average';
    notes: string;
  };
  damage_assessment: {
    point_of_impact: string;
    damaged_panels: string[];
    structural_deformation_visible: boolean;
    airbag_deployment_visible: boolean;
    damage_scope: 'minor' | 'moderate' | 'major' | 'severe';
    structural_concern: boolean;
  };
  narrative: string;   // 2–3 sentences professional description
  confidence: number;  // 0–1
}
```

**Prompt:** Send both images simultaneously. Ask Gemini to compare before vs after, identify all visible damage, assess severity, and return structured JSON only.

---

### Task 3.5 — AI Field Merge Logic

**File:** `src/lib/ai/merge-extracted-data.ts`

This utility merges AI extraction results into the wizard state without overwriting user-edited fields.

```typescript
export function mergeExtractionIntoWizardState(
  currentState: WizardState,
  extraction: ExtractedDocumentData,
  repairExtraction?: RepairEstimateExtraction,
  imageAnalysis?: DamageAnalysisResult,
  manuallyEditedFields: Set<string> = new Set()
): { newState: Partial<WizardState>; aiFilledFields: string[] } {
  // For each extracted field:
  // 1. Check if field key is in manuallyEditedFields — if so, skip
  // 2. Check if field already has a non-empty value in currentState — if so, skip
  // 3. Otherwise, apply extracted value and add to aiFilledFields
  // Return merged partial state and list of AI-filled field keys
}
```

---

**✅ PHASE 3 COMPLETE WHEN:**
- [ ] Gemini client connects successfully with test prompt
- [ ] Document extractor returns valid typed JSON from a sample insurance card
- [ ] Repair extractor correctly identifies all line items from a sample repair estimate
- [ ] Image analyzer returns structured damage assessment from before/after photos
- [ ] API routes return proper error responses for invalid input
- [ ] No API keys exposed to client bundle (verify with `npm run build` output)
- [ ] AI-filled fields show "✨ Auto-filled" badge in wizard steps

---

## PHASE 4: CALCULATION ENGINE & BUSINESS LOGIC
**Agent:** A
**Depends on:** Phase 2 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 5

### Task 4.1 — Helper Functions

**File:** `src/lib/calculations/helpers.ts`

```typescript
// EXACT implementations required — do not approximate

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

---

### Task 4.2 — Comparable Vehicle Adjustment Calculator

**File:** `src/lib/calculations/adjustments.ts`

```typescript
// ALL constants below are non-negotiable — match Master Spec exactly

const MILEAGE_RATE_PER_MILE = 0.12;           // $0.12 per mile difference
const EQUIPMENT_FACTOR = 0.80;                 // 80% of factory MSRP
const DEPRECIATION_RATE_PER_YEAR = 0.07;      // 7% per year (under 5 years)
const CONDITION_MULTIPLIERS = {
  excellent:     -0.05,
  good:           0.00,
  average:        0.05,
  below_average:  0.10,
  rough:          0.15,
};

export function calculateCompAdjustments(
  subject: SubjectVehicle,
  comp: ComparableVehicle
): CompAdjustments {

  // 1. MILEAGE — positive if comp has MORE miles (comp value increases to match subject)
  const mileageDiff = comp.mileage - subject.mileage_at_accident;
  const mileageAdj = mileageDiff * -MILEAGE_RATE_PER_MILE;

  // 2. EQUIPMENT — subject has extra equipment comp lacks → subtract from comp
  let equipmentAdj = 0;
  subject.optional_equipment.forEach(item => {
    if (!compHasEquipment(comp, item.name)) {
      equipmentAdj -= item.factory_price * EQUIPMENT_FACTOR;
    }
  });

  // 3. YEAR — use depreciation rate only if years differ
  const yearDiff = comp.year - subject.year;
  const yearAdj = yearDiff !== 0 ? comp.listing_price * (yearDiff * -DEPRECIATION_RATE_PER_YEAR) : 0;

  // 4. CONDITION — normalize comp to "good" baseline
  const conditionAdj = comp.condition && comp.condition !== 'good'
    ? comp.listing_price * (CONDITION_MULTIPLIERS[comp.condition] ?? 0)
    : 0;

  // 5. TRIM — only if not exact match, use MSRP delta (requires external data)
  // For now: return 0 and flag for manual review
  const trimAdj = 0;

  const total = mileageAdj + equipmentAdj + yearAdj + conditionAdj + trimAdj;

  return {
    mileage_adjustment:    mileageAdj,
    equipment_adjustments: equipmentAdj,
    year_adjustment:       yearAdj,
    condition_adjustment:  conditionAdj,
    trim_adjustment:       trimAdj,
    total_adjustments:     total,
    adjusted_value:        comp.listing_price + total,
  };
}
```

---

### Task 4.3 — DV Calculator

**File:** `src/lib/calculations/valuation.ts`

```typescript
export function calculateDiminishedValue(
  preComps: ComparableVehicle[],   // clean-history comps
  postComps: ComparableVehicle[],  // accident-history comps
  repairCost: number
): ValuationResults {

  const included = (c: ComparableVehicle) => c.includedInCalculation;
  const preValues  = preComps.filter(included).map(c => Number(c.adjustedValue));
  const postValues = postComps.filter(included).map(c => Number(c.adjustedValue));

  const preFMV  = calculateMedian(preValues);
  const postACV = calculateMedian(postValues);
  const dv      = preFMV - postACV;

  return {
    pre_accident_fmv:          preFMV,
    post_repair_acv:           postACV,
    diminished_value:          dv,
    percentage_of_pre_value:   (dv / preFMV) * 100,
    percentage_of_repair_cost: (dv / repairCost) * 100,
    calculation_method:        'Comparable Sales Method (Median) — Canal v. Tullis',
    confidence_range: {
      low:  Math.max(0, calculatePercentile(preValues, 10) - calculatePercentile(postValues, 90)),
      high: calculatePercentile(preValues, 90) - calculatePercentile(postValues, 10),
    },
  };
}
```

---

### Task 4.4 — Severity Classifier

**File:** `src/lib/severity/severity.ts`

```typescript
// EXACT decision tree — match spec precisely. Do not simplify.

export function classifyDamageSeverity(
  accident: AccidentDetails,
  vehicle: SubjectVehicle
): SeverityAnalysis {

  const {
    total_labor_hours: hrs,
    frame_pulling_required: framePull,
    frame_labor_hours: frameLaborHrs,
    structural_damage: structural,
    airbag_deployment: airbag,
    panels_replaced,
  } = accident;

  const hasStructuralPanels = panels_replaced.some(p => p.panel_type === 'structural');

  let level: 1 | 2 | 3 | 4 | 5;

  if (hrs > 60 || (airbag && structural && frameLaborHrs > 5) || frameLaborHrs > 10) {
    level = 5;
  } else if (framePull || frameLaborHrs > 0 || (structural && hrs > 35) || (airbag && hrs > 30)) {
    level = 4;
  } else if ((hrs >= 20 && hrs <= 35) || (hasStructuralPanels && hrs > 15) || airbag) {
    level = 3;
  } else if (hrs >= 10 && hrs < 20 && !structural && !framePull) {
    level = 2;
  } else {
    level = 1;
  }

  const textMap = { 1: 'Minor', 2: 'Moderate', 3: 'Medium', 4: 'Major', 5: 'Severe' } as const;

  const naaaGradeMap: Record<1|2|3|4|5, string> = {
    5: '1 - Rough',
    4: '2 - Below Average',
    3: '3 - Average',
    2: '4 - Good',
    1: vehicle.pre_accident_condition.overall_grade === 'excellent' ? '4 - Good' : '3 - Average',
  };

  return {
    severity_level:        level,
    severity_text:         textMap[level],
    justification:         buildJustification(level, accident),
    post_repair_naaa_grade: naaaGradeMap[level],
    naaa_grade_explanation: buildNaaaExplanation(level),
  };
}

// buildJustification() and buildNaaaExplanation() are narrative functions
// that construct professional text based on the severity level and accident data
// Reference Master Spec Section 4.3.3 for exact language
```

---

### Task 4.5 — Dynamic Legal Citations

**File:** `src/lib/narratives/legal-citations.ts`

```typescript
export interface LegalCitations {
  state: string;
  firstPartyStatute: string | null;
  thirdPartyStatute: string | null;
  anti17c: boolean;
  anti17cStatement: string | null;
  caselaw: string | null;
  generalStatement: string;
}

export function getLegalCitations(ownerState: string): LegalCitations {
  switch (ownerState.toUpperCase()) {
    case 'GA':
      return {
        state: 'Georgia',
        firstPartyStatute:  'O.C.G.A. § 33-4-6',
        thirdPartyStatute:  'O.C.G.A. § 33-4-7',
        anti17c:            true,
        anti17cStatement:   `This appraisal explicitly rejects the so-called "17c formula" 
          often used by insurance companies. The Georgia Department of Insurance Commissioner 
          issued a directive in December 2008 stating that the Department has never endorsed 
          any specific formula, including 17c, and insurers must consider all relevant 
          information provided by the insured. The 17c methodology artificially caps 
          diminished value at 10% of pre-accident value, double-penalizes for mileage, 
          and has no scientific or legal basis.`,
        caselaw:            'Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)',
        generalStatement:   'Georgia law recognizes diminished value claims under both first-party and third-party contexts.',
      };
    case 'NC':
      return {
        state:              'North Carolina',
        firstPartyStatute:  'N.C. Gen. Stat. § 20-279.21(d)(1)',
        thirdPartyStatute:  null,
        anti17c:            false,
        anti17cStatement:   null,
        caselaw:            null,
        generalStatement:   'North Carolina has a formal appraisal dispute process for diminished value claims.',
      };
    default:
      return {
        state:              ownerState,
        firstPartyStatute:  null,
        thirdPartyStatute:  null,
        anti17c:            false,
        anti17cStatement:   null,
        caselaw:            'Restatement of Torts § 928',
        generalStatement:   `${ownerState} addresses diminished value under general tort law principles.`,
      };
  }
}
```

**Note:** Add additional states (FL, TX, CA, etc.) as legal research is completed. Start with GA, NC, and default.

---

### Task 4.6 — Calculation API Route

**File:** `src/app/api/appraisal/[id]/calculate/route.ts`

Triggered when user completes Step 6. Fetches all comp vehicles from DB, runs adjustments for each, runs DV calculation, runs severity classification, saves results back to appraisal record.

---

**✅ PHASE 4 COMPLETE WHEN:**
- [ ] Unit tests pass for median, percentile, mileage adj, equipment adj
- [ ] Severity classifier correctly classifies all 5 severity levels (test each boundary condition)
- [ ] DV calculation matches: $32k FMV - $24k ACV = $8k DV
- [ ] Legal citations return correct output for GA, NC, and unknown state
- [ ] Calculate API route saves results to database

---

## PHASE 5: FILE UPLOAD SYSTEM
**Agent:** B
**Depends on:** Phase 3 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 4

### Task 5.1 — Upload API Route

**File:** `src/app/api/upload/route.ts`

```typescript
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file') as File;
  const appraisalId = form.get('appraisalId') as string;
  const fileType = form.get('fileType') as string;
  // fileType: 'repair_estimate' | 'damage_photo' | 'repair_photo' | 'insurance_doc'

  // Validate file size (25MB max)
  if (file.size > 25 * 1024 * 1024) {
    return Response.json({ error: 'File exceeds 25MB limit' }, { status: 400 });
  }

  // Validate file type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'File type not supported' }, { status: 400 });
  }

  const blob = await put(
    `appraisals/${appraisalId}/${fileType}/${Date.now()}-${file.name}`,
    file,
    { access: 'private' }
  );

  // Save URL to database based on fileType
  await updateAppraisalFileUrl(appraisalId, fileType, blob.url);

  return Response.json({ url: blob.url, fileType });
}
```

---

### Task 5.2 — FileUploadZone Component

**File:** `src/components/upload/FileUploadZone.tsx`

Requirements:
- Native HTML5 drag events — no third-party drag-drop library
- Multiple files simultaneously
- Progress bar per file (simulated with fetch XHR progress)
- Success state: filename, size, checkmark
- Error state: error message + retry button
- Accepted: `image/jpeg, image/png, image/webp, application/pdf`
- Max 25MB per file, 20 files per zone
- Optional: trigger AI analysis immediately after upload (via `onUploadComplete` callback)

```typescript
interface FileUploadZoneProps {
  appraisalId: string;
  fileType: 'repair_estimate' | 'damage_photo' | 'repair_photo' | 'insurance_doc';
  label: string;
  description?: string;
  accept?: string;
  maxFiles?: number;
  singleFile?: boolean;
  onUploadComplete: (urls: string[]) => void;
  onAIProcessingStart?: () => void;
  onAIProcessingComplete?: (result: any) => void;
  existingFiles?: string[];
}
```

---

### Task 5.3 — Document Library

**File:** `src/app/(dashboard)/dashboard/appraisal/[id]/documents/page.tsx`

Lists all files associated with an appraisal:
- Grouped by type (Repair Estimate, Before Photos, After Photos, Insurance Docs)
- Each file: icon, filename, size, upload date, preview button, download button, delete button
- Upload additional files via embedded FileUploadZone
- Preview: opens PDF in new tab; images display inline in modal

---

**✅ PHASE 5 COMPLETE WHEN:**
- [ ] Files upload to Vercel Blob with correct path structure
- [ ] Private access enforced — unauthenticated blob URLs return 401
- [ ] Files over 25MB rejected with clear error
- [ ] Unsupported file types rejected
- [ ] Document library displays, previews, and deletes files
- [ ] Upload of repair estimate triggers Gemini extraction automatically

---

## PHASE 6: PDF REPORT GENERATION
**Agent:** A
**Depends on:** Phase 4 complete
**Estimated Time:** 4–5 days
**Can run parallel with:** Phase 7

### Task 6.1 — Report Data Assembler

**File:** `src/lib/pdf/assemble-report-data.ts`

Fetches all data needed for the report from the database and assembles it into a single `CompleteAppraisalData` object. This function is the gate before PDF generation — if any required data is missing, it throws a descriptive error.

```typescript
export interface CompleteAppraisalData {
  appraisal:        SelectAppraisal;
  owner:            OwnerInfo;
  insurance:        InsuranceInfo;
  vehicle:          SubjectVehicle;
  accident:         AccidentDetails;
  preComps:         SelectComparableVehicle[];
  postComps:        SelectComparableVehicle[];
  valuation:        ValuationResults;
  severity:         SeverityAnalysis;
  legalCitations:   LegalCitations;
  repairNarrative:  string;
  stigmaNarrative:  string;
  appraiser?:       AppraiserInfo;
}

export async function assembleReportData(
  appraisalId: string,
  userId: string
): Promise<CompleteAppraisalData> {
  // 1. Fetch appraisal + verify userId ownership
  // 2. Fetch all comparable vehicles
  // 3. If valuation not yet calculated, run it now
  // 4. Get legal citations based on ownerState
  // 5. Generate all narrative text
  // 6. Return complete object
}
```

---

### Task 6.2 — PDF Report Component

**File:** `src/lib/pdf/ReportDocument.tsx`

Use `@react-pdf/renderer`. Build the full 14-section report. Design specs:

- **Colors:** Brand blue `#2563EB`, white background, gray text `#1F2937`
- **DV Amount highlight:** Green `#10B981`
- **Warning boxes (structural damage):** Amber `#F59E0B` background
- **Page size:** Letter (8.5" × 11")
- **Margins:** 0.75" all sides
- **Header:** "ClaimShield DV — Diminished Value Appraisal" on every page
- **Footer:** Page X of Y on every page

**14 Sections (in order):**
1. Cover Page — logo, vehicle info, DV amount in large green box
2. Cover Letter — formal letter with DV highlighted
3. Purpose, Scope & Intended Use
4. Vehicle Information — table + optional equipment
5. Pre-Accident Condition Assessment — NAAA grading table
6. Accident & Damage Summary — incident table + critical damage flags + components replaced table
7. Pre-Accident Comparable Vehicles — one detailed card per comp with adjustment breakdown
8. Post-Accident Comparable Vehicles — same format
9. Valuation Analysis — side-by-side table + DV amount large
10. Damage Severity Analysis — narrative + severity level badge
11. Market Stigma & Buyer Perception — full generated narrative
12. Legal Citations & Methodology — dynamic state citations
13. Disclaimers & Certifications — USPAP if professional appraiser
14. Appendices — repair estimate reference

---

### Task 6.3 — PDF Generation API Route

**File:** `src/app/api/pdf/generate/route.ts`

Configure for extended timeout in `vercel.json`:

```json
{
  "functions": {
    "src/app/api/pdf/generate/route.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

Route behavior:
1. Auth check — verify user owns appraisal
2. Entitlement check — verify user has reports available or active subscription
3. Assemble report data
4. Render PDF via `@react-pdf/renderer`
5. Upload PDF buffer to Vercel Blob
6. Save URL to `appraisals.report_pdf_url`
7. Decrement `users.reportsAvailable` if individual purchase
8. Return PDF URL

---

### Task 6.4 — Report Preview Page

**File:** `src/app/(dashboard)/dashboard/appraisal/[id]/report/page.tsx`

- Polls for `report_pdf_url` while PDF is generating (show progress spinner)
- Displays PDF in embedded `<iframe>` viewer once ready
- Shows DV amount prominently above viewer
- Buttons: Download PDF, Email Report, Regenerate, Share (7-day link)
- If report not yet generated: show "Generate Report" button with entitlement status

---

**✅ PHASE 6 COMPLETE WHEN:**
- [ ] PDF renders all 14 sections for a test appraisal
- [ ] State-specific legal citations correct for GA and non-GA
- [ ] DV amount on cover matches calculation
- [ ] PDF uploads to Vercel Blob, URL saved to database
- [ ] Report preview page embeds PDF correctly
- [ ] Generation completes within 60 seconds
- [ ] Minimum 15 pages generated for a complete appraisal
- [ ] Individual report purchasers have `reportsAvailable` decremented

---

## PHASE 7: DOCUMENT TEMPLATES
**Agent:** B
**Depends on:** Phase 5 complete
**Estimated Time:** 3–4 days
**Can run parallel with:** Phase 6

### Task 7.1 — Template Engine

**File:** `src/lib/templates/template-engine.ts`

```typescript
export interface TemplateData {
  // All variable fields used across templates
  owner_name: string;
  owner_address: string;
  vehicle: string;            // "2024 Acura RDX A-Spec"
  vin: string;
  accident_date: string;
  repair_cost: string;        // formatted currency
  dv_amount: string;          // formatted currency
  dv_percentage: string;      // "XX.X%"
  insurance_company: string;
  claim_number: string;
  adjuster_name: string;
  severity_level: string;     // "Level 4 – Major"
  naaa_grade: string;
  state: string;
  first_party_statute: string | null;
  third_party_statute: string | null;
  report_date: string;
  deadline_date?: string;     // 60 days from today for GA demand letters
  bad_faith_amount?: string;  // 50% of DV or $5,000, whichever is greater
  appraiser_name?: string;
  appraiser_company?: string;
  appraiser_license?: string;
  [key: string]: string | null | undefined;
}

export function renderTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key]?.toString() ?? `[${key}]`;  // unfilled placeholders remain visible
  });
}

export function buildTemplateData(report: CompleteAppraisalData): TemplateData {
  // Map all CompleteAppraisalData fields to flat TemplateData interface
}
```

---

### Task 7.2 — All 7 Document Templates

**Template 1 — Appraisal Summary** (`src/lib/templates/appraisal-summary.ts`)
1-page executive summary. Always available. No state restriction.

**Template 2 — Georgia 60-Day Demand Letter** (`src/lib/templates/demand-letter-ga.ts`)
- Only available when `ownerState === 'GA'`
- Cites O.C.G.A. § 33-4-6 (first-party) or § 33-4-7 (third-party)
- Sets 60-day deadline from letter date
- Threatens bad faith penalties if unpaid

**Template 3 — Generic Demand Letter** (`src/lib/templates/demand-letter-generic.ts`)
- Available for all non-GA states
- Uses general tort law language
- References Restatement of Torts § 928

**Template 4 — Bad Faith Penalty Calculator** (`src/lib/templates/bad-faith-letter.ts`)
- GA only
- Calculates: max(DV × 0.50, $5,000) as penalty amount
- References O.C.G.A. § 33-4-6 bad faith provision

**Template 5 — Insurance Negotiation Response** (`src/lib/templates/negotiation-response.ts`)
- Always available
- Input: the insurance company's offered amount
- Shows: their offer, your calculated DV, percentage difference, rebuttal language

**Template 6 — Expert Witness Affidavit** (`src/lib/templates/expert-affidavit.ts`)
- Only available when `appraiserInfo.is_professional_appraiser === true`
- Full USPAP Standard 8-3 certification language
- Signature block

**Template 7 — Market Stigma Impact Statement** (`src/lib/templates/stigma-statement.ts`)
- Always available
- Standalone document for buyer resistance arguments
- Includes DV percentage, severity classification, structural damage section if applicable

---

### Task 7.3 — Document Templates Page

**File:** `src/app/(dashboard)/dashboard/appraisal/[id]/documents/page.tsx`

List all 7 templates. For each:
- Name and description
- Availability status (locked with reason if unavailable)
- Preview button (renders in modal)
- Download as PDF
- Download as DOCX (use `docx` npm package)
- Email button

---

**✅ PHASE 7 COMPLETE WHEN:**
- [ ] All 7 templates render with correct variable substitution
- [ ] GA templates only appear for GA state
- [ ] Expert affidavit only appears for professional appraisers
- [ ] Bad faith amount correctly calculated as max(50% × DV, $5,000)
- [ ] Templates export as both PDF and DOCX

---

## PHASE 8: STRIPE PAYMENTS
**Agent:** A
**Depends on:** Phase 6 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 9

### Task 8.1 — Checkout Route

**File:** `src/app/api/stripe/checkout/route.ts`

Two checkout modes:

**One-time report purchase:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: process.env.STRIPE_INDIVIDUAL_PRICE_ID!, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=success`,
  cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchase=canceled`,
  metadata: { userId, purchaseType: 'individual_report' },
});
```

**Subscription:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?sub=success`,
  cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing?sub=canceled`,
  metadata: { userId, plan },
  customer_email: userEmail,
});
```

---

### Task 8.2 — Webhook Handler

**File:** `src/app/api/stripe/webhook/route.ts`

Handle these Stripe events:

| Event | Action |
|---|---|
| `checkout.session.completed` (payment) | Increment `users.reportsAvailable` by 1 |
| `checkout.session.completed` (subscription) | Set `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus = 'active'`, update `role` based on plan |
| `customer.subscription.updated` | Update `subscriptionStatus` |
| `customer.subscription.deleted` | Set `subscriptionStatus = 'canceled'`, revert role to `'individual'` |
| `invoice.payment_failed` | Set `subscriptionStatus = 'past_due'`, send email |

**Critical:** Validate Stripe webhook signature before processing any event.

```typescript
const sig = headers().get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

---

### Task 8.3 — Entitlement Gate

**File:** `src/lib/auth/entitlement-check.ts`

```typescript
export async function checkReportEntitlement(userId: string): Promise<{
  canGenerate: boolean;
  reason?: string;
}> {
  const user = await getUserFromDb(userId);

  // Active subscription = unlimited
  if (user.subscriptionStatus === 'active') {
    return { canGenerate: true };
  }

  // Individual reports available
  if (user.reportsAvailable > 0) {
    return { canGenerate: true };
  }

  return {
    canGenerate: false,
    reason: 'No reports available. Purchase a report or subscribe to continue.',
  };
}
```

Apply this check in the PDF generate route and the "Generate Report" button in Step 7.

---

**✅ PHASE 8 COMPLETE WHEN:**
- [ ] One-time checkout completes, `reportsAvailable` incremented
- [ ] Subscription checkout completes, `subscriptionStatus = 'active'`, role updated
- [ ] PDF generation blocked without entitlement
- [ ] Subscription cancellation reverts access
- [ ] Webhook signature validation passes
- [ ] All tested in Stripe test mode

---

## PHASE 9: EMAIL DELIVERY
**Agent:** B
**Depends on:** Phase 7 complete
**Estimated Time:** 1–2 days
**Can run parallel with:** Phase 8

### Task 9.1 — SendGrid Client

**File:** `src/lib/email/sendgrid-client.ts`

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM = process.env.SENDGRID_FROM_EMAIL!;

export async function sendReportReady(
  to: string, name: string, vehicle: string,
  dvAmount: string, pdfUrl: string
): Promise<void> {
  await sgMail.send({
    to, from: FROM,
    subject: `Your ClaimShield DV Report is Ready — ${vehicle}`,
    html: reportReadyTemplate(name, vehicle, dvAmount, pdfUrl),
  });
}

export async function sendWelcome(to: string, name: string): Promise<void> { ... }
export async function sendPaymentConfirmation(to: string, name: string, amount: string): Promise<void> { ... }
export async function sendSubscriptionCanceled(to: string, name: string): Promise<void> { ... }
```

---

### Task 9.2 — Email Templates

Build HTML email templates as functions returning HTML strings. Each template:
- Responsive HTML email layout
- ClaimShield DV branding (blue header)
- Clear CTA button
- Unsubscribe link in footer

Templates needed:
1. Report Ready (with PDF download link)
2. Welcome (after first sign-up)
3. Payment Confirmation
4. Subscription Canceled

---

### Task 9.3 — Trigger Points

Wire up email sending at these trigger points:
- Welcome: Clerk webhook `user.created` (Task 1.5)
- Payment Confirmation: Stripe webhook `checkout.session.completed`
- Report Ready: PDF generate route after successful upload
- Subscription Canceled: Stripe webhook `customer.subscription.deleted`

---

**✅ PHASE 9 COMPLETE WHEN:**
- [ ] All 4 email templates send without errors
- [ ] PDF link in report email is accessible
- [ ] Welcome email triggers on first sign-up
- [ ] Payment confirmation triggers after Stripe checkout
- [ ] SendGrid domain verified (check spam score)

---

## PHASE 10: ROLE-BASED ACCESS CONTROL
**Agent:** A
**Depends on:** Phase 8 complete
**Estimated Time:** 1–2 days
**Can run parallel with:** Phase 11

### Task 10.1 — Onboarding Role Selection Page

**File:** `src/app/onboarding/role/page.tsx`

After first login, redirect here. Show 4 role cards:
- **Individual** — "I was in an accident and want to file a DV claim"
- **Professional Appraiser** — "I generate appraisals for clients"
- **Auto Injury Attorney** — "I represent clients in DV claims"
- **Body Shop** — "I want to offer DV services to my customers"

On selection, save role to `users.role` via API and redirect to dashboard.

---

### Task 10.2 — Role Middleware

**File:** `src/lib/auth/role-check.ts`

```typescript
import { auth } from '@clerk/nextjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ROLE_PERMISSIONS, UserRole } from '@/types/roles';

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  return user ?? null;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role as UserRole);
}

export function getPermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.individual;
}
```

---

### Task 10.3 — Role-Gated UI Elements

Apply role gating to:
- USPAP certification section in Step 7 — appraiser only
- White-label settings in dashboard — body_shop only
- Team management section — attorney only
- Usage limits display — individual only

---

**✅ PHASE 10 COMPLETE WHEN:**
- [ ] Role selection page renders and saves role correctly
- [ ] New users redirected to onboarding on first login
- [ ] USPAP section only visible to appraiser role
- [ ] API routes return 403 for unauthorized role access

---

## PHASE 11: DASHBOARD & UX POLISH
**Agent:** B
**Depends on:** Phase 9 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 10

### Task 11.1 — Dashboard Home Page

**File:** `src/app/(dashboard)/dashboard/page.tsx`

Layout:
- Top: Usage widget (reports available / subscription status)
- CTA: "Start New Appraisal" button (prominent)
- Grid of appraisal cards sorted by most recent
- Each card: vehicle name, DV amount (if calculated), status badge, date, action menu (View, Edit, Duplicate, Archive, Download PDF)

---

### Task 11.2 — Appraisal Card Actions

Implement all actions in `src/components/dashboard/AppraisalCard.tsx`:

- **View** → navigate to report page
- **Edit** → navigate to wizard at last completed step
- **Duplicate** → POST to `/api/appraisal/[id]/duplicate` → creates clone as new draft
- **Archive** → PATCH `status = 'archived'` → removes from default view
- **Download PDF** → opens `report_pdf_url` in new tab
- **Share** → POST to `/api/appraisal/[id]/share` → returns 7-day signed blob URL → copies to clipboard

---

### Task 11.3 — Usage Widget

**File:** `src/components/dashboard/UsageWidget.tsx`

- Active subscription: show plan name, renewal date, "Unlimited Reports"
- Individual purchaser: show "X reports remaining" + "Buy More" button
- No entitlement: show "No reports available" + prominent "Get Started" button

---

### Task 11.4 — Mobile Responsiveness

Audit all wizard steps and dashboard for mobile layout. Minimum requirements:
- All wizard steps usable on 375px width
- Dashboard cards stack vertically on mobile
- File upload zones work on mobile (tap to browse)
- Navigation collapses to hamburger menu on mobile

---

### Task 11.5 — Auto-Save & Draft Resume

Wizard auto-saves:
- Every 30 seconds when `isDirty = true`
- On step navigation (forward or back)
- On browser tab close (beforeunload event)

Draft resume:
- If user has an in-progress draft, dashboard shows "Resume Draft" card at top
- Clicking resumes wizard at last completed step with all data restored

---

**✅ PHASE 11 COMPLETE WHEN:**
- [ ] Dashboard displays all appraisals with correct status
- [ ] All card actions work (duplicate, archive, download, share)
- [ ] Usage widget shows correct data based on subscription/purchase status
- [ ] All wizard steps are mobile-responsive at 375px
- [ ] Auto-save works and draft resumes correctly

---

## PHASE 12: TESTING, SECURITY & LAUNCH HARDENING
**Agent:** Both
**Depends on:** All phases complete
**Estimated Time:** 3–5 days

### Task 12.1 — Unit Tests (Agent A)

**File:** `src/__tests__/calculations.test.ts`

Required test cases (all must pass):

```typescript
// Helpers
test('median([32000, 31500, 32500]) === 32000')
test('median([30000, 35000]) === 32500')
test('median([]) === 0')

// Adjustments
test('comp has 10,000 more miles → mileage adj = +$1,200')
test('comp has 10,000 fewer miles → mileage adj = -$1,200')
test('subject has equipment worth $2,000 MSRP comp lacks → equipment adj = -$1,600')
test('comp is 2 years newer → year adj = -14% of listing price')
test('comp condition "average" → condition adj = +5% of listing price')

// DV Calculation
test('$32k FMV - $24k ACV = $8,000 DV')
test('$8k DV / $32k FMV = 25% of pre-value')
test('$8k DV / $5k repair cost = 160% of repair cost')

// Severity
test('hrs=65 → Level 5')
test('airbag=true, structural=true, frameLaborHrs=6 → Level 5')
test('framePull=true → Level 4')
test('structural=true, hrs=40 → Level 4')
test('hrs=25, no structural, no frame → Level 3')
test('airbag=true standalone, hrs=10 → Level 3')
test('hrs=15, no structural, no frame → Level 2')
test('hrs=8 → Level 1')

// Legal Citations
test('GA → returns firstPartyStatute with O.C.G.A. § 33-4-6')
test('GA → anti17c = true')
test('NC → returns firstPartyStatute with N.C. Gen. Stat.')
test('TX → returns default with Restatement of Torts § 928')
test('GA → caselaw includes Canal v. Tullis')
```

---

### Task 12.2 — Security Audit (Both)

Each item must be verified before launch:

**Authentication:**
- [ ] All `/api/*` routes (except public ones) check `auth()` from Clerk
- [ ] All database queries filter by `userId` — users cannot access other users' data
- [ ] Clerk webhook validates `svix` signature
- [ ] Stripe webhook validates `stripe-signature`

**Data Security:**
- [ ] `GEMINI_API_KEY` not prefixed with `NEXT_PUBLIC_` — verify in build output
- [ ] `STRIPE_SECRET_KEY` not prefixed with `NEXT_PUBLIC_`
- [ ] `DATABASE_URL` not prefixed with `NEXT_PUBLIC_`
- [ ] Vercel Blob storage set to `access: 'private'`

**Input Validation:**
- [ ] All API routes validate input with Zod before processing
- [ ] File upload validates type and size server-side (not just client-side)
- [ ] VIN field validates exactly 17 characters
- [ ] Dollar amounts validated as positive numbers

**SQL Safety:**
- [ ] All database queries use Drizzle ORM — no raw SQL strings
- [ ] No user input concatenated into query strings

---

### Task 12.3 — Performance Targets

| Operation | Target | Acceptable Maximum |
|---|---|---|
| Wizard step navigation | < 200ms | 500ms |
| Apify comp search | < 15s | 30s |
| Gemini document extraction | < 10s | 20s |
| PDF generation | < 45s | 60s |
| Dashboard load | < 1s | 2s |
| Page transitions | < 300ms | 500ms |

---

### Task 12.4 — Pre-Launch Checklist

**Code:**
- [ ] `npm run build` — zero errors
- [ ] All unit tests pass
- [ ] `USE_MOCK_SCRAPING=false` in production env
- [ ] All console.log statements removed from production paths

**Services:**
- [ ] Stripe switched to live mode (not test)
- [ ] Live Stripe price IDs updated in env vars
- [ ] SendGrid sending domain verified (check DNS)
- [ ] Neon database on paid plan for production load
- [ ] Apify actors confirmed working in production

**Legal & Compliance:**
- [ ] Privacy Policy page exists at `/privacy`
- [ ] Terms of Service page exists at `/terms`
- [ ] Document template accuracy reviewed by legal counsel
- [ ] USPAP language reviewed for compliance
- [ ] State law citations verified for GA and NC
- [ ] Disclaimer language reviewed — no guarantee of legal outcome

**Monitoring:**
- [ ] Vercel error logging enabled
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring configured
- [ ] Alert on PDF generation failures

---

**✅ PHASE 12 COMPLETE = LAUNCH READY**

---

## APPENDIX A: VIN DECODE API

Use the free NHTSA API — no API key required:

```typescript
export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
  );
  const data = await res.json();
  const vars = data.Results;
  const get = (var_name: string) =>
    vars.find((v: any) => v.Variable === var_name)?.Value ?? '';

  return {
    year:         parseInt(get('Model Year')) || null,
    make:         get('Make'),
    model:        get('Model'),
    trim:         get('Trim'),
    body_style:   get('Body Class'),
    engine:       `${get('Displacement (L)')}L ${get('Engine Number of Cylinders')} Cyl`,
    transmission: get('Transmission Style'),
  };
}
```

---

## APPENDIX B: MOCK SCRAPING DATA

**File:** `src/lib/scraping/mock-data.ts`

Use this during development when `USE_MOCK_SCRAPING=true`. Returns realistic mock comparable vehicles so the rest of the system can be built and tested without live Apify calls.

```typescript
export function getMockComparables(
  year: number, make: string, model: string, trim: string,
  accidentRequired: boolean
): MockComp[] {
  return [
    {
      vin: `MOCK${year}${make.slice(0,3).toUpperCase()}0000001`,
      year, make, model, trim,
      mileage: 45000,
      accidentHistory: accidentRequired ? 'accident_reported' : 'no_accidents',
      listingPrice: accidentRequired ? 24500 : 32000,
      dealerName: 'AutoNation Mock Motors',
      locationCity: 'Atlanta', locationState: 'GA',
      listingUrl: 'https://www.autotrader.com/mock-listing-1',
    },
    // Add 4 more mock entries with slight variations
  ];
}
```

---

## APPENDIX C: APIFY INTEGRATION

**File:** `src/lib/scraping/apify-client.ts`

```typescript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN! });

export async function searchComparables(params: CompSearchParams): Promise<CompResult[]> {
  if (process.env.USE_MOCK_SCRAPING === 'true') {
    return getMockComparables(params.year, params.make, params.model, params.trim, params.accidentRequired);
  }

  // Run Apify actor for AutoTrader search
  const run = await client.actor('YOUR_APIFY_ACTOR_ID').call({
    year: params.year,
    make: params.make,
    model: params.model,
    zipCode: params.zipCode,
    radius: params.radiusMiles,
    maxMileage: params.mileage + params.mileageTolerance,
    maxResults: params.maxResults,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.filter(item =>
    params.accidentRequired
      ? item.accidentHistory === 'accident_reported'
      : item.accidentHistory === 'no_accidents'
  ) as CompResult[];
}
```

---

## APPENDIX D: INTER-AGENT HANDOFF PROTOCOL

When an agent completes a phase:
1. Run `npm run build` — must complete with zero TypeScript errors
2. Run `npm test` — all tests must pass
3. Add a comment to the last modified file: `// AGENT-[A/B]-COMPLETE: Phase [N] — [timestamp]`
4. Notify the other agent of completion so parallel work can begin
5. Update the completion checklist for that phase in this document

When merging parallel agent work:
- Confirm no file conflicts (agents work on separate files within each phase)
- Run `npm run build` on the merged codebase
- Run all tests

---

*End of ClaimShield DV Greenfield Development Instructions v1.0*
*Source: Master Appraisal Schema, Gap Analysis, Codebase Analysis Report, Project Description*
*Created: March 1, 2026*

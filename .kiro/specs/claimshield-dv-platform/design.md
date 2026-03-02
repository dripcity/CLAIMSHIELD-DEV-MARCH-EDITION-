# Design Document: ClaimShield DV Platform

## Overview

ClaimShield DV is a Next.js 14-based SaaS platform that generates professional diminished value (DV) appraisal reports using AI-powered document extraction, automated comparable vehicle search, and legally-recognized valuation methodologies. The system guides users through an 8-step wizard to create comprehensive 15-25 page PDF reports with state-specific legal citations.

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode, no `any` types)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **File Storage**: Vercel Blob (private access with signed URLs)
- **AI**: Google Gemini 3.1 Pro
- **Web Scraping**: Apify
- **Payments**: Stripe
- **Email**: SendGrid
- **PDF Generation**: @react-pdf/renderer
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod

### Key Design Principles

1. **Type Safety**: TypeScript everywhere with strict typing
2. **Security First**: All secrets server-side only, user ownership validation on every query
3. **Exact Calculations**: Precise constants ($0.12/mile, 80% MSRP, 7% annual depreciation)
4. **Median-Based Valuation**: Use median, not mean, for all comparable calculations
5. **State-Specific Logic**: Dynamic legal citations based on owner state
6. **Mobile-First**: Responsive design from 320px to 2560px
7. **Performance**: Sub-second page loads, clear loading states for long operations

## Architecture

### Application Structure

```
app/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── onboarding/page.tsx
├── (dashboard)/
│   ├── layout.tsx                    # Protected layout with auth check
│   ├── dashboard/page.tsx            # Appraisal list
│   ├── appraisals/
│   │   ├── new/page.tsx              # Wizard entry
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Appraisal detail
│   │   │   ├── wizard/page.tsx       # 8-step wizard
│   │   │   ├── preview/page.tsx      # PDF preview
│   │   │   ├── documents/page.tsx    # Document library
│   │   │   └── templates/page.tsx    # Document templates
│   └── settings/page.tsx
├── api/
│   ├── webhooks/
│   │   ├── clerk/route.ts            # User creation webhook
│   │   └── stripe/route.ts           # Payment webhooks
│   ├── appraisals/
│   │   ├── route.ts                  # List, create
│   │   ├── [id]/route.ts             # Get, update, delete
│   │   ├── [id]/auto-save/route.ts   # Draft auto-save
│   │   └── [id]/generate-pdf/route.ts
│   ├── documents/
│   │   ├── upload/route.ts           # File upload to Blob
│   │   ├── extract/route.ts          # AI extraction
│   │   └── [id]/route.ts             # Delete document
│   ├── comparables/
│   │   ├── search/route.ts           # Apify scraping
│   │   └── [id]/route.ts             # Update, delete
│   ├── calculations/
│   │   └── route.ts                  # Valuation calculations
│   ├── templates/
│   │   └── [type]/route.ts           # Generate document templates
│   └── checkout/
│       └── route.ts                  # Stripe checkout session
├── _components/
│   ├── wizard/
│   │   ├── WizardLayout.tsx
│   │   ├── WizardProgress.tsx
│   │   ├── Step1VehicleInfo.tsx
│   │   ├── Step2OwnerInfo.tsx
│   │   ├── Step3AccidentDetails.tsx
│   │   ├── Step4DocumentUpload.tsx
│   │   ├── Step5Comparables.tsx
│   │   ├── Step6Calculations.tsx
│   │   ├── Step7Review.tsx
│   │   └── Step8Generate.tsx
│   ├── ui/                           # shadcn/ui components
│   ├── FileUpload.tsx
│   ├── DocumentPreview.tsx
│   ├── ComparableCard.tsx
│   ├── CalculationBreakdown.tsx
│   └── StateLawBanner.tsx
└── lib/
    ├── db/
    │   ├── schema.ts                 # Drizzle schema
    │   └── index.ts                  # DB client
    ├── ai/
    │   ├── gemini.ts                 # Gemini client
    │   ├── extract-repair-estimate.ts
    │   ├── extract-insurance-docs.ts
    │   ├── extract-vehicle-info.ts
    │   └── analyze-images.ts
    ├── calculations/
    │   ├── valuation.ts              # Median calculations
    │   ├── adjustments.ts            # Mileage, equipment, year, condition
    │   ├── severity-classifier.ts    # 5-level classification
    │   └── naaa-grading.ts           # NAAA grade assignment
    ├── scraping/
    │   └── apify-search.ts           # Comparable vehicle search
    ├── pdf/
    │   ├── generator.ts              # Main PDF generation
    │   ├── components/               # React-PDF components
    │   │   ├── CoverPage.tsx
    │   │   ├── CoverLetter.tsx
    │   │   ├── VehicleInfo.tsx
    │   │   ├── ComparablesSection.tsx
    │   │   ├── ValuationAnalysis.tsx
    │   │   ├── SeverityAnalysis.tsx
    │   │   ├── LegalCitations.tsx
    │   │   └── Disclaimers.tsx
    │   └── narratives.ts             # Narrative generation
    ├── templates/
    │   ├── demand-letter-ga.ts
    │   ├── demand-letter-generic.ts
    │   ├── bad-faith-calculator.ts
    │   ├── expert-affidavit.ts
    │   └── market-stigma.ts
    ├── email/
    │   └── sendgrid.ts               # Email templates
    ├── payments/
    │   └── stripe.ts                 # Stripe helpers
    ├── storage/
    │   └── blob.ts                   # Vercel Blob helpers
    ├── legal/
    │   └── state-citations.ts        # State-specific legal text
    ├── validation/
    │   └── schemas.ts                # Zod schemas
    └── utils/
        ├── auth.ts                   # Auth helpers
        ├── formatting.ts             # Currency, date formatting
        └── constants.ts              # Calculation constants
```

### Data Flow

1. **User Authentication**: Clerk → Webhook → Create user record in DB
2. **Appraisal Creation**: User input → Auto-save every 30s → Draft persistence
3. **Document Upload**: Client → API route → Vercel Blob → Save URL to DB
4. **AI Extraction**: Document URL → Gemini API → Structured JSON → Pre-fill form
5. **Comparable Search**: Vehicle specs → Apify → Scrape listings → Save to DB
6. **Calculations**: Comparables + adjustments → Median calculation → Save results
7. **PDF Generation**: Appraisal data → React-PDF → Vercel Blob → Save URL
8. **Payment**: Stripe checkout → Webhook → Update entitlement → Unlock features

## Components and Interfaces

### Database Schema (Drizzle ORM)


```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['individual', 'appraiser', 'attorney', 'body_shop', 'admin']);
export const statusEnum = pgEnum('appraisal_status', ['draft', 'complete', 'sent', 'archived']);
export const compTypeEnum = pgEnum('comp_type', ['pre_accident', 'post_accident']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  role: roleEnum('role').default('individual'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  reportsRemaining: integer('reports_remaining').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appraisals = pgTable('appraisals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: statusEnum('status').default('draft'),
  
  // Claim information
  claimNumber: text('claim_number'),
  appraisalDate: timestamp('appraisal_date'),
  accidentDate: timestamp('accident_date'),
  purpose: text('purpose'),
  
  // Owner information
  ownerInfo: jsonb('owner_info').$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  
  // Insurance information
  insuranceInfo: jsonb('insurance_info').$type<{
    company: string;
    policyNumber: string;
    claimNumber: string;
    adjusterName?: string;
    adjusterPhone?: string;
    adjusterEmail?: string;
  }>(),
  
  // Subject vehicle
  subjectVehicle: jsonb('subject_vehicle').$type<{
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    engine?: string;
    transmission?: string;
    bodyStyle?: string;
    exteriorColor?: string;
    interiorColor?: string;
    mileage: number;
    preAccidentCondition: 'excellent' | 'good' | 'average' | 'below_average';
    preAccidentNaaaGrade: string;
    optionalEquipment?: string[];
  }>(),
  
  // Accident details
  accidentDetails: jsonb('accident_details').$type<{
    pointOfImpact: string;
    structuralDamage: boolean;
    airbagDeployment: boolean;
    framePulling: boolean;
    panelsReplaced: string[];
    paintedPanels: string[];
    totalRepairCost: number;
    partsCost: number;
    laborCost: number;
    paintCost: number;
    bodyLaborHours: number;
    frameLaborHours: number;
    refinishLaborHours: number;
    mechanicalLaborHours: number;
    totalLaborHours: number;
    oemParts: boolean;
    aftermarketParts: boolean;
    refurbishedParts: boolean;
    repairFacility?: string;
    repairFacilityPhone?: string;
    estimateDate?: string;
  }>(),
  
  // Valuation results
  valuationResults: jsonb('valuation_results').$type<{
    preAccidentFmv: number;
    postRepairAcv: number;
    diminishedValue: number;
    dvPercentOfValue: number;
    dvPercentOfRepair: number;
    confidenceRangeLow: number;
    confidenceRangeHigh: number;
    preAccidentCompsCount: number;
    postAccidentCompsCount: number;
  }>(),
  
  // Severity analysis
  severityAnalysis: jsonb('severity_analysis').$type<{
    severityLevel: 1 | 2 | 3 | 4 | 5;
    severityLabel: 'Minor' | 'Moderate' | 'Medium' | 'Major' | 'Severe';
    postRepairNaaaGrade: string;
    justification: string;
  }>(),
  
  // Appraiser information (for professional appraisers)
  appraiserInfo: jsonb('appraiser_info').$type<{
    name?: string;
    license?: string;
    certifications?: string[];
    signatureUrl?: string;
  }>(),
  
  // Document URLs
  repairEstimateUrl: text('repair_estimate_url'),
  damagePhotos: jsonb('damage_photos').$type<string[]>(),
  repairPhotos: jsonb('repair_photos').$type<string[]>(),
  insuranceDocs: jsonb('insurance_docs').$type<string[]>(),
  reportPdfUrl: text('report_pdf_url'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const comparableVehicles = pgTable('comparable_vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  appraisalId: uuid('appraisal_id').notNull().references(() => appraisals.id, { onDelete: 'cascade' }),
  compType: compTypeEnum('comp_type').notNull(),
  source: text('source'), // 'apify', 'manual'
  
  // Vehicle details
  vin: text('vin'),
  year: integer('year').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  trim: text('trim'),
  mileage: integer('mileage').notNull(),
  accidentHistory: boolean('accident_history').notNull(),
  
  // Listing details
  listingUrl: text('listing_url'),
  listingPrice: decimal('listing_price', { precision: 10, scale: 2 }).notNull(),
  dealerName: text('dealer_name'),
  dealerPhone: text('dealer_phone'),
  locationCity: text('location_city'),
  locationState: text('location_state'),
  distanceMiles: integer('distance_miles'),
  
  // Adjustments
  adjustments: jsonb('adjustments').$type<{
    mileage: number;
    equipment: number;
    year: number;
    condition: number;
    total: number;
  }>(),
  adjustedValue: decimal('adjusted_value', { precision: 10, scale: 2 }),
  
  // Calculation inclusion
  includedInCalculation: boolean('included_in_calculation').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Indexes for performance
export const appraisalsUserIdIdx = pgTable('appraisals').index('appraisals_user_id_idx').on(appraisals.userId);
export const appraisalsStatusIdx = pgTable('appraisals').index('appraisals_status_idx').on(appraisals.status);
export const comparablesAppraisalIdIdx = pgTable('comparable_vehicles').index('comparables_appraisal_id_idx').on(comparableVehicles.appraisalId);
```

### API Routes

#### Authentication Middleware

```typescript
// lib/utils/auth.ts
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function requireAppraisalOwnership(appraisalId: string, userId: string) {
  const [appraisal] = await db
    .select()
    .from(appraisals)
    .where(eq(appraisals.id, appraisalId));
  
  if (!appraisal) {
    throw new Error('Appraisal not found');
  }
  
  if (appraisal.userId !== userId) {
    throw new Error('Forbidden');
  }
  
  return appraisal;
}

export async function checkEntitlement(user: typeof users.$inferSelect) {
  // Check if user has active subscription or reports remaining
  if (user.subscriptionStatus === 'active') {
    return true;
  }
  
  if (user.reportsRemaining && user.reportsRemaining > 0) {
    return true;
  }
  
  return false;
}
```

#### Appraisal Routes

```typescript
// app/api/appraisals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createAppraisalSchema = z.object({
  claimNumber: z.string().optional(),
  purpose: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    
    const userAppraisals = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.userId, user.id))
      .orderBy(appraisals.updatedAt);
    
    return NextResponse.json(userAppraisals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = createAppraisalSchema.parse(body);
    
    const [newAppraisal] = await db
      .insert(appraisals)
      .values({
        userId: user.id,
        status: 'draft',
        ...validated,
      })
      .returning();
    
    return NextResponse.json(newAppraisal);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

```typescript
// app/api/appraisals/[id]/auto-save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await requireAppraisalOwnership(params.id, user.id);
    
    const body = await req.json();
    
    const [updated] = await db
      .update(appraisals)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, params.id))
      .returning();
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

#### Document Upload and AI Extraction

```typescript
// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { put } from '@vercel/blob';
import { z } from 'zod';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const appraisalId = formData.get('appraisalId') as string;
    const fileType = formData.get('fileType') as string; // 'repair_estimate', 'damage_photo', etc.
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Upload to Vercel Blob with private access
    const blob = await put(`${appraisalId}/${fileType}/${file.name}`, file, {
      access: 'public', // Will use signed URLs for access
      addRandomSuffix: true,
    });
    
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

```typescript
// app/api/documents/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { extractRepairEstimate } from '@/lib/ai/extract-repair-estimate';
import { extractInsuranceDocs } from '@/lib/ai/extract-insurance-docs';
import { extractVehicleInfo } from '@/lib/ai/extract-vehicle-info';
import { analyzeImages } from '@/lib/ai/analyze-images';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { documentUrl, documentType } = await req.json();
    
    let extractedData;
    
    switch (documentType) {
      case 'repair_estimate':
        extractedData = await extractRepairEstimate(documentUrl);
        break;
      case 'insurance_docs':
        extractedData = await extractInsuranceDocs(documentUrl);
        break;
      case 'vehicle_docs':
        extractedData = await extractVehicleInfo(documentUrl);
        break;
      case 'damage_photos':
        extractedData = await analyzeImages(documentUrl);
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    
    return NextResponse.json(extractedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Comparable Vehicle Search

```typescript
// app/api/comparables/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { searchComparables } from '@/lib/scraping/apify-search';
import { db } from '@/lib/db';
import { comparableVehicles } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId, vehicleSpecs, location, searchType } = await req.json();
    
    // searchType: 'pre_accident' or 'post_accident'
    const results = await searchComparables({
      year: vehicleSpecs.year,
      make: vehicleSpecs.make,
      model: vehicleSpecs.model,
      trim: vehicleSpecs.trim,
      mileage: vehicleSpecs.mileage,
      location: location,
      accidentHistory: searchType === 'post_accident',
    });
    
    // Save comparables to database
    const savedComps = await Promise.all(
      results.map(comp =>
        db.insert(comparableVehicles).values({
          appraisalId,
          compType: searchType,
          source: 'apify',
          ...comp,
        }).returning()
      )
    );
    
    return NextResponse.json(savedComps);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Valuation Calculations

```typescript
// app/api/calculations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { calculateValuation } from '@/lib/calculations/valuation';
import { classifySeverity } from '@/lib/calculations/severity-classifier';
import { db } from '@/lib/db';
import { appraisals, comparableVehicles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId } = await req.json();
    
    await requireAppraisalOwnership(appraisalId, user.id);
    
    // Get appraisal and comparables
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId));
    
    const comps = await db
      .select()
      .from(comparableVehicles)
      .where(eq(comparableVehicles.appraisalId, appraisalId));
    
    // Calculate severity
    const severityAnalysis = classifySeverity(appraisal.accidentDetails);
    
    // Calculate valuation
    const valuationResults = calculateValuation(
      appraisal.subjectVehicle,
      comps,
      severityAnalysis
    );
    
    // Update appraisal
    const [updated] = await db
      .update(appraisals)
      .set({
        valuationResults,
        severityAnalysis,
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, appraisalId))
      .returning();
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### PDF Generation

```typescript
// app/api/appraisals/[id]/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership, checkEntitlement } from '@/lib/utils/auth';
import { generatePDF } from '@/lib/pdf/generator';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { appraisals, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await requireAppraisalOwnership(params.id, user.id);
    
    // Check entitlement
    const hasEntitlement = await checkEntitlement(user);
    if (!hasEntitlement) {
      return NextResponse.json(
        { error: 'No active subscription or reports remaining' },
        { status: 403 }
      );
    }
    
    // Get appraisal with all data
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, params.id));
    
    // Generate PDF
    const pdfBuffer = await generatePDF(appraisal);
    
    // Upload to Blob
    const blob = await put(
      `reports/${params.id}/appraisal-${Date.now()}.pdf`,
      pdfBuffer,
      {
        access: 'public',
        contentType: 'application/pdf',
      }
    );
    
    // Update appraisal
    await db
      .update(appraisals)
      .set({
        reportPdfUrl: blob.url,
        status: 'complete',
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, params.id));
    
    // Decrement reports remaining if not subscription
    if (user.subscriptionStatus !== 'active' && user.reportsRemaining > 0) {
      await db
        .update(users)
        .set({
          reportsRemaining: user.reportsRemaining - 1,
        })
        .where(eq(users.id, user.id));
    }
    
    return NextResponse.json({ pdfUrl: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Stripe Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if it's a one-time purchase or subscription
      if (session.mode === 'payment') {
        // One-time report purchase
        await db
          .update(users)
          .set({
            reportsRemaining: 1,
            stripeCustomerId: session.customer as string,
          })
          .where(eq(users.clerkId, session.metadata!.clerkId));
      }
      break;
    }
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await db
        .update(users)
        .set({
          subscriptionStatus: 'canceled',
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      await db
        .update(users)
        .set({
          subscriptionStatus: 'past_due',
        })
        .where(eq(users.stripeCustomerId, invoice.customer as string));
      
      // TODO: Send email notification
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}
```

### Wizard Components


```typescript
// app/_components/wizard/WizardLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardProgress } from './WizardProgress';

interface WizardLayoutProps {
  appraisalId: string;
  currentStep: number;
  children: React.ReactNode;
}

export function WizardLayout({ appraisalId, currentStep, children }: WizardLayoutProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetch(`/api/appraisals/${appraisalId}/auto-save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [appraisalId, formData]);
  
  const handleNext = async () => {
    // Validate current step
    // Save data
    // Navigate to next step
    router.push(`/appraisals/${appraisalId}/wizard?step=${currentStep + 1}`);
  };
  
  const handleBack = () => {
    router.push(`/appraisals/${appraisalId}/wizard?step=${currentStep - 1}`);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} totalSteps={8} />
      <div className="mt-8">{children}</div>
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button onClick={handleBack}>Back</button>
        )}
        <button onClick={handleNext}>
          {currentStep === 8 ? 'Generate Report' : 'Next'}
        </button>
      </div>
    </div>
  );
}
```


```typescript
// app/_components/FileUpload.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  appraisalId: string;
  fileType: string;
  onUploadComplete: (url: string) => void;
  maxFiles?: number;
}

export function FileUpload({ appraisalId, fileType, onUploadComplete, maxFiles = 20 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    maxFiles,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('appraisalId', appraisalId);
        formData.append('fileType', fileType);
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        
        const { url } = await response.json();
        onUploadComplete(url);
      }
      
      setUploading(false);
    },
  });
  
  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer">
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading... {progress}%</p>
      ) : (
        <p>Drag and drop files here, or click to browse</p>
      )}
    </div>
  );
}
```

## Data Models

### Appraisal Data Model

The appraisal is the central entity in the system. It contains:

- **Claim Information**: Claim number, dates, purpose
- **Owner Information**: Contact details, address (used for state-specific logic)
- **Insurance Information**: Company, policy, adjuster details
- **Subject Vehicle**: VIN, specs, condition, equipment
- **Accident Details**: Damage description, repair costs, labor hours
- **Valuation Results**: FMV, ACV, DV amount, confidence ranges
- **Severity Analysis**: Classification level, NAAA grade, justification
- **Document URLs**: References to uploaded files in Blob storage


### Comparable Vehicle Data Model

Comparable vehicles are linked to appraisals via foreign key. Each comparable contains:

- **Vehicle Specs**: Year, make, model, trim, mileage
- **Listing Details**: Price, dealer, location, distance
- **Accident History**: Boolean flag for pre/post accident classification
- **Adjustments**: Mileage, equipment, year, condition adjustments
- **Adjusted Value**: Final value after all adjustments
- **Inclusion Flag**: Whether to include in median calculation

### Calculation Constants

```typescript
// lib/utils/constants.ts
export const CALCULATION_CONSTANTS = {
  MILEAGE_ADJUSTMENT_PER_MILE: 0.12,
  EQUIPMENT_MSRP_MULTIPLIER: 0.80,
  ANNUAL_DEPRECIATION_RATE: 0.07,
  DEPRECIATION_MAX_YEARS: 5,
  
  NAAA_GRADE_MULTIPLIERS: {
    '5 - Excellent': 1.00,
    '4 - Good': 0.95,
    '3 - Average': 0.90,
    '2 - Below Average': 0.85,
    '1 - Rough': 0.75,
  },
  
  SEVERITY_LEVELS: {
    1: 'Minor',
    2: 'Moderate',
    3: 'Medium',
    4: 'Major',
    5: 'Severe',
  },
  
  SEVERITY_TO_NAAA: {
    5: '1 - Rough',
    4: '2 - Below Average',
    3: '3 - Average',
    2: '4 - Good',
    1: '4 - Good', // or '3 - Average' depending on pre-accident grade
  },
} as const;
```

### AI Extraction Schemas

```typescript
// lib/ai/schemas.ts
import { z } from 'zod';

export const repairEstimateSchema = z.object({
  repairFacility: z.string().optional(),
  repairFacilityPhone: z.string().optional(),
  estimateDate: z.string().optional(),
  totalRepairCost: z.number(),
  partsCost: z.number(),
  laborCost: z.number(),
  paintCost: z.number(),
  bodyLaborHours: z.number(),
  frameLaborHours: z.number(),
  refinishLaborHours: z.number(),
  mechanicalLaborHours: z.number(),
  totalLaborHours: z.number(),
  framePulling: z.boolean(),
  airbagDeployment: z.boolean(),
  structuralDamage: z.boolean(),
  panelsReplaced: z.array(z.string()),
  paintedPanels: z.array(z.string()),
  oemParts: z.boolean(),
  aftermarketParts: z.boolean(),
  refurbishedParts: z.boolean(),
  lineItems: z.array(z.object({
    description: z.string(),
    partCost: z.number().optional(),
    laborCost: z.number().optional(),
    laborHours: z.number().optional(),
    laborType: z.enum(['body', 'frame', 'refinish', 'mechanical']).optional(),
    category: z.enum(['OEM', 'aftermarket', 'refurbished', 'labor', 'paint', 'other']),
  })),
  confidence: z.number().min(0).max(1),
});

export const insuranceDocsSchema = z.object({
  company: z.string(),
  policyNumber: z.string(),
  claimNumber: z.string(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  adjusterEmail: z.string().optional(),
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const vehicleInfoSchema = z.object({
  vin: z.string().length(17),
  year: z.number(),
  make: z.string(),
  model: z.string(),
  trim: z.string().optional(),
  mileage: z.number(),
  confidence: z.number().min(0).max(1),
});

export const imageAnalysisSchema = z.object({
  pointOfImpact: z.string(),
  structuralDamage: z.boolean(),
  suspectedFrameDamage: z.boolean(),
  airbagDeployment: z.boolean(),
  damagedPanels: z.array(z.string()),
  damageScope: z.enum(['minor', 'moderate', 'major', 'severe']),
  preAccidentCondition: z.enum(['excellent', 'good', 'average', 'below_average']),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});
```


### AI Integration (Gemini 3.1 Pro)

```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractStructuredData<T>(
  documentUrl: string,
  prompt: string,
  schema: any
): Promise<T> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  // Fetch document content
  const response = await fetch(documentUrl);
  const buffer = await response.arrayBuffer();
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType: response.headers.get('content-type') || 'application/pdf',
      },
    },
    { text: prompt },
  ]);
  
  const text = result.response.text();
  const parsed = JSON.parse(text);
  
  // Validate against schema
  return schema.parse(parsed);
}
```

```typescript
// lib/ai/extract-repair-estimate.ts
import { extractStructuredData } from './gemini';
import { repairEstimateSchema } from './schemas';

const REPAIR_ESTIMATE_PROMPT = `
Analyze this repair estimate document and extract the following information in JSON format:

1. Repair facility name and phone number
2. Estimate date
3. Total costs: parts, labor, paint, total
4. Labor hours by category: body, frame, refinish, mechanical
5. Identify if frame pulling is mentioned
6. Identify if airbags were deployed
7. Identify structural damage indicators
8. List all panels being replaced
9. List all panels being painted
10. Identify part types used: OEM, aftermarket, refurbished
11. Extract all line items with descriptions, costs, and labor hours

For each line item, categorize the labor type and part category.
Calculate total labor hours as the sum of all categories.
Provide a confidence score (0-1) for the extraction quality.

Return ONLY valid JSON matching this structure:
{
  "repairFacility": "string",
  "repairFacilityPhone": "string",
  "estimateDate": "YYYY-MM-DD",
  "totalRepairCost": number,
  "partsCost": number,
  "laborCost": number,
  "paintCost": number,
  "bodyLaborHours": number,
  "frameLaborHours": number,
  "refinishLaborHours": number,
  "mechanicalLaborHours": number,
  "totalLaborHours": number,
  "framePulling": boolean,
  "airbagDeployment": boolean,
  "structuralDamage": boolean,
  "panelsReplaced": ["string"],
  "paintedPanels": ["string"],
  "oemParts": boolean,
  "aftermarketParts": boolean,
  "refurbishedParts": boolean,
  "lineItems": [
    {
      "description": "string",
      "partCost": number,
      "laborCost": number,
      "laborHours": number,
      "laborType": "body" | "frame" | "refinish" | "mechanical",
      "category": "OEM" | "aftermarket" | "refurbished" | "labor" | "paint" | "other"
    }
  ],
  "confidence": number
}
`;

export async function extractRepairEstimate(documentUrl: string) {
  return extractStructuredData(
    documentUrl,
    REPAIR_ESTIMATE_PROMPT,
    repairEstimateSchema
  );
}
```


```typescript
// lib/ai/analyze-images.ts
import { extractStructuredData } from './gemini';
import { imageAnalysisSchema } from './schemas';

const IMAGE_ANALYSIS_PROMPT = `
Analyze these before and after vehicle damage photos and extract:

1. Point of impact (e.g., "front driver side", "rear passenger quarter panel")
2. Whether structural damage is visible
3. Whether frame damage is suspected
4. Whether airbag deployment is visible
5. List of damaged panels
6. Overall damage scope: minor, moderate, major, or severe
7. Pre-accident condition assessment from before photos: excellent, good, average, or below_average
8. A professional 2-3 sentence description of the damage

Provide a confidence score (0-1) for the analysis quality.

Return ONLY valid JSON matching this structure:
{
  "pointOfImpact": "string",
  "structuralDamage": boolean,
  "suspectedFrameDamage": boolean,
  "airbagDeployment": boolean,
  "damagedPanels": ["string"],
  "damageScope": "minor" | "moderate" | "major" | "severe",
  "preAccidentCondition": "excellent" | "good" | "average" | "below_average",
  "description": "string",
  "confidence": number
}
`;

export async function analyzeImages(imageUrls: string[]) {
  // For multiple images, we'd need to handle them together
  // This is a simplified version for a single image
  return extractStructuredData(
    imageUrls[0],
    IMAGE_ANALYSIS_PROMPT,
    imageAnalysisSchema
  );
}
```

### Calculation Engine

```typescript
// lib/calculations/valuation.ts
import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

interface ComparableVehicle {
  listingPrice: number;
  mileage: number;
  year: number;
  accidentHistory: boolean;
}

interface SubjectVehicle {
  mileage: number;
  year: number;
  optionalEquipment?: string[];
}

interface Adjustment {
  mileage: number;
  equipment: number;
  year: number;
  condition: number;
  total: number;
}

export function calculateAdjustments(
  subject: SubjectVehicle,
  comparable: ComparableVehicle,
  naaaGrade: string,
  equipmentMsrp: number = 0
): Adjustment {
  // Mileage adjustment: $0.12 per mile difference
  const mileageDiff = comparable.mileage - subject.mileage;
  const mileageAdj = mileageDiff * CALCULATION_CONSTANTS.MILEAGE_ADJUSTMENT_PER_MILE;
  
  // Equipment adjustment: 80% of MSRP
  const equipmentAdj = equipmentMsrp * CALCULATION_CONSTANTS.EQUIPMENT_MSRP_MULTIPLIER;
  
  // Year adjustment: 7% per year for vehicles under 5 years old
  const yearDiff = comparable.year - subject.year;
  let yearAdj = 0;
  if (Math.abs(yearDiff) <= CALCULATION_CONSTANTS.DEPRECIATION_MAX_YEARS) {
    yearAdj = comparable.listingPrice * 
      CALCULATION_CONSTANTS.ANNUAL_DEPRECIATION_RATE * 
      yearDiff;
  }
  
  // Condition adjustment based on NAAA grade
  const gradeMultiplier = CALCULATION_CONSTANTS.NAAA_GRADE_MULTIPLIERS[naaaGrade] || 1.0;
  const conditionAdj = comparable.listingPrice * (1 - gradeMultiplier);
  
  const total = mileageAdj + equipmentAdj + yearAdj + conditionAdj;
  
  return {
    mileage: mileageAdj,
    equipment: equipmentAdj,
    year: yearAdj,
    condition: conditionAdj,
    total,
  };
}

export function calculateAdjustedValue(
  listingPrice: number,
  adjustments: Adjustment
): number {
  return listingPrice - adjustments.total;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[Math.max(0, index)];
}

export function calculateValuation(
  subjectVehicle: SubjectVehicle,
  comparables: ComparableVehicle[],
  severityAnalysis: { postRepairNaaaGrade: string }
) {
  // Separate pre-accident and post-accident comparables
  const preAccidentComps = comparables.filter(c => !c.accidentHistory);
  const postAccidentComps = comparables.filter(c => c.accidentHistory);
  
  // Calculate adjusted values for pre-accident comparables
  const preAccidentValues = preAccidentComps.map(comp => {
    const adjustments = calculateAdjustments(
      subjectVehicle,
      comp,
      '5 - Excellent' // Assume excellent pre-accident condition
    );
    return calculateAdjustedValue(comp.listingPrice, adjustments);
  });
  
  // Calculate adjusted values for post-accident comparables
  const postAccidentValues = postAccidentComps.map(comp => {
    const adjustments = calculateAdjustments(
      subjectVehicle,
      comp,
      severityAnalysis.postRepairNaaaGrade
    );
    return calculateAdjustedValue(comp.listingPrice, adjustments);
  });
  
  // Calculate medians (NOT means)
  const preAccidentFmv = calculateMedian(preAccidentValues);
  const postRepairAcv = calculateMedian(postAccidentValues);
  
  // Calculate diminished value
  const diminishedValue = preAccidentFmv - postRepairAcv;
  
  // Calculate confidence ranges (10th and 90th percentiles)
  const confidenceRangeLow = calculatePercentile(postAccidentValues, 10);
  const confidenceRangeHigh = calculatePercentile(postAccidentValues, 90);
  
  return {
    preAccidentFmv,
    postRepairAcv,
    diminishedValue,
    dvPercentOfValue: (diminishedValue / preAccidentFmv) * 100,
    dvPercentOfRepair: 0, // Will be calculated with repair cost
    confidenceRangeLow,
    confidenceRangeHigh,
    preAccidentCompsCount: preAccidentComps.length,
    postAccidentCompsCount: postAccidentComps.length,
  };
}
```


### Severity Classification Engine

```typescript
// lib/calculations/severity-classifier.ts
import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

interface AccidentDetails {
  totalLaborHours: number;
  frameLaborHours: number;
  bodyLaborHours: number;
  airbagDeployment: boolean;
  structuralDamage: boolean;
  framePulling: boolean;
  panelsReplaced: string[];
}

interface SeverityResult {
  severityLevel: 1 | 2 | 3 | 4 | 5;
  severityLabel: 'Minor' | 'Moderate' | 'Medium' | 'Major' | 'Severe';
  postRepairNaaaGrade: string;
  justification: string;
}

const STRUCTURAL_PANELS = [
  'frame rail',
  'unibody',
  'a-pillar',
  'b-pillar',
  'c-pillar',
  'rocker panel',
  'floor pan',
  'firewall',
];

function hasStructuralPanelReplacement(panelsReplaced: string[]): boolean {
  return panelsReplaced.some(panel =>
    STRUCTURAL_PANELS.some(structural =>
      panel.toLowerCase().includes(structural)
    )
  );
}

export function classifySeverity(
  accidentDetails: AccidentDetails,
  preAccidentGrade: string = '5 - Excellent'
): SeverityResult {
  const {
    totalLaborHours,
    frameLaborHours,
    airbagDeployment,
    structuralDamage,
    framePulling,
    panelsReplaced,
  } = accidentDetails;
  
  let severityLevel: 1 | 2 | 3 | 4 | 5;
  let justification: string;
  
  // Level 5 (Severe) - Most severe conditions
  if (totalLaborHours > 60) {
    severityLevel = 5;
    justification = `Severe damage classification due to excessive labor hours (${totalLaborHours} hours). ` +
      `Repairs of this magnitude indicate extensive structural and cosmetic damage requiring complete disassembly and reconstruction.`;
  } else if (airbagDeployment && structuralDamage && frameLaborHours > 5) {
    severityLevel = 5;
    justification = `Severe damage classification due to airbag deployment combined with structural damage and significant frame work (${frameLaborHours} hours). ` +
      `This combination indicates a high-energy impact affecting the vehicle's safety systems and structural integrity.`;
  } else if (frameLaborHours > 10) {
    severityLevel = 5;
    justification = `Severe damage classification due to extensive frame work (${frameLaborHours} hours). ` +
      `Frame repairs of this magnitude indicate substantial structural compromise requiring specialized equipment and expertise.`;
  }
  // Level 4 (Major)
  else if (framePulling) {
    severityLevel = 4;
    justification = `Major damage classification due to frame pulling requirement. ` +
      `Frame pulling indicates structural deformation that required specialized hydraulic equipment to restore proper alignment.`;
  } else if (frameLaborHours > 0) {
    severityLevel = 4;
    justification = `Major damage classification due to frame work (${frameLaborHours} hours). ` +
      `Any frame involvement indicates structural damage that affects the vehicle's safety and integrity.`;
  } else if (structuralDamage && totalLaborHours > 35) {
    severityLevel = 4;
    justification = `Major damage classification due to structural damage combined with extensive labor (${totalLaborHours} hours). ` +
      `This indicates significant impact to load-bearing components requiring substantial repair work.`;
  } else if (airbagDeployment && totalLaborHours > 30) {
    severityLevel = 4;
    justification = `Major damage classification due to airbag deployment combined with extensive labor (${totalLaborHours} hours). ` +
      `Airbag deployment indicates a significant impact, and the labor hours confirm extensive damage.`;
  }
  // Level 3 (Medium)
  else if (totalLaborHours >= 20 && totalLaborHours <= 35) {
    severityLevel = 3;
    justification = `Medium damage classification due to moderate labor hours (${totalLaborHours} hours). ` +
      `This level of repair indicates substantial panel replacement and refinishing work.`;
  } else if (hasStructuralPanelReplacement(panelsReplaced) && totalLaborHours > 15) {
    severityLevel = 3;
    justification = `Medium damage classification due to structural panel replacement combined with significant labor (${totalLaborHours} hours). ` +
      `Replacement of structural panels: ${panelsReplaced.filter(p => STRUCTURAL_PANELS.some(s => p.toLowerCase().includes(s))).join(', ')}.`;
  } else if (airbagDeployment && !structuralDamage) {
    severityLevel = 3;
    justification = `Medium damage classification due to airbag deployment without structural damage. ` +
      `While airbags deployed, the impact did not compromise structural integrity, but still represents significant damage.`;
  }
  // Level 2 (Moderate)
  else if (totalLaborHours >= 10 && totalLaborHours < 20 && !structuralDamage) {
    severityLevel = 2;
    justification = `Moderate damage classification due to moderate labor hours (${totalLaborHours} hours) without structural involvement. ` +
      `Repairs limited to cosmetic panels and refinishing work.`;
  }
  // Level 1 (Minor)
  else {
    severityLevel = 1;
    justification = `Minor damage classification due to limited labor hours (${totalLaborHours} hours). ` +
      `Repairs limited to minor cosmetic work with no structural involvement.`;
  }
  
  // Determine post-repair NAAA grade based on severity
  let postRepairNaaaGrade: string;
  
  switch (severityLevel) {
    case 5:
      postRepairNaaaGrade = '1 - Rough';
      break;
    case 4:
      postRepairNaaaGrade = '2 - Below Average';
      break;
    case 3:
      postRepairNaaaGrade = '3 - Average';
      break;
    case 2:
      postRepairNaaaGrade = '4 - Good';
      break;
    case 1:
      postRepairNaaaGrade = preAccidentGrade === '5 - Excellent' ? '4 - Good' : '3 - Average';
      break;
  }
  
  return {
    severityLevel,
    severityLabel: CALCULATION_CONSTANTS.SEVERITY_LEVELS[severityLevel],
    postRepairNaaaGrade,
    justification,
  };
}
```

### Web Scraping (Apify)

```typescript
// lib/scraping/apify-search.ts
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

interface SearchParams {
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  location: string;
  accidentHistory: boolean;
}

export async function searchComparables(params: SearchParams) {
  const { year, make, model, trim, mileage, location, accidentHistory } = params;
  
  // Configure search parameters
  const input = {
    searchQuery: `${year} ${make} ${model} ${trim || ''}`,
    location: location,
    maxMileage: mileage + 15000, // 15k mile tolerance
    minMileage: Math.max(0, mileage - 15000),
    accidentHistory: accidentHistory ? 'yes' : 'no',
    maxResults: 5,
    radius: 100, // miles
  };
  
  // Run the Apify actor (using a hypothetical car listing scraper)
  const run = await client.actor('your-actor-id').call(input);
  
  // Fetch results
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  // Transform results to our format
  return items.map((item: any) => ({
    vin: item.vin,
    year: item.year,
    make: item.make,
    model: item.model,
    trim: item.trim,
    mileage: item.mileage,
    accidentHistory: item.accidentHistory,
    listingUrl: item.url,
    listingPrice: parseFloat(item.price),
    dealerName: item.dealerName,
    dealerPhone: item.dealerPhone,
    locationCity: item.city,
    locationState: item.state,
    distanceMiles: item.distance,
  }));
}
```


### State-Specific Legal Citations

```typescript
// lib/legal/state-citations.ts

interface LegalCitation {
  state: string;
  statutes: string[];
  caselaw: string[];
  methodology: string;
  antiFormula?: string;
}

export function getStateCitations(state: string): LegalCitation {
  const stateUpper = state.toUpperCase();
  
  switch (stateUpper) {
    case 'GA':
    case 'GEORGIA':
      return {
        state: 'Georgia',
        statutes: [
          'O.C.G.A. § 33-4-6 (First-Party Claims)',
          'O.C.G.A. § 33-4-7 (Third-Party Claims)',
        ],
        caselaw: [
          'Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)',
        ],
        methodology: 'Georgia law recognizes diminished value claims and requires insurers to pay the difference between pre-accident fair market value and post-repair actual cash value. The comparable sales method is the preferred methodology for establishing market value.',
        antiFormula: 'Georgia courts have rejected the use of the 17c formula (also known as the "Mitchell formula") for calculating diminished value. This formula is an arbitrary mathematical calculation that does not reflect actual market conditions. Instead, Georgia law requires appraisers to use the comparable sales method, which analyzes actual market transactions of similar vehicles with and without accident history.',
      };
    
    case 'NC':
    case 'NORTH CAROLINA':
      return {
        state: 'North Carolina',
        statutes: [
          'N.C. Gen. Stat. § 20-279.21(d)(1) (Appraisal Dispute Process)',
        ],
        caselaw: [],
        methodology: 'North Carolina law provides a formal appraisal dispute process for diminished value claims. The comparable sales method is recognized as a valid approach for establishing the difference in market value.',
      };
    
    default:
      return {
        state: state,
        statutes: [
          'Restatement (Second) of Torts § 928 (Measure of Damages)',
        ],
        caselaw: [],
        methodology: 'Under general tort law principles, a claimant is entitled to be made whole for property damage. This includes the difference between the vehicle\'s pre-accident fair market value and its post-repair actual cash value. The comparable sales method is a widely accepted approach for establishing this difference.',
      };
  }
}

export function generateLegalCitationsSection(state: string): string {
  const citations = getStateCitations(state);
  
  let section = `## Legal Foundation\n\n`;
  section += `### Applicable Law: ${citations.state}\n\n`;
  
  if (citations.statutes.length > 0) {
    section += `**Statutory Authority:**\n`;
    citations.statutes.forEach(statute => {
      section += `- ${statute}\n`;
    });
    section += `\n`;
  }
  
  if (citations.caselaw.length > 0) {
    section += `**Case Law:**\n`;
    citations.caselaw.forEach(caseRef => {
      section += `- ${caseRef}\n`;
    });
    section += `\n`;
  }
  
  section += `**Methodology:**\n\n${citations.methodology}\n\n`;
  
  if (citations.antiFormula) {
    section += `**Rejection of Formula-Based Calculations:**\n\n${citations.antiFormula}\n\n`;
  }
  
  return section;
}
```

### PDF Generation (@react-pdf/renderer)

```typescript
// lib/pdf/generator.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { AppraisalReport } from './components/AppraisalReport';

export async function generatePDF(appraisal: any): Promise<Buffer> {
  const pdfDocument = <AppraisalReport appraisal={appraisal} />;
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
```

```typescript
// lib/pdf/components/AppraisalReport.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CoverPage } from './CoverPage';
import { CoverLetter } from './CoverLetter';
import { VehicleInfo } from './VehicleInfo';
import { ComparablesSection } from './ComparablesSection';
import { ValuationAnalysis } from './ValuationAnalysis';
import { SeverityAnalysis } from './SeverityAnalysis';
import { LegalCitations } from './LegalCitations';
import { Disclaimers } from './Disclaimers';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 10,
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

interface AppraisalReportProps {
  appraisal: any;
}

export function AppraisalReport({ appraisal }: AppraisalReportProps) {
  return (
    <Document>
      <CoverPage appraisal={appraisal} />
      <CoverLetter appraisal={appraisal} />
      
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>ClaimShield DV — Diminished Value Appraisal</Text>
        <VehicleInfo vehicle={appraisal.subjectVehicle} />
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => 
          `Page ${pageNumber} of ${totalPages}`
        } fixed />
      </Page>
      
      <ComparablesSection 
        comparables={appraisal.comparables}
        compType="pre_accident"
      />
      
      <ComparablesSection 
        comparables={appraisal.comparables}
        compType="post_accident"
      />
      
      <ValuationAnalysis valuation={appraisal.valuationResults} />
      
      <SeverityAnalysis 
        severity={appraisal.severityAnalysis}
        accidentDetails={appraisal.accidentDetails}
      />
      
      <LegalCitations state={appraisal.ownerInfo.state} />
      
      <Disclaimers appraiserInfo={appraisal.appraiserInfo} />
    </Document>
  );
}
```


```typescript
// lib/pdf/components/CoverPage.tsx
import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
  },
  dvBox: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 8,
    marginVertical: 30,
  },
  dvLabel: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  dvAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  vehicleInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 120,
  },
  infoValue: {
    fontSize: 12,
  },
});

export function CoverPage({ appraisal }: { appraisal: any }) {
  const { subjectVehicle, valuationResults, ownerInfo, appraisalDate } = appraisal;
  
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Diminished Value Appraisal</Text>
      <Text style={styles.subtitle}>Professional Vehicle Valuation Report</Text>
      
      <View style={styles.dvBox}>
        <Text style={styles.dvLabel}>Calculated Diminished Value</Text>
        <Text style={styles.dvAmount}>
          ${valuationResults.diminishedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
      
      <View style={styles.vehicleInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle:</Text>
          <Text style={styles.infoValue}>
            {subjectVehicle.year} {subjectVehicle.make} {subjectVehicle.model} {subjectVehicle.trim}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>VIN:</Text>
          <Text style={styles.infoValue}>{subjectVehicle.vin}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mileage:</Text>
          <Text style={styles.infoValue}>{subjectVehicle.mileage.toLocaleString()} miles</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Owner:</Text>
          <Text style={styles.infoValue}>
            {ownerInfo.firstName} {ownerInfo.lastName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Appraisal Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(appraisalDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>
    </Page>
  );
}
```

### Document Template Generation

```typescript
// lib/templates/demand-letter-ga.ts

export function generateGeorgiaDemandLetter(appraisal: any): string {
  const { ownerInfo, insuranceInfo, subjectVehicle, valuationResults, accidentDate } = appraisal;
  
  const claimType = insuranceInfo.claimNumber.startsWith('1P') ? 'first-party' : 'third-party';
  const statute = claimType === 'first-party' ? 'O.C.G.A. § 33-4-6' : 'O.C.G.A. § 33-4-7';
  
  return `
${ownerInfo.firstName} ${ownerInfo.lastName}
${ownerInfo.address}
${ownerInfo.city}, ${ownerInfo.state} ${ownerInfo.zip}
${ownerInfo.email}
${ownerInfo.phone}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${insuranceInfo.company}
Claims Department
Attn: ${insuranceInfo.adjusterName || 'Claims Adjuster'}
${insuranceInfo.adjusterEmail || ''}

RE: Diminished Value Claim - 60-Day Demand
    Policy Number: ${insuranceInfo.policyNumber}
    Claim Number: ${insuranceInfo.claimNumber}
    Vehicle: ${subjectVehicle.year} ${subjectVehicle.make} ${subjectVehicle.model}
    VIN: ${subjectVehicle.vin}
    Date of Loss: ${new Date(accidentDate).toLocaleDateString('en-US')}

Dear Claims Representative:

This letter constitutes formal demand for payment of diminished value under ${statute}. I am the owner of the above-referenced vehicle, which sustained damage in an accident on ${new Date(accidentDate).toLocaleDateString('en-US')}.

While the vehicle has been repaired, it has suffered a permanent loss in fair market value due to its accident history. This loss is known as "diminished value" and is a compensable element of damages under Georgia law.

**Diminished Value Amount: $${valuationResults.diminishedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**

I have obtained a professional diminished value appraisal using the comparable sales method, which is the legally recognized methodology in Georgia. The appraisal compares actual market transactions of similar vehicles with and without accident history to determine the measurable loss in value.

Pursuant to ${statute}, you have 60 days from receipt of this demand to pay the diminished value claim. Failure to pay within 60 days may result in bad faith penalties of 50% of the claim amount plus attorney's fees and litigation costs.

I have attached the complete appraisal report for your review. Please remit payment within 60 days to avoid additional penalties.

Sincerely,

${ownerInfo.firstName} ${ownerInfo.lastName}
`;
}
```


## Error Handling

### Error Handling Strategy

The platform implements a comprehensive error handling strategy across all layers:

#### API Route Error Handling

All API routes follow a consistent error handling pattern:

```typescript
try {
  // Validate authentication
  const user = await requireAuth();
  
  // Validate input
  const validated = schema.parse(body);
  
  // Execute business logic
  const result = await performOperation(validated);
  
  return NextResponse.json(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  if (error.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (error.message === 'Forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

#### Client-Side Error Handling

Client components display user-friendly error messages:

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setError(null);
  setLoading(true);
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }
    
    const result = await response.json();
    // Handle success
  } catch (err) {
    setError(err.message || 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
}
```

#### AI Extraction Error Handling

AI extraction operations include fallback mechanisms:

- If extraction fails, display error message and allow manual entry
- Include confidence scores with extracted data
- Allow users to reject low-confidence extractions
- Retry mechanism for transient failures
- Timeout handling (10 seconds per document)

#### File Upload Error Handling

File upload operations validate:

- File size (max 25MB)
- File type (PDF, JPEG, PNG, WebP only)
- Maximum file count (20 per appraisal)
- Network errors with retry option
- Progress indication for large files

#### Payment Error Handling

Payment operations handle:

- Stripe API errors
- Webhook signature validation failures
- Duplicate payment attempts
- Failed payment notifications via email
- Subscription status synchronization

#### Database Error Handling

Database operations handle:

- Connection failures with retry logic
- Constraint violations (unique, foreign key)
- Transaction rollbacks on error
- Query timeouts
- Ownership validation failures

### Validation Schemas

All user input is validated using Zod schemas:

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const vinSchema = z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/);

export const emailSchema = z.string().email();

export const phoneSchema = z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/);

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const vehicleInfoSchema = z.object({
  vin: vinSchema,
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  mileage: z.number().int().min(0),
  preAccidentCondition: z.enum(['excellent', 'good', 'average', 'below_average']),
});

export const ownerInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
});

export const accidentDetailsSchema = z.object({
  pointOfImpact: z.string().min(1),
  structuralDamage: z.boolean(),
  airbagDeployment: z.boolean(),
  framePulling: z.boolean(),
  totalRepairCost: z.number().min(0),
  totalLaborHours: z.number().min(0),
  frameLaborHours: z.number().min(0),
}).refine(
  (data) => data.accidentDate <= new Date().toISOString(),
  { message: 'Accident date cannot be in the future' }
);
```


## Testing Strategy

### Dual Testing Approach

The platform requires both unit testing and property-based testing for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Testing Framework

- **Unit Testing**: Vitest
- **Property-Based Testing**: fast-check (JavaScript/TypeScript PBT library)
- **E2E Testing**: Playwright
- **API Testing**: Supertest with Vitest

### Property-Based Testing Configuration

All property tests must:

- Run minimum 100 iterations per test (due to randomization)
- Reference the design document property in a comment tag
- Tag format: `// Feature: claimshield-dv-platform, Property {number}: {property_text}`
- Use fast-check for generating random test data

Example property test structure:

```typescript
import { test } from 'vitest';
import * as fc from 'fast-check';

// Feature: claimshield-dv-platform, Property 1: Median calculation
test('median calculation returns middle value for all sorted arrays', () => {
  fc.assert(
    fc.property(
      fc.array(fc.float(), { minLength: 1, maxLength: 100 }),
      (values) => {
        const median = calculateMedian(values);
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
          expect(median).toBe((sorted[mid - 1] + sorted[mid]) / 2);
        } else {
          expect(median).toBe(sorted[mid]);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

Unit tests focus on:

1. **Calculation Functions**: Test exact calculation constants and formulas
2. **Severity Classification**: Test decision tree logic with specific examples
3. **State-Specific Logic**: Test legal citations for each state
4. **Validation**: Test Zod schemas with valid and invalid inputs
5. **API Routes**: Test authentication, authorization, and business logic
6. **Error Handling**: Test error conditions and edge cases

Example unit test:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAdjustments } from '@/lib/calculations/valuation';

describe('calculateAdjustments', () => {
  it('applies mileage adjustment at $0.12 per mile', () => {
    const subject = { mileage: 50000, year: 2020 };
    const comparable = { 
      listingPrice: 30000, 
      mileage: 60000, 
      year: 2020,
      accidentHistory: false 
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
    
    // 10,000 mile difference * $0.12 = $1,200
    expect(adjustments.mileage).toBe(1200);
  });
  
  it('applies equipment adjustment at 80% of MSRP', () => {
    const subject = { mileage: 50000, year: 2020 };
    const comparable = { 
      listingPrice: 30000, 
      mileage: 50000, 
      year: 2020,
      accidentHistory: false 
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent', 5000);
    
    // $5,000 MSRP * 0.80 = $4,000
    expect(adjustments.equipment).toBe(4000);
  });
});
```

### Integration Testing

Integration tests verify:

- Database operations with test database
- API route end-to-end flows
- Authentication and authorization
- File upload and storage
- Webhook handling

### E2E Testing

E2E tests verify:

- Complete wizard flow from start to finish
- PDF generation and download
- Payment checkout flow
- Document upload and extraction
- Dashboard operations

### Test Coverage Goals

- Unit test coverage: 80% minimum
- Property test coverage: All calculation and validation logic
- E2E test coverage: All critical user flows
- API test coverage: All routes with authentication and authorization

### Continuous Integration

All tests run on:

- Pull request creation
- Merge to main branch
- Pre-deployment checks

Failed tests block deployment to production.


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- Requirements 5.1, 5.6, and 21.1 all test VIN validation → Combine into single property
- Requirements 7.1 and 7.10 both test median calculation → Combine into single property
- Requirements 1.10 and 23.2 both test ownership validation → Combine into single property

The following properties represent unique, non-redundant correctness guarantees:

### Property 1: User ID Uniqueness

For any set of newly created user accounts, each user must receive a unique identifier that differs from all other user identifiers in the system.

**Validates: Requirements 1.2**

### Property 2: Protected Route Authentication

For any protected API route and any request without valid authentication credentials, the system must reject the request with a 401 Unauthorized status.

**Validates: Requirements 1.3**

### Property 3: Appraisal Ownership Validation

For any appraisal query and any user, if the user ID does not match the appraisal's owner ID, the system must reject the query with a 403 Forbidden status.

**Validates: Requirements 1.9, 1.10, 23.2**

### Property 4: Wizard Data Persistence

For any form data entered in any wizard step, navigating to a different step and then returning must preserve all previously entered data without loss or modification.

**Validates: Requirements 2.3**

### Property 5: Required Field Validation

For any wizard step with required fields, if any required field is empty or invalid, the system must prevent progression to the next step.

**Validates: Requirements 2.6**

### Property 6: File Type Validation

For any file upload with MIME type in the set {image/jpeg, image/png, image/webp, application/pdf}, the upload must succeed, and for any file with a MIME type not in this set, the upload must be rejected.

**Validates: Requirements 3.2**

### Property 7: User Edit Preservation

For any form field that has been manually edited by the user, subsequent AI extraction operations must not overwrite the user-edited value.

**Validates: Requirements 3.14**

### Property 8: File Deletion Cleanup

For any file deletion operation, both the Blob storage entry and the database reference must be removed, such that subsequent queries for the file return null or not found.

**Validates: Requirements 4.11**

### Property 9: VIN Format Validation

For any string input to the VIN field, if the string is exactly 17 alphanumeric characters (excluding I, O, Q), validation must pass, and for any string not matching this format, validation must fail.

**Validates: Requirements 5.1, 5.6, 21.1**

### Property 10: Minimum Comparable Count

For any successful comparable vehicle search, the system must return at least 3 comparable vehicles, expanding search parameters if necessary to meet this minimum.

**Validates: Requirements 6.6**

### Property 11: Median-Based Valuation

For any set of adjusted comparable vehicle values, the calculated fair market value must equal the median of the set, not the arithmetic mean.

**Validates: Requirements 7.1, 7.10**

### Property 12: Mileage Adjustment Constant

For any mileage difference between subject vehicle and comparable vehicle, the mileage adjustment must equal exactly $0.12 multiplied by the absolute mileage difference.

**Validates: Requirements 7.4**

### Property 13: Equipment Adjustment Constant

For any optional equipment with factory MSRP value, the equipment adjustment must equal exactly 80% (0.80) of the MSRP value.

**Validates: Requirements 7.5**

### Property 14: Year Adjustment Constant

For any year difference between subject vehicle and comparable vehicle where both vehicles are under 5 years old, the year adjustment must equal exactly 7% (0.07) of the comparable's listing price multiplied by the year difference.

**Validates: Requirements 7.6**

### Property 15: Valuation Recalculation

For any appraisal with existing valuation results, when any comparable vehicle is added, removed, or modified, the system must recalculate all valuation results to reflect the change.

**Validates: Requirements 7.13**

### Property 16: Severity Justification Generation

For any severity classification result, the system must generate a non-empty justification narrative that explains the classification decision.

**Validates: Requirements 8.14**

### Property 17: Severity to NAAA Grade Mapping

For any severity level in the set {1, 2, 3, 4, 5}, the system must assign a corresponding NAAA grade according to the mapping: Level 5 → "1 - Rough", Level 4 → "2 - Below Average", Level 3 → "3 - Average", Level 2 → "4 - Good", Level 1 → "4 - Good" or "3 - Average".

**Validates: Requirements 8.15**

### Property 18: State-Specific Citation Exclusion

For any appraisal where the owner state is not Georgia, the generated PDF report must not contain Georgia-specific legal citations (O.C.G.A. § 33-4-6, O.C.G.A. § 33-4-7).

**Validates: Requirements 10.8**

### Property 19: Structural Damage Indicator

For any appraisal with structural damage flag set to true, the generated PDF report must display amber warning boxes indicating structural damage.

**Validates: Requirements 11.28**

### Property 20: Template Variable Substitution

For any document template containing {{variable}} placeholders, the generated document must replace all placeholders with actual values from the appraisal data, such that no {{variable}} patterns remain in the output.

**Validates: Requirements 13.10**

### Property 21: Report Purchase Entitlement

For any user who completes a single report purchase, the user's reportsRemaining count must increase by exactly 1.

**Validates: Requirements 14.6**

### Property 22: Webhook Signature Validation

For any incoming Stripe webhook event with an invalid signature, the system must reject the event and return a 400 Bad Request status without processing the event data.

**Validates: Requirements 14.17**

### Property 23: Entitlement Access Control

For any user without active subscription and with reportsRemaining equal to 0, any attempt to generate a PDF report must be rejected with a 403 Forbidden status.

**Validates: Requirements 14.18**

### Property 24: Appraisal Duplication

For any appraisal, the duplicate operation must create a new appraisal with status "draft" and all data fields copied from the original, except for the ID and timestamps which must be newly generated.

**Validates: Requirements 16.7**

### Property 25: Appraisal Archival

For any appraisal, the archive operation must set the status field to "archived" and exclude the appraisal from default dashboard queries.

**Validates: Requirements 16.9**

### Property 26: Future Date Validation

For any accident date input, if the date is in the future (greater than the current date), validation must fail and prevent form submission.

**Validates: Requirements 21.5**

### Property 27: Positive Mileage Validation

For any mileage input, if the value is less than or equal to zero, validation must fail and prevent form submission.

**Validates: Requirements 21.6**

### Property 28: Positive Repair Cost Validation

For any repair cost input, if the value is less than or equal to zero, validation must fail and prevent form submission.

**Validates: Requirements 21.7**

### Property 29: Cascade Delete Comparables

For any appraisal deletion operation, all comparable vehicles associated with that appraisal (via foreign key) must also be deleted from the database.

**Validates: Requirements 24.8**

### Property 30: Labor Hours Summation

For any repair estimate with labor hour categories (body, frame, refinish, mechanical), the total labor hours must equal the sum of all category values.

**Validates: Requirements 25.6**

### Property 31: Extraction Data Population

For any successful AI extraction operation, all extracted fields with confidence scores above the threshold must populate the corresponding form fields in the wizard.

**Validates: Requirements 25.20**


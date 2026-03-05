---
title: Project Structure
inclusion: always
---

# ClaimShield DV - Project Structure

## Directory Layout

```
claimshield-dv/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public auth routes
│   │   ├── sign-in/[[...sign-in]]/
│   │   ├── sign-up/[[...sign-up]]/
│   │   └── onboarding/
│   ├── (dashboard)/         # Protected routes (auth middleware)
│   │   ├── dashboard/       # Main dashboard
│   │   ├── appraisals/      # Appraisal management
│   │   │   ├── new/         # New appraisal creation
│   │   │   └── [id]/        # Individual appraisal
│   │   │       ├── wizard/  # 8-step appraisal wizard
│   │   │       ├── preview/ # PDF preview
│   │   │       ├── documents/ # Document library
│   │   │       └── templates/ # Document templates
│   │   └── layout.tsx       # Protected layout with auth
│   ├── api/                 # API routes
│   │   ├── webhooks/        # External webhooks (clerk, stripe)
│   │   ├── appraisals/      # Appraisal CRUD
│   │   ├── documents/       # File upload and extraction
│   │   ├── comparables/     # Comparable vehicle search
│   │   ├── calculations/    # Valuation calculations
│   │   ├── templates/       # Document template generation
│   │   └── checkout/        # Stripe checkout
│   ├── _components/         # Shared React components
│   │   └── wizard/          # Wizard step components
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── lib/                     # Core business logic
│   ├── ai/                  # AI extraction
│   │   ├── gemini.ts        # Gemini client
│   │   ├── schemas.ts       # Zod schemas for extraction
│   │   ├── extract-*.ts     # Extraction functions
│   │   └── analyze-images.ts
│   ├── calculations/        # Valuation logic
│   │   ├── valuation.ts     # Median-based calculations
│   │   └── severity-classifier.ts  # 5-level classification
│   ├── db/                  # Database
│   │   ├── schema.ts        # Drizzle schema
│   │   └── index.ts         # Database client
│   ├── legal/               # Legal citations
│   │   └── state-citations.ts  # State-specific laws
│   ├── scraping/            # Web scraping
│   │   └── apify-search.ts  # Apify integration
│   ├── storage/             # File storage
│   │   └── blob.ts          # Vercel Blob utilities
│   ├── utils/               # Shared utilities
│   │   ├── auth.ts          # Auth helpers
│   │   ├── constants.ts     # Calculation constants
│   │   ├── formatting.ts    # Currency/date formatting
│   │   └── utils.ts         # shadcn utilities
│   ├── validation/          # Zod schemas
│   │   └── schemas.ts       # Form validation
│   ├── env.ts               # Environment validation
│   └── pdf/                 # PDF generation
│       ├── generator.ts     # Main PDF generator
│       ├── components/      # React-PDF components
│       └── narratives.ts    # Narrative generation
├── components/              # shadcn/ui components
│   └── ui/                  # UI component library
├── .kiro/                   # Kiro configuration
│   └── specs/               # Spec files
├── .agent/                  # Agent workspace
│   ├── requirements.md      # Requirements document
│   ├── design.md            # Design document
│   └── tasks.md             # Implementation tasks
├── .antigravity/            # Antigravity rules
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json
├── drizzle.config.ts
└── .env.local.example
```

## Key Conventions

### Database Schema

- Use Drizzle ORM with PostgreSQL
- Define enums for status fields (user_role, appraisal_status, comp_type)
- Use JSONB for complex nested objects (ownerInfo, accidentDetails, valuationResults)
- Foreign keys with cascade delete for related data
- Indexes on frequently queried fields (userId, status, appraisalId)

### API Routes

- All API routes are in `app/api/`
- Use Next.js 14 App Router route handlers
- Implement GET, POST, PATCH, DELETE as needed
- Validate authentication on all protected routes
- Validate user ownership for user-specific resources
- Return appropriate HTTP status codes

### Component Structure

- Use TypeScript with strict mode
- Use shadcn/ui components as building blocks
- Place shared components in `app/_components/`
- Wizard steps in `app/_components/wizard/`
- UI components in `components/ui/`

### Calculation Constants

- Define exact constants in `lib/utils/constants.ts`
- MILEAGE_ADJUSTMENT_PER_MILE = 0.12
- EQUIPMENT_MSRP_MULTIPLIER = 0.80
- ANNUAL_DEPRECIATION_RATE = 0.07
- Use median (not mean) for all valuation calculations

### State-Specific Logic

- Detect state from owner address
- Georgia: O.C.G.A. § 33-4-6, § 33-4-7, Canal Ins. Co. v. Tullis
- North Carolina: N.C. Gen. Stat. § 20-279.21(d)(1)
- Generic: Restatement of Torts § 928

### File Storage

- Upload to Vercel Blob with private access
- Organize by appraisal ID and file type
- Generate signed URLs for access
- Delete both Blob entry and database reference on file deletion
---
title: ClaimShield Code Conventions
inclusion: always
---

# ClaimShield DV Code Conventions

## Tech Stack Constraints

- **Framework**: Next.js 14+ (App Router only)
- **Database**: PostgreSQL via Drizzle ORM (Neon hosted)
- **Auth**: Clerk (React 19.x compatible versions ONLY)
- **Payments**: Stripe
- **Storage**: Vercel Blob (private access model)
- **AI**: Google Gemini 2.0 Flash (Or Higher) or Gemini 3.1 Pro
- **Styling**: Tailwind CSS + shadcn/ui components

## Critical Dependency Constraints

**IMPORTANT**: Clerk and React versions MUST be compatible. Reference CS-LR-001 resolution for version matrix.

Current Known-Good Set:
- `next`: 15.x
- `react`: 19.x  
- `react-dom`: 19.x
- `@clerk/nextjs`: (latest compatible with React 19)

## File Organization

```
app/
  (auth)/          # Unauthenticated routes
  (dashboard)/     # Authenticated dashboard routes
  _components/     # Shared components
  api/             # API routes
lib/
  ai/              # AI extraction utilities
  calculations/    # Valuation logic
  db/              # Database schema and queries
  legal/           # State citations and compliance
  pdf/             # Report generation
  storage/         # Blob storage utilities
  templates/       # Document templates
  utils/           # Shared utilities
components/ui/     # shadcn components
```

## Naming Conventions

- **API Routes**: `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`
- **Components**: PascalCase (e.g., `WizardLayout.tsx`)
- **Utilities**: camelCase (e.g., `calculateDV.ts`)
- **Database Tables**: snake_case (e.g., `comparable_vehicles`)

## Route Patterns

**CRITICAL**: All wizard and dashboard routes MUST use `/dashboard/` namespace.

✅ Correct:
- `/dashboard/appraisals/[id]`
- `/dashboard/appraisals/[id]/wizard`

❌ Incorrect (causes navigation bugs):
- `/appraisals/[id]`
- `/appraisals/[vin]/edit`

## Testing Standards

- Unit tests for calculations, utilities, validators
- Integration tests for API routes
- E2E tests (Playwright) for critical user journeys
- Property-based tests for valuation logic (coming)

## Code Quality Gates

Before any commit:
1. `npm run lint` passes
2. `npm run build` completes successfully  
3. `npm run test:run` passes (when tests stabilized)
4. No TypeScript `any` types in new code
5. Authorization checks present on mutating endpoints

## When to Use Specs vs. Chat

**Use Specs** (formal spec-driven workflow):
- Multi-step features (e.g., CS-LR-021 PDF generation)
- Features requiring design decisions (e.g., template engine)
- Features with security implications

**Use Chat** (direct implementation):
- Bug fixes with clear root cause
- Refactors without behavioral changes
- Simple CRUD operations

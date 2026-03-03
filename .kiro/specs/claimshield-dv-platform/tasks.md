# Implementation Plan: ClaimShield DV Platform

## Overview

This implementation plan breaks down the ClaimShield DV platform into discrete coding tasks. The platform is a Next.js 14 TypeScript application that generates professional diminished value appraisal reports using AI-powered document extraction, automated comparable vehicle search, and legally-recognized valuation methodologies.

## Technology Stack

- Next.js 14 with App Router and TypeScript (strict mode)
- Neon PostgreSQL with Drizzle ORM
- Clerk for authentication
- Vercel Blob for file storage
- Google Gemini 3.1 Pro for AI extraction
- Apify for web scraping
- Stripe for payments
- SendGrid for email
- @react-pdf/renderer for PDF generation
- Tailwind CSS + shadcn/ui for UI

## Tasks

- [x] 1. Project initialization and environment setup
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and App Router
    - Run `npx create-next-app@latest` with TypeScript, ESLint, Tailwind CSS, App Router
    - Configure `tsconfig.json` with strict mode and path aliases
    - Set up `.env.local` with all required environment variables
    - _Requirements: 30.1-30.15_
  
  - [x] 1.2 Install and configure core dependencies
    - Install Drizzle ORM, Neon serverless driver, Drizzle Kit
    - Install Clerk SDK (@clerk/nextjs)
    - Install Vercel Blob SDK (@vercel/blob)
    - Install Google Generative AI SDK (@google/generative-ai)
    - Install Apify Client SDK (apify-client)
    - Install Stripe SDK (stripe)
    - Install SendGrid SDK (@sendgrid/mail)
    - Install React PDF renderer (@react-pdf/renderer)
    - Install Zod for validation
    - Install shadcn/ui CLI and initialize
    - _Requirements: 30.1-30.15_
  
  - [x] 1.3 Configure environment variables validation
    - Create `lib/env.ts` to validate all required environment variables on startup
    - Use Zod to define environment schema
    - Throw clear error messages for missing variables
    - _Requirements: 30.12-30.15_

- [x] 2. Database schema and migrations
  - [x] 2.1 Create Drizzle schema definitions
    - Create `lib/db/schema.ts` with users, appraisals, and comparable_vehicles tables
    - Define enums: roleEnum, statusEnum, compTypeEnum
    - Define JSONB types for complex nested structures
    - Add foreign key relationships with cascade delete
    - Add indexes on user_id, appraisal_id, and status fields
    - _Requirements: 24.1-24.13_
  
  - [x] 2.2 Set up database connection and client
    - Create `lib/db/index.ts` with Neon serverless connection
    - Export typed database client using Drizzle
    - Configure connection pooling
    - _Requirements: 24.1-24.2_
  
  - [x] 2.3 Create and run initial database migration
    - Generate migration files using Drizzle Kit
    - Run migrations against Neon database
    - Verify schema creation
    - _Requirements: 24.1-24.13_
  
  - [x]* 2.4 Write property test for cascade delete
    - **Property 29: Cascade Delete Comparables**
    - **Validates: Requirements 24.8**
    - Test that deleting an appraisal also deletes all associated comparable vehicles

- [x] 3. Authentication and authorization infrastructure
  - [x] 3.1 Configure Clerk authentication
    - Set up Clerk middleware in `middleware.ts`
    - Configure public and protected routes
    - Add Clerk providers to root layout
    - _Requirements: 1.1, 1.3_
  
  - [x] 3.2 Create authentication utility functions
    - Create `lib/utils/auth.ts` with `requireAuth()` function
    - Implement `requireAppraisalOwnership()` function
    - Implement `checkEntitlement()` function
    - _Requirements: 1.3, 1.9, 1.10, 23.1, 23.2_
  
  - [x] 3.3 Create Clerk webhook handler for user creation
    - Create `app/api/webhooks/clerk/route.ts`
    - Handle `user.created` event
    - Create user record in database with Clerk ID
    - _Requirements: 1.2, 19.6, 19.7_
  
  - [ ]* 3.4 Write property test for user ID uniqueness
    - **Property 1: User ID Uniqueness**
    - **Validates: Requirements 1.2**
    - Test that each new user receives a unique identifier
  
  - [ ]* 3.5 Write property test for protected route authentication
    - **Property 2: Protected Route Authentication**
    - **Validates: Requirements 1.3**
    - Test that requests without valid auth are rejected with 401
  
  - [ ]* 3.6 Write property test for appraisal ownership validation
    - **Property 3: Appraisal Ownership Validation**
    - **Validates: Requirements 1.9, 1.10, 23.2**
    - Test that users cannot access appraisals they don't own

- [x] 4. Validation schemas and constants
  - [x] 4.1 Create Zod validation schemas
    - Create `lib/validation/schemas.ts` with all form validation schemas
    - Define vinSchema, emailSchema, phoneSchema, dateSchema
    - Define vehicleInfoSchema, ownerInfoSchema, accidentDetailsSchema
    - _Requirements: 21.1-21.10_
  
  - [x] 4.2 Create calculation constants
    - Create `lib/utils/constants.ts` with exact calculation constants
    - Define MILEAGE_ADJUSTMENT_PER_MILE = 0.12
    - Define EQUIPMENT_MSRP_MULTIPLIER = 0.80
    - Define ANNUAL_DEPRECIATION_RATE = 0.07
    - Define NAAA_GRADE_MULTIPLIERS and SEVERITY_LEVELS mappings
    - _Requirements: 7.4, 7.5, 7.6_
  
  - [x]* 4.3 Write property test for VIN format validation
    - **Property 9: VIN Format Validation**
    - **Validates: Requirements 5.1, 5.6, 21.1**
    - Test that 17-character alphanumeric strings (excluding I, O, Q) pass validation
  
  - [x]* 4.4 Write property test for future date validation
    - **Property 26: Future Date Validation**
    - **Validates: Requirements 21.5**
    - Test that dates in the future fail validation
  
  - [x]* 4.5 Write property test for positive mileage validation
    - **Property 27: Positive Mileage Validation**
    - **Validates: Requirements 21.6**
    - Test that mileage values <= 0 fail validation
  
  - [x]* 4.6 Write property test for positive repair cost validation
    - **Property 28: Positive Repair Cost Validation**
    - **Validates: Requirements 21.7**
    - Test that repair cost values <= 0 fail validation

- [x] 5. Calculation engine implementation
  - [x] 5.1 Implement valuation calculation functions
    - Create `lib/calculations/valuation.ts`
    - Implement `calculateAdjustments()` with exact constants
    - Implement `calculateAdjustedValue()`
    - Implement `calculateMedian()` (not mean)
    - Implement `calculatePercentile()` for confidence ranges
    - Implement `calculateValuation()` main function
    - _Requirements: 7.1-7.15_
  
  - [x]* 5.2 Write property test for median-based valuation
    - **Property 11: Median-Based Valuation**
    - **Validates: Requirements 7.1, 7.10**
    - Test that FMV equals median of adjusted values, not mean
  
  - [x]* 5.3 Write property test for mileage adjustment constant
    - **Property 12: Mileage Adjustment Constant**
    - **Validates: Requirements 7.4**
    - Test that mileage adjustment equals exactly $0.12 per mile difference
  
  - [x]* 5.4 Write property test for equipment adjustment constant
    - **Property 13: Equipment Adjustment Constant**
    - **Validates: Requirements 7.5**
    - Test that equipment adjustment equals exactly 80% of MSRP
  
  - [x]* 5.5 Write property test for year adjustment constant
    - **Property 14: Year Adjustment Constant**
    - **Validates: Requirements 7.6**
    - Test that year adjustment equals exactly 7% per year for vehicles under 5 years old
  
  - [x] 5.6 Implement severity classification engine
    - Create `lib/calculations/severity-classifier.ts`
    - Implement `classifySeverity()` with decision tree logic
    - Generate justification narratives for each severity level
    - Map severity levels to NAAA grades
    - _Requirements: 8.1-8.21_
  
  - [x]* 5.7 Write property test for severity justification generation
    - **Property 16: Severity Justification Generation**
    - **Validates: Requirements 8.14**
    - Test that all severity classifications generate non-empty justifications
  
  - [x]* 5.8 Write property test for severity to NAAA grade mapping
    - **Property 17: Severity to NAAA Grade Mapping**
    - **Validates: Requirements 8.15**
    - Test correct mapping: Level 5→"1 - Rough", Level 4→"2 - Below Average", etc.
  
  - [x]* 5.9 Write unit tests for severity classification decision tree
    - Test all severity level thresholds with specific examples
    - Test edge cases: exactly 60 hours, exactly 10 frame hours, etc.
    - _Requirements: 8.1-8.21_
  
  - [x]* 5.10 Write property test for labor hours summation
    - **Property 30: Labor Hours Summation**
    - **Validates: Requirements 25.6**
    - Test that total labor hours equals sum of all category values

- [x] 6. File storage infrastructure
  - [x] 6.1 Create Vercel Blob storage utilities
    - Create `lib/storage/blob.ts` with upload and delete functions
    - Implement signed URL generation for private access
    - Organize files by appraisal ID and file type
    - _Requirements: 4.1-4.3, 23.3_
  
  - [ ]* 6.2 Write property test for file deletion cleanup
    - **Property 8: File Deletion Cleanup**
    - **Validates: Requirements 4.11**
    - Test that both Blob storage entry and database reference are removed on deletion

- [x] 7. AI extraction infrastructure
  - [x] 7.1 Create Gemini API client
    - Create `lib/ai/gemini.ts` with `extractStructuredData()` function
    - Handle document fetching and base64 encoding
    - Implement JSON parsing and schema validation
    - _Requirements: 3.17, 23.4_
  
  - [x] 7.2 Create AI extraction schemas
    - Create `lib/ai/schemas.ts` with Zod schemas
    - Define repairEstimateSchema, insuranceDocsSchema, vehicleInfoSchema, imageAnalysisSchema
    - Include confidence score fields
    - _Requirements: 3.9, 3.10_
  
  - [x] 7.3 Implement repair estimate extraction
    - Create `lib/ai/extract-repair-estimate.ts`
    - Write detailed prompt for repair estimate extraction
    - Extract all line items with categorization
    - Extract labor hours by category
    - Identify frame pulling, airbag deployment, structural damage
    - _Requirements: 3.5, 25.1-25.20_
  
  - [x] 7.4 Implement insurance document extraction
    - Create `lib/ai/extract-insurance-docs.ts`
    - Write prompt for insurance document extraction
    - Extract company, policy number, claim number, adjuster details
    - _Requirements: 3.6_
  
  - [x] 7.5 Implement vehicle information extraction
    - Create `lib/ai/extract-vehicle-info.ts`
    - Write prompt for vehicle document extraction
    - Extract VIN, year, make, model, trim, mileage
    - _Requirements: 3.7_
  
  - [x] 7.6 Implement image analysis
    - Create `lib/ai/analyze-images.ts`
    - Write prompt for before/after photo analysis
    - Identify point of impact, damaged panels, structural damage
    - Assess pre-accident condition and damage scope
    - _Requirements: 3.8, 26.1-26.18_
  
  - [ ]* 7.7 Write property test for extraction data population
    - **Property 31: Extraction Data Population**
    - **Validates: Requirements 25.20**
    - Test that extracted fields with high confidence populate form fields

- [x] 8. Web scraping infrastructure
  - [x] 8.1 Create Apify comparable vehicle search
    - Create `lib/scraping/apify-search.ts`
    - Implement `searchComparables()` function
    - Configure search parameters: year, make, model, trim, mileage, location, accident history
    - Transform Apify results to database schema format
    - _Requirements: 6.1-6.16, 23.7_
  
  - [ ]* 8.2 Write property test for minimum comparable count
    - **Property 10: Minimum Comparable Count**
    - **Validates: Requirements 6.6**
    - Test that search returns at least 3 comparables, expanding parameters if needed

- [x] 9. State-specific legal citations
  - [x] 9.1 Create state citations database
    - Create `lib/legal/state-citations.ts`
    - Implement `getStateCitations()` function with switch statement
    - Define Georgia citations: O.C.G.A. § 33-4-6, § 33-4-7, Canal Ins. Co. v. Tullis
    - Define North Carolina citations: N.C. Gen. Stat. § 20-279.21(d)(1)
    - Define generic citations: Restatement of Torts § 928
    - Include anti-17c formula statement for Georgia
    - _Requirements: 10.1-10.10_
  
  - [x] 9.2 Implement legal citations section generator
    - Implement `generateLegalCitationsSection()` function
    - Format statutes, case law, methodology, and anti-formula text
    - _Requirements: 10.1-10.10_
  
  - [ ]* 9.3 Write property test for state-specific citation exclusion
    - **Property 18: State-Specific Citation Exclusion**
    - **Validates: Requirements 10.8**
    - Test that non-Georgia appraisals don't contain Georgia-specific citations

- [x] 10. API routes - Appraisals
  - [x] 10.1 Create appraisal list and create endpoints
    - Create `app/api/appraisals/route.ts`
    - Implement GET handler to list user's appraisals
    - Implement POST handler to create new appraisal
    - Validate authentication and input
    - _Requirements: 1.3, 1.9, 16.1-16.6_
  
  - [x] 10.2 Create appraisal detail endpoints
    - Create `app/api/appraisals/[id]/route.ts`
    - Implement GET handler to fetch single appraisal
    - Implement PATCH handler to update appraisal
    - Implement DELETE handler to delete appraisal
    - Validate ownership on all operations
    - _Requirements: 1.9, 1.10, 16.8, 24.8_
  
  - [x] 10.3 Create auto-save endpoint
    - Create `app/api/appraisals/[id]/auto-save/route.ts`
    - Implement PATCH handler for draft auto-save
    - Update timestamps on save
    - _Requirements: 2.4_
  
  - [ ]* 10.4 Write integration tests for appraisal API routes
    - Test authentication requirements
    - Test ownership validation
    - Test CRUD operations
    - _Requirements: 1.3, 1.9, 1.10_

- [x] 11. API routes - Documents
  - [x] 11.1 Create document upload endpoint
    - Create `app/api/documents/upload/route.ts`
    - Implement POST handler for file uploads
    - Validate file type and size
    - Upload to Vercel Blob storage
    - Return file URL
    - _Requirements: 3.1-3.4, 4.1-4.6_
  
  - [x] 11.2 Create document extraction endpoint
    - Create `app/api/documents/extract/route.ts`
    - Implement POST handler for AI extraction
    - Route to appropriate extraction function based on document type
    - Return structured JSON with confidence scores
    - _Requirements: 3.5-3.18_
  
  - [x] 11.3 Create document delete endpoint
    - Create `app/api/documents/[id]/route.ts`
    - Implement DELETE handler
    - Remove from Blob storage and nullify database reference
    - _Requirements: 4.10, 4.11_
  
  - [ ]* 11.4 Write property test for file type validation
    - **Property 6: File Type Validation**
    - **Validates: Requirements 3.2**
    - Test that only allowed MIME types succeed, others are rejected
  
  - [ ]* 11.5 Write property test for user edit preservation
    - **Property 7: User Edit Preservation**
    - **Validates: Requirements 3.14**
    - Test that AI extraction doesn't overwrite user-edited fields

- [x] 12. API routes - Comparables
  - [x] 12.1 Create comparable vehicle search endpoint
    - Create `app/api/comparables/search/route.ts`
    - Implement POST handler for Apify search
    - Save results to database
    - Return saved comparable vehicles
    - _Requirements: 6.1-6.16_
  
  - [x] 12.2 Create comparable vehicle update/delete endpoints
    - Create `app/api/comparables/[id]/route.ts`
    - Implement PATCH handler to update comparable details
    - Implement DELETE handler to remove comparable
    - _Requirements: 6.14, 6.15_

- [x] 13. API routes - Calculations
  - [x] 13.1 Create valuation calculation endpoint
    - Create `app/api/calculations/route.ts`
    - Implement POST handler
    - Fetch appraisal and comparables from database
    - Call `classifySeverity()` and `calculateValuation()`
    - Update appraisal with results
    - _Requirements: 7.1-7.15, 8.1-8.21_
  
  - [ ]* 13.2 Write property test for valuation recalculation
    - **Property 15: Valuation Recalculation**
    - **Validates: Requirements 7.13**
    - Test that adding/removing/modifying comparables triggers recalculation

- [x] 14. Checkpoint - Core backend infrastructure complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Stripe payment integration
  - [x] 15.1 Create Stripe utilities
    - Create `lib/payments/stripe.ts` with Stripe client
    - Implement checkout session creation functions
    - _Requirements: 14.1, 14.8, 23.5_
  
  - [x] 15.2 Create checkout endpoint
    - Create `app/api/checkout/route.ts`
    - Implement POST handler to create Stripe checkout session
    - Support individual report purchase ($129)
    - Support subscription plans (professional $299, attorney $499, body shop $399)
    - _Requirements: 14.2-14.8_
  
  - [x] 15.3 Create Stripe webhook handler
    - Create `app/api/webhooks/stripe/route.ts`
    - Validate webhook signatures
    - Handle `checkout.session.completed` event
    - Handle `customer.subscription.created` event
    - Handle `customer.subscription.updated` event
    - Handle `customer.subscription.deleted` event
    - Handle `invoice.payment_failed` event
    - Update user records with Stripe IDs and subscription status
    - _Requirements: 14.9-14.20, 23.9_
  
  - [ ]* 15.4 Write property test for report purchase entitlement
    - **Property 21: Report Purchase Entitlement**
    - **Validates: Requirements 14.6**
    - Test that single report purchase increases reportsRemaining by exactly 1
  
  - [ ]* 15.5 Write property test for webhook signature validation
    - **Property 22: Webhook Signature Validation**
    - **Validates: Requirements 14.17**
    - Test that invalid signatures are rejected with 400 status
  
  - [ ]* 15.6 Write property test for entitlement access control
    - **Property 23: Entitlement Access Control**
    - **Validates: Requirements 14.18**
    - Test that users without entitlement cannot generate PDFs

- [x] 16. SendGrid email integration
  - [x] 16.1 Create SendGrid utilities
    - Create `lib/email/sendgrid.ts` with email sending functions
    - Implement HTML email templates
    - Create report delivery email template
    - Create welcome email template
    - Create payment confirmation email template
    - _Requirements: 15.1-15.12, 23.6_
  
  - [x] 16.2 Create email sending endpoint
    - Create `app/api/email/send/route.ts`
    - Implement POST handler to send report emails
    - Validate user ownership before sending
    - Include signed Blob URLs for PDF access
    - _Requirements: 15.1-15.12_

- [x] 17. PDF generation infrastructure
  - [x] 17.1 Create React-PDF component structure
    - Create `lib/pdf/components/AppraisalReport.tsx` main document component
    - Create `lib/pdf/components/CoverPage.tsx`
    - Create `lib/pdf/components/CoverLetter.tsx`
    - Create `lib/pdf/components/VehicleInfo.tsx`
    - Create `lib/pdf/components/ComparablesSection.tsx`
    - Create `lib/pdf/components/ValuationAnalysis.tsx`
    - Create `lib/pdf/components/SeverityAnalysis.tsx`
    - Create `lib/pdf/components/LegalCitations.tsx`
    - Create `lib/pdf/components/Disclaimers.tsx`
    - _Requirements: 11.1-11.28_
  
  - [x] 17.2 Implement PDF styling and formatting
    - Define StyleSheet for professional blue/white color scheme
    - Format currency with commas and dollar signs
    - Add page numbers and headers to all pages
    - Highlight DV amount in green box on cover page
    - Add amber warning boxes for structural damage
    - _Requirements: 11.17-11.20, 11.28_
  
  - [x] 17.3 Create narrative generation utilities
    - Create `lib/pdf/narratives.ts`
    - Implement repair analysis narrative generation
    - Implement market stigma narrative generation
    - Implement component-by-component analysis
    - _Requirements: 9.1-9.14_
  
  - [x] 17.4 Create PDF generator main function
    - Create `lib/pdf/generator.ts`
    - Implement `generatePDF()` function using renderToBuffer
    - _Requirements: 11.1-11.28_
  
  - [x] 17.5 Create PDF generation endpoint
    - Create `app/api/appraisals/[id]/generate-pdf/route.ts`
    - Implement POST handler
    - Check entitlement before generation
    - Generate PDF and upload to Vercel Blob
    - Update appraisal status to "complete"
    - Decrement reportsRemaining for non-subscription users
    - _Requirements: 11.1-11.28, 14.18_
  
  - [ ]* 17.6 Write property test for structural damage indicator
    - **Property 19: Structural Damage Indicator**
    - **Validates: Requirements 11.28**
    - Test that structural damage flag displays amber warning boxes in PDF

- [x] 18. Document template generation
  - [x] 18.1 Create document template utilities
    - Create `lib/templates/demand-letter-ga.ts` for Georgia 60-day demand letter
    - Create `lib/templates/demand-letter-generic.ts` for generic demand letter
    - Create `lib/templates/bad-faith-calculator.ts` for Georgia bad faith penalty calculator
    - Create `lib/templates/expert-affidavit.ts` for expert witness affidavit
    - Create `lib/templates/market-stigma.ts` for market stigma impact statement
    - Implement variable substitution for {{variable}} placeholders
    - _Requirements: 13.1-13.10_
  
  - [x] 18.2 Create template generation endpoint
    - Create `app/api/templates/[type]/route.ts`
    - Implement GET handler to generate templates
    - Validate state and role requirements
    - Return generated document as PDF or DOCX
    - _Requirements: 13.11-13.17_
  
  - [ ]* 18.3 Write property test for template variable substitution
    - **Property 20: Template Variable Substitution**
    - **Validates: Requirements 13.10**
    - Test that all {{variable}} placeholders are replaced with actual values

- [x] 19. Checkpoint - All backend APIs complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. shadcn/ui component setup
  - [x] 20.1 Install core shadcn/ui components
    - Install button, input, label, form, card, dialog, dropdown-menu, select, textarea
    - Install table, tabs, toast, progress, badge, separator
    - Configure Tailwind CSS with shadcn/ui theme
    - _Requirements: 28.1-28.10_

- [x] 21. Authentication pages
  - [x] 21.1 Create sign-in page
    - Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
    - Use Clerk's SignIn component
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [x] 21.2 Create sign-up page
    - Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
    - Use Clerk's SignUp component
    - _Requirements: 1.1, 1.2_
  
  - [x] 21.3 Create onboarding/role selection page
    - Create `app/(auth)/onboarding/page.tsx`
    - Display 4 role options with descriptions
    - Save selected role to database
    - Redirect to dashboard after selection
    - _Requirements: 19.1-19.7_

- [x] 22. Dashboard and appraisal management
  - [x] 22.1 Create protected dashboard layout
    - Create `app/(dashboard)/layout.tsx`
    - Add authentication check
    - Add navigation menu
    - _Requirements: 1.3, 16.1_
  
  - [x] 22.2 Create dashboard page
    - Create `app/(dashboard)/dashboard/page.tsx`
    - Display appraisal list with status, vehicle info, DV amount
    - Display creation and updated dates
    - Add filter by status
    - Add sort by date
    - Add search functionality
    - Display usage tracking (reports used/remaining)
    - _Requirements: 16.1-16.20_
  
  - [x] 22.3 Implement appraisal actions
    - Add duplicate action to clone appraisals
    - Add archive action to soft delete
    - Add bulk download action for multiple appraisals
    - Add share action to generate expiring URLs
    - _Requirements: 16.6-16.13_
  
  - [ ]* 22.4 Write property test for appraisal duplication
    - **Property 24: Appraisal Duplication**
    - **Validates: Requirements 16.7**
    - Test that duplicate creates new draft with all data copied except ID and timestamps
  
  - [ ]* 22.5 Write property test for appraisal archival
    - **Property 25: Appraisal Archival**
    - **Validates: Requirements 16.9**
    - Test that archive sets status to "archived" and excludes from default queries

- [x] 23. Wizard layout and navigation
  - [x] 23.1 Create wizard layout component
    - Create `app/_components/wizard/WizardLayout.tsx`
    - Implement progress indicator showing current step and total steps
    - Implement auto-save every 30 seconds
    - Add Next/Back navigation buttons
    - Handle form data state management
    - _Requirements: 2.1-2.10_
  
  - [x] 23.2 Create wizard progress component
    - Create `app/_components/wizard/WizardProgress.tsx`
    - Display 8 steps with visual indicators
    - Highlight current step
    - Show completed steps
    - _Requirements: 2.2_
  
  - [ ]* 23.3 Write property test for wizard data persistence
    - **Property 4: Wizard Data Persistence**
    - **Validates: Requirements 2.3**
    - Test that navigating between steps preserves all entered data
  
  - [ ]* 23.4 Write property test for required field validation
    - **Property 5: Required Field Validation**
    - **Validates: Requirements 2.6**
    - Test that empty required fields prevent step progression

- [x] 24. Wizard Step 1: Vehicle Information
  - [x] 24.1 Create Step 1 component
    - Create `app/_components/wizard/Step1VehicleInfo.tsx`
    - Add VIN input with format validation
    - Add year, make, model, trim, mileage inputs
    - Add pre-accident condition select (excellent, good, average, below_average)
    - Add optional equipment multi-select
    - Implement VIN decoding on blur
    - Display state law banner based on owner state
    - _Requirements: 5.1-5.8, 20.1-20.5_
  
  - [x] 24.2 Create state law banner component
    - Create `app/_components/StateLawBanner.tsx`
    - Display green banner for Georgia
    - Display blue banner for North Carolina
    - Display amber banner for other states
    - _Requirements: 20.1-20.5_

- [x] 25. Wizard Step 2: Owner Information
  - [x] 25.1 Create Step 2 component
    - Create `app/_components/wizard/Step2OwnerInfo.tsx`
    - Add owner name, email, phone inputs
    - Add address, city, state, zip inputs
    - Add insurance company, policy number, claim number inputs
    - Add adjuster name, phone, email inputs (optional)
    - Implement inline validation for email and phone formats
    - _Requirements: 21.2, 21.3_

- [x] 26. Wizard Step 3: Accident Details
  - [x] 26.1 Create Step 3 component
    - Create `app/_components/wizard/Step3AccidentDetails.tsx`
    - Add accident date input with future date validation
    - Add point of impact input
    - Add checkboxes: structural damage, airbag deployment, frame pulling
    - Add panels replaced multi-select
    - Add painted panels multi-select
    - Add repair cost inputs: total, parts, labor, paint
    - Add labor hours inputs: body, frame, refinish, mechanical, total
    - Add part type checkboxes: OEM, aftermarket, refurbished
    - Add repair facility name and phone (optional)
    - _Requirements: 21.5, 21.7, 21.8_

- [x] 27. Wizard Step 4: Document Upload
  - [x] 27.1 Create file upload component
    - Create `app/_components/FileUpload.tsx`
    - Implement drag-and-drop file upload
    - Implement click-to-browse file upload
    - Display upload progress
    - Validate file type and size
    - Display error messages for invalid files
    - _Requirements: 3.1-3.4, 4.12-4.16_
  
  - [x] 27.2 Create document preview component
    - Create `app/_components/DocumentPreview.tsx`
    - Display uploaded files with filename, size, upload date
    - Add preview button for PDFs (open in new tab)
    - Add preview button for images (display inline)
    - Add delete button
    - _Requirements: 4.7-4.10_
  
  - [x] 27.3 Create Step 4 component
    - Create `app/_components/wizard/Step4DocumentUpload.tsx`
    - Add repair estimate upload section
    - Add damage photos upload section (before photos)
    - Add repair photos upload section (after photos)
    - Add insurance documents upload section
    - Add "Extract Data" button for each document type
    - Display extracted data with accept/reject options
    - Mark auto-filled fields with visual indicator
    - _Requirements: 3.1-3.18, 4.1-4.16_

- [x] 28. Wizard Step 5: Comparable Vehicles
  - [x] 28.1 Create comparable card component
    - Create `app/_components/ComparableCard.tsx`
    - Display vehicle details: year, make, model, trim, mileage
    - Display listing price and dealer information
    - Display adjustment breakdown
    - Display adjusted value
    - Add edit and delete buttons
    - Add checkbox to include/exclude from calculation
    - _Requirements: 6.14, 6.15, 7.14_
  
  - [x] 28.2 Create Step 5 component
    - Create `app/_components/wizard/Step5Comparables.tsx`
    - Add "Search Pre-Accident Comparables" button
    - Add "Search Post-Accident Comparables" button
    - Display loading indicator during search
    - Display search results as comparable cards
    - Add "Add Manual Comparable" button
    - Display minimum 3 comparables requirement
    - _Requirements: 6.1-6.16_

- [x] 29. Wizard Step 6: Calculations
  - [x] 29.1 Create calculation breakdown component
    - Create `app/_components/CalculationBreakdown.tsx`
    - Display pre-accident FMV calculation
    - Display post-repair ACV calculation
    - Display diminished value amount
    - Display DV as percentage of value
    - Display DV as percentage of repair cost
    - Display confidence ranges (10th and 90th percentiles)
    - Display adjustment breakdowns for each comparable
    - _Requirements: 7.1-7.15_
  
  - [x] 29.2 Create Step 6 component
    - Create `app/_components/wizard/Step6Calculations.tsx`
    - Add "Calculate Valuation" button
    - Display loading indicator during calculation
    - Display severity classification with justification
    - Display NAAA grade assignment
    - Display calculation breakdown component
    - _Requirements: 7.1-7.15, 8.1-8.21_

- [x] 30. Wizard Step 7: Review
  - [x] 30.1 Create Step 7 component
    - Create `app/_components/wizard/Step7Review.tsx`
    - Display summary of all entered data
    - Display vehicle information
    - Display owner and insurance information
    - Display accident details
    - Display comparable vehicles count
    - Display valuation results
    - Display severity analysis
    - Add "Edit" buttons to navigate back to specific steps
    - _Requirements: 2.8_

- [x] 31. Wizard Step 8: Generate Report
  - [x] 31.1 Create Step 8 component
    - Create `app/_components/wizard/Step8Generate.tsx`
    - Display final DV amount prominently
    - Add "Generate PDF Report" button
    - Check entitlement before allowing generation
    - Display "Buy Report" call-to-action if no entitlement
    - Display loading indicator during PDF generation
    - Redirect to preview page after generation
    - _Requirements: 11.1-11.28, 14.18, 16.17_

- [x] 32. Checkpoint - Wizard implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 33. Appraisal detail pages
  - [x] 33.1 Create appraisal detail page
    - Create `app/(dashboard)/appraisals/[id]/page.tsx`
    - Display appraisal summary
    - Display status badge
    - Add "Edit" button to open wizard
    - Add "Generate PDF" button
    - Add "View Report" button if PDF exists
    - Add "Email Report" button
    - Add "Duplicate" button
    - Add "Archive" button
    - _Requirements: 16.1-16.13_
  
  - [x] 33.2 Create wizard page
    - Create `app/(dashboard)/appraisals/[id]/wizard/page.tsx`
    - Use WizardLayout component
    - Route to appropriate step component based on query parameter
    - _Requirements: 2.1-2.10_
  
  - [x] 33.3 Create preview page
    - Create `app/(dashboard)/appraisals/[id]/preview/page.tsx`
    - Embed PDF in iframe
    - Display DV amount above preview
    - Add download button
    - Add email button
    - Add regenerate button
    - _Requirements: 12.1-12.10_
  
  - [x] 33.4 Create documents page
    - Create `app/(dashboard)/appraisals/[id]/documents/page.tsx`
    - List all uploaded files by type
    - Add preview, download, delete buttons for each file
    - Add upload button to add more documents
    - _Requirements: 17.1-17.12_
  
  - [x] 33.5 Create templates page
    - Create `app/(dashboard)/appraisals/[id]/templates/page.tsx`
    - Display all available templates with availability status
    - Lock templates not applicable to user's state or role
    - Add preview and download buttons for each template
    - _Requirements: 13.11-13.17_

- [x] 34. New appraisal creation flow
  - [x] 34.1 Create new appraisal page
    - Create `app/(dashboard)/appraisals/new/page.tsx`
    - Create new draft appraisal in database
    - Redirect to wizard Step 1
    - _Requirements: 2.1_

- [x] 35. Settings and account management
  - [x] 35.1 Create settings page
    - Create `app/(dashboard)/settings/page.tsx`
    - Display user profile information
    - Display current role
    - Display subscription status
    - Display reports remaining
    - Add "Manage Subscription" button (link to Stripe portal)
    - Add "Buy More Reports" button
    - _Requirements: 14.14-14.16_

- [x] 36. Role-based features
  - [x] 36.1 Implement appraiser-specific features
    - Add USPAP certification fields to wizard
    - Add signature upload component
    - Include USPAP compliance statements in PDF reports
    - Enable expert witness affidavit template
    - _Requirements: 18.1-18.4_
  
  - [x] 36.2 Implement attorney-specific features
    - Add team management page
    - Allow adding paralegal accounts
    - _Requirements: 18.5, 18.6_
  
  - [x] 36.3 Implement body shop-specific features
    - Add white-label options to settings
    - _Requirements: 18.7_
  
  - [x] 36.4 Implement role-based access control
    - Enforce role permissions on all API routes
    - Return 403 Forbidden for unauthorized access
    - Hide professional-only features from individual users
    - _Requirements: 18.8-18.10_

- [x] 37. Responsive design and mobile optimization
  - [x] 37.1 Implement responsive layouts
    - Make all pages responsive from 320px to 2560px
    - Stack form fields vertically on narrow screens
    - Use mobile-optimized file upload controls
    - Use touch-friendly controls on mobile devices
    - Optimize PDF preview for mobile viewing
    - Use mobile-friendly navigation menus
    - Display tables with horizontal scrolling when necessary
    - _Requirements: 28.1-28.10_
  
  - [ ]* 37.2 Test on multiple browsers and devices
    - Test on iOS Safari
    - Test on Android Chrome
    - Test on desktop browsers (Chrome, Firefox, Safari, Edge)
    - _Requirements: 28.10_

- [-] 38. Accessibility compliance
  - [x] 38.1 Implement accessibility features
    - Use semantic HTML elements throughout
    - Add alt text for all images
    - Add labels for all form inputs
    - Support keyboard navigation for all interactive elements
    - Add focus indicators for keyboard navigation
    - Use sufficient color contrast ratios (WCAG AA minimum)
    - Don't rely solely on color to convey information
    - Add ARIA labels for complex components
    - Add skip navigation links
    - _Requirements: 29.1-29.10_
  
  - [ ]* 38.2 Test with screen readers
    - Test with NVDA or JAWS on Windows
    - Test with VoiceOver on macOS/iOS
    - _Requirements: 29.9_

- [x] 39. Error handling and user feedback
  - [x] 39.1 Implement error handling patterns
    - Add try-catch blocks to all API routes
    - Return appropriate HTTP status codes
    - Display user-friendly error messages (not stack traces)
    - Add retry options for failed operations
    - Handle network timeouts gracefully
    - Display inline validation errors next to invalid fields
    - Prevent form submission when required fields are missing
    - _Requirements: 21.9-21.15_
  
  - [x] 39.2 Implement loading states
    - Add loading indicators for operations exceeding 1 second
    - Display progress for file uploads
    - Display loading during comparable search (15 seconds max)
    - Display loading during PDF generation (45 seconds max)
    - Display loading during AI extraction (10 seconds per document)
    - _Requirements: 22.6_
  
  - [x] 39.3 Implement toast notifications
    - Add success toasts for completed operations
    - Add error toasts for failed operations
    - Add info toasts for auto-save confirmations
    - _Requirements: 21.11_

- [x] 40. Performance optimization
  - [x] 40.1 Optimize database queries
    - Add indexes on frequently queried fields
    - Use Drizzle ORM query builder for efficient queries
    - Implement pagination for appraisal lists
    - _Requirements: 22.8, 22.9_
  
  - [x] 40.2 Optimize page load times
    - Implement code splitting for large components
    - Lazy load wizard steps
    - Cache static assets
    - Optimize images with Next.js Image component
    - _Requirements: 22.1, 22.5, 22.10_
  
  - [x] 40.3 Optimize auto-save
    - Debounce auto-save to avoid excessive API calls
    - Auto-save without blocking user interaction
    - _Requirements: 22.7_

- [-] 41. Security hardening
  - [x] 41.1 Implement security best practices
    - Validate all environment variables are server-side only
    - Never expose API keys in client-side code
    - Validate Stripe webhook signatures
    - Sanitize user input to prevent SQL injection
    - Use Drizzle ORM for all database queries (no raw SQL)
    - Validate and sanitize file uploads
    - Implement rate limiting on API routes
    - Use HTTPS for all communications
    - Log security events for audit purposes
    - _Requirements: 23.1-23.15_
  
  - [ ] 41.2 Security audit and penetration testing
    - Test authentication bypass attempts
    - Test authorization bypass attempts
    - Test file upload vulnerabilities
    - Test SQL injection attempts
    - Test XSS vulnerabilities
    - _Requirements: 23.1-23.15_

- [x] 42. Checkpoint - Frontend and security complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 43. Educational resources (optional)
  - [x] 43.1 Create educational content pages
    - Create pages for DV education, negotiation strategies, state-specific guidance
    - Create sample negotiation scripts
    - Create information about 17c formula flaws
    - Create information about NAAA grading standards
    - Create information about comparable sales method
    - Create information about bad faith insurance practices
    - Create information about when to hire an attorney
    - Organize content by topic
    - _Requirements: 27.1-27.10_

- [-] 44. Integration testing
  - [ ]* 44.1 Write API integration tests
    - Test complete appraisal creation flow
    - Test document upload and extraction flow
    - Test comparable search flow
    - Test calculation flow
    - Test PDF generation flow
    - Test payment flow
    - Test email sending flow
    - _Requirements: All_
  
  - [ ]* 44.2 Write E2E tests for critical flows
    - Test complete wizard flow from start to finish
    - Test PDF generation and download
    - Test payment checkout flow
    - Test document upload and extraction
    - Test dashboard operations
    - _Requirements: All_

- [-] 45. Deployment preparation
  - [ ] 45.1 Configure Vercel deployment
    - Set up Vercel project
    - Configure environment variables in Vercel dashboard
    - Set up production database in Neon
    - Configure custom domain (if applicable)
    - _Requirements: 30.1-30.15_
  
  - [ ] 45.2 Set up monitoring and logging
    - Configure error tracking (Sentry or similar)
    - Set up application monitoring
    - Configure log aggregation
    - _Requirements: 21.13_
  
  - [x] 45.3 Create deployment documentation
    - Document environment variables
    - Document deployment process
    - Document database migration process
    - Document third-party service setup
    - _Requirements: 30.1-30.15_

- [ ] 46. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration and E2E tests validate complete user flows
- All property-based tests must run minimum 100 iterations
- TypeScript strict mode must be enabled throughout
- No `any` types allowed in the codebase
- All calculation constants must be exact as specified in requirements

## Testing Strategy

### Property-Based Testing
- Use fast-check library for property-based tests
- Run minimum 100 iterations per test
- Tag each test with: `// Feature: claimshield-dv-platform, Property {number}: {property_text}`
- All 31 correctness properties from the design document must have corresponding tests

### Unit Testing
- Test all calculation functions with exact constants
- Test severity classification decision tree with specific examples
- Test state-specific legal citations
- Test validation schemas with valid and invalid inputs
- Test error handling and edge cases

### Integration Testing
- Test all API routes with authentication and authorization
- Test database operations with test database
- Test file upload and storage
- Test webhook handling

### E2E Testing
- Test complete wizard flow
- Test PDF generation and download
- Test payment checkout flow
- Test document upload and extraction
- Test dashboard operations

## Implementation Order

The tasks are ordered to build incrementally:
1. Project setup and infrastructure (Tasks 1-4)
2. Core backend logic (Tasks 5-9)
3. API routes (Tasks 10-18)
4. Frontend components (Tasks 20-34)
5. Advanced features (Tasks 35-38)
6. Quality assurance (Tasks 39-42)
7. Deployment (Tasks 45-46)

Each checkpoint ensures that the previous phase is complete and working before moving to the next phase.

# ClaimShield DV — Multi-Agent Development Instructions
**Version:** 2.0 | **Date:** March 1, 2026
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Neon/Drizzle · Clerk · Vercel · Apify · Gemini 3.1 Pro · Puppeteer · Stripe · SendGrid

---

## ⚠️ CRITICAL AGENT GROUND RULES

Before any agent writes a single line of code, read and internalize these rules:

1. **Stack is fixed.** Next.js 14 App Router. No Express. No Vite. No Wouter. No Replit Auth. No Firebase. Any prior code referencing these is legacy and should be ignored or replaced.
2. **Auth is Clerk.** Period. No custom sessions. No JWT rolls. Clerk middleware handles all protection.
3. **Database is Neon + Drizzle ORM.** Use the schema defined in Phase 1 exactly. Do not deviate from field names, types, or relations.
4. **Calculations must match the Master Appraisal Schema exactly.** Use **median**, not mean. Use **$0.12/mile** for mileage adjustments. Use **80% of MSRP** for equipment. Use the exact severity decision tree defined in Section 4.3.3. No hardcoded magic numbers.
5. **Legal citations are dynamic.** Never hardcode Georgia law. Always derive citations from `ownerState` field.
6. **TypeScript everywhere.** No `.js` files. No `any` types except where unavoidable with third-party SDKs.
7. **Tailwind only.** No custom CSS files. No CSS modules. No inline styles except where Tailwind cannot handle a case.
8. **File storage is Vercel Blob.** Not GCS. Not S3. Not local filesystem.
9. **Source of truth for all business logic:** `ClaimShield DV - Master Appraisal Schema & Auto-Generation Logic`
10. **Agents must verify before assuming.** If a file or function isn't confirmed to exist, check before referencing it.

---

## PROJECT STATE SUMMARY (As of March 1, 2026)

### What EXISTS and is functional:
- Drizzle schema (`shared/schema.ts`) — 95% compliant with Master Spec ✅
- Valuation calculations (`valuation.ts`) — correct formulas, needs median fix ⚠️
- Severity classification (`severity.ts`) — functional, needs decision tree alignment ⚠️
- Narrative generation (`narratives.ts`) — complete but GA-hardcoded ⚠️
- Comparable vehicle Apify search — configured but needs hardening ⚠️
- Multi-step wizard Steps 1–2 (Driver Info, VIN decode) — complete ✅
- Steps 5–6 (Pre/Post comps with Apify + manual entry) — complete ✅
- Clerk auth — configured ✅
- Vercel Blob — partially configured ⚠️

### What is MISSING (launch blockers):
- PDF report generation ❌
- File upload system (drag-drop, Vercel Blob) ❌
- AI document analysis + field auto-population (Gemini 3.1 Pro) ❌
- Before/after image damage analysis (Gemini 3.1 Pro) ❌
- Repair estimate line-item extraction (Gemini 3.1 Pro) ❌
- Step 3 (Accident Details) — partial, needs repair cost parsing ⚠️
- Step 7 (Report Preview/Export) ❌
- 7 document templates (demand letters, affidavits, etc.) ❌
- Stripe subscription integration ❌
- SendGrid email delivery ❌
- Role-based access (appraiser, attorney, body shop) ❌
- Dashboard actions (duplicate, archive, bulk download) ❌

### Launch Readiness: 65/100

---

## PHASE STRUCTURE OVERVIEW

Phases are designed for **parallel agent execution**. Agents A and B can work simultaneously within each phase on non-overlapping tracks. Dependencies are explicitly called out.

```
PHASE 0: Foundation Repair (Sequential — must complete before all else)
PHASE 1: AI Integration — Gemini 3.1 Pro  [Agent A]
PHASE 2: File Upload System                [Agent B]  ← runs parallel to Phase 1
PHASE 3: PDF Report Generation             [Agent A]  ← after Phase 1 complete
PHASE 4: Document Templates                [Agent B]  ← after Phase 2 complete
PHASE 5: Stripe + Payments                 [Agent A]  ← after Phase 3 complete
PHASE 6: Email Delivery (SendGrid)         [Agent B]  ← after Phase 4 complete
PHASE 7: Role-Based Access Control        [Agent A]  ← after Phase 5 complete
PHASE 8: Dashboard + UX Polish             [Agent B]  ← after Phase 6 complete
PHASE 9: Testing + Launch Hardening        [Both]     ← final phase
```

---

## PHASE 0: FOUNDATION REPAIR
**Type:** Sequential — ALL agents blocked until this is complete
**Estimated Time:** 1–2 days
**Owner:** Primary Agent

### Task 0.1 — Fix Calculation Engine
**File:** `src/lib/calculations/valuation.ts`

Replace mean-based averaging with median. Reference implementation:

```typescript
// REQUIRED: Replace any .reduce mean calculation with this
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Mileage adjustment: MUST be exactly $0.12/mile
const mileageDiff = comp.mileage - subject.mileage_at_accident;
const mileageAdjustment = mileageDiff * -0.12;

// Equipment adjustment: MUST be exactly 80% of factory MSRP
const equipmentAdjustment = item.factory_price * 0.80;

// Year adjustment: MUST be 7% per year for vehicles under 5 years old
const yearAdjustment = comp.listing_price * (yearDiff * -0.07);

// Condition normalization multipliers (EXACT values required):
const conditionMultipliers = {
  excellent: -0.05,
  good: 0,
  average: 0.05,
  below_average: 0.10,
  rough: 0.15
};
```

**Verification:** Write a unit test confirming:
- 3 pre-comps at [32000, 31500, 32500] → median = 32000
- 3 post-comps at [24000, 23500, 24500] → median = 24000
- DV = 8000

---

### Task 0.2 — Fix Severity Classification
**File:** `src/lib/severity/severity.ts`

Replace point-score system with exact decision tree from Master Spec Section 4.3.3:

```typescript
// EXACT decision tree — do not simplify or modify:

// LEVEL 5: total_labor_hours > 60
//       OR (airbag_deployment AND structural_damage AND frame_labor_hours > 5)
//       OR frame_labor_hours > 10

// LEVEL 4: frame_pulling_required = true
//       OR frame_labor_hours > 0
//       OR (structural_damage AND total_labor_hours > 35)
//       OR (airbag_deployment AND total_labor_hours > 30)

// LEVEL 3: total_labor_hours 20-35
//       OR (structural panels replaced AND total_labor_hours > 15)
//       OR airbag_deployment (standalone)

// LEVEL 2: total_labor_hours 10-20
//       AND no structural_damage
//       AND no frame_pulling_required

// LEVEL 1: total_labor_hours < 10

// NAAA post-repair grade mapping (EXACT):
// Level 5 → "1 - Rough"
// Level 4 → "2 - Below Average"
// Level 3 → "3 - Average"
// Level 2 → "4 - Good"
// Level 1 → pre-grade was "excellent" ? "4 - Good" : "3 - Average"
```

---

### Task 0.3 — Fix Legal Citations (Dynamic State Detection)
**File:** `src/lib/narratives/legal-citations.ts`

Create this file if it doesn't exist. Replace all hardcoded GA references with dynamic lookup:

```typescript
export function getLegalCitations(ownerState: string): LegalCitations {
  switch (ownerState.toUpperCase()) {
    case 'GA':
      return {
        firstParty: 'O.C.G.A. § 33-4-6',
        thirdParty: 'O.C.G.A. § 33-4-7',
        anti17c: true,
        anti17cText: `This appraisal explicitly rejects the so-called "17c formula"...
          [full text from Master Spec Section 2.6]`,
        caselaw: 'Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)'
      };
    case 'NC':
      return {
        firstParty: 'N.C. Gen. Stat. § 20-279.21(d)(1)',
        thirdParty: null,
        anti17c: false,
        caselaw: null
      };
    default:
      return {
        firstParty: null,
        thirdParty: null,
        anti17c: false,
        caselaw: 'Restatement of Torts § 928'
      };
  }
}
```

**Note:** Add additional states as data becomes available. Start with GA, NC, and default.

---

### Task 0.4 — Environment Variables Audit
**File:** `.env.local`

Confirm ALL of the following are present and valid before any other phase begins:

```bash
# Database
DATABASE_URL=                    # Neon PostgreSQL connection string

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI
GEMINI_API_KEY=                  # Gemini 3.1 Pro — get from Google AI Studio

# Storage
BLOB_READ_WRITE_TOKEN=           # Vercel Blob

# Scraping
APIFY_API_TOKEN=

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
USE_MOCK_DATA=false              # Set true only during local dev without Apify
```

**Agent must confirm each variable is populated before proceeding. Do not proceed with placeholders.**

---

### Task 0.5 — Drizzle Schema Alignment
**File:** `shared/schema.ts` (or `src/db/schema.ts` — confirm actual path)

Verify the following fields exist exactly as specified. Add any missing ones:

```typescript
// Confirm these critical fields exist on the appraisals table:
ownerState: text('owner_state').notNull()  // drives legal citations
repairEstimateUrl: text('repair_estimate_url')
damagePhotos: jsonb('damage_photos').$type<string[]>()
repairPhotos: jsonb('repair_photos').$type<string[]>()
aiExtractionData: jsonb('ai_extraction_data')  // ADD if missing — stores Gemini extraction results
reportPdfUrl: text('report_pdf_url')
stripeCustomerId: text('stripe_customer_id')
stripeSubscriptionId: text('stripe_subscription_id')
userRole: text('user_role').default('individual')  // 'individual' | 'appraiser' | 'attorney' | 'body_shop'
```

Run `npm run db:push` after any schema changes. Confirm migration succeeds before proceeding.

---

**✅ PHASE 0 COMPLETE WHEN:**
- [ ] Unit tests pass for median calculation
- [ ] Severity classifier matches all 5 test cases from Master Spec
- [ ] Legal citations return correct state-specific content for GA, NC, and default
- [ ] All env vars confirmed populated
- [ ] `db:push` succeeds with no errors
- [ ] No remaining references to Replit Auth, Express, Vite, or Wouter in active codebase

---

## PHASE 1: AI INTEGRATION — GEMINI 3.1 PRO
**Agent:** A
**Depends on:** Phase 0 complete
**Estimated Time:** 3–4 days
**Can run parallel with:** Phase 2

### Task 1.1 — Gemini Client Setup
**Create:** `src/lib/ai/gemini-client.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro',  // confirm exact model string with Google AI docs
});

export async function generateContent(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function analyzeDocumentWithFile(
  fileData: { data: string; mimeType: string },
  prompt: string
): Promise<string> {
  const result = await geminiModel.generateContent([
    { inlineData: fileData },
    { text: prompt }
  ]);
  return result.response.text();
}
```

---

### Task 1.2 — Document Analysis & Field Auto-Population
**Create:** `src/lib/ai/document-extractor.ts`
**API Route:** `src/app/api/ai/extract-document/route.ts`

This is the core AI feature. When a user uploads documents (accident report, insurance card, repair estimate), Gemini analyzes them and returns structured data to pre-fill wizard fields.

**Extraction targets from uploaded documents:**

```typescript
export interface ExtractedDocumentData {
  // From insurance documents
  owner?: {
    full_name?: string;
    address?: { street?: string; city?: string; state?: string; zip?: string };
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
  // From repair estimates
  repair?: {
    repair_facility?: string;
    repair_facility_phone?: string;
    total_repair_cost?: number;
    body_labor_hours?: number;
    frame_labor_hours?: number;
    refinish_labor_hours?: number;
    mechanical_labor_hours?: number;
    frame_pulling_required?: boolean;
    alignment_required?: boolean;
    airbag_deployment?: boolean;
    structural_damage?: boolean;
    panels_replaced?: Array<{
      panel_name: string;
      panel_type: 'structural' | 'cosmetic' | 'bolt-on';
      replaced_or_repaired: 'replaced' | 'repaired';
      part_type?: 'OEM' | 'aftermarket' | 'refurbished';
      cost?: number;
    }>;
    painted_panels?: string[];
    oem_parts_used?: boolean;
    aftermarket_parts_used?: boolean;
  };
  accident?: {
    accident_date?: string;
    loss_type?: 'collision' | 'comprehensive';
    point_of_impact?: string;
  };
  confidence: Record<string, number>; // 0-1 confidence per field
}
```

**Gemini prompt template:**

```typescript
const EXTRACTION_PROMPT = `
You are a vehicle insurance document analyst. Extract all available data from 
this document and return it as a JSON object matching the following TypeScript 
interface exactly. Only include fields where you found data — omit fields you 
are uncertain about. Include a "confidence" object with a 0-1 score for each 
top-level group you extracted data from.

Return ONLY valid JSON with no markdown, no preamble, no explanation.

Interface to match: [paste ExtractedDocumentData interface here]

Rules:
- Dates must be in ISO format (YYYY-MM-DD)
- Phone numbers as (XXX) XXX-XXXX
- Dollar amounts as numbers only (no $ or commas)
- VINs must be exactly 17 characters
- If a field is ambiguous, omit it rather than guess
`;
```

**API Route behavior:**
1. Receive file (PDF or image) as multipart form data
2. Convert to base64
3. Send to Gemini with extraction prompt
4. Parse JSON response
5. Return `ExtractedDocumentData` to client
6. Client merges with existing wizard state (never overwrite user-edited fields)

---

### Task 1.3 — Before/After Image Damage Analysis
**Create:** `src/lib/ai/image-analyzer.ts`
**API Route:** `src/app/api/ai/analyze-damage/route.ts`

```typescript
export interface DamageAnalysisResult {
  severity_indicators: {
    structural_deformation_visible: boolean;
    frame_damage_suspected: boolean;
    airbag_deployment_visible: boolean;
    panels_damaged: string[];
    damage_scope: 'minor' | 'moderate' | 'major' | 'severe';
  };
  before_condition_assessment: {
    overall_condition: 'excellent' | 'good' | 'average' | 'below_average';
    paint_condition: string;
    body_condition: string;
    notes: string;
  };
  after_damage_assessment: {
    point_of_impact: string;
    damaged_areas: string[];
    estimated_repair_complexity: string;
    structural_concern: boolean;
  };
  narrative: string; // 2-3 sentence professional description
  confidence: number; // 0-1
}
```

**Prompt:** Send before image + after image together and ask Gemini to compare them, identify damage extent, and return structured `DamageAnalysisResult` as JSON only.

**Integration point:** Results from image analysis should pre-populate:
- `point_of_impact` field
- `structural_damage` boolean
- `panels_replaced` array (as suggestions, user confirms)
- `damage_scope` informs severity pre-selection

---

### Task 1.4 — Repair Estimate Line-Item Extraction
**Create:** `src/lib/ai/repair-extractor.ts`
**API Route:** `src/app/api/ai/extract-repair/route.ts`

This is the most data-intensive extraction. Gemini reads the repair estimate PDF and pulls every single line item.

```typescript
export interface RepairLineItem {
  description: string;
  part_type: 'OEM' | 'aftermarket' | 'refurbished' | 'labor' | 'paint' | 'other';
  labor_hours?: number;
  labor_type?: 'body' | 'frame' | 'refinish' | 'mechanical';
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

**Prompt instruction to Gemini:** "Extract every single line item from this repair estimate. Categorize each as OEM, aftermarket, or refurbished parts, or labor. Identify labor type for each labor line (body, frame, refinish, mechanical). Sum totals for each category. Return ONLY valid JSON."

**Critical:** The output of this extraction directly populates Step 3 (Accident Details) of the wizard. All fields must map 1:1 to the `AccidentDetails` schema.

---

### Task 1.5 — Wizard Upload Gate (Step 0)
**Create:** `src/app/appraisal/upload/page.tsx`

This is a new pre-wizard step (Step 0) that appears before the existing Step 1. It is optional but strongly encouraged.

**UI behavior:**
1. Display drag-drop zone accepting PDFs and images
2. User can upload any combination of: repair estimate, insurance card, accident report, before/after photos
3. Each uploaded file triggers its appropriate Gemini analysis (Tasks 1.2–1.4)
4. Show loading states per file with progress indicators
5. Display extracted data summary: "We found the following information in your documents — does this look correct?"
6. Show each extracted field with a ✓ or ✗ toggle
7. On confirm, pass extracted data to wizard state
8. Wizard steps with pre-populated fields show a "✨ Auto-filled" badge on those fields

**State management:** Use `useReducer` with a `WizardState` type that holds all step data. Extracted data merges into state via `MERGE_EXTRACTED_DATA` action. User edits override extracted values.

---

**✅ PHASE 1 COMPLETE WHEN:**
- [ ] Gemini client connects and returns responses without errors
- [ ] Document upload extracts owner, insurance, and vehicle data correctly
- [ ] Repair estimate extraction captures all line items with correct categorization
- [ ] Image analysis returns structured damage assessment
- [ ] Step 0 upload gate renders, processes files, and passes data to wizard
- [ ] Pre-populated wizard fields display "✨ Auto-filled" badge
- [ ] All API routes return 400 for malformed input and 500 with error message for AI failures
- [ ] No Gemini API key exposed to client bundle

---

## PHASE 2: FILE UPLOAD SYSTEM
**Agent:** B
**Depends on:** Phase 0 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 1

### Task 2.1 — Vercel Blob Upload Handler
**Create:** `src/app/api/upload/route.ts`

```typescript
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file') as File;
  const appraisalId = form.get('appraisalId') as string;
  const fileType = form.get('fileType') as string; 
  // fileType: 'repair_estimate' | 'damage_photo' | 'repair_photo' | 'insurance_doc'

  const blob = await put(
    `appraisals/${appraisalId}/${fileType}/${file.name}`,
    file,
    { access: 'private' }  // IMPORTANT: private access only
  );

  // Save URL to database
  await saveFileUrlToAppraisal(appraisalId, fileType, blob.url);

  return Response.json({ url: blob.url });
}
```

---

### Task 2.2 — Drag-Drop Upload Component
**Create:** `src/components/upload/FileUploadZone.tsx`

Requirements:
- Accept multiple files simultaneously
- Show file type icons (PDF, image)
- Show upload progress bar per file
- Show success state with filename and size
- Show error state with retry button
- Accepted types: `image/jpeg, image/png, image/webp, application/pdf`
- Max file size: 25MB per file
- Max files: 20 per appraisal
- Do NOT use any third-party drag-drop library — implement with native HTML5 drag events or React's built-in handlers

**Props interface:**
```typescript
interface FileUploadZoneProps {
  appraisalId: string;
  fileType: 'repair_estimate' | 'damage_photo' | 'repair_photo' | 'insurance_doc';
  label: string;
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  onUploadError: (error: string) => void;
}
```

---

### Task 2.3 — Upload Integration in Wizard Step 3
**File:** `src/app/appraisal/steps/Step3AccidentDetails.tsx`

Add upload zones for:
1. **Repair Estimate PDF** (single file, required) — triggers Task 1.4 extraction automatically on upload
2. **Before-damage photos** (multiple, optional)
3. **After-repair photos** (multiple, optional)

Each upload zone should:
- Display existing uploaded files if resuming a draft
- Allow deletion of uploaded files
- Show AI extraction status badge when Gemini is processing the repair estimate

---

### Task 2.4 — Document Library in Dashboard
**File:** `src/app/dashboard/appraisal/[id]/documents/page.tsx`

Create a documents tab within each appraisal detail view:
- List all uploaded files with type, name, size, upload date
- Preview button (opens PDF in new tab, shows image inline)
- Download button (generates signed Vercel Blob URL)
- Delete button (removes from Blob + nulls database reference)
- Upload additional documents post-creation

---

**✅ PHASE 2 COMPLETE WHEN:**
- [ ] Files upload to Vercel Blob and URLs persist to database
- [ ] Drag-drop zone works in Chrome, Safari, Firefox
- [ ] Upload progress shows accurately
- [ ] Files under 25MB upload without error
- [ ] Files over 25MB are rejected with clear error message
- [ ] Uploaded repair estimate triggers Gemini extraction automatically
- [ ] Document library lists, previews, and deletes files correctly
- [ ] Private blob access enforced — no unauthenticated URL access

---

## PHASE 3: PDF REPORT GENERATION
**Agent:** A
**Depends on:** Phase 1 complete
**Estimated Time:** 3–4 days
**Can run parallel with:** Phase 4

### Task 3.1 — PDF Generation Architecture Decision

Puppeteer on Vercel has memory/timeout constraints with serverless functions. Use the following approach:

**Recommended:** Use `@react-pdf/renderer` for the report layout (runs in Node.js, no browser needed, no cold start issues). Use Puppeteer only if complex CSS layout is required and `@react-pdf/renderer` cannot achieve it.

**Install:**
```bash
npm install @react-pdf/renderer
npm install @types/react-pdf
```

If Puppeteer is required, deploy PDF generation as a **Vercel serverless function with 60-second timeout** and 3GB memory limit. Configure in `vercel.json`:

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

---

### Task 3.2 — Report Data Assembler
**Create:** `src/lib/pdf/assemble-report-data.ts`

Before generating the PDF, assemble all data from the database into a single `CompleteAppraisalData` object. This function:
1. Fetches appraisal by ID
2. Fetches all linked comparable vehicles
3. Runs final DV calculation (median method)
4. Runs severity classification
5. Generates all narrative text
6. Fetches state-specific legal citations
7. Returns complete typed object ready for PDF renderer

```typescript
export async function assembleReportData(
  appraisalId: string,
  userId: string
): Promise<CompleteAppraisalData> {
  // ... fetch, calculate, generate, return
}
```

---

### Task 3.3 — PDF Report Component
**Create:** `src/lib/pdf/ReportDocument.tsx`

Build the full 14-section report exactly matching the structure in Master Spec Section 3.1. Sections in order:

1. Cover Page — ClaimShield DV branding, vehicle info, DV amount highlighted
2. Cover Letter — formal letter with DV amount prominently displayed
3. Purpose, Scope & Intended Use
4. Vehicle Information — table format with all vehicle details + optional equipment
5. Pre-Accident Condition Assessment — NAAA grading table
6. Accident & Damage Summary — accident details + critical damage indicators table + components replaced table
7. Pre-Accident Comparable Vehicles — one card per comp with adjustment breakdown
8. Post-Accident Comparable Vehicles — same format, accident-reported comps
9. Valuation Analysis — side-by-side comparison table with final DV amount
10. Damage Severity Analysis — auto-generated narrative + severity badge
11. Market Stigma & Buyer Perception — full narrative
12. Legal Citations & Methodology — dynamic state citations + Canal v. Tullis
13. Disclaimers & Certifications — independence statement + USPAP if professional
14. Appendices — repair estimate attachment reference

**Design requirements:**
- Professional blue and white color scheme (#2563EB primary)
- Page numbers on every page (X of Y)
- Header with "ClaimShield DV — Diminished Value Appraisal" on every page
- DV amount shown in green highlight box on cover (#10B981)
- All dollar amounts formatted with `$XX,XXX` format
- Structural damage indicators shown in amber warning boxes

---

### Task 3.4 — PDF API Route
**Create:** `src/app/api/pdf/generate/route.ts`

```typescript
export async function POST(request: Request) {
  const { appraisalId } = await request.json();
  
  // 1. Verify user owns this appraisal (Clerk auth check)
  // 2. Assemble report data
  // 3. Generate PDF buffer
  // 4. Upload to Vercel Blob
  // 5. Save URL to appraisals.report_pdf_url
  // 6. Return download URL
  
  return Response.json({ pdfUrl });
}
```

---

### Task 3.5 — Report Preview Page
**Create:** `src/app/appraisal/[id]/report/page.tsx`

- Show loading state while PDF generates (polling or Server-Sent Events)
- Display generated PDF in embedded viewer (iframe or `<embed>`)
- Download button
- Email report button (triggers Phase 6)
- "Regenerate" button (re-runs generation if data was updated)
- Show DV amount prominently above the preview

---

**✅ PHASE 3 COMPLETE WHEN:**
- [ ] PDF generates successfully for a test appraisal
- [ ] All 14 sections render with correct data
- [ ] State-specific legal citations are correct for GA and non-GA
- [ ] DV amount on cover matches calculation
- [ ] PDF uploads to Vercel Blob and URL saves to database
- [ ] Report preview page loads PDF in embedded viewer
- [ ] Generation completes within Vercel timeout limits
- [ ] Generated PDF is minimum 15 pages for a complete appraisal

---

## PHASE 4: DOCUMENT TEMPLATES
**Agent:** B
**Depends on:** Phase 2 complete
**Estimated Time:** 3–4 days
**Can run parallel with:** Phase 3

### Task 4.1 — Template Engine
**Create:** `src/lib/templates/template-engine.ts`

Build a variable substitution engine that accepts a template string with `{{variable}}` placeholders and replaces them with appraisal data.

```typescript
export function renderTemplate(
  template: string,
  data: AppraisalTemplateData
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key]?.toString() ?? match;
  });
}
```

---

### Task 4.2 — Build All 7 Document Templates

Create each as a typed template function in `src/lib/templates/`:

**Template 1: Full DV Appraisal Summary** (1-page executive summary)
- `src/lib/templates/appraisal-summary.ts`
- Variables: owner name, vehicle, DV amount, calculation method, date

**Template 2: Georgia 60-Day Demand Letter**
- `src/lib/templates/demand-letter-ga.ts`
- Variables: insurance company, claim number, adjuster name, DV amount, 60-day deadline
- Cites O.C.G.A. § 33-4-6 or § 33-4-7 based on claim type
- Only render for `ownerState === 'GA'`

**Template 3: Generic Demand Letter** (non-GA states)
- `src/lib/templates/demand-letter-generic.ts`
- Same structure as GA version with generic tort law citations

**Template 4: Bad Faith Penalty Calculator Letter**
- `src/lib/templates/bad-faith-letter.ts`
- Variables: DV amount, 50% penalty calculation, $5,000 minimum, attorney fee notice
- GA-specific

**Template 5: Insurance Negotiation Response**
- `src/lib/templates/negotiation-response.ts`
- Template for countering a low insurance offer
- Variables: their offer amount, your DV amount, percentage difference

**Template 6: Expert Witness Affidavit**
- `src/lib/templates/expert-affidavit.ts`
- USPAP-compliant certification language from Master Spec Section 2.7
- Only for `is_professional_appraiser = true`

**Template 7: Market Stigma Impact Statement**
- `src/lib/templates/stigma-statement.ts`
- Standalone 1-page document for buyer resistance arguments
- Variables: DV percentage, severity level, structural damage indicators

---

### Task 4.3 — Template Document Page
**Create:** `src/app/appraisal/[id]/documents/page.tsx`

- List all 7 templates with availability status (locked/available based on state and appraiser type)
- Preview button for each template (renders in modal)
- Download as PDF button
- Download as DOCX button (use `docx` npm package for Word export)
- Email template button

---

**✅ PHASE 4 COMPLETE WHEN:**
- [ ] All 7 templates render without errors for GA and non-GA appraisals
- [ ] GA demand letter only appears for GA state owners
- [ ] Expert affidavit only appears for professional appraisers
- [ ] Variable substitution replaces all `{{placeholders}}` correctly
- [ ] Templates download as PDF
- [ ] Templates download as DOCX

---

## PHASE 5: STRIPE INTEGRATION
**Agent:** A
**Depends on:** Phase 3 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 6

### Task 5.1 — Stripe Products Setup (do this in Stripe dashboard manually)

Create these products in Stripe:

| Product | Price | Type |
|---|---|---|
| Individual Report | $129/report | One-time |
| Professional Monthly | $299/mo | Subscription |
| Attorney Monthly | $499/mo | Subscription |
| Body Shop Monthly | $399/mo | Subscription |

---

### Task 5.2 — Checkout Flow
**Create:** `src/app/api/stripe/checkout/route.ts`

```typescript
// For one-time report purchases:
// Create Stripe Checkout session → redirect to Stripe hosted page → webhook confirms payment → unlock PDF generation

// For subscriptions:
// Create Stripe Customer → create Subscription → save stripeCustomerId + stripeSubscriptionId to user record
```

---

### Task 5.3 — Webhook Handler
**Create:** `src/app/api/stripe/webhook/route.ts`

Handle these events:
- `checkout.session.completed` → unlock report generation
- `customer.subscription.created` → set user role based on plan
- `customer.subscription.deleted` → downgrade user access
- `invoice.payment_failed` → flag account, send email

---

### Task 5.4 — Usage Gating

Implement access control:
- Free tier: 0 reports (account creation only)
- Individual report purchase: 1 report unlocked per purchase
- Professional/Attorney/Body Shop: unlimited reports while subscription active

**Gate PDF generation** — `src/app/api/pdf/generate/route.ts` must check user has active entitlement before proceeding.

---

**✅ PHASE 5 COMPLETE WHEN:**
- [ ] Checkout flow completes for one-time and subscription products
- [ ] Webhook correctly updates user entitlements
- [ ] PDF generation blocked for users without entitlement
- [ ] Subscription cancellation correctly removes access
- [ ] Test mode payments work end-to-end

---

## PHASE 6: EMAIL DELIVERY (SENDGRID)
**Agent:** B
**Depends on:** Phase 4 complete
**Estimated Time:** 1–2 days
**Can run parallel with:** Phase 5

### Task 6.1 — SendGrid Client
**Create:** `src/lib/email/sendgrid-client.ts`

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendReportEmail(
  to: string,
  ownerName: string,
  pdfUrl: string,
  dvAmount: number,
  vehicle: string
): Promise<void> {
  await sgMail.send({
    to,
    from: 'reports@claimshield-dv.com',
    subject: `Your ClaimShield DV Report — ${vehicle}`,
    html: buildReportEmailHTML(ownerName, pdfUrl, dvAmount, vehicle),
    attachments: [] // link only, don't attach PDF directly (file size)
  });
}
```

---

### Task 6.2 — Email Templates

Build HTML email templates for:
1. **Report Delivery** — "Your report is ready. Download here."
2. **Welcome** — triggered on first account creation
3. **Payment Confirmation** — triggered on Stripe checkout.session.completed
4. **Subscription Renewal Reminder** — 3 days before renewal

---

### Task 6.3 — Email API Route
**Create:** `src/app/api/email/send-report/route.ts`

Triggered from report preview page "Email Report" button. Validates user, fetches PDF URL, sends email.

---

**✅ PHASE 6 COMPLETE WHEN:**
- [ ] Report email sends with correct vehicle and DV amount
- [ ] PDF link in email is accessible (signed Vercel Blob URL)
- [ ] Welcome email sends on account creation
- [ ] Payment confirmation email sends after Stripe checkout

---

## PHASE 7: ROLE-BASED ACCESS CONTROL
**Agent:** A
**Depends on:** Phase 5 complete
**Estimated Time:** 2 days
**Can run parallel with:** Phase 8

### Task 7.1 — Role Definitions

```typescript
export type UserRole = 'individual' | 'appraiser' | 'attorney' | 'body_shop' | 'admin';

export const rolePermissions: Record<UserRole, RolePermissions> = {
  individual: {
    canGenerateReports: true,
    maxReportsPerMonth: null, // limited by purchase
    canAccessUSPAPCertification: false,
    canWhiteLabel: false,
    canManageTeam: false,
  },
  appraiser: {
    canGenerateReports: true,
    maxReportsPerMonth: null, // unlimited with sub
    canAccessUSPAPCertification: true,
    canWhiteLabel: false,
    canManageTeam: false,
  },
  attorney: {
    canGenerateReports: true,
    maxReportsPerMonth: null,
    canAccessUSPAPCertification: false,
    canWhiteLabel: false,
    canManageTeam: true, // can add paralegal accounts
  },
  body_shop: {
    canGenerateReports: true,
    maxReportsPerMonth: null,
    canAccessUSPAPCertification: false,
    canWhiteLabel: true,
    canManageTeam: false,
  },
  admin: { /* all permissions */ }
};
```

---

### Task 7.2 — Role Middleware
**Create:** `src/lib/auth/role-check.ts`

```typescript
export async function requireRole(
  userId: string,
  requiredRole: UserRole | UserRole[]
): Promise<boolean> {
  const user = await getUserFromDb(userId);
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}
```

Apply to all relevant API routes.

---

### Task 7.3 — Role Selection UI
**Create:** `src/app/onboarding/role/page.tsx`

After first login (Clerk webhook), redirect new users to role selection page. Present 4 options with descriptions. Save selection to database.

---

**✅ PHASE 7 COMPLETE WHEN:**
- [ ] Role saved to database on onboarding
- [ ] USPAP certification section only visible to appraiser role
- [ ] White-label option only visible to body_shop role
- [ ] Team management only visible to attorney role
- [ ] API routes reject unauthorized role access with 403

---

## PHASE 8: DASHBOARD & UX POLISH
**Agent:** B
**Depends on:** Phase 6 complete
**Estimated Time:** 2–3 days
**Can run parallel with:** Phase 7

### Task 8.1 — Dashboard Actions
**File:** `src/app/dashboard/page.tsx`

Add these actions to each appraisal card:
- **Duplicate** — clone all data into new draft appraisal (useful for attorneys with repeat clients)
- **Archive** — soft delete (set `status = 'archived'`, hide from default view)
- **Bulk Download** — select multiple appraisals → download as ZIP of PDFs
- **Share** — generate a 7-day expiring signed URL for the report

---

### Task 8.2 — Usage Tracking Widget
Add to dashboard header:
- Reports used this month (for subscription users)
- Reports remaining (for per-report purchasers)
- Quick "Buy More" CTA

---

### Task 8.3 — Wizard UX Improvements
- Add progress bar across top of wizard (Step X of 7)
- Auto-save draft every 30 seconds
- Resume draft on return visit
- Mobile-responsive layout for all wizard steps
- Field validation inline (not just on submit)
- "Skip for now" option on optional steps

---

### Task 8.4 — State Law Warning Banners
On Step 1 (Driver Info), after state is entered:
- If GA: show green banner — "Great news! Georgia has strong DV laws. Your claim is well-supported."
- If NC: show blue banner — "North Carolina has a formal appraisal dispute process."
- If unsupported state: show amber banner — "Your state uses general tort law for DV claims. Our report is still fully valid."

---

**✅ PHASE 8 COMPLETE WHEN:**
- [ ] Duplicate, archive, bulk download all work
- [ ] Usage tracking displays correctly
- [ ] Draft auto-saves and resumes
- [ ] All wizard steps are mobile-responsive
- [ ] State law banners appear correctly for GA, NC, and default

---

## PHASE 9: TESTING & LAUNCH HARDENING
**Agent:** Both
**Depends on:** All phases complete
**Estimated Time:** 3–5 days

### Task 9.1 — Unit Tests (Agent A)
**File:** `src/__tests__/calculations.test.ts`

Required test cases:
```typescript
// Median calculation
test('median of [32000, 31500, 32500] = 32000')
test('median of [30000, 35000] = 32500')

// DV calculation
test('DV of $32k FMV vs $24k ACV = $8000')
test('DV as % of pre-value = 25%')

// Severity classification
test('labor_hours=45, frame_pulling=true → Level 4')
test('labor_hours=65 → Level 5')
test('labor_hours=25, no structural → Level 3')
test('labor_hours=15 → Level 2')
test('labor_hours=8 → Level 1')
test('airbag=true, structural=true, frame_labor=6 → Level 5')

// Adjustment calculations
test('comp has 10k more miles → adjustment = +$1200')
test('equipment worth $2000 MSRP → adjustment = -$1600')
test('comp is 2 years newer → adjustment = -14% of price')
```

---

### Task 9.2 — Integration Tests (Agent B)
**File:** `src/__tests__/appraisal-flow.test.ts`

End-to-end test (using Playwright or Cypress):
1. Create account, select role
2. Complete wizard steps 0–6
3. Trigger calculation
4. Generate PDF
5. Verify PDF URL saved to database
6. Verify email sent (mock SendGrid)

---

### Task 9.3 — Security Audit (Both)
- [ ] All API routes check Clerk auth before executing
- [ ] Users can only access their own appraisals (userId check on all DB queries)
- [ ] Blob storage URLs are private (no public access)
- [ ] Gemini API key not in client bundle (`GEMINI_API_KEY` not prefixed with `NEXT_PUBLIC_`)
- [ ] Stripe webhook validates signature before processing
- [ ] No raw SQL — all queries through Drizzle ORM
- [ ] Input validation on all API routes (use Zod)

---

### Task 9.4 — Performance Targets
- Wizard step transitions: < 200ms
- Apify comp search: display results within 15 seconds (show loading state immediately)
- PDF generation: complete within 45 seconds (show progress indicator)
- Gemini extraction: complete within 10 seconds per document
- Dashboard load: < 1 second

---

### Task 9.5 — Pre-Launch Checklist
- [ ] All Phase 0–8 completion criteria met
- [ ] All unit and integration tests pass
- [ ] Security audit items resolved
- [ ] Stripe in live mode (not test)
- [ ] SendGrid sending domain verified
- [ ] Error tracking configured (Sentry or Vercel error logs)
- [ ] Privacy policy and terms of service pages exist
- [ ] Legal disclaimer reviewed by counsel (document template accuracy)
- [ ] USPAP language reviewed for compliance
- [ ] State law citations verified for GA and NC
- [ ] `USE_MOCK_DATA=false` in production env

---

## APPENDIX A: COMPONENT DIRECTORY STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   └── sign-in/ sign-up/          # Clerk hosted pages
│   ├── api/
│   │   ├── ai/
│   │   │   ├── extract-document/
│   │   │   ├── extract-repair/
│   │   │   └── analyze-damage/
│   │   ├── appraisal/                 # CRUD routes
│   │   ├── comparables/               # Apify search routes
│   │   ├── email/
│   │   ├── pdf/generate/
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   └── webhook/
│   │   └── upload/
│   ├── appraisal/
│   │   ├── upload/                    # Step 0 - AI doc upload
│   │   ├── new/                       # Wizard entry
│   │   ├── [id]/
│   │   │   ├── report/                # PDF preview
│   │   │   └── documents/             # Template library
│   │   └── steps/
│   │       ├── Step1DriverInfo.tsx
│   │       ├── Step2VehicleDetails.tsx
│   │       ├── Step3AccidentDetails.tsx
│   │       ├── Step4PreAccidentCondition.tsx
│   │       ├── Step5PreAccidentComps.tsx
│   │       ├── Step6PostAccidentComps.tsx
│   │       └── Step7ReviewGenerate.tsx
│   ├── dashboard/
│   │   └── appraisal/[id]/
│   │       └── documents/
│   └── onboarding/role/
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── upload/
│   │   └── FileUploadZone.tsx
│   ├── wizard/
│   │   └── WizardProgress.tsx
│   └── dashboard/
├── lib/
│   ├── ai/
│   │   ├── gemini-client.ts
│   │   ├── document-extractor.ts
│   │   ├── image-analyzer.ts
│   │   └── repair-extractor.ts
│   ├── auth/
│   │   └── role-check.ts
│   ├── calculations/
│   │   └── valuation.ts               # median-based, spec-compliant
│   ├── email/
│   │   └── sendgrid-client.ts
│   ├── pdf/
│   │   ├── ReportDocument.tsx
│   │   └── assemble-report-data.ts
│   ├── severity/
│   │   └── severity.ts                # exact decision tree
│   ├── narratives/
│   │   ├── legal-citations.ts         # dynamic state detection
│   │   ├── repair-analysis.ts
│   │   └── market-stigma.ts
│   └── templates/
│       ├── template-engine.ts
│       ├── demand-letter-ga.ts
│       ├── demand-letter-generic.ts
│       ├── bad-faith-letter.ts
│       ├── negotiation-response.ts
│       ├── expert-affidavit.ts
│       ├── appraisal-summary.ts
│       └── stigma-statement.ts
├── db/
│   └── schema.ts                      # Drizzle schema (single source of truth)
└── types/
    ├── appraisal.ts
    ├── ai.ts
    └── roles.ts
```

---

## APPENDIX B: INTER-AGENT HANDOFF PROTOCOL

When Agent A completes a phase and hands off to the next parallel task:
1. Leave a `// AGENT-A-COMPLETE: [timestamp]` comment in the last modified file
2. Run `npm run build` and confirm zero TypeScript errors
3. Run available unit tests and confirm all pass
4. Update this document's completion checklist

When Agent B completes a phase:
1. Same protocol as above with `// AGENT-B-COMPLETE`
2. Confirm no merge conflicts with Agent A's work
3. Run `npm run build` to verify combined codebase compiles

---

*End of Multi-Agent Development Instructions v2.0*
*Source documents: Master Appraisal Schema, Codebase Analysis Report, Gap Analysis, Project Description*
*Next review: After Phase 0 completion*

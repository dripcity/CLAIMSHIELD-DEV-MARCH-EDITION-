# PDF Report Structure Requirements

## Current Issue

`lib/pdf/generator.tsx:108-157` produces single-page placeholder.

**Required**: 15-25 page professional report.

## Report Sections (from Master Schema)

1. Cover Page
2. Executive Summary
3. Vehicle Information
4. Accident Details
5. Pre-Accident Condition & Value
6. Post-Accident Condition
7. Repair Analysis
8. Comparable Sales Analysis
9. Diminished Value Calculation
10. Market Impact Analysis
11. Damage Severity Classification
12. Legal Citations & State Law
13. Narrative Explanation
14. Supporting Documentation
15. Appraiser Credentials (if professional role)
16. USPAP Compliance Statement (if professional role)
17. Certification & Signature

## Implementation Approach

Create section components:
```typescript
// lib/pdf/sections/CoverPage.tsx
export function CoverPage({ appraisal }: { appraisal: Appraisal }) {
  return (
    <div className="page">
      <h1>{appraisal.claimNumber} - Diminished Value Report</h1>
      {/* ... */}
    </div>
  );
}

// lib/pdf/generator.tsx
export async function generateReport(appraisalId: string) {
  const appraisal = await getAppraisal(appraisalId);
  
  return (
    <Document>
      <CoverPage appraisal={appraisal} />
      <ExecutiveSummary appraisal={appraisal} />
      {/* ... all sections */}
    </Document>
  );
}
```

## Page Breaks

Use CSS for pagination:
```css
.page {
  page-break-after: always;
  min-height: 100vh;
}
```
EOF# Extract 10: Template Engine (for CS-LR-023)
cat > .kiro/context/extracts/template-engine-requirements.md << 'EOF'
# Template Engine Requirements

## Current Status

Only 2 demand letter templates exist. Required: 7 templates total.

## Required Templates

1. Demand Letter (Insurance Company) - EXISTS
2. Demand Letter (At-Fault Party) - EXISTS
3. Settlement Authorization Letter - MISSING
4. Records Release Authorization - MISSING
5. Notice of Representation (Attorney) - MISSING
6. Pre-Litigation Settlement Demand - MISSING
7. Expert Witness Affidavit - MISSING (separate route CS-LR-024)

## Template Engine Pattern
```typescript
// lib/templates/template-engine.ts
export interface TemplateData {
  appraisalId: string;
  claimNumber: string;
  ownerName: string;
  // ... all possible fields
}

export function renderTemplate(templateType: string, data: TemplateData): string {
  const template = loadTemplate(templateType);
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key as keyof TemplateData] || '';
  });
}
```

## File Structure
```
lib/templates/
  ├── template-engine.ts
  ├── demand-letter-insurance.ts
  ├── demand-letter-at-fault.ts
  ├── settlement-authorization.ts
  ├── records-release.ts
  ├── notice-representation.ts
  ├── pre-litigation-demand.ts
  └── expert-affidavit.ts (CS-LR-024)
```

## API Routes

Each template needs endpoint:
```
app/api/templates/[type]/route.ts
```

Supports types: `demand-insurance`, `demand-at-fault`, `settlement-auth`, etc.

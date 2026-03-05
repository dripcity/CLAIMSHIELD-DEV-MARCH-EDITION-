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

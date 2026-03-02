import { extractStructuredData } from './gemini';
import { insuranceDocsSchema } from './schemas';

const INSURANCE_DOCS_PROMPT = `
Analyze this insurance document and extract the following information in JSON format:

1. Insurance company name
2. Policy number
3. Claim number
4. Adjuster name (if present)
5. Adjuster phone number (if present)
6. Adjuster email (if present)
7. Vehicle owner first name (if present)
8. Vehicle owner last name (if present)

Provide a confidence score (0-1) for the extraction quality.

Return ONLY valid JSON matching this structure:
{
  "company": "string",
  "policyNumber": "string",
  "claimNumber": "string",
  "adjusterName": "string",
  "adjusterPhone": "string",
  "adjusterEmail": "string",
  "ownerFirstName": "string",
  "ownerLastName": "string",
  "confidence": number
}
`;

export async function extractInsuranceDocs(documentUrl: string) {
  return extractStructuredData(
    documentUrl,
    INSURANCE_DOCS_PROMPT,
    insuranceDocsSchema
  );
}

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

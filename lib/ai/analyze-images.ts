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

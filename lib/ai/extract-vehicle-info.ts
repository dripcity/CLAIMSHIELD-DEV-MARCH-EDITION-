import { extractStructuredData } from './gemini';
import { vehicleInfoSchema } from './schemas';

const VEHICLE_INFO_PROMPT = `
Analyze this vehicle document and extract the following information in JSON format:

1. VIN (17-character vehicle identification number)
2. Year
3. Make
4. Model
5. Trim (if present)
6. Mileage

Provide a confidence score (0-1) for the extraction quality.

Return ONLY valid JSON matching this structure:
{
  "vin": "string (17 characters)",
  "year": number,
  "make": "string",
  "model": "string",
  "trim": "string",
  "mileage": number,
  "confidence": number
}
`;

export async function extractVehicleInfo(documentUrl: string) {
  return extractStructuredData(
    documentUrl,
    VEHICLE_INFO_PROMPT,
    vehicleInfoSchema
  );
}

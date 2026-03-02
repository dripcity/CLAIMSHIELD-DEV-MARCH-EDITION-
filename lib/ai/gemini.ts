import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractStructuredData<T>(
  documentUrl: string,
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  // Fetch document content
  const response = await fetch(documentUrl);
  const buffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || 'application/pdf';
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType,
      },
    },
    { text: prompt },
  ]);
  
  const text = result.response.text();
  
  // Extract JSON from markdown code blocks if present
  let jsonText = text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  } else {
    // Try to find JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonText = objectMatch[0];
    }
  }
  
  const parsed = JSON.parse(jsonText);
  
  // Validate against schema
  return schema.parse(parsed);
}

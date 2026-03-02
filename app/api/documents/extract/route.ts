import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { extractRepairEstimate } from '@/lib/ai/extract-repair-estimate';
import { extractInsuranceDocs } from '@/lib/ai/extract-insurance-docs';
import { extractVehicleInfo } from '@/lib/ai/extract-vehicle-info';
import { analyzeImages } from '@/lib/ai/analyze-images';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { documentUrl, documentType } = await req.json();
    
    let extractedData;
    
    switch (documentType) {
      case 'repair_estimate':
        extractedData = await extractRepairEstimate(documentUrl);
        break;
      case 'insurance_docs':
        extractedData = await extractInsuranceDocs(documentUrl);
        break;
      case 'vehicle_docs':
        extractedData = await extractVehicleInfo(documentUrl);
        break;
      case 'damage_photos':
        extractedData = await analyzeImages([documentUrl]);
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    
    return NextResponse.json(extractedData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}

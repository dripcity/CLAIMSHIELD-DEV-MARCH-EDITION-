import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { extractRepairEstimate } from '@/lib/ai/extract-repair-estimate';
import { extractInsuranceDocs } from '@/lib/ai/extract-insurance-docs';
import { extractVehicleInfo } from '@/lib/ai/extract-vehicle-info';
import { analyzeImages } from '@/lib/ai/analyze-images';
import { z } from 'zod';

const extractPayloadSchema = z.object({
  appraisalId: z.string().uuid('appraisalId must be a valid UUID'),
  documentUrl: z.string().url('documentUrl must be a valid URL'),
  documentType: z.enum(['repair_estimate', 'insurance_docs', 'vehicle_docs', 'damage_photos', 'repair_photos']),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const payload = extractPayloadSchema.parse(await req.json());
    const { appraisalId, documentUrl, documentType } = payload;

    await requireAppraisalOwnership(appraisalId, user.id);
    
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
      case 'repair_photos':
        extractedData = await analyzeImages([documentUrl]);
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type', code: 'INVALID_DOCUMENT_TYPE' }, { status: 400 });
    }
    
    return NextResponse.json(extractedData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
      }
      if (error.message === 'Appraisal not found') {
        return NextResponse.json({ error: 'Appraisal not found', code: 'APPRAISAL_NOT_FOUND' }, { status: 404 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid extraction payload',
          code: 'INVALID_PAYLOAD',
          issues: error.issues,
        },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Extraction failed',
          code: 'EXTRACTION_FAILED',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Extraction failed',
        code: 'EXTRACTION_FAILED',
      },
      { status: 500 }
    );
  }
}

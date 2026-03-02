import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { generateGeorgiaDemandLetter } from '@/lib/templates/demand-letter-ga';
import { generateGenericDemandLetter } from '@/lib/templates/demand-letter-generic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const params = await context.params;
    const user = await requireAuth();
    
    // Get appraisal ID from query
    const appraisalId = req.nextUrl.searchParams.get('appraisalId');
    const state = req.nextUrl.searchParams.get('state');
    
    if (!appraisalId) {
      return NextResponse.json({ error: 'Appraisal ID required' }, { status: 400 });
    }
    
    await requireAppraisalOwnership(appraisalId, user.id);
    
    // Get appraisal data
    const { db } = await import('@/lib/db');
    const { appraisals } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId));
    
    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }
    
    let templateContent: string;
    
    switch (params.type) {
      case 'demand-letter-ga':
        templateContent = generateGeorgiaDemandLetter(appraisal);
        break;
      case 'demand-letter-generic':
        templateContent = generateGenericDemandLetter(appraisal);
        break;
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }
    
    return NextResponse.json({ content: templateContent });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

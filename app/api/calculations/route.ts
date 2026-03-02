import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { calculateValuation } from '@/lib/calculations/valuation';
import { classifySeverity } from '@/lib/calculations/severity-classifier';
import { db } from '@/lib/db';
import { appraisals, comparableVehicles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId } = await req.json();
    
    await requireAppraisalOwnership(appraisalId, user.id);
    
    // Get appraisal and comparables
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId));
    
    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }
    
    const comps = await db
      .select()
      .from(comparableVehicles)
      .where(eq(comparableVehicles.appraisalId, appraisalId));
    
    // Calculate severity
    const severityAnalysis = classifySeverity(
      appraisal.accidentDetails as any,
      appraisal.subjectVehicle?.preAccidentNaaaGrade
    );
    
    // Calculate valuation
    const valuationResults = calculateValuation(
      appraisal.subjectVehicle as any,
      comps.map(c => ({
        listingPrice: parseFloat(c.listingPrice as string),
        mileage: c.mileage,
        year: c.year,
        accidentHistory: c.accidentHistory,
      })),
      severityAnalysis
    );
    
    // Update appraisal
    const [updated] = await db
      .update(appraisals)
      .set({
        valuationResults: valuationResults as any,
        severityAnalysis: severityAnalysis as any,
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, appraisalId))
      .returning();
    
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('Calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals, comparableVehicles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await requireAppraisalOwnership(id, user.id);

    // Fetch the original appraisal
    const [original] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, id))
      .execute();

    if (!original) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    // Create duplicate with new ID and timestamps, status set to draft
    const [duplicate] = await db
      .insert(appraisals)
      .values({
        userId: user.id,
        status: 'draft',
        subjectVehicle: original.subjectVehicle,
        ownerInfo: original.ownerInfo,
        insuranceInfo: original.insuranceInfo,
        accidentDetails: original.accidentDetails,
        repairEstimateUrl: original.repairEstimateUrl,
        damagePhotos: original.damagePhotos,
        repairPhotos: original.repairPhotos,
        insuranceDocs: original.insuranceDocs,
        severityAnalysis: original.severityAnalysis,
        appraiserInfo: original.appraiserInfo,
        claimNumber: original.claimNumber,
        appraisalDate: original.appraisalDate,
        accidentDate: original.accidentDate,
        purpose: original.purpose,
        valuationResults: null, // Reset valuation results
        reportPdfUrl: null, // Reset PDF URL
      })
      .returning()
      .execute();

    // Duplicate comparable vehicles if they exist
    const originalComparables = await db
      .select()
      .from(comparableVehicles)
      .where(eq(comparableVehicles.appraisalId, id))
      .execute();

    if (originalComparables.length > 0) {
      await db
        .insert(comparableVehicles)
        .values(
          originalComparables.map((comp) => ({
            appraisalId: duplicate.id,
            compType: comp.compType,
            source: comp.source,
            vin: comp.vin,
            year: comp.year,
            make: comp.make,
            model: comp.model,
            trim: comp.trim,
            mileage: comp.mileage,
            listingPrice: comp.listingPrice,
            listingUrl: comp.listingUrl,
            dealerName: comp.dealerName,
            dealerPhone: comp.dealerPhone,
            locationCity: comp.locationCity,
            locationState: comp.locationState,
            distanceMiles: comp.distanceMiles,
            accidentHistory: comp.accidentHistory,
            adjustments: comp.adjustments,
            adjustedValue: comp.adjustedValue,
            includedInCalculation: comp.includedInCalculation,
          }))
        )
        .execute();
    }

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('Error duplicating appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate appraisal' },
      { status: 500 }
    );
  }
}

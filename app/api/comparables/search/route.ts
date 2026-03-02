import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { searchComparables } from '@/lib/scraping/apify-search';
import { db } from '@/lib/db';
import { comparableVehicles } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId, vehicleSpecs, location, searchType } = await req.json();
    
    // searchType: 'pre_accident' or 'post_accident'
    const results = await searchComparables({
      year: vehicleSpecs.year,
      make: vehicleSpecs.make,
      model: vehicleSpecs.model,
      trim: vehicleSpecs.trim,
      mileage: vehicleSpecs.mileage,
      location: location,
      accidentHistory: searchType === 'post_accident',
    });
    
    // Save comparables to database
    const savedComps = await Promise.all(
      results.map(comp =>
        db.insert(comparableVehicles).values({
          appraisalId,
          compType: searchType,
          source: 'apify',
          vin: comp.vin,
          year: comp.year,
          make: comp.make,
          model: comp.model,
          trim: comp.trim,
          mileage: comp.mileage,
          accidentHistory: comp.accidentHistory,
          listingUrl: comp.listingUrl,
          listingPrice: comp.listingPrice.toString(),
          dealerName: comp.dealerName,
          dealerPhone: comp.dealerPhone,
          locationCity: comp.locationCity,
          locationState: comp.locationState,
          distanceMiles: comp.distanceMiles,
        }).returning()
      )
    );
    
    return NextResponse.json(savedComps);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

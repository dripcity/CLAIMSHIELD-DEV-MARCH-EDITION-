import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

interface SearchParams {
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  location: string;
  accidentHistory: boolean;
}

interface ComparableResult {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  accidentHistory: boolean;
  listingUrl: string;
  listingPrice: number;
  dealerName?: string;
  dealerPhone?: string;
  locationCity?: string;
  locationState?: string;
  distanceMiles?: number;
}

export async function searchComparables(params: SearchParams): Promise<ComparableResult[]> {
  const { year, make, model, trim, mileage, location, accidentHistory } = params;
  
  // Configure search parameters
  const input = {
    searchQuery: `${year} ${make} ${model} ${trim || ''}`,
    location: location,
    maxMileage: mileage + 15000, // 15k mile tolerance
    minMileage: Math.max(0, mileage - 15000),
    accidentHistory: accidentHistory ? 'yes' : 'no',
    maxResults: 5,
    radius: 100, // miles
  };
  
  // Run the Apify actor (using a hypothetical car listing scraper)
  // Note: You'll need to replace 'your-actor-id' with an actual Apify actor
  // that scrapes car listings (e.g., from Cars.com, AutoTrader, etc.)
  const run = await client.actor('your-actor-id').call(input);
  
  // Fetch results
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  // Transform results to our format
  return items.map((item: any) => ({
    vin: item.vin,
    year: item.year,
    make: item.make,
    model: item.model,
    trim: item.trim,
    mileage: item.mileage,
    accidentHistory: item.accidentHistory,
    listingUrl: item.url,
    listingPrice: parseFloat(item.price),
    dealerName: item.dealerName,
    dealerPhone: item.dealerPhone,
    locationCity: item.city,
    locationState: item.state,
    distanceMiles: item.distance,
  }));
}

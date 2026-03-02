import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['individual', 'appraiser', 'attorney', 'body_shop', 'admin']);
export const statusEnum = pgEnum('appraisal_status', ['draft', 'complete', 'sent', 'archived']);
export const compTypeEnum = pgEnum('comp_type', ['pre_accident', 'post_accident']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  role: roleEnum('role').default('individual'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  reportsRemaining: integer('reports_remaining').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appraisals = pgTable('appraisals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: statusEnum('status').default('draft'),
  
  // Claim information
  claimNumber: text('claim_number'),
  appraisalDate: timestamp('appraisal_date'),
  accidentDate: timestamp('accident_date'),
  purpose: text('purpose'),
  
  // Owner information
  ownerInfo: jsonb('owner_info').$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  
  // Insurance information
  insuranceInfo: jsonb('insurance_info').$type<{
    company: string;
    policyNumber: string;
    claimNumber: string;
    adjusterName?: string;
    adjusterPhone?: string;
    adjusterEmail?: string;
  }>(),
  
  // Subject vehicle
  subjectVehicle: jsonb('subject_vehicle').$type<{
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    engine?: string;
    transmission?: string;
    bodyStyle?: string;
    exteriorColor?: string;
    interiorColor?: string;
    mileage: number;
    preAccidentCondition: 'excellent' | 'good' | 'average' | 'below_average';
    preAccidentNaaaGrade: string;
    optionalEquipment?: string[];
  }>(),
  
  // Accident details
  accidentDetails: jsonb('accident_details').$type<{
    pointOfImpact: string;
    structuralDamage: boolean;
    airbagDeployment: boolean;
    framePulling: boolean;
    panelsReplaced: string[];
    paintedPanels: string[];
    totalRepairCost: number;
    partsCost: number;
    laborCost: number;
    paintCost: number;
    bodyLaborHours: number;
    frameLaborHours: number;
    refinishLaborHours: number;
    mechanicalLaborHours: number;
    totalLaborHours: number;
    oemParts: boolean;
    aftermarketParts: boolean;
    refurbishedParts: boolean;
    repairFacility?: string;
    repairFacilityPhone?: string;
    estimateDate?: string;
  }>(),
  
  // Valuation results
  valuationResults: jsonb('valuation_results').$type<{
    preAccidentFmv: number;
    postRepairAcv: number;
    diminishedValue: number;
    dvPercentOfValue: number;
    dvPercentOfRepair: number;
    confidenceRangeLow: number;
    confidenceRangeHigh: number;
    preAccidentCompsCount: number;
    postAccidentCompsCount: number;
  }>(),
  
  // Severity analysis
  severityAnalysis: jsonb('severity_analysis').$type<{
    severityLevel: 1 | 2 | 3 | 4 | 5;
    severityLabel: 'Minor' | 'Moderate' | 'Medium' | 'Major' | 'Severe';
    postRepairNaaaGrade: string;
    justification: string;
  }>(),
  
  // Appraiser information (for professional appraisers)
  appraiserInfo: jsonb('appraiser_info').$type<{
    name?: string;
    license?: string;
    certifications?: string[];
    signatureUrl?: string;
  }>(),
  
  // Document URLs
  repairEstimateUrl: text('repair_estimate_url'),
  damagePhotos: jsonb('damage_photos').$type<string[]>(),
  repairPhotos: jsonb('repair_photos').$type<string[]>(),
  insuranceDocs: jsonb('insurance_docs').$type<string[]>(),
  reportPdfUrl: text('report_pdf_url'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const comparableVehicles = pgTable('comparable_vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  appraisalId: uuid('appraisal_id').notNull().references(() => appraisals.id, { onDelete: 'cascade' }),
  compType: compTypeEnum('comp_type').notNull(),
  source: text('source'), // 'apify', 'manual'
  
  // Vehicle details
  vin: text('vin'),
  year: integer('year').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  trim: text('trim'),
  mileage: integer('mileage').notNull(),
  accidentHistory: boolean('accident_history').notNull(),
  
  // Listing details
  listingUrl: text('listing_url'),
  listingPrice: decimal('listing_price', { precision: 10, scale: 2 }).notNull(),
  dealerName: text('dealer_name'),
  dealerPhone: text('dealer_phone'),
  locationCity: text('location_city'),
  locationState: text('location_state'),
  distanceMiles: integer('distance_miles'),
  
  // Adjustments
  adjustments: jsonb('adjustments').$type<{
    mileage: number;
    equipment: number;
    year: number;
    condition: number;
    total: number;
  }>(),
  adjustedValue: decimal('adjusted_value', { precision: 10, scale: 2 }),
  
  // Calculation inclusion
  includedInCalculation: boolean('included_in_calculation').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
});

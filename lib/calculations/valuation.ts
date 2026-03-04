import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

interface ComparableVehicle {
  listingPrice: number;
  mileage: number;
  year: number;
  accidentHistory: boolean;
}

interface SubjectVehicle {
  mileage: number;
  year: number;
  optionalEquipment?: string[];
}

interface Adjustment {
  mileage: number;
  equipment: number;
  year: number;
  condition: number;
  total: number;
}

export function calculateAdjustments(
  subject: SubjectVehicle,
  comparable: ComparableVehicle,
  naaaGrade: string,
  equipmentMsrp: number = 0
): Adjustment {
  // Mileage adjustment: $0.12 per mile difference
  const mileageDiff = comparable.mileage - subject.mileage;
  const mileageAdj = mileageDiff * CALCULATION_CONSTANTS.MILEAGE_ADJUSTMENT_PER_MILE;
  
  // Equipment adjustment: 80% of MSRP
  const equipmentAdj = equipmentMsrp * CALCULATION_CONSTANTS.EQUIPMENT_MSRP_MULTIPLIER;
  
  // Year adjustment: 7% per year for vehicles under 5 years old
  const yearDiff = comparable.year - subject.year;
  let yearAdj = 0;
  if (Math.abs(yearDiff) <= CALCULATION_CONSTANTS.DEPRECIATION_MAX_YEARS) {
    yearAdj = comparable.listingPrice * 
      CALCULATION_CONSTANTS.ANNUAL_DEPRECIATION_RATE * 
      yearDiff;
  }
  
  // Condition adjustment based on NAAA grade
  const gradeMultiplier = CALCULATION_CONSTANTS.NAAA_GRADE_MULTIPLIERS[naaaGrade as keyof typeof CALCULATION_CONSTANTS.NAAA_GRADE_MULTIPLIERS] || 1.0;
  const conditionAdj = comparable.listingPrice * (1 - gradeMultiplier);
  
  const total = mileageAdj + equipmentAdj + yearAdj + conditionAdj;
  
  return {
    mileage: mileageAdj,
    equipment: equipmentAdj,
    year: yearAdj,
    condition: conditionAdj,
    total,
  };
}

export function calculateAdjustedValue(
  listingPrice: number,
  adjustments: Adjustment
): number {
  return listingPrice - adjustments.total;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[Math.max(0, index)];
}

export function calculateValuation(
  subjectVehicle: SubjectVehicle,
  comparables: ComparableVehicle[],
  severityAnalysis: { postRepairNaaaGrade: string },
  repairCost: number = 0
) {
  // Separate pre-accident and post-accident comparables
  const preAccidentComps = comparables.filter(c => !c.accidentHistory);
  const postAccidentComps = comparables.filter(c => c.accidentHistory);
  
  // Calculate adjusted values for pre-accident comparables
  const preAccidentValues = preAccidentComps.map(comp => {
    const adjustments = calculateAdjustments(
      subjectVehicle,
      comp,
      '5 - Excellent' // Assume excellent pre-accident condition
    );
    return calculateAdjustedValue(comp.listingPrice, adjustments);
  });
  
  // Calculate adjusted values for post-accident comparables
  const postAccidentValues = postAccidentComps.map(comp => {
    const adjustments = calculateAdjustments(
      subjectVehicle,
      comp,
      severityAnalysis.postRepairNaaaGrade
    );
    return calculateAdjustedValue(comp.listingPrice, adjustments);
  });
  
  // Calculate medians (NOT means)
  const preAccidentFmv = calculateMedian(preAccidentValues);
  const postRepairAcv = calculateMedian(postAccidentValues);
  
  // Calculate diminished value
  const diminishedValue = Math.max(preAccidentFmv - postRepairAcv, 0);
  
  // Calculate confidence ranges (10th and 90th percentiles)
  const confidenceRangeLow = calculatePercentile(postAccidentValues, 10);
  const confidenceRangeHigh = calculatePercentile(postAccidentValues, 90);
  
  return {
    preAccidentFmv,
    postRepairAcv,
    diminishedValue,
    dvPercentOfValue: preAccidentFmv > 0 ? (diminishedValue / preAccidentFmv) * 100 : 0,
    dvPercentOfRepair: repairCost > 0 ? (diminishedValue / repairCost) * 100 : 0,
    confidenceRangeLow,
    confidenceRangeHigh,
    preAccidentCompsCount: preAccidentComps.length,
    postAccidentCompsCount: postAccidentComps.length,
  };
}

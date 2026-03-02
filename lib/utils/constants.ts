export const CALCULATION_CONSTANTS = {
  MILEAGE_ADJUSTMENT_PER_MILE: 0.12,
  EQUIPMENT_MSRP_MULTIPLIER: 0.80,
  ANNUAL_DEPRECIATION_RATE: 0.07,
  DEPRECIATION_MAX_YEARS: 5,
  
  NAAA_GRADE_MULTIPLIERS: {
    '5 - Excellent': 1.00,
    '4 - Good': 0.95,
    '3 - Average': 0.90,
    '2 - Below Average': 0.85,
    '1 - Rough': 0.75,
  } as const,
  
  SEVERITY_LEVELS: {
    1: 'Minor',
    2: 'Moderate',
    3: 'Medium',
    4: 'Major',
    5: 'Severe',
  } as const,
  
  SEVERITY_TO_NAAA: {
    5: '1 - Rough',
    4: '2 - Below Average',
    3: '3 - Average',
    2: '4 - Good',
    1: '4 - Good', // or '3 - Average' depending on pre-accident grade
  } as const,
} as const;

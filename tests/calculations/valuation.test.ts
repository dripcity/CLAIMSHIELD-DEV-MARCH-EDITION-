/**
 * Property-Based Tests: Valuation Calculations
 * Feature: claimshield-dv-platform
 * Property 11: Median-Based Valuation
 * Property 12: Mileage Adjustment Constant
 * Property 13: Equipment Adjustment Constant
 * Property 14: Year Adjustment Constant
 * Validates: Requirements 7.1, 7.4, 7.5, 7.6, 7.10
 * 
 * Test that valuation calculations use exact constants and median (not mean)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateMedian,
  calculateAdjustments,
  calculateAdjustedValue,
  calculateValuation,
} from '@/lib/calculations/valuation';
import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

describe('Property 11: Median-Based Valuation', () => {
  it('should calculate median, not mean, for FMV', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of prices (3-10 comparables)
        fc.array(fc.integer({ min: 10000, max: 50000 }), { minLength: 3, maxLength: 10 }),
        async (prices) => {
          const median = calculateMedian(prices);
          
          // Calculate mean for comparison
          const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          
          // Median should be different from mean (unless all values are the same)
          const allSame = prices.every(p => p === prices[0]);
          if (!allSame && prices.length > 2) {
            // For most random datasets, median != mean
            // We verify median is within the range of values
            const sorted = [...prices].sort((a, b) => a - b);
            expect(median).toBeGreaterThanOrEqual(sorted[0]);
            expect(median).toBeLessThanOrEqual(sorted[sorted.length - 1]);
          }
          
          // Verify median calculation is correct
          const sorted = [...prices].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const expectedMedian = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
          
          expect(median).toBe(expectedMedian);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct median for odd-length arrays', () => {
    expect(calculateMedian([1, 2, 3])).toBe(2);
    expect(calculateMedian([10, 20, 30, 40, 50])).toBe(30);
    expect(calculateMedian([100])).toBe(100);
  });

  it('should return correct median for even-length arrays', () => {
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([100, 200])).toBe(150);
  });

  it('should handle unsorted arrays correctly', () => {
    expect(calculateMedian([3, 1, 2])).toBe(2);
    expect(calculateMedian([40, 10, 30, 20])).toBe(25);
  });
});

describe('Property 12: Mileage Adjustment Constant', () => {
  it('should use exactly $0.12 per mile difference', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10000, max: 150000 }), // Subject mileage
        fc.integer({ min: 10000, max: 150000 }), // Comparable mileage
        async (subjectMileage, comparableMileage) => {
          const subject = {
            mileage: subjectMileage,
            year: 2020,
          };
          
          const comparable = {
            listingPrice: 25000,
            mileage: comparableMileage,
            year: 2020,
            accidentHistory: false,
          };
          
          const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
          
          // Calculate expected mileage adjustment
          const mileageDiff = comparableMileage - subjectMileage;
          const expectedMileageAdj = mileageDiff * 0.12;
          
          // Verify exact constant is used
          expect(adjustments.mileage).toBeCloseTo(expectedMileageAdj, 2);
          expect(CALCULATION_CONSTANTS.MILEAGE_ADJUSTMENT_PER_MILE).toBe(0.12);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply positive adjustment when comparable has higher mileage', () => {
    const subject = { mileage: 30000, year: 2020 };
    const comparable = {
      listingPrice: 25000,
      mileage: 50000, // 20,000 miles more
      year: 2020,
      accidentHistory: false,
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
    
    // 20,000 miles * $0.12 = $2,400
    expect(adjustments.mileage).toBeCloseTo(2400, 2);
  });

  it('should apply negative adjustment when comparable has lower mileage', () => {
    const subject = { mileage: 50000, year: 2020 };
    const comparable = {
      listingPrice: 25000,
      mileage: 30000, // 20,000 miles less
      year: 2020,
      accidentHistory: false,
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
    
    // -20,000 miles * $0.12 = -$2,400
    expect(adjustments.mileage).toBeCloseTo(-2400, 2);
  });
});

describe('Property 13: Equipment Adjustment Constant', () => {
  it('should use exactly 80% of MSRP for equipment', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 500, max: 10000 }), // Equipment MSRP
        async (equipmentMsrp) => {
          const subject = { mileage: 30000, year: 2020 };
          const comparable = {
            listingPrice: 25000,
            mileage: 30000,
            year: 2020,
            accidentHistory: false,
          };
          
          const adjustments = calculateAdjustments(
            subject,
            comparable,
            '5 - Excellent',
            equipmentMsrp
          );
          
          // Calculate expected equipment adjustment
          const expectedEquipmentAdj = equipmentMsrp * 0.80;
          
          // Verify exact constant is used
          expect(adjustments.equipment).toBeCloseTo(expectedEquipmentAdj, 2);
          expect(CALCULATION_CONSTANTS.EQUIPMENT_MSRP_MULTIPLIER).toBe(0.80);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate 80% of equipment MSRP correctly', () => {
    const subject = { mileage: 30000, year: 2020 };
    const comparable = {
      listingPrice: 25000,
      mileage: 30000,
      year: 2020,
      accidentHistory: false,
    };
    
    // $5,000 MSRP equipment
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent', 5000);
    
    // $5,000 * 0.80 = $4,000
    expect(adjustments.equipment).toBeCloseTo(4000, 2);
  });
});

describe('Property 14: Year Adjustment Constant', () => {
  it('should use exactly 7% annual depreciation for vehicles under 5 years old', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2020, max: 2024 }), // Subject year
        fc.integer({ min: -4, max: 4 }), // Year difference
        async (subjectYear, yearDiff) => {
          const comparableYear = subjectYear + yearDiff;
          
          // Only test if within 5 year range
          if (Math.abs(yearDiff) <= 5) {
            const subject = { mileage: 30000, year: subjectYear };
            const comparable = {
              listingPrice: 25000,
              mileage: 30000,
              year: comparableYear,
              accidentHistory: false,
            };
            
            const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
            
            // Calculate expected year adjustment
            const expectedYearAdj = 25000 * 0.07 * yearDiff;
            
            // Verify exact constant is used
            expect(adjustments.year).toBeCloseTo(expectedYearAdj, 2);
            expect(CALCULATION_CONSTANTS.ANNUAL_DEPRECIATION_RATE).toBe(0.07);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply 7% depreciation per year correctly', () => {
    const subject = { mileage: 30000, year: 2020 };
    const comparable = {
      listingPrice: 25000,
      mileage: 30000,
      year: 2022, // 2 years newer
      accidentHistory: false,
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
    
    // $25,000 * 0.07 * 2 = $3,500
    expect(adjustments.year).toBeCloseTo(3500, 2);
  });

  it('should not apply year adjustment for vehicles over 5 years apart', () => {
    const subject = { mileage: 30000, year: 2015 };
    const comparable = {
      listingPrice: 25000,
      mileage: 30000,
      year: 2022, // 7 years newer (over 5 year limit)
      accidentHistory: false,
    };
    
    const adjustments = calculateAdjustments(subject, comparable, '5 - Excellent');
    
    // Should be 0 because year difference exceeds 5 years
    expect(adjustments.year).toBe(0);
  });
});

describe('Valuation Integration Tests', () => {
  it('should calculate diminished value as difference between pre and post accident values', () => {
    const subject = { mileage: 30000, year: 2020 };
    
    const comparables = [
      // Pre-accident comparables
      { listingPrice: 25000, mileage: 30000, year: 2020, accidentHistory: false },
      { listingPrice: 26000, mileage: 28000, year: 2020, accidentHistory: false },
      { listingPrice: 24000, mileage: 32000, year: 2020, accidentHistory: false },
      // Post-accident comparables
      { listingPrice: 20000, mileage: 30000, year: 2020, accidentHistory: true },
      { listingPrice: 21000, mileage: 28000, year: 2020, accidentHistory: true },
      { listingPrice: 19000, mileage: 32000, year: 2020, accidentHistory: true },
    ];
    
    const result = calculateValuation(
      subject,
      comparables,
      { postRepairNaaaGrade: '4 - Good' }
    );
    
    // Verify diminished value is positive
    expect(result.diminishedValue).toBeGreaterThan(0);
    
    // Verify it's the difference between pre and post
    expect(result.diminishedValue).toBeCloseTo(
      result.preAccidentFmv - result.postRepairAcv,
      2
    );
    
    // Verify counts
    expect(result.preAccidentCompsCount).toBe(3);
    expect(result.postAccidentCompsCount).toBe(3);
  });
});

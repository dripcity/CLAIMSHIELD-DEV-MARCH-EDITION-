/**
 * Property-Based Tests: Numeric Validation
 * Feature: claimshield-dv-platform
 * Property 27: Positive Mileage Validation
 * Property 28: Positive Repair Cost Validation
 * Validates: Requirements 21.6, 21.7
 * 
 * Test that mileage and repair cost values <= 0 fail validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { vehicleInfoSchema, accidentDetailsSchema } from '@/lib/validation/schemas';

describe('Property 27: Positive Mileage Validation', () => {
  it('should reject mileage values <= 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate negative integers and zero
        fc.integer({ min: -1000000, max: 0 }),
        async (mileage) => {
          const testData = {
            vin: '1HGBH41JXMN109186',
            year: 2020,
            make: 'Honda',
            model: 'Accord',
            mileage: mileage,
            preAccidentCondition: 'good' as const,
          };

          const result = vehicleInfoSchema.safeParse(testData);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('positive');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept positive mileage values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate positive integers (1 to 500,000 miles)
        fc.integer({ min: 1, max: 500000 }),
        async (mileage) => {
          const testData = {
            vin: '1HGBH41JXMN109186',
            year: 2020,
            make: 'Honda',
            model: 'Accord',
            mileage: mileage,
            preAccidentCondition: 'good' as const,
          };

          const result = vehicleInfoSchema.safeParse(testData);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject specific invalid mileage values', () => {
    const invalidMileages = [-1, -100, -50000, 0];

    invalidMileages.forEach((mileage) => {
      const testData = {
        vin: '1HGBH41JXMN109186',
        year: 2020,
        make: 'Honda',
        model: 'Accord',
        mileage: mileage,
        preAccidentCondition: 'good' as const,
      };

      const result = vehicleInfoSchema.safeParse(testData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Property 28: Positive Repair Cost Validation', () => {
  it('should reject repair cost values <= 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate negative numbers and zero
        fc.integer({ min: -100000, max: 0 }),
        async (repairCost) => {
          const testData = {
            accidentDate: '2024-01-01',
            pointOfImpact: 'Front',
            structuralDamage: false,
            airbagDeployment: false,
            framePulling: false,
            totalRepairCost: repairCost,
            totalLaborHours: 20,
            frameLaborHours: 0,
          };

          const result = accidentDetailsSchema.safeParse(testData);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('positive');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept positive repair cost values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate positive numbers (1 to 100,000)
        fc.integer({ min: 1, max: 100000 }),
        async (repairCost) => {
          const testData = {
            accidentDate: '2024-01-01',
            pointOfImpact: 'Front',
            structuralDamage: false,
            airbagDeployment: false,
            framePulling: false,
            totalRepairCost: repairCost,
            totalLaborHours: 20,
            frameLaborHours: 0,
          };

          const result = accidentDetailsSchema.safeParse(testData);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject specific invalid repair cost values', () => {
    const invalidCosts = [-1, -1000, -50000, 0];

    invalidCosts.forEach((cost) => {
      const testData = {
        accidentDate: '2024-01-01',
        pointOfImpact: 'Front',
        structuralDamage: false,
        airbagDeployment: false,
        framePulling: false,
        totalRepairCost: cost,
        totalLaborHours: 20,
        frameLaborHours: 0,
      };

      const result = accidentDetailsSchema.safeParse(testData);
      expect(result.success).toBe(false);
    });
  });

  it('should accept zero labor hours but not negative', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -100, max: 100 }),
        async (laborHours) => {
          const testData = {
            accidentDate: '2024-01-01',
            pointOfImpact: 'Front',
            structuralDamage: false,
            airbagDeployment: false,
            framePulling: false,
            totalRepairCost: 5000,
            totalLaborHours: laborHours,
            frameLaborHours: 0,
          };

          const result = accidentDetailsSchema.safeParse(testData);
          if (laborHours < 0) {
            expect(result.success).toBe(false);
          } else {
            expect(result.success).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

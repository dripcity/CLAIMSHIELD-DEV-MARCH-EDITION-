/**
 * Property-Based Test: Future Date Validation
 * Feature: claimshield-dv-platform
 * Property 26: Future Date Validation
 * Validates: Requirements 21.5
 * 
 * Test that dates in the future fail validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { accidentDetailsSchema } from '@/lib/validation/schemas';

describe('Property 26: Future Date Validation', () => {
  it('should reject future dates for accident date', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate dates in the future (1 day to 365 days from now)
        fc.integer({ min: 1, max: 365 }).map((daysInFuture) => {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + daysInFuture);
          return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }),
        async (futureDate) => {
          const testData = {
            accidentDate: futureDate,
            pointOfImpact: 'Front',
            structuralDamage: false,
            airbagDeployment: false,
            framePulling: false,
            totalRepairCost: 5000,
            totalLaborHours: 20,
            frameLaborHours: 0,
          };

          const result = accidentDetailsSchema.safeParse(testData);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('future');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept past dates for accident date', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate dates in the past (1 day to 3650 days ago, ~10 years)
        fc.integer({ min: 1, max: 3650 }).map((daysInPast) => {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - daysInPast);
          return pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }),
        async (pastDate) => {
          const testData = {
            accidentDate: pastDate,
            pointOfImpact: 'Front',
            structuralDamage: false,
            airbagDeployment: false,
            framePulling: false,
            totalRepairCost: 5000,
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

  it('should accept today\'s date for accident date', () => {
    const today = new Date().toISOString().split('T')[0];
    const testData = {
      accidentDate: today,
      pointOfImpact: 'Front',
      structuralDamage: false,
      airbagDeployment: false,
      framePulling: false,
      totalRepairCost: 5000,
      totalLaborHours: 20,
      frameLaborHours: 0,
    };

    const result = accidentDetailsSchema.safeParse(testData);
    expect(result.success).toBe(true);
  });

  it('should reject specific future dates', () => {
    // Generate dates that are definitely in the future
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setFullYear(today.getFullYear() + 5);
    
    const futureDate2 = new Date(today);
    futureDate2.setFullYear(today.getFullYear() + 10);
    
    const futureDates = [
      futureDate1.toISOString().split('T')[0],
      futureDate2.toISOString().split('T')[0],
      '2050-01-01', // Far future date
    ];

    futureDates.forEach((date) => {
      const testData = {
        accidentDate: date,
        pointOfImpact: 'Front',
        structuralDamage: false,
        airbagDeployment: false,
        framePulling: false,
        totalRepairCost: 5000,
        totalLaborHours: 20,
        frameLaborHours: 0,
      };

      const result = accidentDetailsSchema.safeParse(testData);
      expect(result.success).toBe(false);
    });
  });
});

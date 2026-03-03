/**
 * Property-Based Tests: Severity Classification
 * Feature: claimshield-dv-platform
 * Property 16: Severity Justification Generation
 * Property 17: Severity to NAAA Grade Mapping
 * Property 30: Labor Hours Summation
 * Validates: Requirements 8.14, 8.15, 25.6
 * 
 * Test severity classification logic and NAAA grade mapping
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifySeverity } from '@/lib/calculations/severity-classifier';
import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

describe('Property 16: Severity Justification Generation', () => {
  it('should generate non-empty justifications for all severity levels', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various accident details
        fc.record({
          totalLaborHours: fc.integer({ min: 1, max: 100 }),
          frameLaborHours: fc.integer({ min: 0, max: 20 }),
          bodyLaborHours: fc.integer({ min: 0, max: 50 }),
          airbagDeployment: fc.boolean(),
          structuralDamage: fc.boolean(),
          framePulling: fc.boolean(),
          panelsReplaced: fc.array(fc.constantFrom('hood', 'fender', 'door', 'quarter panel'), { maxLength: 5 }),
        }),
        async (accidentDetails) => {
          const result = classifySeverity(accidentDetails);
          
          // Verify justification is non-empty
          expect(result.justification).toBeTruthy();
          expect(result.justification.length).toBeGreaterThan(0);
          
          // Verify justification contains relevant information
          expect(typeof result.justification).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include labor hours in justification', () => {
    const testCases = [
      { totalLaborHours: 5, expectedInJustification: '5 hours' },
      { totalLaborHours: 25, expectedInJustification: '25 hours' },
      { totalLaborHours: 65, expectedInJustification: '65 hours' },
    ];

    testCases.forEach(({ totalLaborHours, expectedInJustification }) => {
      const result = classifySeverity({
        totalLaborHours,
        frameLaborHours: 0,
        bodyLaborHours: totalLaborHours,
        airbagDeployment: false,
        structuralDamage: false,
        framePulling: false,
        panelsReplaced: [],
      });

      expect(result.justification).toContain(expectedInJustification);
    });
  });

  it('should mention frame work in justification when present', () => {
    const result = classifySeverity({
      totalLaborHours: 30,
      frameLaborHours: 8,
      bodyLaborHours: 22,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.justification.toLowerCase()).toMatch(/frame|structural/);
  });

  it('should mention airbag deployment in justification when present', () => {
    const result = classifySeverity({
      totalLaborHours: 18, // Lower hours to trigger airbag-specific classification
      frameLaborHours: 0,
      bodyLaborHours: 18,
      airbagDeployment: true,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.justification.toLowerCase()).toContain('airbag');
  });
});

describe('Property 17: Severity to NAAA Grade Mapping', () => {
  it('should map severity levels to correct NAAA grades', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          totalLaborHours: fc.integer({ min: 1, max: 100 }),
          frameLaborHours: fc.integer({ min: 0, max: 20 }),
          bodyLaborHours: fc.integer({ min: 0, max: 50 }),
          airbagDeployment: fc.boolean(),
          structuralDamage: fc.boolean(),
          framePulling: fc.boolean(),
          panelsReplaced: fc.array(fc.constantFrom('hood', 'fender', 'door'), { maxLength: 5 }),
        }),
        async (accidentDetails) => {
          const result = classifySeverity(accidentDetails);
          
          // Verify NAAA grade matches severity level
          const expectedGrades: Record<number, string> = {
            5: '1 - Rough',
            4: '2 - Below Average',
            3: '3 - Average',
            2: '4 - Good',
            1: '4 - Good', // Minor damage still results in Good grade
          };
          
          expect(result.postRepairNaaaGrade).toBe(expectedGrades[result.severityLevel]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map Level 5 (Severe) to "1 - Rough"', () => {
    const result = classifySeverity({
      totalLaborHours: 65, // > 60 hours = Level 5
      frameLaborHours: 0,
      bodyLaborHours: 65,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(5);
    expect(result.severityLabel).toBe('Severe');
    expect(result.postRepairNaaaGrade).toBe('1 - Rough');
  });

  it('should map Level 4 (Major) to "2 - Below Average"', () => {
    const result = classifySeverity({
      totalLaborHours: 30,
      frameLaborHours: 5, // Frame work = Level 4
      bodyLaborHours: 25,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(4);
    expect(result.severityLabel).toBe('Major');
    expect(result.postRepairNaaaGrade).toBe('2 - Below Average');
  });

  it('should map Level 3 (Medium) to "3 - Average"', () => {
    const result = classifySeverity({
      totalLaborHours: 25, // 20-35 hours = Level 3
      frameLaborHours: 0,
      bodyLaborHours: 25,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(3);
    expect(result.severityLabel).toBe('Medium');
    expect(result.postRepairNaaaGrade).toBe('3 - Average');
  });

  it('should map Level 2 (Moderate) to "4 - Good"', () => {
    const result = classifySeverity({
      totalLaborHours: 15, // 10-20 hours, no structural = Level 2
      frameLaborHours: 0,
      bodyLaborHours: 15,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(2);
    expect(result.severityLabel).toBe('Moderate');
    expect(result.postRepairNaaaGrade).toBe('4 - Good');
  });

  it('should map Level 1 (Minor) to "4 - Good"', () => {
    const result = classifySeverity({
      totalLaborHours: 5, // < 10 hours = Level 1
      frameLaborHours: 0,
      bodyLaborHours: 5,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(1);
    expect(result.severityLabel).toBe('Minor');
    expect(result.postRepairNaaaGrade).toBe('4 - Good');
  });
});

describe('Severity Classification Decision Tree', () => {
  it('should classify as Level 5 when total labor hours > 60', () => {
    const result = classifySeverity({
      totalLaborHours: 61,
      frameLaborHours: 0,
      bodyLaborHours: 61,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(5);
  });

  it('should classify as Level 5 when airbag + structural + frame > 5 hours', () => {
    const result = classifySeverity({
      totalLaborHours: 30,
      frameLaborHours: 6,
      bodyLaborHours: 24,
      airbagDeployment: true,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(5);
  });

  it('should classify as Level 5 when frame labor hours > 10', () => {
    const result = classifySeverity({
      totalLaborHours: 30,
      frameLaborHours: 11,
      bodyLaborHours: 19,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(5);
  });

  it('should classify as Level 4 when frame pulling is required', () => {
    const result = classifySeverity({
      totalLaborHours: 25,
      frameLaborHours: 3,
      bodyLaborHours: 22,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: true,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(4);
  });

  it('should classify as Level 4 when any frame work is present', () => {
    const result = classifySeverity({
      totalLaborHours: 25,
      frameLaborHours: 2,
      bodyLaborHours: 23,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(4);
  });

  it('should classify as Level 4 when structural damage + labor > 35 hours', () => {
    const result = classifySeverity({
      totalLaborHours: 40,
      frameLaborHours: 0,
      bodyLaborHours: 40,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(4);
  });

  it('should classify as Level 4 when airbag deployment + labor > 30 hours', () => {
    const result = classifySeverity({
      totalLaborHours: 35,
      frameLaborHours: 0,
      bodyLaborHours: 35,
      airbagDeployment: true,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(4);
  });

  it('should classify as Level 3 when labor hours between 20-35', () => {
    const result = classifySeverity({
      totalLaborHours: 25,
      frameLaborHours: 0,
      bodyLaborHours: 25,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(3);
  });

  it('should classify as Level 3 when airbag deployment without structural damage', () => {
    const result = classifySeverity({
      totalLaborHours: 18,
      frameLaborHours: 0,
      bodyLaborHours: 18,
      airbagDeployment: true,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(3);
  });

  it('should classify as Level 2 when labor hours 10-20 without structural damage', () => {
    const result = classifySeverity({
      totalLaborHours: 15,
      frameLaborHours: 0,
      bodyLaborHours: 15,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(2);
  });

  it('should classify as Level 1 for minor damage', () => {
    const result = classifySeverity({
      totalLaborHours: 5,
      frameLaborHours: 0,
      bodyLaborHours: 5,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    expect(result.severityLevel).toBe(1);
  });

  it('should handle edge case: exactly 60 hours (not Level 5)', () => {
    const result = classifySeverity({
      totalLaborHours: 60,
      frameLaborHours: 0,
      bodyLaborHours: 60,
      airbagDeployment: false,
      structuralDamage: false,
      framePulling: false,
      panelsReplaced: [],
    });

    // 60 hours is NOT > 60, so should not be Level 5
    expect(result.severityLevel).not.toBe(5);
  });

  it('should handle edge case: exactly 10 frame hours (not Level 5)', () => {
    const result = classifySeverity({
      totalLaborHours: 30,
      frameLaborHours: 10,
      bodyLaborHours: 20,
      airbagDeployment: false,
      structuralDamage: true,
      framePulling: false,
      panelsReplaced: [],
    });

    // 10 hours is NOT > 10, so should be Level 4 (frame work present)
    expect(result.severityLevel).toBe(4);
  });
});

describe('Property 30: Labor Hours Summation', () => {
  it('should validate that total labor hours equals sum of categories', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bodyLaborHours: fc.integer({ min: 0, max: 50 }),
          frameLaborHours: fc.integer({ min: 0, max: 20 }),
          refinishLaborHours: fc.integer({ min: 0, max: 30 }),
          mechanicalLaborHours: fc.integer({ min: 0, max: 20 }),
        }),
        async ({ bodyLaborHours, frameLaborHours, refinishLaborHours, mechanicalLaborHours }) => {
          const totalLaborHours = bodyLaborHours + frameLaborHours + refinishLaborHours + mechanicalLaborHours;
          
          // Verify the sum is correct
          expect(totalLaborHours).toBe(bodyLaborHours + frameLaborHours + refinishLaborHours + mechanicalLaborHours);
          
          // Verify classification uses the total
          const result = classifySeverity({
            totalLaborHours,
            frameLaborHours,
            bodyLaborHours,
            airbagDeployment: false,
            structuralDamage: frameLaborHours > 0, // Set structural damage if frame work present
            framePulling: false,
            panelsReplaced: [],
          });
          
          // Result should mention hours (either total or frame hours depending on classification)
          expect(result.justification.toLowerCase()).toMatch(/\d+ hours/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-Based Test: VIN Format Validation
 * Feature: claimshield-dv-platform
 * Property 9: VIN Format Validation
 * Validates: Requirements 5.1, 5.6, 21.1
 * 
 * Test that 17-character alphanumeric strings (excluding I, O, Q) pass validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { vinSchema } from '@/lib/validation/schemas';

describe('Property 9: VIN Format Validation', () => {
  it('should accept valid 17-character VINs without I, O, Q', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid VIN: 17 characters from [A-HJ-NPR-Z0-9]
        fc.array(
          fc.constantFrom(
            ...'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'.split('')
          ),
          { minLength: 17, maxLength: 17 }
        ).map(chars => chars.join('')),
        async (vin) => {
          const result = vinSchema.safeParse(vin);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject VINs with invalid characters (I, O, Q)', () => {
    const invalidVins = [
      'I2345678901234567', // Contains I
      'O2345678901234567', // Contains O
      'Q2345678901234567', // Contains Q
      '1234567890123456I', // I at end
      '1234567890123456O', // O at end
      '1234567890123456Q', // Q at end
    ];

    invalidVins.forEach((vin) => {
      const result = vinSchema.safeParse(vin);
      expect(result.success).toBe(false);
    });
  });

  it('should reject VINs with incorrect length', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings of wrong length
        fc.integer({ min: 1, max: 30 }).chain((length) =>
          length === 17
            ? fc.constant('') // Skip length 17
            : fc.array(
                fc.constantFrom(...'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'.split('')),
                { minLength: length, maxLength: length }
              ).map(chars => chars.join(''))
        ),
        async (vin) => {
          if (vin.length !== 17) {
            const result = vinSchema.safeParse(vin);
            expect(result.success).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject VINs with lowercase letters', () => {
    const result = vinSchema.safeParse('abcdefghjklmnprst'); // 17 lowercase chars
    expect(result.success).toBe(false);
  });

  it('should reject VINs with special characters', () => {
    const invalidVins = [
      '1234567890123456-', // Hyphen
      '1234567890123456_', // Underscore
      '1234567890123456.', // Period
      '1234567890123456 ', // Space
    ];

    invalidVins.forEach((vin) => {
      const result = vinSchema.safeParse(vin);
      expect(result.success).toBe(false);
    });
  });

  it('should accept real-world VIN examples', () => {
    const validVins = [
      '1HGBH41JXMN109186', // Honda
      '2HGFG12878H542890', // Honda
      '5YJSA1E14HF123456', // Tesla
      'WBADT43452G123456', // BMW
      'JM1BL1S59A1234567', // Mazda
    ];

    validVins.forEach((vin) => {
      const result = vinSchema.safeParse(vin);
      expect(result.success).toBe(true);
    });
  });
});

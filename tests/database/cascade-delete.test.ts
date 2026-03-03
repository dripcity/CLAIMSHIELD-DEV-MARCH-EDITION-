/**
 * Property-Based Test: Cascade Delete Comparables
 * Feature: claimshield-dv-platform
 * Property 29: Cascade Delete Comparables
 * Validates: Requirements 24.8
 * 
 * Test that deleting an appraisal also deletes all associated comparable vehicles
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { db } from '@/lib/db';
import { appraisals, comparableVehicles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Property 29: Cascade Delete Comparables', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const [user] = await db
      .insert(users)
      .values({
        clerkId: `test-clerk-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        role: 'individual',
      })
      .returning();
    testUserId = user.id;
  });

  afterEach(async () => {
    // Cleanup: delete test user (cascades to appraisals and comparables)
    await db.delete(users).where(eq(users.clerkId, `test-clerk-${Date.now()}`));
  });

  it('should delete all associated comparable vehicles when an appraisal is deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of comparables (1-10)
        fc.integer({ min: 1, max: 10 }),
        async (numComparables) => {
          // Create an appraisal
          const [appraisal] = await db
            .insert(appraisals)
            .values({
              userId: testUserId,
              status: 'draft',
            })
            .returning();

          // Create comparable vehicles
          const comparableData = Array.from({ length: numComparables }, (_, i) => ({
            appraisalId: appraisal.id,
            compType: i % 2 === 0 ? ('pre_accident' as const) : ('post_accident' as const),
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            mileage: 50000,
            listingPrice: '25000',
            accidentHistory: false,
          }));

          await db.insert(comparableVehicles).values(comparableData);

          // Verify comparables were created
          const createdComparables = await db
            .select()
            .from(comparableVehicles)
            .where(eq(comparableVehicles.appraisalId, appraisal.id));

          expect(createdComparables).toHaveLength(numComparables);

          // Delete the appraisal
          await db.delete(appraisals).where(eq(appraisals.id, appraisal.id));

          // Verify all comparables were deleted (cascade)
          const remainingComparables = await db
            .select()
            .from(comparableVehicles)
            .where(eq(comparableVehicles.appraisalId, appraisal.id));

          expect(remainingComparables).toHaveLength(0);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in requirements
    );
  });

  it('should not affect comparables of other appraisals when deleting one appraisal', async () => {
    // Create two appraisals
    const [appraisal1] = await db
      .insert(appraisals)
      .values({
        userId: testUserId,
        status: 'draft',
      })
      .returning();

    const [appraisal2] = await db
      .insert(appraisals)
      .values({
        userId: testUserId,
        status: 'draft',
      })
      .returning();

    // Create comparables for both appraisals
    await db.insert(comparableVehicles).values([
      {
        appraisalId: appraisal1.id,
        compType: 'pre_accident',
        year: 2020,
        make: 'Toyota',
        model: 'Camry',
        mileage: 50000,
        listingPrice: '25000',
        accidentHistory: false,
      },
      {
        appraisalId: appraisal2.id,
        compType: 'pre_accident',
        year: 2020,
        make: 'Honda',
        model: 'Accord',
        mileage: 45000,
        listingPrice: '26000',
        accidentHistory: false,
      },
    ]);

    // Delete appraisal1
    await db.delete(appraisals).where(eq(appraisals.id, appraisal1.id));

    // Verify appraisal1's comparables are deleted
    const appraisal1Comparables = await db
      .select()
      .from(comparableVehicles)
      .where(eq(comparableVehicles.appraisalId, appraisal1.id));

    expect(appraisal1Comparables).toHaveLength(0);

    // Verify appraisal2's comparables still exist
    const appraisal2Comparables = await db
      .select()
      .from(comparableVehicles)
      .where(eq(comparableVehicles.appraisalId, appraisal2.id));

    expect(appraisal2Comparables).toHaveLength(1);

    // Cleanup
    await db.delete(appraisals).where(eq(appraisals.id, appraisal2.id));
  });
});

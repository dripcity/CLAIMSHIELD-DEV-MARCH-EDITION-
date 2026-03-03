/**
 * Property-Based Test: Appraisal Ownership Validation
 * Feature: claimshield-dv-platform
 * Property 3: Appraisal Ownership Validation
 * Validates: Requirements 1.9, 1.10, 23.2
 * 
 * Test that users cannot access appraisals they don't own
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAppraisalOwnership } from '@/lib/utils/auth';

describe('Property 3: Appraisal Ownership Validation', () => {
  const testClerkIds: string[] = [];
  const testAppraisalIds: string[] = [];

  afterEach(async () => {
    // Clean up test appraisals
    for (const appraisalId of testAppraisalIds) {
      await db.delete(appraisals).where(eq(appraisals.id, appraisalId));
    }
    testAppraisalIds.length = 0;

    // Clean up test users
    for (const clerkId of testClerkIds) {
      await db.delete(users).where(eq(users.clerkId, clerkId));
    }
    testClerkIds.length = 0;
  });

  it('should allow owner to access their own appraisals', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user data
        fc.uuid().map(uuid => `clerk_test_owner_${uuid}`),
        fc.integer({ min: 1, max: 5 }), // Number of appraisals
        async (clerkId, appraisalCount) => {
          testClerkIds.push(clerkId);

          // Create user
          const [user] = await db.insert(users).values({
            clerkId,
            email: `${clerkId}@test.com`,
            role: 'individual',
          }).returning();

          // Create multiple appraisals for this user
          for (let i = 0; i < appraisalCount; i++) {
            const [appraisal] = await db.insert(appraisals).values({
              userId: user.id,
              status: 'draft',
            }).returning();

            testAppraisalIds.push(appraisal.id);

            // Owner should be able to access their appraisal
            const result = await requireAppraisalOwnership(appraisal.id, user.id);
            expect(result.id).toBe(appraisal.id);
            expect(result.userId).toBe(user.id);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should reject non-owner access to appraisals', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different users
        fc.uuid().map(uuid => `clerk_test_owner_${uuid}`),
        fc.uuid().map(uuid => `clerk_test_other_${uuid}`),
        async (ownerClerkId, otherClerkId) => {
          // Ensure different clerk IDs
          fc.pre(ownerClerkId !== otherClerkId);

          testClerkIds.push(ownerClerkId, otherClerkId);

          // Create owner user
          const [owner] = await db.insert(users).values({
            clerkId: ownerClerkId,
            email: `${ownerClerkId}@test.com`,
            role: 'individual',
          }).returning();

          // Create other user
          const [otherUser] = await db.insert(users).values({
            clerkId: otherClerkId,
            email: `${otherClerkId}@test.com`,
            role: 'individual',
          }).returning();

          // Create appraisal owned by owner
          const [appraisal] = await db.insert(appraisals).values({
            userId: owner.id,
            status: 'draft',
          }).returning();

          testAppraisalIds.push(appraisal.id);

          // Other user should NOT be able to access owner's appraisal
          try {
            await requireAppraisalOwnership(appraisal.id, otherUser.id);
            expect.fail('Expected requireAppraisalOwnership to throw error');
          } catch (error: any) {
            expect(error.message).toContain('Forbidden');
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should reject access to non-existent appraisals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Random appraisal ID
        fc.uuid(), // Random user ID
        async (appraisalId, userId) => {
          // Attempt to access non-existent appraisal
          try {
            await requireAppraisalOwnership(appraisalId, userId);
            expect.fail('Expected requireAppraisalOwnership to throw error');
          } catch (error: any) {
            expect(error.message).toContain('not found');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should enforce ownership across multiple users and appraisals', async () => {
    // Create 3 users
    const userIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const clerkId = `clerk_test_multi_${Date.now()}_${i}`;
      testClerkIds.push(clerkId);

      const [user] = await db.insert(users).values({
        clerkId,
        email: `multi_${i}@test.com`,
        role: 'individual',
      }).returning();

      userIds.push(user.id);
    }

    // Create 2 appraisals for each user
    const appraisalsByUser: Record<string, string[]> = {};
    for (const userId of userIds) {
      appraisalsByUser[userId] = [];
      
      for (let i = 0; i < 2; i++) {
        const [appraisal] = await db.insert(appraisals).values({
          userId,
          status: 'draft',
        }).returning();

        testAppraisalIds.push(appraisal.id);
        appraisalsByUser[userId].push(appraisal.id);
      }
    }

    // Verify each user can only access their own appraisals
    for (const userId of userIds) {
      const ownAppraisals = appraisalsByUser[userId];
      
      // Should access own appraisals
      for (const appraisalId of ownAppraisals) {
        const result = await requireAppraisalOwnership(appraisalId, userId);
        expect(result.userId).toBe(userId);
      }

      // Should NOT access other users' appraisals
      for (const otherUserId of userIds) {
        if (otherUserId !== userId) {
          const otherAppraisals = appraisalsByUser[otherUserId];
          
          for (const appraisalId of otherAppraisals) {
            try {
              await requireAppraisalOwnership(appraisalId, userId);
              expect.fail('Expected requireAppraisalOwnership to throw error');
            } catch (error: any) {
              expect(error.message).toContain('Forbidden');
            }
          }
        }
      }
    }
  });

  it('should validate ownership with empty or invalid user IDs', async () => {
    const clerkId = `clerk_test_invalid_${Date.now()}`;
    testClerkIds.push(clerkId);

    // Create user and appraisal
    const [user] = await db.insert(users).values({
      clerkId,
      email: `${clerkId}@test.com`,
      role: 'individual',
    }).returning();

    const [appraisal] = await db.insert(appraisals).values({
      userId: user.id,
      status: 'draft',
    }).returning();

    testAppraisalIds.push(appraisal.id);

    // Test with empty string
    try {
      await requireAppraisalOwnership(appraisal.id, '');
      expect.fail('Expected requireAppraisalOwnership to throw error');
    } catch (error: any) {
      expect(error.message).toContain('Forbidden');
    }

    // Test with random UUID
    try {
      await requireAppraisalOwnership(appraisal.id, '00000000-0000-0000-0000-000000000000');
      expect.fail('Expected requireAppraisalOwnership to throw error');
    } catch (error: any) {
      expect(error.message).toContain('Forbidden');
    }
  });
});

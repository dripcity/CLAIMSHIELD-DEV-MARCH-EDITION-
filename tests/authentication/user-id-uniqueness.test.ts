/**
 * Property-Based Test: User ID Uniqueness
 * Feature: claimshield-dv-platform
 * Property 1: User ID Uniqueness
 * Validates: Requirements 1.2
 * 
 * Test that each new user receives a unique identifier
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Property 1: User ID Uniqueness', () => {
  // Clean up test users after each test
  const testClerkIds: string[] = [];

  afterEach(async () => {
    // Clean up all test users
    for (const clerkId of testClerkIds) {
      await db.delete(users).where(eq(users.clerkId, clerkId));
    }
    testClerkIds.length = 0;
  });

  it('should assign unique IDs to each new user', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of unique clerk IDs (3-10 users)
        fc.array(
          fc.uuid().map(uuid => `clerk_test_${uuid}`),
          { minLength: 3, maxLength: 10 }
        ).map(ids => [...new Set(ids)]), // Ensure unique clerk IDs
        async (clerkIds) => {
          const createdUserIds: string[] = [];

          // Create multiple users
          for (const clerkId of clerkIds) {
            testClerkIds.push(clerkId);
            
            const [user] = await db.insert(users).values({
              clerkId,
              email: `${clerkId}@test.com`,
              role: 'individual',
            }).returning();

            createdUserIds.push(user.id);
          }

          // Verify all user IDs are unique
          const uniqueIds = new Set(createdUserIds);
          expect(uniqueIds.size).toBe(createdUserIds.length);

          // Verify each ID is a valid UUID
          createdUserIds.forEach(id => {
            expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
          });
        }
      ),
      { numRuns: 10 } // Reduced runs due to database operations
    );
  });

  it('should generate different IDs for users created sequentially', async () => {
    const userIds: string[] = [];

    // Create 5 users sequentially
    for (let i = 0; i < 5; i++) {
      const clerkId = `clerk_test_sequential_${Date.now()}_${i}`;
      testClerkIds.push(clerkId);

      const [user] = await db.insert(users).values({
        clerkId,
        email: `sequential_${i}@test.com`,
        role: 'individual',
      }).returning();

      userIds.push(user.id);
    }

    // Verify all IDs are unique
    const uniqueIds = new Set(userIds);
    expect(uniqueIds.size).toBe(5);
  });

  it('should generate different IDs for users with same email domain', async () => {
    const userIds: string[] = [];

    // Create users with same email domain
    for (let i = 0; i < 3; i++) {
      const clerkId = `clerk_test_same_domain_${Date.now()}_${i}`;
      testClerkIds.push(clerkId);

      const [user] = await db.insert(users).values({
        clerkId,
        email: `user${i}@example.com`, // Same domain
        role: 'individual',
      }).returning();

      userIds.push(user.id);
    }

    // Verify all IDs are unique despite same email domain
    const uniqueIds = new Set(userIds);
    expect(uniqueIds.size).toBe(3);
  });

  it('should enforce clerk ID uniqueness constraint', async () => {
    const clerkId = `clerk_test_duplicate_${Date.now()}`;
    testClerkIds.push(clerkId);

    // Create first user
    await db.insert(users).values({
      clerkId,
      email: 'first@test.com',
      role: 'individual',
    });

    // Attempt to create second user with same clerk ID
    await expect(
      db.insert(users).values({
        clerkId, // Same clerk ID
        email: 'second@test.com',
        role: 'individual',
      })
    ).rejects.toThrow();
  });
});

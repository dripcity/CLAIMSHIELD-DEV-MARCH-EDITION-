/**
 * Property-Based Test: Protected Route Authentication
 * Feature: claimshield-dv-platform
 * Property 2: Protected Route Authentication
 * Validates: Requirements 1.3
 * 
 * Test that requests without valid auth are rejected with 401
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { requireAuth } from '@/lib/utils/auth';

// Mock Clerk's auth function
const mockAuth = (userId: string | null) => {
  return () => Promise.resolve({ userId });
};

describe('Property 2: Protected Route Authentication', () => {
  it('should reject requests without authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various invalid auth states
        fc.constantFrom(null, undefined, '', ' '),
        async (invalidUserId) => {
          // Mock auth to return invalid user ID
          const auth = mockAuth(invalidUserId as string | null);

          // Attempt to require auth
          try {
            await requireAuth(auth);
            // Should not reach here
            expect.fail('Expected requireAuth to throw error');
          } catch (error: any) {
            // Verify error is 401 Unauthorized
            expect(error.message).toContain('Unauthorized');
            expect(error.status || error.statusCode).toBe(401);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept requests with valid authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid user IDs
        fc.uuid().map(uuid => `user_${uuid}`),
        async (validUserId) => {
          // Mock auth to return valid user ID
          const auth = mockAuth(validUserId);

          // Require auth should succeed
          const result = await requireAuth(auth);
          expect(result.userId).toBe(validUserId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty string user IDs', async () => {
    const auth = mockAuth('');

    try {
      await requireAuth(auth);
      expect.fail('Expected requireAuth to throw error');
    } catch (error: any) {
      expect(error.message).toContain('Unauthorized');
    }
  });

  it('should reject whitespace-only user IDs', async () => {
    const auth = mockAuth('   ');

    try {
      await requireAuth(auth);
      expect.fail('Expected requireAuth to throw error');
    } catch (error: any) {
      expect(error.message).toContain('Unauthorized');
    }
  });

  it('should accept valid Clerk user IDs', async () => {
    const validClerkIds = [
      'user_2abc123def456',
      'user_1xyz789ghi012',
      'user_3mno345pqr678',
    ];

    for (const clerkId of validClerkIds) {
      const auth = mockAuth(clerkId);
      const result = await requireAuth(auth);
      expect(result.userId).toBe(clerkId);
    }
  });
});

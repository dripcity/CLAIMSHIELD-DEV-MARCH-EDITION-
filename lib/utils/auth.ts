import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hasPermission, type UserRole } from './rbac';
import type { RolePermissions } from './rbac';

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function requireAppraisalOwnership(appraisalId: string, userId: string) {
  const [appraisal] = await db
    .select()
    .from(appraisals)
    .where(eq(appraisals.id, appraisalId));
  
  if (!appraisal) {
    throw new Error('Appraisal not found');
  }
  
  if (appraisal.userId !== userId) {
    throw new Error('Forbidden');
  }
  
  return appraisal;
}

export async function checkEntitlement(user: typeof users.$inferSelect) {
  // Check if user has active subscription or reports remaining
  if (user.subscriptionStatus === 'active') {
    return true;
  }
  
  if (user.reportsRemaining && user.reportsRemaining > 0) {
    return true;
  }
  
  return false;
}

/**
 * Require a specific role permission
 * Throws an error if the user doesn't have the required permission
 */
export async function requireRolePermission(
  permission: keyof RolePermissions,
  errorMessage?: string
) {
  const user = await requireAuth();
  const userRole = (user.role || 'individual') as UserRole;
  
  if (!hasPermission(userRole, permission)) {
    throw new Error(errorMessage || 'Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Check if the current user has a specific permission
 */
export async function checkRolePermission(
  permission: keyof RolePermissions
): Promise<boolean> {
  try {
    const user = await requireAuth();
    const userRole = (user.role || 'individual') as UserRole;
    return hasPermission(userRole, permission);
  } catch {
    return false;
  }
}

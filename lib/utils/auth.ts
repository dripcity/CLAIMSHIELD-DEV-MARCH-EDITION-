import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const createAppraisalSchema = z.object({
  claimNumber: z.string().optional(),
  purpose: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    
    const userAppraisals = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.userId, user.id))
      .orderBy(desc(appraisals.updatedAt));
    
    return NextResponse.json(userAppraisals);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = createAppraisalSchema.parse(body);
    
    const [newAppraisal] = await db
      .insert(appraisals)
      .values({
        userId: user.id,
        status: 'draft',
        ...validated,
      })
      .returning();
    
    return NextResponse.json(newAppraisal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

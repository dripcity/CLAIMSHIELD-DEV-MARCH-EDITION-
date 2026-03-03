import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await requireAppraisalOwnership(id, user.id);

    // Update status to archived
    const [updated] = await db
      .update(appraisals)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, id))
      .returning()
      .execute();

    if (!updated) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error archiving appraisal:', error);
    return NextResponse.json(
      { error: 'Failed to archive appraisal' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireComparableOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { comparableVehicles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    await requireComparableOwnership(params.id, user.id);

    const [updated] = await db
      .update(comparableVehicles)
      .set(body)
      .where(eq(comparableVehicles.id, params.id))
      .returning();
    
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (error.message === 'Comparable not found') {
        return NextResponse.json({ error: 'Comparable not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await requireAuth();

    await requireComparableOwnership(params.id, user.id);

    await db
      .delete(comparableVehicles)
      .where(eq(comparableVehicles.id, params.id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (error.message === 'Comparable not found') {
        return NextResponse.json({ error: 'Comparable not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

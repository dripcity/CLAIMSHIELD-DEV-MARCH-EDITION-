import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['individual', 'appraiser', 'attorney', 'body_shop']),
});

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const { role } = roleSchema.parse(await req.json());

    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid role payload', issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

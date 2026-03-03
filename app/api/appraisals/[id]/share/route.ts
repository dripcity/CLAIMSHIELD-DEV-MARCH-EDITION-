import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { expiresInHours = 24 } = body;

    await requireAppraisalOwnership(id, user.id);

    // Fetch the appraisal
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, id))
      .execute();

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }

    if (!appraisal.reportPdfUrl) {
      return NextResponse.json(
        { error: 'No PDF report available to share' },
        { status: 400 }
      );
    }

    // Generate expiring share URL
    // In production, this would create a signed URL with expiration
    // For now, we'll create a simple token-based URL
    const shareToken = Buffer.from(
      JSON.stringify({
        appraisalId: id,
        expiresAt: Date.now() + expiresInHours * 60 * 60 * 1000,
      })
    ).toString('base64url');

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareToken}`;

    return NextResponse.json({
      shareUrl,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

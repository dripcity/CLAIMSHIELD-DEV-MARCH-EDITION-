import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership, checkEntitlement } from '@/lib/utils/auth';
import { generatePDF } from '@/lib/pdf/generator';
import { uploadFile } from '@/lib/storage/blob';
import { db } from '@/lib/db';
import { appraisals, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await requireAuth();
    await requireAppraisalOwnership(params.id, user.id);
    
    // Check entitlement
    const hasEntitlement = await checkEntitlement(user);
    if (!hasEntitlement) {
      return NextResponse.json(
        { error: 'No active subscription or reports remaining' },
        { status: 403 }
      );
    }
    
    // Get appraisal with all data
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, params.id));
    
    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
    }
    
    // Generate PDF
    const pdfBuffer = await generatePDF(appraisal);
    
    // Upload to Blob
    const url = await uploadFile(pdfBuffer, {
      appraisalId: params.id,
      fileType: 'report',
      fileName: `appraisal-${Date.now()}.pdf`,
    });
    
    // Update appraisal
    await db
      .update(appraisals)
      .set({
        reportPdfUrl: url,
        status: 'complete',
        updatedAt: new Date(),
      })
      .where(eq(appraisals.id, params.id));
    
    // Decrement reports remaining if not subscription
    if (user.subscriptionStatus !== 'active' && user.reportsRemaining && user.reportsRemaining > 0) {
      await db
        .update(users)
        .set({
          reportsRemaining: user.reportsRemaining - 1,
        })
        .where(eq(users.id, user.id));
    }
    
    return NextResponse.json({ pdfUrl: url });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { sendEmail, generateReportEmailHtml } from '@/lib/email/sendgrid';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId, email } = await req.json();
    
    await requireAppraisalOwnership(appraisalId, user.id);
    
    // Get appraisal data
    const { db } = await import('@/lib/db');
    const { appraisals } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId));
    
    if (!appraisal || !appraisal.reportPdfUrl) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    // Generate email content
    const ownerName = `${appraisal.ownerInfo?.firstName} ${appraisal.ownerInfo?.lastName}`;
    const vehicleInfo = `${appraisal.subjectVehicle?.year} ${appraisal.subjectVehicle?.make} ${appraisal.subjectVehicle?.model}`;
    const dvAmount = `$${appraisal.valuationResults?.diminishedValue.toLocaleString()}`;
    
    const html = generateReportEmailHtml({
      ownerName,
      vehicleInfo,
      dvAmount,
      reportUrl: appraisal.reportPdfUrl,
    });
    
    // Send email
    const result = await sendEmail({
      to: email,
      from: 'reports@claimshield-dv.com',
      subject: 'Your ClaimShield DV Report is Ready',
      html,
    });
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { deleteFile } from '@/lib/storage/blob';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await context.params;
    const user = await requireAuth();
    const { url, appraisalId } = await req.json();

    if (!appraisalId) {
      return NextResponse.json({ error: 'Missing appraisalId' }, { status: 400 });
    }

    await requireAppraisalOwnership(appraisalId, user.id);
    
    // Delete from Blob storage
    await deleteFile(url);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (error.message === 'Appraisal not found') {
        return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

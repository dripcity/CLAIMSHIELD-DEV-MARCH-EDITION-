import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { uploadFile } from '@/lib/storage/blob';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const appraisalId = formData.get('appraisalId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!appraisalId) {
      return NextResponse.json({ error: 'Missing appraisalId' }, { status: 400 });
    }

    await requireAppraisalOwnership(appraisalId, user.id);

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const url = await uploadFile(file, {
      appraisalId,
      fileType: fileType as any,
      fileName: file.name,
    });

    return NextResponse.json({ url });
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

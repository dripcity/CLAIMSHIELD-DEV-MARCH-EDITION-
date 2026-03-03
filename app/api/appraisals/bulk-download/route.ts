import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { appraisalIds } = body;

    if (!appraisalIds || !Array.isArray(appraisalIds) || appraisalIds.length === 0) {
      return NextResponse.json(
        { error: 'appraisalIds array is required' },
        { status: 400 }
      );
    }

    // Fetch appraisals owned by user
    const userAppraisals = await db
      .select()
      .from(appraisals)
      .where(
        eq(appraisals.userId, user.id)
      )
      .execute();

    // Filter to only include requested IDs that user owns
    const requestedAppraisals = userAppraisals.filter((a) =>
      appraisalIds.includes(a.id)
    );

    if (requestedAppraisals.length === 0) {
      return NextResponse.json(
        { error: 'No appraisals found or access denied' },
        { status: 404 }
      );
    }

    // Filter to only include appraisals with PDF reports
    const appraisalsWithPdfs = requestedAppraisals.filter(
      (a) => a.reportPdfUrl && a.status === 'complete'
    );

    if (appraisalsWithPdfs.length === 0) {
      return NextResponse.json(
        { error: 'No completed reports found to download' },
        { status: 400 }
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Download each PDF and add to ZIP
    for (const appraisal of appraisalsWithPdfs) {
      try {
        const response = await fetch(appraisal.reportPdfUrl!);
        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer();
          const fileName = `${appraisal.subjectVehicle?.year}_${appraisal.subjectVehicle?.make}_${appraisal.subjectVehicle?.model}_${appraisal.id.slice(0, 8)}.pdf`;
          zip.file(fileName, pdfBuffer);
        }
      } catch (error) {
        console.error(`Failed to download PDF for appraisal ${appraisal.id}:`, error);
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="appraisal-reports-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating bulk download:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk download' },
      { status: 500 }
    );
  }
}

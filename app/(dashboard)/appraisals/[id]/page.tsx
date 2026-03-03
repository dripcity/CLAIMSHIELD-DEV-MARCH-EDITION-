import { redirect } from 'next/navigation';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import AppraisalPageClient from './AppraisalPageClient';

export default async function AppraisalPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  await requireAppraisalOwnership(id, user.id);

  const [appraisal] = await db
    .select()
    .from(appraisals)
    .where(eq(appraisals.id, id))
    .execute();

  if (!appraisal) {
    redirect('/dashboard');
  }

  return <AppraisalPageClient appraisal={appraisal} />;
}

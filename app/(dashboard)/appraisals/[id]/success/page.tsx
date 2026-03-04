import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle2, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

async function SuccessContent({ appraisalId, sessionId }: { appraisalId: string; sessionId?: string }) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  // Fetch appraisal
  const [appraisal] = await db
    .select()
    .from(appraisals)
    .where(eq(appraisals.id, appraisalId))
    .limit(1);
  
  if (!appraisal) {
    redirect('/dashboard');
  }
  
  const vehicle = appraisal.subjectVehicle as any;
  const vehicleDescription = vehicle 
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : 'Vehicle';
  
  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your diminished value appraisal report has been purchased
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-2">Appraisal Details</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vehicle:</dt>
                <dd className="font-medium">{vehicleDescription}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Appraisal ID:</dt>
                <dd className="font-mono text-xs">{appraisalId}</dd>
              </div>
              {sessionId && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Transaction ID:</dt>
                  <dd className="font-mono text-xs">{sessionId}</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Your report is being generated and will be ready shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>You'll receive an email with a download link when it's ready</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>You can also download it from your dashboard anytime</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href={`/appraisals/${appraisalId}/preview`}>
                <Download className="mr-2 h-4 w-4" />
                View Report
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AppraisalSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent appraisalId={id} sessionId={session_id} />
    </Suspense>
  );
}

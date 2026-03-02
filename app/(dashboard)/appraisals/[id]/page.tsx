import { redirect } from 'next/navigation';
import { requireAuth, requireAppraisalOwnership } from '@/lib/utils/auth';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatCurrency } from '@/lib/utils/formatting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, FileText, Copy, Archive, Mail, Eye, Edit } from 'lucide-react';

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

  const { subjectVehicle, valuationResults, status, reportPdfUrl, createdAt, updatedAt } = appraisal;

  const handleDuplicate = async () => {
    'use server';
    // TODO: Implement duplicate functionality
  };

  const handleArchive = async () => {
    'use server';
    // TODO: Implement archive functionality
  };

  const handleGeneratePDF = async () => {
    'use server';
    // TODO: Implement PDF generation
  };

  const handleEmailReport = async () => {
    'use server';
    // TODO: Implement email functionality
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appraisal Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          {status !== 'complete' && (
            <Button onClick={handleGeneratePDF}>
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          )}
          {status === 'complete' && (
            <>
              <Button variant="outline" onClick={handleEmailReport}>
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
              <Button variant="outline" onClick={() => {}}>
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="text-lg font-semibold">
                {subjectVehicle?.year} {subjectVehicle?.make} {subjectVehicle?.model}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Diminished Value</p>
              <p className="text-lg font-semibold">
                {valuationResults?.diminishedValue
                  ? formatCurrency(valuationResults.diminishedValue)
                  : 'Not calculated'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge
                variant="outline"
                className={`px-3 py-1 ${
                  status === 'complete'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : status === 'archived'
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Appraisal Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="text-gray-900">
                {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-gray-900">
                {updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            {status === 'draft' ? (
              <>
                <p className="text-gray-600">
                  Complete your appraisal by filling in all required fields in the wizard.
                </p>
                <Button variant="outline" onClick={() => {}}>
                  <Edit className="w-4 h-4 mr-2" />
                  Continue Wizard
                </Button>
              </>
            ) : status === 'complete' ? (
              <>
                <p className="text-gray-600">
                  Your appraisal report is ready. Download or email it to your insurance company.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEmailReport}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Report
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                This appraisal has been archived and is no longer active.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

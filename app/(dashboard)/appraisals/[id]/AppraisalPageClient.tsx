'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/formatting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, FileText, Copy, Archive, Mail, Eye, Edit } from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';

interface AppraisalPageClientProps {
  appraisal: {
    id: string;
    subjectVehicle: {
      year: number;
      make: string;
      model: string;
    } | null;
    valuationResults: {
      diminishedValue: number;
    } | null;
    status: string | null;
    reportPdfUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
}

export default function AppraisalPageClient({ appraisal }: AppraisalPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appraisals/${appraisal.id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const duplicate = await response.json();
        toast({
          title: 'Appraisal duplicated',
          description: 'A new draft has been created.',
        });
        router.push(`/dashboard/appraisals/${duplicate.id}/wizard?step=1`);
      } else {
        throw new Error('Failed to duplicate');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate appraisal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appraisals/${appraisal.id}/archive`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Appraisal archived',
          description: 'The appraisal has been moved to archived status.',
        });
        router.push('/dashboard');
      } else {
        throw new Error('Failed to archive');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive appraisal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appraisals/${appraisal.id}/generate-pdf`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'PDF generated',
          description: 'Your appraisal report is ready.',
        });
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appraisalId: appraisal.id,
          type: 'report_delivery',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Email sent',
          description: 'The report has been sent to your email.',
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    router.push(`/dashboard/appraisals/${appraisal.id}/preview`);
  };

  const handleContinueWizard = () => {
    router.push(`/dashboard/appraisals/${appraisal.id}/wizard?step=1`);
  };

  const { subjectVehicle, valuationResults, status, reportPdfUrl, createdAt, updatedAt } = appraisal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appraisal Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDuplicate} disabled={loading}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleArchive} disabled={loading}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          {status && status !== 'complete' && (
            <Button onClick={handleGeneratePDF} disabled={loading}>
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          )}
          {status === 'complete' && (
            <>
              <Button variant="outline" onClick={handleEmailReport} disabled={loading}>
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
              <Button variant="outline" onClick={handleViewReport}>
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
                <Button variant="outline" onClick={handleContinueWizard}>
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
                  <Button variant="outline" onClick={handleEmailReport} disabled={loading}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Report
                  </Button>
                  <Button variant="outline" onClick={handleViewReport}>
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

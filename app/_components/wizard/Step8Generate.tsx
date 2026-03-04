'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/formatting';
import { getDashboardPreviewRoute } from '@/lib/utils/routes';

interface Step8GenerateProps {
  appraisalId: string;
  data: {
    valuationResults: {
      diminishedValue: number;
    };
  };
}

export function Step8Generate({ appraisalId, data }: Step8GenerateProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/appraisals/${appraisalId}/generate-pdf`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setGenerated(true);
      } else if (response.status === 403) {
        setError('You do not have entitlement to generate reports. Please purchase a report or subscribe.');
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while generating the report.');
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = () => {
    router.push(getDashboardPreviewRoute(appraisalId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Report</h2>
        <p className="text-gray-600 mb-6">Generate your professional appraisal report.</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
        <p className="text-sm text-emerald-700 mb-2">Calculated Diminished Value</p>
        <p className="text-5xl font-bold text-emerald-600">
          {formatCurrency(data.valuationResults?.diminishedValue || 0)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={generating || generated}
          className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 shadow-lg"
        >
          {generating ? 'Generating...' : generated ? 'Report Generated!' : 'Generate PDF Report'}
        </button>
      </div>

      {generated && (
        <div className="text-center space-y-4">
          <p className="text-green-600 font-medium">Your report has been generated successfully!</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleViewReport}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              View Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

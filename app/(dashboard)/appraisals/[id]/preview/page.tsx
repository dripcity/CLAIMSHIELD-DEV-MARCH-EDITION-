'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/formatting';

interface Appraisal {
  id: string;
  status: string;
  subjectVehicle: {
    vin: string;
    year: string;
    make: string;
    model: string;
    trim: string;
    mileage: number;
    preAccidentCondition: string;
  };
  ownerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  accidentDetails: {
    accidentDate: string;
    pointOfImpact: string;
    structuralDamage: boolean;
    airbagDeployment: boolean;
    framePulling: boolean;
    totalRepairCost: number;
    totalLaborHours: number;
  };
  valuationResults: {
    preAccidentFmv: number;
    postRepairAcv: number;
    diminishedValue: number;
    dvPercentOfValue: number;
  };
  severityAnalysis: {
    severityLevel: number;
    severityLabel: string;
    justification: string;
    postRepairNaaaGrade: string;
  };
}

export default function AppraisalPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppraisal = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/appraisals/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAppraisal(data);
        }
      } catch (error) {
        console.error('Failed to fetch appraisal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisal();
  }, [params]);

  const handleGeneratePDF = async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/appraisals/${id}/generate-pdf`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('PDF generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading appraisal...</p>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Appraisal not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Report Preview</h1>
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
        >
          Generate PDF Report
        </button>
      </div>

      {/* Preview Container */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Cover Page */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Diminished Value Appraisal Report</h1>
          <p className="text-gray-600">Prepared by ClaimShield DV</p>
        </div>

        {/* Vehicle Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Year:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.year}</span>
            </div>
            <div>
              <span className="text-gray-600">Make:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.make}</span>
            </div>
            <div>
              <span className="text-gray-600">Model:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.model}</span>
            </div>
            <div>
              <span className="text-gray-600">VIN:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.vin}</span>
            </div>
            <div>
              <span className="text-gray-600">Mileage:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.mileage.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Condition:</span>
              <span className="ml-2 font-medium">{appraisal.subjectVehicle.preAccidentCondition}</span>
            </div>
          </div>
        </div>

        {/* Accident Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Accident Date:</span>
              <span className="ml-2 font-medium">{appraisal.accidentDetails.accidentDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Point of Impact:</span>
              <span className="ml-2 font-medium">{appraisal.accidentDetails.pointOfImpact}</span>
            </div>
            <div>
              <span className="text-gray-600">Structural Damage:</span>
              <span className="ml-2 font-medium">{appraisal.accidentDetails.structuralDamage ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Airbag Deployment:</span>
              <span className="ml-2 font-medium">{appraisal.accidentDetails.airbagDeployment ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Repair Cost:</span>
              <span className="ml-2 font-medium">{formatCurrency(appraisal.accidentDetails.totalRepairCost)}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Labor Hours:</span>
              <span className="ml-2 font-medium">{appraisal.accidentDetails.totalLaborHours}</span>
            </div>
          </div>
        </div>

        {/* Valuation Results */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Valuation Results</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-blue-700">Pre-Accident Fair Market Value</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(appraisal.valuationResults?.preAccidentFmv || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Post-Repair Actual Cash Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(appraisal.valuationResults?.postRepairAcv || 0)}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-blue-200">
              <p className="text-sm text-blue-700">Calculated Diminished Value</p>
              <p className="text-4xl font-bold text-emerald-600 mt-1">
                {formatCurrency(appraisal.valuationResults?.diminishedValue || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Severity Analysis */}
        {appraisal.severityAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Severity Analysis</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-lg font-semibold text-amber-900 mb-2">
                Severity Level {appraisal.severityAnalysis.severityLevel}: {appraisal.severityAnalysis.severityLabel}
              </p>
              <p className="text-sm text-amber-700">{appraisal.severityAnalysis.justification}</p>
              <p className="text-sm text-amber-700 mt-1">
                Post-Repair NAAA Grade: {appraisal.severityAnalysis.postRepairNaaaGrade}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

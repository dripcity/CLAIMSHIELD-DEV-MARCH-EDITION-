'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Step7ReviewProps {
  data: {
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
      insuranceCompany: string;
      policyNumber: string;
      claimNumber: string;
      adjusterName?: string;
      adjusterPhone?: string;
      adjusterEmail?: string;
    };
    accidentDate: string;
    accidentDetails: {
      pointOfImpact: string;
      structuralDamage: boolean;
      airbagDeployment: boolean;
      framePulling: boolean;
      panelsReplaced: string;
      paintedPanels: string;
      totalRepairCost: number;
      partsCost: number;
      laborCost: number;
      paintCost: number;
      bodyLaborHours: number;
      frameLaborHours: number;
      refinishLaborHours: number;
      mechanicalLaborHours: number;
      totalLaborHours: number;
      oemParts: boolean;
      aftermarketParts: boolean;
      refurbishedParts: boolean;
      repairFacilityName?: string;
      repairFacilityPhone?: string;
    };
    comparables: any[];
    valuationResults: any;
    severityAnalysis: any;
  };
}

export function Step7Review({ data }: Step7ReviewProps) {
  const router = useRouter();
  const [editingStep, setEditingStep] = useState<number | null>(null);

  const handleEdit = (step: number) => {
    setEditingStep(step);
    router.push(`/appraisals/${data.subjectVehicle.vin}/wizard?step=${step}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Your Appraisal</h2>
        <p className="text-gray-600 mb-6">Review all the information before generating your report.</p>
      </div>

      <div className="space-y-6">
        {/* Vehicle Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Vehicle Information</h3>
            <button
              onClick={() => handleEdit(1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">VIN:</span>
              <span className="ml-2 font-medium">{data.subjectVehicle.vin}</span>
            </div>
            <div>
              <span className="text-gray-500">Year/Make/Model:</span>
              <span className="ml-2 font-medium">
                {data.subjectVehicle.year} {data.subjectVehicle.make} {data.subjectVehicle.model}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Trim:</span>
              <span className="ml-2 font-medium">{data.subjectVehicle.trim}</span>
            </div>
            <div>
              <span className="text-gray-500">Mileage:</span>
              <span className="ml-2 font-medium">{data.subjectVehicle.mileage.toLocaleString()} miles</span>
            </div>
            <div>
              <span className="text-gray-500">Pre-Accident Condition:</span>
              <span className="ml-2 font-medium capitalize">{data.subjectVehicle.preAccidentCondition.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Owner Information</h3>
            <button
              onClick={() => handleEdit(2)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.firstName} {data.ownerInfo.lastName}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">Address:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.address}, {data.ownerInfo.city}, {data.ownerInfo.state} {data.ownerInfo.zip}</span>
            </div>
            <div>
              <span className="text-gray-500">Insurance Company:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.insuranceCompany}</span>
            </div>
            <div>
              <span className="text-gray-500">Policy Number:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.policyNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Claim Number:</span>
              <span className="ml-2 font-medium">{data.ownerInfo.claimNumber}</span>
            </div>
            {data.ownerInfo.adjusterName && (
              <div>
                <span className="text-gray-500">Adjuster:</span>
                <span className="ml-2 font-medium">{data.ownerInfo.adjusterName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Accident Details */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Accident Details</h3>
            <button
              onClick={() => handleEdit(3)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Accident Date:</span>
              <span className="ml-2 font-medium">{data.accidentDate}</span>
            </div>
            <div>
              <span className="text-gray-500">Point of Impact:</span>
              <span className="ml-2 font-medium">{data.accidentDetails.pointOfImpact}</span>
            </div>
            <div>
              <span className="text-gray-500">Structural Damage:</span>
              <span className="ml-2 font-medium">{data.accidentDetails.structuralDamage ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Airbag Deployment:</span>
              <span className="ml-2 font-medium">{data.accidentDetails.airbagDeployment ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Frame Pulling:</span>
              <span className="ml-2 font-medium">{data.accidentDetails.framePulling ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Total Repair Cost:</span>
              <span className="ml-2 font-medium">${data.accidentDetails.totalRepairCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Labor Hours:</span>
              <span className="ml-2 font-medium">{data.accidentDetails.totalLaborHours} hours</span>
            </div>
          </div>
        </div>

        {/* Comparable Vehicles */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Comparable Vehicles ({data.comparables.length})</h3>
            <button
              onClick={() => handleEdit(5)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          {data.comparables.length === 0 ? (
            <p className="text-sm text-gray-500">No comparables added.</p>
          ) : (
            <div className="space-y-2">
              {data.comparables.map((comp) => (
                <div key={comp.id} className="text-sm">
                  <span className="font-medium">
                    {comp.year} {comp.make} {comp.model}
                  </span>
                  <span className="ml-2 text-gray-600">
                    - {comp.mileage.toLocaleString()} miles - ${comp.listingPrice.toLocaleString()}
                  </span>
                  {!comp.includedInCalculation && (
                    <span className="ml-2 text-xs text-gray-400">(excluded)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Valuation Results */}
        {data.valuationResults && (
          <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-emerald-800">Valuation Results</h3>
              <button
                onClick={() => handleEdit(6)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-700">Pre-Accident FMV:</span>
                <span className="ml-2 font-bold text-emerald-900">
                  ${data.valuationResults.preAccidentFmv.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-emerald-700">Post-Repair ACV:</span>
                <span className="ml-2 font-bold text-emerald-900">
                  ${data.valuationResults.postRepairAcv.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-emerald-200">
                <span className="text-emerald-700">Diminished Value:</span>
                <span className="ml-2 text-2xl font-bold text-emerald-900">
                  ${data.valuationResults.diminishedValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Severity Analysis */}
        {data.severityAnalysis && (
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-amber-800">Severity Analysis</h3>
              <button
                onClick={() => handleEdit(6)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
            <div className="text-sm">
              <p>
                <strong>Level {data.severityAnalysis.severityLevel} ({data.severityAnalysis.severityLabel})</strong>
              </p>
              <p className="mt-1 text-amber-700">{data.severityAnalysis.justification}</p>
              <p className="mt-1 text-amber-700">
                Post-Repair NAAA Grade: {data.severityAnalysis.postRepairNaaaGrade}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

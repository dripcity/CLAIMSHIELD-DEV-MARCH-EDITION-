'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardLayout } from '@/app/_components/wizard/WizardLayout';
import { Step1VehicleInfo } from '@/app/_components/wizard/Step1VehicleInfo';
import { Step2OwnerInfo } from '@/app/_components/wizard/Step2OwnerInfo';
import { Step3AccidentDetails } from '@/app/_components/wizard/Step3AccidentDetails';
import { Step4DocumentUpload } from '@/app/_components/wizard/Step4DocumentUpload';
import { Step5Comparables } from '@/app/_components/wizard/Step5Comparables';
import { Step6Calculations } from '@/app/_components/wizard/Step6Calculations';
import { Step7Review } from '@/app/_components/wizard/Step7Review';
import { Step8Generate } from '@/app/_components/wizard/Step8Generate';

interface FormData {
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
    adjusterName: string;
    adjusterPhone: string;
    adjusterEmail: string;
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
    repairFacilityName: string;
    repairFacilityPhone: string;
  };
  documents: any[];
  comparables: any[];
  valuationResults: any;
  severityAnalysis: any;
}

export default function AppraisalWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const [formData, setFormData] = useState<FormData>({
    subjectVehicle: {
      vin: '',
      year: '',
      make: '',
      model: '',
      trim: '',
      mileage: 0,
      preAccidentCondition: 'average',
    },
    ownerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'GA',
      zip: '',
      insuranceCompany: '',
      policyNumber: '',
      claimNumber: '',
      adjusterName: '',
      adjusterPhone: '',
      adjusterEmail: '',
    },
    accidentDate: new Date().toISOString().split('T')[0],
    accidentDetails: {
      pointOfImpact: '',
      structuralDamage: false,
      airbagDeployment: false,
      framePulling: false,
      panelsReplaced: '',
      paintedPanels: '',
      totalRepairCost: 0,
      partsCost: 0,
      laborCost: 0,
      paintCost: 0,
      bodyLaborHours: 0,
      frameLaborHours: 0,
      refinishLaborHours: 0,
      mechanicalLaborHours: 0,
      totalLaborHours: 0,
      oemParts: true,
      aftermarketParts: false,
      refurbishedParts: false,
      repairFacilityName: '',
      repairFacilityPhone: '',
    },
    documents: [],
    comparables: [],
    valuationResults: null,
    severityAnalysis: null,
  });
  const [loading, setLoading] = useState(true);

  const currentStep = parseInt(searchParams.get('step') || '1', 10);

  useEffect(() => {
    const fetchAppraisal = async () => {
      try {
        const response = await fetch(`/api/appraisals/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        }
      } catch (error) {
        console.error('Failed to fetch appraisal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisal();
  }, [id]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading appraisal...</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1VehicleInfo data={formData} onChange={updateField} />;
      case 2:
        return <Step2OwnerInfo data={formData} onChange={updateField} />;
      case 3:
        return <Step3AccidentDetails data={formData} onChange={updateField} />;
      case 4:
        return (
          <Step4DocumentUpload
            appraisalId={id}
            formData={formData}
            setFormData={setFormData}
            onNext={() => {}}
            onBack={() => {}}
          />
        );
      case 5:
        return (
          <Step5Comparables
            appraisalId={id}
            data={formData}
            onChange={updateField}
          />
        );
      case 6:
        return (
          <Step6Calculations
            appraisalId={id}
            data={formData}
            onChange={updateField}
          />
        );
      case 7:
        return <Step7Review data={formData} />;
      case 8:
        return <Step8Generate appraisalId={id} data={formData} />;
      default:
        return <Step1VehicleInfo data={formData} onChange={updateField} />;
    }
  };

  return (
    <WizardLayout
      appraisalId={id}
      currentStep={currentStep}
    >
      {renderStep()}
    </WizardLayout>
  );
}

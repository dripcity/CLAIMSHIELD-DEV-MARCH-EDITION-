'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WizardProgress } from './WizardProgress';

interface WizardLayoutProps {
  appraisalId: string;
  currentStep: number;
  children: React.ReactNode;
}

export function WizardLayout({ appraisalId, currentStep, children }: WizardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (Object.keys(formData).length > 0) {
        setAutoSaving(true);
        try {
          await fetch(`/api/appraisals/${appraisalId}/auto-save`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [appraisalId, formData]);
  
  const handleNext = async () => {
    // Validate current step
    // Save data
    // Navigate to next step
    router.push(`/appraisals/${appraisalId}/wizard?step=${currentStep + 1}`);
  };
  
  const handleBack = () => {
    router.push(`/appraisals/${appraisalId}/wizard?step=${currentStep - 1}`);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <WizardProgress currentStep={currentStep} totalSteps={8} />
      <div className="mt-8">{children}</div>
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {currentStep === 8 ? 'Generate Report' : 'Next'}
        </button>
      </div>
      {autoSaving && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Auto-saving...
        </div>
      )}
    </div>
  );
}

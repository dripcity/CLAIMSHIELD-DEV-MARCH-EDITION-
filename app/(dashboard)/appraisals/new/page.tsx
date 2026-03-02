'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function NewAppraisalPage() {
  const router = useRouter();
  const { user } = useUser();
  const [creating, setCreating] = useState(false);
  const [appraisalId, setAppraisalId] = useState<string | null>(null);

  const createAppraisal = useCallback(async () => {
    if (!user?.id) return;

    setCreating(true);
    try {
      const response = await fetch('/api/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: 'draft',
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
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
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
          accidentDetails: {
            accidentDate: new Date().toISOString().split('T')[0],
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppraisalId(data.id);
      }
    } catch (error) {
      console.error('Failed to create appraisal:', error);
    } finally {
      setCreating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      createAppraisal();
    }
  }, [user, createAppraisal]);

  useEffect(() => {
    if (appraisalId) {
      router.push(`/dashboard/appraisals/${appraisalId}/wizard?step=1`);
    }
  }, [appraisalId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Creating your new appraisal...</p>
      </div>
    </div>
  );
}

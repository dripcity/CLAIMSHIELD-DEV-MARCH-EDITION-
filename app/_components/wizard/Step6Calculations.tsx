'use client';

import { useState } from 'react';
import { CalculationBreakdown } from '../CalculationBreakdown';

interface SeverityAnalysis {
  severityLevel: number;
  severityLabel: string;
  justification: string;
  postRepairNaaaGrade: string;
}

interface Step6CalculationsProps {
  appraisalId: string;
  data: {
    comparables: any[];
    accidentDetails: {
      totalRepairCost?: number;
    };
  };
  onChange: (field: string, value: any) => void;
}

export function Step6Calculations({ appraisalId, data, onChange }: Step6CalculationsProps) {
  const [calculating, setCalculating] = useState(false);
  const [valuation, setValuation] = useState<any>(null);
  const [severity, setSeverity] = useState<SeverityAnalysis | null>(null);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appraisalId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setValuation(result.valuationResults);
        setSeverity(result.severityAnalysis);
      }
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Valuation Analysis</h2>
        <p className="text-gray-600 mb-6">Calculate the diminished value using comparable sales method.</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCalculate}
          disabled={calculating || !data.comparables || data.comparables.length < 3}
          className="px-8 py-4 text-lg font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 shadow-lg"
        >
          {calculating ? 'Calculating...' : 'Calculate Valuation'}
        </button>
      </div>

      {valuation && severity && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Damage Severity</h3>
            <p className="text-amber-800">
              <strong>Level {severity.severityLevel} ({severity.severityLabel})</strong>
            </p>
            <p className="text-sm text-amber-700 mt-1">{severity.justification}</p>
            <p className="text-sm text-amber-700 mt-1">
              Post-Repair NAAA Grade: {severity.postRepairNaaaGrade}
            </p>
          </div>

          <CalculationBreakdown 
            valuation={valuation} 
            comparables={data.comparables || []} 
          />
        </div>
      )}
    </div>
  );
}

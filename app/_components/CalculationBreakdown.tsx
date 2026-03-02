'use client';

import { formatCurrency } from '@/lib/utils/formatting';

interface ComparableAdjustments {
  mileage?: number;
  equipment?: number;
  year?: number;
  condition?: number;
  total?: number;
}

interface ComparableVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  listingPrice: number;
  adjustedValue: number;
  adjustments?: ComparableAdjustments;
}

interface ValuationResults {
  preAccidentFmv: number;
  postRepairAcv: number;
  diminishedValue: number;
  dvPercentOfValue: number;
  dvPercentOfRepairCost: number;
  confidenceRangeLow?: number;
  confidenceRangeHigh?: number;
}

interface CalculationBreakdownProps {
  valuation: ValuationResults;
  comparables: ComparableVehicle[];
}

export function CalculationBreakdown({ valuation, comparables }: CalculationBreakdownProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Valuation Summary</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-blue-700">Pre-Accident Fair Market Value</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {formatCurrency(valuation.preAccidentFmv)}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Post-Repair Actual Cash Value</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {formatCurrency(valuation.postRepairAcv)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-200">
          <p className="text-sm text-blue-700">Calculated Diminished Value</p>
          <p className="text-4xl font-bold text-emerald-600 mt-1">
            {formatCurrency(valuation.diminishedValue)}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {valuation.dvPercentOfValue.toFixed(1)}% of pre-accident value
          </p>
          <p className="text-sm text-blue-700">
            {valuation.dvPercentOfRepairCost.toFixed(1)}% of repair cost
          </p>
        </div>

        {valuation.confidenceRangeLow !== undefined && valuation.confidenceRangeHigh !== undefined && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">Confidence Range (90%)</p>
            <p className="text-sm text-blue-600 mt-1">
              {formatCurrency(valuation.confidenceRangeLow)} - {formatCurrency(valuation.confidenceRangeHigh)}
            </p>
          </div>
        )}
      </div>

      {comparables && comparables.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Comparable Vehicle Details</h4>
          <div className="space-y-3">
            {comparables.map((comp) => (
              <div key={comp.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {comp.year} {comp.make} {comp.model}
                    </p>
                    <p className="text-sm text-gray-600">{comp.mileage.toLocaleString()} miles</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(comp.adjustedValue)}</p>
                    <p className="text-sm text-gray-600">Adjusted Value</p>
                  </div>
                </div>
                {comp.adjustments && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Listing: {formatCurrency(comp.listingPrice)}</p>
                    <p>Adjustments: {formatCurrency(comp.adjustments.total || 0)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

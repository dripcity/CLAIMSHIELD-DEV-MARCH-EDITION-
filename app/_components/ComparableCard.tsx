'use client';

import { formatCurrency } from '@/lib/utils/formatting';

interface ComparableAdjustments {
  mileage?: number;
  equipment?: number;
  year?: number;
  condition?: number;
  total?: number;
}

interface ComparableCardProps {
  comp: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage: number;
    locationCity?: string;
    locationState?: string;
    distanceMiles?: number;
    listingPrice: number;
    adjustments?: ComparableAdjustments;
    adjustedValue?: number;
    includedInCalculation: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleInclude: () => void;
}

export function ComparableCard({ comp, onEdit, onDelete, onToggleInclude }: ComparableCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {comp.year} {comp.make} {comp.model} {comp.trim}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {comp.mileage.toLocaleString()} miles • {comp.locationCity}, {comp.locationState}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {comp.distanceMiles ? `${comp.distanceMiles} miles away` : 'Manual entry'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(comp.listingPrice)}</p>
          <p className="text-sm text-gray-600">Listing Price</p>
        </div>
      </div>

      {comp.adjustments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Adjustments:</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Mileage:</span>
              <span className="ml-2 text-gray-900">
                {comp.adjustments.mileage ? formatCurrency(comp.adjustments.mileage) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Equipment:</span>
              <span className="ml-2 text-gray-900">
                {comp.adjustments.equipment ? formatCurrency(comp.adjustments.equipment) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Year:</span>
              <span className="ml-2 text-gray-900">
                {comp.adjustments.year ? formatCurrency(comp.adjustments.year) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Condition:</span>
              <span className="ml-2 text-gray-900">
                {comp.adjustments.condition ? formatCurrency(comp.adjustments.condition) : 'N/A'}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Adjusted Value:</span>
            <span className="ml-2 text-lg font-bold text-emerald-600">
              {comp.adjustedValue ? formatCurrency(comp.adjustedValue) : 'N/A'}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={comp.includedInCalculation}
            onChange={onToggleInclude}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Include in calculation</span>
        </label>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

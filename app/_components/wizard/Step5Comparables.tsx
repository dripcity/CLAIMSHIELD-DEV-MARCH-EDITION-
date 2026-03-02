'use client';

import { useState } from 'react';
import { ComparableCard } from '../ComparableCard';

interface Step5ComparablesProps {
  appraisalId: string;
  data: {
    subjectVehicle: {
      year: string;
      make: string;
      model: string;
      trim: string;
      mileage: number;
    };
    ownerInfo: {
      city?: string;
      state?: string;
    };
    comparables: any[];
  };
  onChange: (field: string, value: any) => void;
}

export function Step5Comparables({ appraisalId, data, onChange }: Step5ComparablesProps) {
  const [searching, setSearching] = useState(false);
  const [comparables, setComparables] = useState<any[]>(data.comparables || []);

  const handleSearchPreAccident = async () => {
    setSearching(true);
    try {
      const response = await fetch('/api/comparables/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appraisalId,
          vehicleSpecs: {
            year: parseInt(data.subjectVehicle.year),
            make: data.subjectVehicle.make,
            model: data.subjectVehicle.model,
            trim: data.subjectVehicle.trim,
            mileage: data.subjectVehicle.mileage,
          },
          location: data.ownerInfo?.city || 'Atlanta',
          searchType: 'pre_accident',
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setComparables((prev) => [...prev, ...results]);
        onChange('comparables', [...comparables, ...results]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchPostAccident = async () => {
    setSearching(true);
    try {
      const response = await fetch('/api/comparables/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appraisalId,
          vehicleSpecs: {
            year: parseInt(data.subjectVehicle.year),
            make: data.subjectVehicle.make,
            model: data.subjectVehicle.model,
            trim: data.subjectVehicle.trim,
            mileage: data.subjectVehicle.mileage,
          },
          location: data.ownerInfo?.city || 'Atlanta',
          searchType: 'post_accident',
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setComparables((prev) => [...prev, ...results]);
        onChange('comparables', [...comparables, ...results]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteComparable = (id: string) => {
    const updated = comparables.filter((c) => c.id !== id);
    setComparables(updated);
    onChange('comparables', updated);
  };

  const handleToggleInclude = (id: string) => {
    const updated = comparables.map((c) => {
      if (c.id === id) {
        return { ...c, includedInCalculation: !c.includedInCalculation };
      }
      return c;
    });
    setComparables(updated);
    onChange('comparables', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparable Vehicles</h2>
        <p className="text-gray-600 mb-6">Search for comparable vehicles to determine market value.</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleSearchPreAccident}
          disabled={searching}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {searching ? 'Searching...' : 'Search Pre-Accident Comparables'}
        </button>

        <button
          onClick={handleSearchPostAccident}
          disabled={searching}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {searching ? 'Searching...' : 'Search Post-Accident Comparables'}
        </button>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Comparables ({comparables.length})
          </h3>
          {comparables.length === 0 ? (
            <p className="text-sm text-gray-500">No comparables found. Run a search above.</p>
          ) : (
            <div className="space-y-3">
              {comparables.map((comp) => (
                <ComparableCard
                  key={comp.id}
                  comp={comp}
                  onEdit={() => {}}
                  onDelete={() => handleDeleteComparable(comp.id)}
                  onToggleInclude={() => handleToggleInclude(comp.id)}
                />
              ))}
            </div>
          )}
          {comparables.length < 3 && (
            <p className="text-sm text-amber-600 mt-2">
              * Minimum 3 comparables required for accurate valuation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

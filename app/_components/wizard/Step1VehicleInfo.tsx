'use client';

import { useState } from 'react';
import { StateLawBanner } from '../StateLawBanner';

interface Step1VehicleInfoProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step1VehicleInfo({ data, onChange }: Step1VehicleInfoProps) {
  const [vin, setVin] = useState(data?.subjectVehicle?.vin || '');
  const [year, setYear] = useState(data?.subjectVehicle?.year || '');
  const [make, setMake] = useState(data?.subjectVehicle?.make || '');
  const [model, setModel] = useState(data?.subjectVehicle?.model || '');
  const [trim, setTrim] = useState(data?.subjectVehicle?.trim || '');
  const [mileage, setMileage] = useState(data?.subjectVehicle?.mileage || '');
  const [preAccidentCondition, setPreAccidentCondition] = useState(
    data?.subjectVehicle?.preAccidentCondition || 'excellent'
  );

  const handleVinBlur = () => {
    if (vin.length === 17) {
      // In a real app, this would call a VIN decoding API
      // For now, just auto-populate some fields
      if (!year) setYear('2020');
      if (!make) setMake('Toyota');
      if (!model) setModel('Camry');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Information</h2>
        <p className="text-gray-600 mb-6">Enter your vehicle details to begin your appraisal.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">VIN (17 characters)</label>
          <input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            onBlur={handleVinBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="1G1ZT53847F123456"
            maxLength={17}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="2020"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Camry"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trim (optional)</label>
          <input
            type="text"
            value={trim}
            onChange={(e) => setTrim(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="LE, XSE, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Accident Condition</label>
          <select
            value={preAccidentCondition}
            onChange={(e) => setPreAccidentCondition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="below_average">Below Average</option>
          </select>
        </div>
      </div>

      <StateLawBanner state={data?.ownerInfo?.state || 'GA'} />
    </div>
  );
}

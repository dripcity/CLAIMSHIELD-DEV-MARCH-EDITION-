'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/formatting';

interface Appraisal {
  id: string;
  status: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  diminishedValue: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await fetch('/api/appraisals');
      if (response.ok) {
        const data = await response.json();
        setAppraisals(data);
      }
    } catch (error) {
      console.error('Failed to fetch appraisals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppraisals = appraisals.filter((appraisal) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'draft' && appraisal.status === 'draft') ||
      (filter === 'complete' && appraisal.status === 'complete') ||
      (filter === 'archived' && appraisal.status === 'archived');
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      appraisal.vehicleMake.toLowerCase().includes(searchLower) ||
      appraisal.vehicleModel.toLowerCase().includes(searchLower) ||
      appraisal.vehicleYear.toString().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const handleNewAppraisal = () => {
    router.push('/dashboard/appraisals/new');
  };

  const handleViewAppraisal = (id: string) => {
    router.push(`/dashboard/appraisals/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleNewAppraisal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          New Appraisal
        </button>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600">Total Appraisals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{appraisals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600">Reports Generated</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {appraisals.filter((a) => a.status === 'complete').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {appraisals.filter((a) => a.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search appraisals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="complete">Complete</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Appraisals Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading appraisals...</p>
        </div>
      ) : filteredAppraisals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No appraisals found</p>
          <button
            onClick={handleNewAppraisal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first appraisal
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DV Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppraisals.map((appraisal) => (
                <tr
                  key={appraisal.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewAppraisal(appraisal.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appraisal.vehicleYear} {appraisal.vehicleMake} {appraisal.vehicleModel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appraisal.status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : appraisal.status === 'archived'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appraisal.diminishedValue > 0
                      ? formatCurrency(appraisal.diminishedValue)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

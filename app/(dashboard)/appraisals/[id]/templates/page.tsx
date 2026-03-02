'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppraisalTemplatesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Document Templates</h1>
      <p className="text-gray-600">Template generation page coming soon...</p>
    </div>
  );
}

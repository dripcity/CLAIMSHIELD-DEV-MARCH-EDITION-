'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppraisalDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/appraisals/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>
      <p className="text-gray-600">Document management page coming soon...</p>
    </div>
  );
}

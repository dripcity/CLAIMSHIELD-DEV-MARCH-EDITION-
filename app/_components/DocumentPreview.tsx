'use client';

import { useState } from 'react';
import { X, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface DocumentPreviewProps {
  documents: Document[];
  onRemove: (id: string) => void;
  onExtract?: (document: Document) => void;
  showExtractButton?: boolean;
}

export function DocumentPreview({ documents, onRemove, onExtract, showExtractButton = false }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreview = (document: Document) => {
    if (document.type.startsWith('image/')) {
      setPreviewUrl(document.url);
      setPreviewType('image');
    } else if (document.type === 'application/pdf') {
      setPreviewUrl(document.url);
      setPreviewType('pdf');
    }
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleDownload = (document: Document) => {
    window.open(document.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(doc.size)} • {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(doc.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove document"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(doc)}
                  className="flex-1"
                >
                  <Eye size={14} className="mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  className="flex-1"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
                {showExtractButton && onExtract && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExtract(doc)}
                    className="flex-1"
                  >
                    Extract Data
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {previewType === 'image' && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                  fill
                />
              )}
              {previewType === 'pdf' && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border rounded"
                  title="PDF Preview"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={handleClosePreview}>
                Close
              </Button>
              <Button onClick={() => window.open(previewUrl, '_blank')}>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

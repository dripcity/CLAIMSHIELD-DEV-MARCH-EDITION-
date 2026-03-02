'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  appraisalId: string;
  fileType: string;
  onUploadComplete: (url: string) => void;
  maxFiles?: number;
  label: string;
}

export function FileUpload({ appraisalId, fileType, onUploadComplete, maxFiles = 20, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appraisalId', appraisalId);
      formData.append('fileType', fileType);
      
      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const { url } = await response.json();
          onUploadComplete(url);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    maxFiles,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((file) => {
        if (file.errors.some((e) => e.code === 'file-too-large')) {
          alert('File too large (max 25MB)');
        }
        if (file.errors.some((e) => e.code === 'file-invalid-type')) {
          alert('Invalid file type. Use PDF, JPEG, PNG, or WebP.');
        }
      });
    },
  });

  return (
    <div className="border-2 border-dashed p-6 text-center cursor-pointer rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
      <input
        {...getInputProps()}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <div {...getRootProps()} className="cursor-pointer">
        {uploading ? (
          <div>
            <p className="text-blue-600 font-medium">Uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 font-medium mb-2">{label}</p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max 25MB per file, PDF, JPEG, PNG, WebP only
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

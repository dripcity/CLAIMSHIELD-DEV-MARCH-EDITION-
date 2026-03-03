'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText } from 'lucide-react';

interface AppraiserFieldsProps {
  data: {
    name?: string;
    license?: string;
    certifications?: string[];
    signatureUrl?: string;
  };
  onChange: (data: {
    name?: string;
    license?: string;
    certifications?: string[];
    signatureUrl?: string;
  }) => void;
}

export function AppraiserFields({ data, onChange }: AppraiserFieldsProps) {
  const [newCertification, setNewCertification] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      onChange({
        ...data,
        certifications: [...(data.certifications || []), newCertification.trim()],
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    const updated = [...(data.certifications || [])];
    updated.splice(index, 1);
    onChange({
      ...data,
      certifications: updated,
    });
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'signature');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      onChange({
        ...data,
        signatureUrl: url,
      });
    } catch (error) {
      console.error('Signature upload error:', error);
      alert('Failed to upload signature. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSignature = () => {
    onChange({
      ...data,
      signatureUrl: undefined,
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <CardTitle>Professional Appraiser Information</CardTitle>
        </div>
        <CardDescription>
          USPAP certification and professional credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Appraiser Name */}
        <div className="space-y-2">
          <Label htmlFor="appraiser-name">Appraiser Name</Label>
          <Input
            id="appraiser-name"
            type="text"
            placeholder="John Doe, Certified Appraiser"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="appraiser-license">License Number</Label>
          <Input
            id="appraiser-license"
            type="text"
            placeholder="e.g., GA-12345"
            value={data.license || ''}
            onChange={(e) => onChange({ ...data, license: e.target.value })}
          />
        </div>

        {/* Certifications */}
        <div className="space-y-2">
          <Label>Certifications</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., USPAP Certified, ASA Member"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCertification();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddCertification}
              variant="outline"
            >
              Add
            </Button>
          </div>
          {data.certifications && data.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Signature Upload */}
        <div className="space-y-2">
          <Label>Digital Signature</Label>
          {data.signatureUrl ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Signature uploaded</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSignature}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={data.signatureUrl}
                alt="Appraiser signature"
                className="max-h-24 object-contain"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="signature-upload"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="signature-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload signature'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 2MB
                </span>
              </label>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Your signature will appear on the appraisal report and expert witness affidavit
          </p>
        </div>

        {/* USPAP Compliance Notice */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            <strong>USPAP Compliance:</strong> By providing your credentials, you certify that this appraisal
            will be conducted in accordance with the Uniform Standards of Professional Appraisal Practice (USPAP).
            The generated report will include USPAP compliance statements and your professional certification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

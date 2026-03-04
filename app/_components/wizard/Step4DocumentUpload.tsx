'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '../FileUpload';
import { DocumentPreview } from '../DocumentPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, Image as ImageIcon, File } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Step4DocumentUploadProps {
  appraisalId: string;
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4DocumentUpload({ appraisalId, formData, setFormData, onNext, onBack }: Step4DocumentUploadProps) {
  const [repairEstimates, setRepairEstimates] = useState<Document[]>([]);
  const [damagePhotos, setDamagePhotos] = useState<Document[]>([]);
  const [repairPhotos, setRepairPhotos] = useState<Document[]>([]);
  const [insuranceDocs, setInsuranceDocs] = useState<Document[]>([]);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<Record<string, any>>({});
  const [showExtractedData, setShowExtractedData] = useState(false);

  // Load existing documents from form data
  useEffect(() => {
    if (formData?.repairEstimates) setRepairEstimates(formData.repairEstimates);
    if (formData?.damagePhotos) setDamagePhotos(formData.damagePhotos);
    if (formData?.repairPhotos) setRepairPhotos(formData.repairPhotos);
    if (formData?.insuranceDocs) setInsuranceDocs(formData.insuranceDocs);
  }, [formData]);

  const handleRepairEstimateUpload = (url: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: url.split('/').pop() || 'repair-estimate.pdf',
      size: 0,
      type: 'application/pdf',
      url,
      uploadedAt: new Date().toISOString(),
    };
    setRepairEstimates((prev) => [...prev, newDoc]);
    setFormData({ ...formData, repairEstimates: [...repairEstimates, newDoc] });
  };

  const handleDamagePhotoUpload = (url: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: url.split('/').pop() || 'damage-photo.jpg',
      size: 0,
      type: 'image/jpeg',
      url,
      uploadedAt: new Date().toISOString(),
    };
    setDamagePhotos((prev) => [...prev, newDoc]);
    setFormData({ ...formData, damagePhotos: [...damagePhotos, newDoc] });
  };

  const handleRepairPhotoUpload = (url: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: url.split('/').pop() || 'repair-photo.jpg',
      size: 0,
      type: 'image/jpeg',
      url,
      uploadedAt: new Date().toISOString(),
    };
    setRepairPhotos((prev) => [...prev, newDoc]);
    setFormData({ ...formData, repairPhotos: [...repairPhotos, newDoc] });
  };

  const handleInsuranceDocUpload = (url: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: url.split('/').pop() || 'insurance-doc.pdf',
      size: 0,
      type: 'application/pdf',
      url,
      uploadedAt: new Date().toISOString(),
    };
    setInsuranceDocs((prev) => [...prev, newDoc]);
    setFormData({ ...formData, insuranceDocs: [...insuranceDocs, newDoc] });
  };

  const handleRemoveDocument = (id: string, type: 'repairEstimates' | 'damagePhotos' | 'repairPhotos' | 'insuranceDocs') => {
    if (type === 'repairEstimates') {
      setRepairEstimates((prev) => prev.filter((doc) => doc.id !== id));
      setFormData({ ...formData, repairEstimates: repairEstimates.filter((doc) => doc.id !== id) });
    } else if (type === 'damagePhotos') {
      setDamagePhotos((prev) => prev.filter((doc) => doc.id !== id));
      setFormData({ ...formData, damagePhotos: damagePhotos.filter((doc) => doc.id !== id) });
    } else if (type === 'repairPhotos') {
      setRepairPhotos((prev) => prev.filter((doc) => doc.id !== id));
      setFormData({ ...formData, repairPhotos: repairPhotos.filter((doc) => doc.id !== id) });
    } else if (type === 'insuranceDocs') {
      setInsuranceDocs((prev) => prev.filter((doc) => doc.id !== id));
      setFormData({ ...formData, insuranceDocs: insuranceDocs.filter((doc) => doc.id !== id) });
    }
  };

  const getDocumentType = (doc: Document): 'repair_estimate' | 'insurance_docs' | 'damage_photos' | 'repair_photos' => {
    if (repairEstimates.some((estimate) => estimate.id === doc.id)) return 'repair_estimate';
    if (insuranceDocs.some((insuranceDoc) => insuranceDoc.id === doc.id)) return 'insurance_docs';
    if (repairPhotos.some((photo) => photo.id === doc.id)) return 'repair_photos';
    return 'damage_photos';
  };

  const handleExtractData = async (document: Document) => {
    setExtracting(document.id);

    try {
      const response = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appraisalId,
          documentUrl: document.url,
          documentType: getDocumentType(document),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setExtractionResults((prev) => ({
          ...prev,
          [document.id]: result,
        }));
        setShowExtractedData(true);
      } else {
        console.error('Extraction failed:', await response.text());
      }
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setExtracting(null);
    }
  };

  const handleAcceptExtractedData = (documentId: string) => {
    const result = extractionResults[documentId];
    if (!result) return;

    // Merge extracted data into form data
    const updatedFormData = { ...formData };
    
    if (result.vehicleInfo) {
      updatedFormData.subjectVehicle = { ...updatedFormData.subjectVehicle, ...result.vehicleInfo };
    }
    if (result.ownerInfo) {
      updatedFormData.ownerInfo = { ...updatedFormData.ownerInfo, ...result.ownerInfo };
    }
    if (result.insuranceInfo) {
      updatedFormData.insuranceInfo = { ...updatedFormData.insuranceInfo, ...result.insuranceInfo };
    }
    if (result.accidentDetails) {
      updatedFormData.accidentDetails = { ...updatedFormData.accidentDetails, ...result.accidentDetails };
    }

    setFormData(updatedFormData);
    setShowExtractedData(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Step 4: Document Upload</h2>
          <p className="text-gray-500">Upload repair estimates, photos, and insurance documents</p>
        </div>
        {showExtractedData && (
          <Button onClick={() => setShowExtractedData(false)} variant="outline" size="sm">
            Close Extracted Data
          </Button>
        )}
      </div>

      {showExtractedData && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <p className="font-medium mb-2">Extracted Data Available</p>
            <p className="text-sm text-blue-800">
              AI has extracted data from your documents. Review the extracted information and click &quot;Accept&quot; to populate the form.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Repair Estimates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Repair Estimates
          </CardTitle>
          <CardDescription>Upload your repair estimate or invoice (PDF, max 25MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            appraisalId={appraisalId}
            fileType="repair_estimate"
            onUploadComplete={handleRepairEstimateUpload}
            label="Drag and drop repair estimates here, or click to browse"
          />
          <DocumentPreview
            documents={repairEstimates}
            onRemove={(id) => handleRemoveDocument(id, 'repairEstimates')}
            onExtract={handleExtractData}
            showExtractButton={repairEstimates.length > 0}
          />
        </CardContent>
      </Card>

      {/* Damage Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon size={20} className="text-red-600" />
            Damage Photos (Before)
          </CardTitle>
          <CardDescription>Upload photos of the damage before repairs (JPG, PNG, WebP, max 25MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            appraisalId={appraisalId}
            fileType="damage_photo"
            onUploadComplete={handleDamagePhotoUpload}
            maxFiles={10}
            label="Drag and drop damage photos here, or click to browse"
          />
          <DocumentPreview
            documents={damagePhotos}
            onRemove={(id) => handleRemoveDocument(id, 'damagePhotos')}
          />
        </CardContent>
      </Card>

      {/* Repair Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon size={20} className="text-green-600" />
            Repair Photos (After)
          </CardTitle>
          <CardDescription>Upload photos of the repairs (JPG, PNG, WebP, max 25MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            appraisalId={appraisalId}
            fileType="repair_photo"
            onUploadComplete={handleRepairPhotoUpload}
            maxFiles={10}
            label="Drag and drop repair photos here, or click to browse"
          />
          <DocumentPreview
            documents={repairPhotos}
            onRemove={(id) => handleRemoveDocument(id, 'repairPhotos')}
          />
        </CardContent>
      </Card>

      {/* Insurance Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File size={20} className="text-purple-600" />
            Insurance Documents
          </CardTitle>
          <CardDescription>Upload insurance claim documents (PDF, max 25MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            appraisalId={appraisalId}
            fileType="insurance_document"
            onUploadComplete={handleInsuranceDocUpload}
            maxFiles={5}
            label="Drag and drop insurance documents here, or click to browse"
          />
          <DocumentPreview
            documents={insuranceDocs}
            onRemove={(id) => handleRemoveDocument(id, 'insuranceDocs')}
            onExtract={handleExtractData}
            showExtractButton={insuranceDocs.length > 0}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={repairEstimates.length === 0}>
          Next Step
        </Button>
      </div>

      {/* Loading Overlay */}
      {extracting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-lg font-medium">Extracting data from document...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}

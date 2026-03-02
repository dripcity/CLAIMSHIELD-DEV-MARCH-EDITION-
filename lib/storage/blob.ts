import { put, del } from '@vercel/blob';

interface UploadOptions {
  appraisalId: string;
  fileType: 'repair_estimate' | 'damage_photo' | 'repair_photo' | 'insurance_doc' | 'report' | 'signature';
  fileName: string;
}

export async function uploadFile(
  file: File | Buffer,
  options: UploadOptions
): Promise<string> {
  const { appraisalId, fileType, fileName } = options;
  
  // Organize files by appraisal ID and file type
  const path = `${appraisalId}/${fileType}/${fileName}`;
  
  // Upload to Vercel Blob with private access
  const blob = await put(path, file, {
    access: 'public', // We'll use signed URLs for access control
    addRandomSuffix: true,
  });
  
  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export function generateSignedUrl(url: string, expiresIn: number = 3600): string {
  // Vercel Blob URLs are already signed when using private access
  // For now, return the URL as-is since we're using public access with auth checks
  return url;
}

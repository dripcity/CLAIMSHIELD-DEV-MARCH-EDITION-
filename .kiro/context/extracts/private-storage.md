# Private Storage Requirements

## Security Finding

**P0-05**: Public storage for sensitive docs/reports

**Files**: `lib/storage/blob.ts:19-24,31-34`

Current implementation uses public access + stub signed URL.

## Required Implementation

1. **Private Blob Storage**: Switch to private access mode
2. **Signed URL Issuance**: Server-only endpoint with expiry claims
3. **No Direct URLs**: Never expose blob URLs to clients

## Pattern
```typescript
// lib/storage/blob.ts
export async function uploadPrivateDocument(file: File, userId: string) {
  const blob = await put(`private/${userId}/${file.name}`, file, {
    access: 'private', // CRITICAL
  });
  
  return blob.url; // Internal use only, never expose to client
}

export async function getSignedDocumentUrl(blobUrl: string, expiryMinutes: number = 60) {
  // Generate signed URL with expiry
  const signedUrl = await createSignedUrl(blobUrl, {
    expiresIn: expiryMinutes * 60,
  });
  
  return signedUrl;
}
```

## API Endpoint

Create `app/api/documents/[id]/signed-url/route.ts`:
- Verify document ownership
- Generate signed URL with expiry
- Return to authorized user only

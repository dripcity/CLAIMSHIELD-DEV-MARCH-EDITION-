# API Documentation

ClaimShield DV REST API documentation.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://claimshield-dv.com`

## Authentication

All API endpoints require authentication via Clerk. Include the session token in the `Authorization` header:

```
Authorization: Bearer <clerk-session-token>
```

## Response Format

All responses follow this format:

### Success Response

```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "error": "Error message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Endpoints

### Appraisals

#### List Appraisals

```
GET /api/appraisals
```

Returns all appraisals for the authenticated user.

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "status": "draft",
    "claimNumber": "CLM-12345",
    "subjectVehicle": { ... },
    "ownerInfo": { ... },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Appraisal

```
POST /api/appraisals
```

Creates a new draft appraisal.

**Request Body:**

```json
{
  "claimNumber": "CLM-12345",
  "purpose": "Insurance claim settlement"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "draft",
  "claimNumber": "CLM-12345",
  "purpose": "Insurance claim settlement",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Get Appraisal

```
GET /api/appraisals/:id
```

Returns a single appraisal by ID.

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "draft",
  "subjectVehicle": { ... },
  "ownerInfo": { ... },
  "accidentDetails": { ... },
  "valuationResults": { ... },
  "severityAnalysis": { ... }
}
```

#### Update Appraisal

```
PATCH /api/appraisals/:id
```

Updates an existing appraisal.

**Request Body:**

```json
{
  "subjectVehicle": {
    "vin": "1HGBH41JXMN109186",
    "year": 2021,
    "make": "Honda",
    "model": "Accord",
    "trim": "EX-L",
    "mileage": 25000
  }
}
```

**Response:** `200 OK`

#### Delete Appraisal

```
DELETE /api/appraisals/:id
```

Deletes an appraisal and all associated data.

**Response:** `200 OK`

#### Auto-Save Appraisal

```
PATCH /api/appraisals/:id/auto-save
```

Auto-saves draft data without validation.

**Request Body:**

```json
{
  "subjectVehicle": { ... },
  "ownerInfo": { ... }
}
```

**Response:** `200 OK`

#### Generate PDF

```
POST /api/appraisals/:id/generate-pdf
```

Generates a PDF report for the appraisal.

**Requirements:**
- User must have active entitlement (subscription or reports remaining)
- Appraisal must have all required data

**Response:** `200 OK`

```json
{
  "pdfUrl": "https://blob.vercel-storage.com/..."
}
```

### Documents

#### Upload Document

```
POST /api/documents/upload
```

Uploads a document to Vercel Blob storage.

**Request:** `multipart/form-data`

```
file: <file>
appraisalId: <uuid>
fileType: "repair_estimate" | "damage_photo" | "repair_photo" | "insurance_docs"
```

**Validation:**
- Max file size: 25MB
- Allowed types: image/jpeg, image/png, image/webp, application/pdf
- Max 20 files per appraisal

**Response:** `200 OK`

```json
{
  "url": "https://blob.vercel-storage.com/..."
}
```

#### Extract Document Data

```
POST /api/documents/extract
```

Extracts structured data from a document using AI.

**Request Body:**

```json
{
  "documentUrl": "https://blob.vercel-storage.com/...",
  "documentType": "repair_estimate" | "insurance_docs" | "vehicle_docs" | "damage_photos"
}
```

**Response:** `200 OK`

```json
{
  "data": {
    "totalRepairCost": 5000,
    "laborHours": 25,
    "structuralDamage": true,
    ...
  },
  "confidence": {
    "totalRepairCost": 0.95,
    "laborHours": 0.90,
    ...
  }
}
```

#### Delete Document

```
DELETE /api/documents/:id
```

Deletes a document from storage and database.

**Response:** `200 OK`

### Comparables

#### Search Comparables

```
POST /api/comparables/search
```

Searches for comparable vehicles using Apify.

**Request Body:**

```json
{
  "appraisalId": "uuid",
  "vehicleSpecs": {
    "year": 2021,
    "make": "Honda",
    "model": "Accord",
    "trim": "EX-L",
    "mileage": 25000
  },
  "location": {
    "city": "Atlanta",
    "state": "GA",
    "zip": "30301"
  },
  "searchType": "pre_accident" | "post_accident"
}
```

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "appraisalId": "uuid",
    "compType": "pre_accident",
    "year": 2021,
    "make": "Honda",
    "model": "Accord",
    "trim": "EX-L",
    "mileage": 24500,
    "listingPrice": 28500,
    "dealerName": "ABC Motors",
    "locationCity": "Atlanta",
    "locationState": "GA",
    "adjustments": {
      "mileage": -60,
      "equipment": 0,
      "year": 0,
      "condition": 0,
      "total": -60
    },
    "adjustedValue": 28440
  }
]
```

#### Update Comparable

```
PATCH /api/comparables/:id
```

Updates a comparable vehicle.

**Request Body:**

```json
{
  "includedInCalculation": false
}
```

**Response:** `200 OK`

#### Delete Comparable

```
DELETE /api/comparables/:id
```

Deletes a comparable vehicle.

**Response:** `200 OK`

### Calculations

#### Calculate Valuation

```
POST /api/calculations
```

Calculates diminished value using comparable sales method.

**Request Body:**

```json
{
  "appraisalId": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "valuationResults": {
    "preAccidentFmv": 28500,
    "postRepairAcv": 24000,
    "diminishedValue": 4500,
    "dvPercentOfValue": 15.79,
    "dvPercentOfRepair": 90.0,
    "confidenceRangeLow": 4200,
    "confidenceRangeHigh": 4800,
    "preAccidentCompsCount": 5,
    "postAccidentCompsCount": 5
  },
  "severityAnalysis": {
    "severityLevel": 4,
    "severityLabel": "Major",
    "postRepairNaaaGrade": "2 - Below Average",
    "justification": "Frame labor hours exceed 5 and airbag deployment occurred..."
  }
}
```

### Templates

#### Generate Template

```
GET /api/templates/:type
```

Generates a document template.

**Types:**
- `demand-letter-ga` - Georgia 60-day demand letter
- `demand-letter-generic` - Generic demand letter
- `bad-faith-calculator` - Georgia bad faith penalty calculator
- `expert-affidavit` - Expert witness affidavit (appraiser only)
- `market-stigma` - Market stigma impact statement

**Query Parameters:**

```
appraisalId: <uuid>
```

**Response:** `200 OK` (PDF or DOCX file)

### Payments

#### Create Checkout Session

```
POST /api/checkout
```

Creates a Stripe checkout session.

**Request Body:**

```json
{
  "mode": "payment" | "subscription",
  "priceId": "price_...",
  "userId": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Create Portal Session

```
POST /api/checkout/portal
```

Creates a Stripe billing portal session.

**Request Body:**

```json
{
  "customerId": "cus_..."
}
```

**Response:** `302 Redirect` to Stripe portal

### Team Management (Attorney Only)

#### List Team Members

```
GET /api/team
```

Returns all team members for the attorney.

**Response:** `200 OK`

```json
{
  "teamMembers": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "paralegal",
      "status": "active"
    }
  ],
  "totalCount": 1
}
```

#### Add Team Member

```
POST /api/team
```

Invites a new team member.

**Request Body:**

```json
{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "role": "paralegal"
}
```

**Response:** `201 Created`

### Webhooks

#### Clerk Webhook

```
POST /api/webhooks/clerk
```

Handles Clerk authentication events.

**Events:**
- `user.created` - Creates user record in database

**Headers:**

```
svix-id: <message-id>
svix-timestamp: <timestamp>
svix-signature: <signature>
```

#### Stripe Webhook

```
POST /api/webhooks/stripe
```

Handles Stripe payment events.

**Events:**
- `checkout.session.completed` - Unlocks report generation
- `customer.subscription.created` - Activates subscription
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_failed` - Flags payment failure

**Headers:**

```
stripe-signature: <signature>
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Default**: 100 requests per minute per user
- **File Upload**: 20 requests per minute per user
- **AI Extraction**: 10 requests per minute per user

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication required |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND_ERROR` | Resource not found |
| `NETWORK_ERROR` | Network error occurred |
| `TIMEOUT_ERROR` | Request timed out |
| `RATE_LIMIT_ERROR` | Rate limit exceeded |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `PAYMENT_ERROR` | Payment processing failed |

## Examples

### Complete Appraisal Flow

```javascript
// 1. Create appraisal
const appraisal = await fetch('/api/appraisals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ claimNumber: 'CLM-12345' })
}).then(r => r.json());

// 2. Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('appraisalId', appraisal.id);
formData.append('fileType', 'repair_estimate');

const upload = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// 3. Extract data
const extracted = await fetch('/api/documents/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentUrl: upload.url,
    documentType: 'repair_estimate'
  })
}).then(r => r.json());

// 4. Update appraisal with extracted data
await fetch(`/api/appraisals/${appraisal.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accidentDetails: extracted.data
  })
});

// 5. Search comparables
const comparables = await fetch('/api/comparables/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appraisalId: appraisal.id,
    vehicleSpecs: { ... },
    location: { ... },
    searchType: 'pre_accident'
  })
}).then(r => r.json());

// 6. Calculate valuation
const valuation = await fetch('/api/calculations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appraisalId: appraisal.id })
}).then(r => r.json());

// 7. Generate PDF
const pdf = await fetch(`/api/appraisals/${appraisal.id}/generate-pdf`, {
  method: 'POST'
}).then(r => r.json());

console.log('PDF URL:', pdf.pdfUrl);
```

## Support

For API support:
- Email: api-support@claimshield-dv.com
- Documentation: https://docs.claimshield-dv.com
- Status: https://status.claimshield-dv.com

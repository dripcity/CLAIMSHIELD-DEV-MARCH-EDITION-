# Webhook Fulfillment Requirements

## Current Issue

`app/api/webhooks/stripe/route.ts:50-51,142` has TODO comments for post-payment actions.

## Required Implementation

### 1. Idempotency

Store processed event IDs to prevent double-processing:
```typescript
// Track processed events
const processedEvents = new Set<string>();

async function handleCheckoutComplete(event: Stripe.Event) {
  const eventId = event.id;
  
  // Check if already processed
  if (await isEventProcessed(eventId)) {
    return; // Skip duplicate
  }
  
  // Process event...
  
  // Mark as processed
  await markEventProcessed(eventId);
}
```

### 2. Report Generation Trigger

On `checkout.session.completed` for appraisal report:
```typescript
const session = event.data.object as Stripe.Checkout.Session;
const appraisalId = session.metadata.appraisalId;

// Trigger PDF generation
await fetch(`${baseUrl}/api/appraisals/${appraisalId}/generate-pdf`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${internalToken}` }
});
```

### 3. Email Delivery

When report ready:
```typescript
await sendEmail({
  to: userEmail,
  subject: 'Your Diminished Value Report is Ready',
  template: 'report-ready',
  data: {
    appraisalId,
    downloadUrl: signedReportUrl,
  }
});
```

### 4. Entitlement Update
```typescript
await db.update(users)
  .set({ reportsRemaining: sql`${users.reportsRemaining} + 1` })
  .where(eq(users.id, userId));
```

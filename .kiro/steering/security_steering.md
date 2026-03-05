---
title: Security Requirements
inclusion: auto
description: Security and authorization patterns. Use when working on API routes, auth, or data access.
---

# Security Requirements

## Critical Security Principles

1. **Object-Level Authorization**: Every API route that accesses user data MUST validate ownership
   - Check `userId` from authenticated session against resource owner
   - Never trust client-provided IDs without verification

2. **Mass Assignment Protection**: Never spread untrusted request bodies into DB operations
   - Use explicit allowlists via Zod schemas
   - Reject unknown fields with 400 status

3. **Private Storage**: All user documents and reports use private blob storage
   - Generate signed URLs with expiry for access
   - Never expose direct blob URLs to clients

4. **Rate Limiting**: API routes must implement rate limiting (coming in CS-LR-035)

## Authorization Pattern Template

```typescript
// API Route Authorization Check Pattern
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership before ANY data access
  const appraisal = await db.query.appraisals.findFirst({
    where: and(
      eq(appraisals.id, params.id),
      eq(appraisals.userId, userId)
    ),
  });

  if (!appraisal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Safe to proceed with owned resource
  return NextResponse.json(appraisal);
}
```

## Validation Pattern Template

```typescript
// Input Validation with Zod
import { z } from 'zod';

const UpdateAppraisalSchema = z.object({
  claimNumber: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'complete']).optional(),
  // Explicitly list ALL allowed fields
}).strict(); // Reject unknown fields

export async function PATCH(request: Request) {
  const body = await request.json();
  
  // Validate against schema
  const result = UpdateAppraisalSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.errors },
      { status: 400 }
    );
  }

  // Use validated data only
  const validatedData = result.data;
  
  await db.update(appraisals)
    .set(validatedData)
    .where(eq(appraisals.id, params.id));
}
```

## Tasks With Security Impact

When working on these task IDs, apply strict security review:
- CS-LR-003, CS-LR-004, CS-LR-005, CS-LR-006, CS-LR-007
- CS-LR-010 (webhook idempotency)
- CS-LR-035 (audit logging and rate limiting)

## Security Gate Checklist

Before marking security-related tasks complete:
- [ ] Authorization check present on all data access paths
- [ ] Input validation uses strict Zod schema
- [ ] No mass assignment vulnerabilities
- [ ] Signed URLs used for private resources
- [ ] Error messages don't leak sensitive data

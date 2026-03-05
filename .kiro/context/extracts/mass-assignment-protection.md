# Mass Assignment Protection

## Security Finding

**P0-03**: Mass assignment in appraisal update endpoints

**Vulnerable Files**:
- `app/api/appraisals/[id]/route.ts:42-49`
- `app/api/appraisals/[id]/auto-save/route.ts:16-23`

Both call `.set({...body})` with untrusted payload.

## Required Pattern
```typescript
import { z } from 'zod';

// Define strict schema with ONLY allowed fields
const UpdateAppraisalSchema = z.object({
  claimNumber: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'complete']).optional(),
  ownerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
  }).optional(),
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

  // Use ONLY validated data
  const validatedData = result.data;
  
  await db.update(appraisals)
    .set(validatedData)
    .where(eq(appraisals.id, params.id));
}
```

## Key Points

- Use `.strict()` to reject unknown fields
- Never spread untrusted input directly
- Return structured validation errors

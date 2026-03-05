# Authorization Pattern Requirements

## Security Findings

**P0-02**: Broken object-level authorization on comparables/documents endpoints

**Vulnerable Files**:
- `app/api/comparables/[id]/route.ts:16-20,41-44` - update/delete without ownership validation
- `app/api/comparables/search/route.ts:10-11,24-29` - accepts arbitrary appraisalId
- `app/api/documents/upload/route.ts:11-13,28-33` - trusts client appraisalId
- `app/api/documents/[id]/route.ts:12-16` - deletes arbitrary blob URL

## Required Pattern
```typescript
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // CRITICAL: Verify ownership before ANY data access
  const appraisal = await db.query.appraisals.findFirst({
    where: and(
      eq(appraisals.id, params.id),
      eq(appraisals.userId, userId)
    ),
  });

  if (!appraisal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Safe to proceed
}
```

## For Comparables

Must join to appraisals table and verify userId before any CRUD operation.

## For Documents

Must verify document belongs to user's appraisal before upload/delete.

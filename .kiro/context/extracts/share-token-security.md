# Share Token Security

## Security Finding

**Vulnerable**: `app/api/appraisals/[id]/share/route.ts:40-47`

Creates base64 JSON token - unsigned, forgeable, no server verification route.

## Required Implementation

Use HMAC/JWT with server secret and explicit claims.

## Pattern
```typescript
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SHARE_TOKEN_SECRET);

// Generate secure share token
export async function createShareToken(appraisalId: string, expiryDays: number = 7) {
  const token = await new SignJWT({ appraisalId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${expiryDays}d`)
    .setIssuedAt()
    .sign(secret);
    
  return token;
}

// Verify share token
export async function verifyShareToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, appraisalId: payload.appraisalId };
  } catch (error) {
    return { valid: false };
  }
}
```

## Environment Variable

Add to `.env.local`:
```
SHARE_TOKEN_SECRET=<generate random 32-byte secret>
```

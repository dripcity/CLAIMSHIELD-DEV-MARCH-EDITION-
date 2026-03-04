import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_ROLE = 'individual';

async function upsertUserFromWebhook(event: WebhookEvent) {
  const userData = event.data as { id?: string; email_addresses?: { email_address: string }[] };
  const clerkId = userData.id;
  const email = userData.email_addresses?.[0]?.email_address;

  if (!clerkId || !email) {
    throw new Error('Invalid Clerk webhook payload');
  }

  const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));

  if (existingUser) {
    await db
      .update(users)
      .set({
        email,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId));

    return;
  }

  await db.insert(users).values({
    clerkId,
    email,
    role: DEFAULT_ROLE,
  });
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      await upsertUserFromWebhook(evt);
    }

    if (evt.type === 'user.deleted') {
      const deletedUser = evt.data as { id?: string };
      if (deletedUser.id) {
        await db.delete(users).where(eq(users.clerkId, deletedUser.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json({ error: 'Invalid Clerk webhook request' }, { status: 400 });
  }
}

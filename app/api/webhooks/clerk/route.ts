import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing userId or role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['individual', 'appraiser', 'attorney', 'body_shop', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (existingUser) {
      // Update existing user's role
      await db
        .update(users)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    } else {
      // Create new user with role - email will be populated by Clerk webhook
      await db.insert(users).values({
        clerkId: userId,
        email: `${userId}@clerk.user`,
        role,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user role:', error);
    return NextResponse.json(
      { error: 'Failed to save role' },
      { status: 500 }
    );
  }
}

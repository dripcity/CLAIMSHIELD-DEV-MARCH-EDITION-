import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { createCheckoutSession } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { planType } = await req.json();
    
    // Define prices using correct price IDs from .env
    const prices: Record<string, string | undefined> = {
      pro: process.env.STRIPE_PRICE_ID_PRO,
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    };
    
    const priceId = prices[planType as keyof typeof prices];
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }
    
    const session = await createCheckoutSession({
      userId: user.clerkId,
      email: user.email,
      planType,
      priceId,
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

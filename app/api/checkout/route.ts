import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { createCheckoutSession } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { planType } = await req.json();
    
    // Define prices
    const prices = {
      individual: process.env.STRIPE_INDIVIDUAL_PRICE_ID,
      professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
      attorney: process.env.STRIPE_ATTORNEY_PRICE_ID,
      body_shop: process.env.STRIPE_BODY_SHOP_PRICE_ID,
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

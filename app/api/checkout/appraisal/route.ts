import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { appraisalId } = await req.json();
    
    if (!appraisalId) {
      return NextResponse.json(
        { error: 'Appraisal ID is required' },
        { status: 400 }
      );
    }
    
    // Verify appraisal exists and belongs to user
    const [appraisal] = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId))
      .limit(1);
    
    if (!appraisal) {
      return NextResponse.json(
        { error: 'Appraisal not found' },
        { status: 404 }
      );
    }
    
    if (appraisal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get vehicle info for description
    const vehicle = appraisal.subjectVehicle as any;
    const vehicleDescription = vehicle 
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : 'Vehicle';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Diminished Value Appraisal Report',
              description: `Professional DV appraisal for ${vehicleDescription}`,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/report-preview.png`],
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        appraisalId,
        userId: user.clerkId,
        type: 'appraisal_report',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/${appraisalId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/${appraisalId}`,
    });
    
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    console.error('Appraisal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

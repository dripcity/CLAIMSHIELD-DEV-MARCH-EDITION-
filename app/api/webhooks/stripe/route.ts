import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { users, appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if it's a one-time purchase or subscription
      if (session.mode === 'payment') {
        // Check if this is an appraisal report purchase
        const appraisalId = session.metadata?.appraisalId;
        
        if (appraisalId) {
          // Update appraisal status to complete and mark as paid
          await db
            .update(appraisals)
            .set({
              status: 'complete',
              updatedAt: new Date(),
            })
            .where(eq(appraisals.id, appraisalId));
          
          console.log(`✅ Appraisal ${appraisalId} marked as paid`);
          
          // TODO: Trigger PDF generation if not already generated
          // TODO: Send email with report to customer
        } else {
          // One-time report credit purchase
          await db
            .update(users)
            .set({
              reportsRemaining: 1,
              stripeCustomerId: session.customer as string,
            })
            .where(eq(users.clerkId, session.metadata?.userId as string));
          
          console.log(`✅ Added report credit for user ${session.metadata?.userId}`);
        }
      } else if (session.mode === 'subscription') {
        // Subscription checkout completed
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        
        if (userId) {
          await db
            .update(users)
            .set({
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
            })
            .where(eq(users.clerkId, userId));
          
          console.log(`✅ Subscription activated for user ${userId} (${planType})`);
        }
      }
      break;
    }
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      
      console.log(`✅ Subscription ${subscription.id} updated: ${subscription.status}`);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await db
        .update(users)
        .set({
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string));
      
      console.log(`✅ Subscription ${subscription.id} canceled`);
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Update subscription status to active on successful payment
      await db
        .update(users)
        .set({
          subscriptionStatus: 'active',
        })
        .where(eq(users.stripeCustomerId, invoice.customer as string));
      
      console.log(`✅ Invoice ${invoice.id} paid successfully`);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      await db
        .update(users)
        .set({
          subscriptionStatus: 'past_due',
        })
        .where(eq(users.stripeCustomerId, invoice.customer as string));
      
      console.log(`❌ Invoice ${invoice.id} payment failed`);
      
      // TODO: Send email notification about failed payment
      break;
    }
    
    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

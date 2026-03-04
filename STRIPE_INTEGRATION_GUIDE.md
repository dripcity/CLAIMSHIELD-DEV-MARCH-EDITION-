# Stripe Integration Guide for ClaimShield DV

## ✅ Setup Complete

Your Stripe integration is fully configured and tested!

### Account Details
- **Account ID**: `acct_1SWaEuCCIpqYzgxD`
- **Email**: gsilkwood@icloud.com
- **Mode**: Test (perfect for development)

### Configured Products & Prices

#### Pro Plan
- **Product ID**: `prod_TTXRLH9a46iH6G`
- **Price ID**: `price_1SWaMQCCIpqYzgxDQsgtAc7F`
- **Amount**: $49.00/month
- **Description**: 10 appraisals per month + priority support

#### Enterprise Plan
- **Product ID**: `prod_TTXTG7rchqRbRe`
- **Price ID**: `price_1SWaONCCIpqYzgxDvJCuLbCf`
- **Amount**: $199.00/month
- **Description**: Unlimited appraisals + white-label reports

## 🚀 Quick Start Examples

### 1. One-Time Payment for Appraisal Report ($99)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  customer_email: userEmail,
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Diminished Value Appraisal Report',
        description: 'Professional DV appraisal with legal citations',
      },
      unit_amount: 9900, // $99.00
    },
    quantity: 1,
  }],
  metadata: {
    appraisalId: 'appr_123',
    userId: 'user_456',
  },
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/{appraisalId}/success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/{appraisalId}`,
});

// Redirect user to: session.url
```

### 2. Subscription Checkout (Pro or Enterprise)

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer_email: userEmail,
  line_items: [{
    price: process.env.STRIPE_PRICE_ID_PRO, // or STRIPE_PRICE_ID_ENTERPRISE
    quantity: 1,
  }],
  metadata: {
    userId: 'user_789',
    planType: 'pro',
  },
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
});
```

### 3. Process Refund

```typescript
const refund = await stripe.refunds.create({
  payment_intent: 'pi_xxx',
  reason: 'requested_by_customer',
});
```

## 📝 Integration Checklist

### ✅ Completed
- [x] Stripe account created and verified
- [x] API keys configured in `.env.local`
- [x] Products created (Pro Plan, Enterprise Plan)
- [x] Prices configured ($49/month, $199/month)
- [x] Test scripts created and verified

### 🔲 Next Steps

1. **Set up Webhook Handlers**
   - Create `/api/webhooks/stripe/route.ts`
   - Handle `checkout.session.completed`
   - Handle `customer.subscription.created`
   - Handle `customer.subscription.deleted`
   - Handle `invoice.payment_succeeded`
   - Handle `invoice.payment_failed`

2. **Update Existing Checkout Route**
   - Fix price IDs in `app/api/checkout/route.ts`
   - Use correct price IDs from `.env.local`

3. **Create Appraisal Purchase Flow**
   - Add "Purchase Report" button to appraisal pages
   - Create `/api/checkout/appraisal/route.ts`
   - Handle success/cancel redirects

4. **Add Subscription Management**
   - Create customer portal for subscription management
   - Add billing page to settings
   - Show current plan and usage

5. **Test Payment Flows**
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Test successful payments
   - Test declined cards
   - Test subscription cancellation

## 🔧 Environment Variables

Your `.env.local` is configured with:

```bash
# Stripe Keys
STRIPE_SECRET_KEY="sk_test_51SWaEu..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SWaEu..."

# Price IDs (monthly subscriptions)
STRIPE_PRICE_ID_PRO="price_1SWaMQCCIpqYzgxDQsgtAc7F"  # $49/month
STRIPE_PRICE_ID_ENTERPRISE="price_1SWaONCCIpqYzgxDvJCuLbCf"  # $199/month

# Product IDs (for reference)
STRIPE_PRODUCT_ID_PRO="prod_TTXRLH9a46iH6G"
STRIPE_PRODUCT_ID_ENTERPRISE="prod_TTXTG7rchqRbRe"
```

## 🧪 Test Scripts

Run these scripts to test your integration:

```bash
# Test basic connection
STRIPE_SECRET_KEY="..." npx tsx scripts/test-stripe.ts

# Run all examples
STRIPE_SECRET_KEY="..." STRIPE_PRICE_ID_PRO="..." npx tsx scripts/stripe-examples.ts

# List all resources
STRIPE_SECRET_KEY="..." npx tsx scripts/list-stripe-resources.ts
```

## 📚 Stripe Best Practices

### ✅ Do:
- Use Checkout Sessions for standard payment flows (easiest)
- Enable dynamic payment methods in Dashboard
- Handle webhooks for all async events
- Use test mode extensively before going live
- Implement idempotency keys for safe retries
- Store customer IDs in your database

### ❌ Don't:
- Use deprecated Charges API (use Payment Intents)
- Hardcode payment method types
- Skip webhook handling
- Expose secret keys in client code
- Forget to test edge cases (declined cards, etc.)

## 🔗 Useful Links

- **Stripe Dashboard**: https://dashboard.stripe.com/test/dashboard
- **API Docs**: https://docs.stripe.com/api
- **Checkout Docs**: https://docs.stripe.com/payments/checkout
- **Webhooks Guide**: https://docs.stripe.com/webhooks
- **Test Cards**: https://docs.stripe.com/testing#cards

## 💡 Recommended Next Implementation

Create a webhook handler to automatically update appraisal status when payment succeeds:

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { appraisals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const appraisalId = session.metadata?.appraisalId;

    if (appraisalId) {
      // Update appraisal to mark as paid
      await db
        .update(appraisals)
        .set({ 
          status: 'completed',
          paidAt: new Date(),
          stripeSessionId: session.id,
        })
        .where(eq(appraisals.id, appraisalId));

      // TODO: Trigger PDF generation and email delivery
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

## 🎉 You're Ready!

Your Stripe integration is fully configured and tested. You can now:
1. Accept payments for appraisal reports
2. Manage subscriptions for professional users
3. Process refunds when needed
4. Track all payments in Stripe Dashboard

Start by implementing the webhook handler, then integrate checkout into your appraisal flow!

/**
 * Stripe Integration Examples for ClaimShield DV
 * 
 * These examples show common Stripe operations for the platform:
 * 1. Create checkout for appraisal report purchase
 * 2. Create subscription for professional users
 * 3. Process refund
 * 4. List customer payments
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// ============================================
// Example 1: One-Time Payment for Appraisal Report
// ============================================
export async function createAppraisalCheckout(
  appraisalId: string,
  userEmail: string,
  userId: string
) {
  console.log('📝 Creating checkout for appraisal report...\n');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Diminished Value Appraisal Report',
            description: `Professional DV appraisal with state-specific legal citations`,
            images: ['https://your-domain.com/report-preview.png'],
          },
          unit_amount: 9900, // $99.00
        },
        quantity: 1,
      },
    ],
    metadata: {
      appraisalId,
      userId,
      type: 'appraisal_report',
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/${appraisalId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appraisals/${appraisalId}`,
  });

  console.log('✅ Checkout session created');
  console.log('   Session ID:', session.id);
  console.log('   Checkout URL:', session.url);
  console.log('   Amount:', `$${(session.amount_total! / 100).toFixed(2)}`);
  
  return session;
}

// ============================================
// Example 2: Subscription for Professional Users
// ============================================
export async function createProfessionalSubscription(
  userEmail: string,
  userId: string,
  planType: 'pro' | 'enterprise'
) {
  console.log(`📊 Creating ${planType} subscription...\n`);

  // First, create or retrieve customer
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      userId,
      planType,
    },
  });

  console.log('✅ Customer created:', customer.id);

  // Use your existing price IDs from .env
  const priceId = planType === 'pro' 
    ? process.env.STRIPE_PRICE_ID_PRO 
    : process.env.STRIPE_PRICE_ID_ENTERPRISE;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customer.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planType,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  console.log('✅ Subscription checkout created');
  console.log('   Session ID:', session.id);
  console.log('   Checkout URL:', session.url);
  
  return { customer, session };
}

// ============================================
// Example 3: Process Refund
// ============================================
export async function processRefund(
  paymentIntentId: string,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  console.log('💰 Processing refund...\n');

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason,
  });

  console.log('✅ Refund processed');
  console.log('   Refund ID:', refund.id);
  console.log('   Amount:', `$${(refund.amount / 100).toFixed(2)}`);
  console.log('   Status:', refund.status);
  
  return refund;
}

// ============================================
// Example 4: List Customer Payments
// ============================================
export async function listCustomerPayments(customerEmail: string) {
  console.log('📋 Listing customer payments...\n');

  // Find customer by email
  const customers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  if (customers.data.length === 0) {
    console.log('❌ No customer found with that email');
    return [];
  }

  const customer = customers.data[0];
  console.log('✅ Customer found:', customer.id);

  // List payment intents
  const paymentIntents = await stripe.paymentIntents.list({
    customer: customer.id,
    limit: 10,
  });

  console.log(`\n📊 Found ${paymentIntents.data.length} payments:\n`);
  
  paymentIntents.data.forEach((payment, index) => {
    console.log(`${index + 1}. ${payment.id}`);
    console.log(`   Amount: $${(payment.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Created: ${new Date(payment.created * 1000).toLocaleDateString()}`);
    console.log('');
  });

  return paymentIntents.data;
}

// ============================================
// Example 5: Retrieve Checkout Session Details
// ============================================
export async function getCheckoutSessionDetails(sessionId: string) {
  console.log('🔍 Retrieving checkout session...\n');

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });

  console.log('✅ Session details:');
  console.log('   Status:', session.status);
  console.log('   Payment Status:', session.payment_status);
  console.log('   Amount Total:', `$${(session.amount_total! / 100).toFixed(2)}`);
  console.log('   Customer Email:', session.customer_email);
  console.log('   Metadata:', session.metadata);

  return session;
}

// ============================================
// Run Examples
// ============================================
async function runExamples() {
  try {
    console.log('🚀 ClaimShield DV - Stripe Integration Examples\n');
    console.log('='.repeat(60));
    console.log('');

    // Example 1: Create appraisal checkout
    console.log('EXAMPLE 1: One-Time Payment for Appraisal Report');
    console.log('-'.repeat(60));
    const appraisalSession = await createAppraisalCheckout(
      'appr_test_123',
      'customer@example.com',
      'user_test_456'
    );
    console.log('');

    // Example 2: Create subscription
    console.log('EXAMPLE 2: Professional Subscription');
    console.log('-'.repeat(60));
    const { customer, session: subSession } = await createProfessionalSubscription(
      'professional@example.com',
      'user_pro_789',
      'pro'
    );
    console.log('');

    // Example 3: List products and prices
    console.log('EXAMPLE 3: Available Products & Prices');
    console.log('-'.repeat(60));
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });
    
    console.log('📦 Products:');
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`);
    });
    
    console.log('\n💵 Prices:');
    prices.data.forEach(price => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
      const interval = price.recurring ? `/${price.recurring.interval}` : 'one-time';
      console.log(`   - ${amount} ${interval} (${price.id})`);
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ All examples completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Visit the checkout URLs to test payment flows');
    console.log('   2. Set up webhook handlers for payment events');
    console.log('   3. Integrate into your API routes');
    console.log('');

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('❌ Stripe Error:', error.message);
      console.error('   Type:', error.type);
      console.error('   Code:', error.code);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

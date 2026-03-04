/**
 * Test script to verify Stripe integration
 * Run with: node --env-file=.env.local -r tsx/cjs scripts/test-stripe.ts
 * Or: npx tsx --env-file=.env.local scripts/test-stripe.ts
 */

import Stripe from 'stripe';

// Load from environment
const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment');
  console.error('   Make sure .env.local is loaded');
  process.exit(1);
}

const stripe = new Stripe(apiKey, {
  apiVersion: '2026-02-25.clover',
});

async function testStripeConnection() {
  console.log('🔍 Testing Stripe connection...\n');

  try {
    // Test 1: Retrieve account details
    console.log('Test 1: Retrieving account details...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Account ID:', account.id);
    console.log('✅ Account Email:', account.email);
    console.log('✅ Account Type:', account.type);
    console.log('✅ Charges Enabled:', account.charges_enabled);
    console.log('✅ Payouts Enabled:', account.payouts_enabled);
    console.log();

    // Test 2: List products
    console.log('Test 2: Listing products...');
    const products = await stripe.products.list({ limit: 5 });
    console.log(`✅ Found ${products.data.length} products`);
    products.data.forEach((product) => {
      console.log(`   - ${product.name} (${product.id})`);
    });
    console.log();

    // Test 3: List prices
    console.log('Test 3: Listing prices...');
    const prices = await stripe.prices.list({ limit: 5 });
    console.log(`✅ Found ${prices.data.length} prices`);
    prices.data.forEach((price) => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
      console.log(`   - ${amount} ${price.currency.toUpperCase()} (${price.id})`);
    });
    console.log();

    // Test 4: Create a test checkout session
    console.log('Test 4: Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'DV Appraisal Report - Test',
              description: 'Test diminished value appraisal report',
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
    });
    console.log('✅ Checkout session created:', session.id);
    console.log('✅ Checkout URL:', session.url);
    console.log();

    console.log('🎉 All tests passed! Stripe is configured correctly.\n');
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

testStripeConnection();

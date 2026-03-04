/**
 * List all Stripe resources to understand what's configured
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

async function listResources() {
  console.log('📋 Stripe Resources for ClaimShield DV\n');
  console.log('='.repeat(60));

  // List products
  console.log('\n📦 PRODUCTS:');
  console.log('-'.repeat(60));
  const products = await stripe.products.list({ limit: 10 });
  products.data.forEach(product => {
    console.log(`\nName: ${product.name}`);
    console.log(`ID: ${product.id}`);
    console.log(`Active: ${product.active}`);
    console.log(`Description: ${product.description || 'N/A'}`);
  });

  // List prices
  console.log('\n\n💵 PRICES:');
  console.log('-'.repeat(60));
  const prices = await stripe.prices.list({ limit: 10 });
  prices.data.forEach(price => {
    const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
    const interval = price.recurring ? `/${price.recurring.interval}` : 'one-time';
    console.log(`\nPrice ID: ${price.id}`);
    console.log(`Product: ${price.product}`);
    console.log(`Amount: ${amount} ${interval}`);
    console.log(`Currency: ${price.currency.toUpperCase()}`);
    console.log(`Active: ${price.active}`);
  });

  // List customers
  console.log('\n\n👥 CUSTOMERS:');
  console.log('-'.repeat(60));
  const customers = await stripe.customers.list({ limit: 5 });
  console.log(`Total customers: ${customers.data.length}`);
  customers.data.forEach(customer => {
    console.log(`\nCustomer ID: ${customer.id}`);
    console.log(`Email: ${customer.email || 'N/A'}`);
    console.log(`Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Resource listing complete\n');
}

listResources().catch(console.error);

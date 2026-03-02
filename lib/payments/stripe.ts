import Stripe from 'stripe';

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

export async function createCheckoutSession({
  userId,
  email,
  planType,
  priceId,
}: {
  userId: string;
  email: string;
  planType: 'individual' | 'professional' | 'attorney' | 'body_shop';
  priceId: string;
}) {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: planType === 'individual' ? 'payment' : 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: {
      userId,
      planType,
    },
    customer_email: email,
  });

  return session;
}

export async function createCustomer({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const customer = await getStripe().customers.create({
    email,
    name,
  });

  return customer;
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}

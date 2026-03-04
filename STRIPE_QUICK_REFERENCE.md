# Stripe Integration Quick Reference

## 🚀 Quick Start

### Test a Purchase Flow
1. Start dev server: `npm run dev`
2. Create an appraisal at `/appraisals/new`
3. Complete the wizard
4. Click "Purchase Report ($99)"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify redirect to success page

### Test Webhook Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

## 📋 API Endpoints

### Create Appraisal Checkout
```typescript
POST /api/checkout/appraisal
Body: { appraisalId: string }
Returns: { url: string, sessionId: string }
```

### Create Subscription Checkout
```typescript
POST /api/checkout
Body: { planType: 'pro' | 'enterprise' }
Returns: { url: string }
```

### Webhook Handler
```typescript
POST /api/webhooks/stripe
Headers: { 'stripe-signature': string }
Body: Stripe Event
```

## 💳 Test Cards

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Card declined |
| Auth Required | 4000 0025 0000 3155 | Requires 3D Secure |
| Insufficient Funds | 4000 0000 0000 9995 | Insufficient funds |

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any 5 digits

## 🔑 Environment Variables

```bash
# Required
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Price IDs
STRIPE_PRICE_ID_PRO="price_1SWaMQCCIpqYzgxDQsgtAc7F"
STRIPE_PRICE_ID_ENTERPRISE="price_1SWaONCCIpqYzgxDvJCuLbCf"

# Webhook (add after setup)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📊 Pricing

| Product | Price | Interval | Price ID |
|---------|-------|----------|----------|
| Appraisal Report | $99.00 | One-time | Created dynamically |
| Pro Plan | $49.00 | Monthly | price_1SWaMQCCIpqYzgxDQsgtAc7F |
| Enterprise Plan | $199.00 | Monthly | price_1SWaONCCIpqYzgxDvJCuLbCf |

## 🎯 Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark appraisal as paid, activate subscription |
| `customer.subscription.created` | Update user subscription status |
| `customer.subscription.updated` | Sync subscription changes |
| `customer.subscription.deleted` | Mark subscription as canceled |
| `invoice.payment_succeeded` | Confirm successful payment |
| `invoice.payment_failed` | Mark account as past_due |

## 🔍 Debugging

### Check Webhook Logs
```bash
# Stripe Dashboard
https://dashboard.stripe.com/test/webhooks

# Application logs
# Look for console.log in app/api/webhooks/stripe/route.ts
```

### View Payments
```bash
# Stripe Dashboard
https://dashboard.stripe.com/test/payments

# Or use CLI
stripe payments list --limit 10
```

### Test Webhook Locally
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

## 🛠️ Common Tasks

### Create a Test Checkout Session
```bash
STRIPE_SECRET_KEY="..." \
STRIPE_PRICE_ID_PRO="..." \
NEXT_PUBLIC_APP_URL="http://localhost:3000" \
npx tsx scripts/stripe-examples.ts
```

### List All Resources
```bash
STRIPE_SECRET_KEY="..." \
npx tsx scripts/list-stripe-resources.ts
```

### Verify Connection
```bash
STRIPE_SECRET_KEY="..." \
npx tsx scripts/test-stripe.ts
```

## 📱 User Journey

### Purchase Flow
```
User completes appraisal
    ↓
Clicks "Purchase Report ($99)"
    ↓
Redirected to Stripe Checkout
    ↓
Enters payment details
    ↓
Payment processed
    ↓
Webhook updates database
    ↓
Redirected to success page
    ↓
PDF generated & emailed
```

### Subscription Flow
```
User selects plan
    ↓
Redirected to Stripe Checkout
    ↓
Enters payment details
    ↓
Subscription created
    ↓
Webhook updates user status
    ↓
Monthly billing begins
```

## 🚨 Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check webhook is enabled in Stripe Dashboard
4. Use Stripe CLI to test locally

### Payment Not Updating Database
1. Check webhook handler logs
2. Verify metadata includes `appraisalId` or `userId`
3. Check database connection
4. Verify user/appraisal exists

### Checkout Session Creation Fails
1. Verify API keys are correct
2. Check price IDs exist
3. Verify user is authenticated
4. Check appraisal ownership

## 📚 Resources

- **Stripe Dashboard**: https://dashboard.stripe.com/test
- **API Docs**: https://docs.stripe.com/api
- **Checkout Guide**: https://docs.stripe.com/payments/checkout
- **Webhook Guide**: https://docs.stripe.com/webhooks
- **Test Cards**: https://docs.stripe.com/testing#cards

## ✅ Pre-Launch Checklist

- [ ] Test complete purchase flow
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Verify webhook events are received
- [ ] Test with all test cards
- [ ] Set up production webhook endpoint
- [ ] Switch to live API keys
- [ ] Test in production environment
- [ ] Monitor first real transactions
- [ ] Set up payment failure alerts

# Pricing Requirements

## Individual Report Pricing

**CRITICAL**: Individual appraisal report checkout MUST charge **$129.00**.

**Current (WRONG)**: `app/api/checkout/appraisal/route.ts:64` has `unit_amount: 9900`

**Required**:
```typescript
const lineItem = {
  price_data: {
    currency: 'usd',
    unit_amount: 12900, // $129.00
    product_data: {
      name: 'Diminished Value Appraisal Report',
    },
  },
  quantity: 1,
};
```

## Subscription Plans

**Current (WRONG)**: `app/api/checkout/route.ts:11-14` only has `pro/enterprise`

**Required**: Four role-based plans:
1. `individual`
2. `professional`
3. `attorney`
4. `body_shop`

## Environment Variables
```bash
STRIPE_PRICE_INDIVIDUAL=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ATTORNEY=price_...
STRIPE_PRICE_BODY_SHOP=price_...
```

## Implementation

Create price constants in `lib/payments/stripe.ts`:
```typescript
export const PRICING = {
  INDIVIDUAL_REPORT: 12900, // $129.00
  PLANS: {
    individual: process.env.STRIPE_PRICE_INDIVIDUAL!,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
    attorney: process.env.STRIPE_PRICE_ATTORNEY!,
    body_shop: process.env.STRIPE_PRICE_BODY_SHOP!,
  }
};
```

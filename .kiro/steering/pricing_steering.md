---
title: Pricing & Monetization Requirements
inclusion: auto
description: Stripe pricing, plan model, and checkout requirements. Use when working on payment/subscription features.
---

# Pricing & Monetization Requirements

## Individual Report Pricing

**CRITICAL**: Individual appraisal report checkout MUST charge **$129.00**.

Stripe Configuration:
- Amount: `12900` (cents)
- Currency: `usd`
- Product: Individual Diminished Value Report

Code Reference:
```typescript
// app/api/checkout/appraisal/route.ts
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

## Subscription Plan Model

**CRITICAL**: Four role-based subscription plans are required:

1. **Individual** - Consumer self-service
   - Price: TBD (confirm with stakeholder)
   - Features: Basic wizard, single report generation

2. **Professional Appraiser** - USPAP-compliant professionals
   - Price: TBD
   - Features: Expert affidavit generation, credentials management

3. **Attorney** - Law firms and paralegals
   - Price: TBD
   - Features: Team management, bulk download, all templates

4. **Body Shop** - White-label for repair facilities
   - Price: TBD
   - Features: White-label branding, customer portal

## Stripe Environment Configuration

Required environment variables:
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (set after creating products in Stripe Dashboard)
STRIPE_PRICE_INDIVIDUAL=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ATTORNEY=price_...
STRIPE_PRICE_BODY_SHOP=price_...
```

## Webhook Fulfillment Requirements

Post-payment actions (CS-LR-010):
1. **Idempotency**: Store processed event IDs to prevent double-processing
2. **Report Generation**: Trigger PDF generation workflow on `checkout.session.completed`
3. **Email Delivery**: Send report-ready notification when PDF available
4. **Entitlement**: Update user record with purchased report access

## Tasks Affected

- CS-LR-008: Individual report pricing alignment
- CS-LR-009: Subscription plan model alignment
- CS-LR-010: Webhook fulfillment implementation

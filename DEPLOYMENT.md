# ClaimShield DV - Deployment Guide

This guide covers deploying the ClaimShield DV platform to production.

## Prerequisites

- Vercel account
- Neon PostgreSQL account
- Clerk account (configured)
- Stripe account (configured)
- SendGrid account
- Google Cloud account (for Gemini API)
- Apify account
- Custom domain (optional)

## Environment Variables

### Required Environment Variables

Create a `.env.local` file (for local development) or configure these in Vercel dashboard (for production):

```bash
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# AI (Google Gemini)
GEMINI_API_KEY="AIza..."

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Web Scraping (Apify)
APIFY_API_TOKEN="apify_api_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_... or sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_... or pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SendGrid)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="reports@claimshield-dv.com"

# Application
NEXT_PUBLIC_APP_URL="https://claimshield-dv.com"
NODE_ENV="production"
```

### Environment Variable Security

**CRITICAL**: Never commit `.env.local` to version control. The following variables must NEVER be exposed to client-side code:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `GEMINI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `APIFY_API_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`

Only variables prefixed with `NEXT_PUBLIC_` are safe to expose to the client.

## Database Setup

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: "ClaimShield DV Production"
3. Copy the connection string
4. Add to environment variables as `DATABASE_URL`

### 2. Run Database Migrations

```bash
# Install dependencies
npm install

# Generate migration files (if not already generated)
npm run db:generate

# Run migrations
npm run db:migrate

# Verify schema
npm run db:studio
```

### 3. Database Indexes

The following indexes are automatically created by the schema:

- `appraisals_user_id_idx` - Index on user_id for fast user queries
- `appraisals_status_idx` - Index on status for filtering
- `comparables_appraisal_id_idx` - Index on appraisal_id for joins

## Third-Party Service Setup

### Clerk (Authentication)

1. Create application in [Clerk Dashboard](https://dashboard.clerk.com)
2. Configure sign-in/sign-up options
3. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to `user.created` event
5. Copy webhook signing secret
6. Add API keys to environment variables

### Stripe (Payments)

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com):
   - Individual Report: $129 (one-time payment)
   - Professional Plan: $299/month (subscription)
   - Attorney Plan: $499/month (subscription)
   - Body Shop Plan: $399/month (subscription)

2. Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. Copy webhook signing secret
5. Add API keys to environment variables

### SendGrid (Email)

1. Create account at [SendGrid](https://sendgrid.com)
2. Verify sender email: `reports@claimshield-dv.com`
3. Create API key with "Mail Send" permissions
4. Add to environment variables

### Google Gemini (AI)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Enable Gemini API
4. Add to environment variables

### Apify (Web Scraping)

1. Create account at [Apify](https://apify.com)
2. Create API token
3. Add to environment variables

### Vercel Blob (File Storage)

1. Blob storage is automatically provisioned with Vercel deployment
2. Token is available in Vercel dashboard under Storage
3. Add to environment variables

## Vercel Deployment

### 1. Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Configure Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import Git repository
3. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

1. Add all required environment variables
2. Set appropriate environments (Production, Preview, Development)
3. Mark sensitive variables as "Sensitive" to hide values

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

### 5. Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add custom domain: `claimshield-dv.com`
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

## Post-Deployment Verification

### 1. Health Checks

- [ ] Homepage loads correctly
- [ ] Sign-in/sign-up flows work
- [ ] Dashboard is accessible after authentication
- [ ] Database connections are working
- [ ] File uploads work
- [ ] Stripe checkout works
- [ ] Webhooks are receiving events

### 2. Test Critical Flows

- [ ] Create new appraisal
- [ ] Upload documents
- [ ] Generate PDF report
- [ ] Process payment
- [ ] Send email

### 3. Monitor Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

## Monitoring and Logging

### Error Tracking (Sentry - Recommended)

1. Create account at [Sentry](https://sentry.io)
2. Create new project for Next.js
3. Install Sentry SDK:

```bash
npm install @sentry/nextjs
```

4. Initialize Sentry:

```bash
npx @sentry/wizard@latest -i nextjs
```

5. Configure `sentry.client.config.ts` and `sentry.server.config.ts`

### Application Monitoring

Vercel provides built-in monitoring:

- Analytics: Track page views and performance
- Speed Insights: Monitor Core Web Vitals
- Logs: View function execution logs

Access via Vercel Dashboard → Analytics/Logs

### Log Aggregation

For production, consider:

- **Datadog**: Full-stack monitoring
- **LogRocket**: Session replay and error tracking
- **New Relic**: Application performance monitoring

## Database Migrations

### Running Migrations in Production

```bash
# Generate new migration
npm run db:generate

# Review migration file in drizzle/migrations/

# Apply migration to production
DATABASE_URL="production-url" npm run db:migrate
```

### Rollback Strategy

1. Keep migration files in version control
2. Test migrations in staging environment first
3. Create database backups before migrations
4. Have rollback SQL scripts ready

## Backup Strategy

### Database Backups

Neon provides automatic backups:

- Point-in-time recovery (7 days)
- Manual snapshots available

To create manual backup:

1. Go to Neon Console
2. Select project
3. Click "Backups"
4. Create snapshot

### File Storage Backups

Vercel Blob is redundant and durable, but consider:

- Regular exports of critical files
- Backup to S3 or similar service
- Document retention policy

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Sensitive keys are not exposed to client
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Webhook signatures are validated
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] CSP headers are set
- [ ] Database uses SSL connections
- [ ] File uploads are validated
- [ ] User input is sanitized

## Performance Optimization

### Vercel Configuration

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Caching Strategy

- Static assets: Cached by Vercel CDN
- API routes: Implement caching where appropriate
- Database queries: Use connection pooling

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Verify SSL mode is set

**Webhook Failures**
- Check webhook URLs are correct
- Verify webhook secrets match
- Check webhook endpoint logs

**File Upload Errors**
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check file size limits
- Verify file type validation

**Payment Errors**
- Verify Stripe keys are correct (test vs live)
- Check webhook is receiving events
- Verify product IDs match

### Getting Help

- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/docs
- Clerk Support: https://clerk.com/support
- Stripe Support: https://support.stripe.com

## Rollback Procedure

If deployment fails:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific deployment
vercel --prod [deployment-url]
```

## Maintenance

### Regular Tasks

- Monitor error rates in Sentry
- Review Vercel analytics weekly
- Check database performance metrics
- Update dependencies monthly
- Review and rotate API keys quarterly
- Test backup restoration quarterly

### Scaling Considerations

- Neon: Upgrade to higher tier for more connections
- Vercel: Pro plan for better performance
- Consider CDN for static assets
- Implement Redis for caching if needed

## Support Contacts

- Technical Lead: [email]
- DevOps: [email]
- On-call: [phone]

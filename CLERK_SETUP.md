# Clerk Authentication Setup Guide

This guide walks you through setting up Clerk authentication for ClaimShield DV.

## Prerequisites

- A Clerk account (sign up at https://clerk.com)
- Node.js and npm installed
- ClaimShield DV project cloned locally

## Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add application"
3. Name it "ClaimShield DV" (or your preferred name)
4. Choose your authentication methods:
   - ✅ Email/Password (recommended)
   - ✅ Google OAuth (recommended for professional users)
   - ✅ Microsoft OAuth (recommended for attorneys/businesses)
   - Optional: GitHub, LinkedIn, etc.
5. Click "Create application"

## Step 2: Get Your API Keys

From your Clerk Dashboard:

1. Go to "API Keys" in the sidebar
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Step 3: Configure Clerk Webhooks

Webhooks sync user data between Clerk and your database.

### Local Development (using ngrok or similar)

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. In another terminal, expose it: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Configure Webhook in Clerk Dashboard

1. Go to "Webhooks" in Clerk Dashboard
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - Local: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click "Create"
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET="whsec_..."
```

## Step 4: Configure User Metadata

Set up custom fields for user roles:

1. Go to "User & Authentication" → "Metadata" in Clerk Dashboard
2. Add a public metadata field:
   - Key: `role`
   - Type: `string`
   - Default value: `individual`
   - Allowed values: `individual`, `appraiser`, `attorney`, `body_shop`, `admin`

## Step 5: Customize Sign-In/Sign-Up Pages (Optional)

1. Go to "Customization" → "Pages" in Clerk Dashboard
2. Customize colors to match ClaimShield DV brand:
   - Primary color: `#2563EB` (blue-600)
   - Background: `#F9FAFB` (gray-50)
3. Add your logo
4. Customize text and labels

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/sign-up`
3. Create a test account
4. Verify:
   - User is created in Clerk Dashboard
   - User appears in your database (check `users` table)
   - You're redirected to `/onboarding`
   - You can access protected routes

## Step 7: Set Up Role-Based Access

After sign-up, users need to select their role during onboarding:

1. Visit `/onboarding` after signing up
2. Select a role (individual, appraiser, attorney, body_shop)
3. The role is saved to the database
4. Different roles have different permissions (see `lib/utils/rbac.ts`)

## Environment Variables Checklist

Make sure your `.env.local` has all these Clerk variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Clerk URLs (default values, usually don't need to change)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"
```

## Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add all Clerk variables (use production keys)

2. Update webhook URL in Clerk Dashboard:
   - Change from ngrok URL to your production domain
   - Example: `https://claimshield-dv.vercel.app/api/webhooks/clerk`

3. Test production deployment:
   - Sign up with a new account
   - Verify webhook events are received
   - Check database for user creation

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct and accessible
2. Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
3. Check webhook logs in Clerk Dashboard → Webhooks → Your Endpoint
4. For local development, ensure ngrok is running

### User Not Created in Database

1. Check webhook is configured and receiving events
2. Verify database connection string is correct
3. Check server logs for errors
4. Ensure `users` table exists (run migrations)

### Authentication Errors

1. Verify API keys are correct (no extra spaces)
2. Check keys match your environment (test vs production)
3. Clear browser cache and cookies
4. Check middleware.ts is properly configured

### Protected Routes Not Working

1. Verify middleware.ts exists in project root
2. Check route is not in `isPublicRoute` matcher
3. Ensure ClerkProvider wraps your app in layout.tsx
4. Check browser console for errors

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use test keys in development** - Switch to production keys only in production
3. **Rotate keys regularly** - Especially if they're exposed
4. **Verify webhook signatures** - The webhook handler does this automatically
5. **Use HTTPS in production** - Required for Clerk webhooks
6. **Limit webhook retries** - Configure in Clerk Dashboard

## Role-Based Access Control (RBAC)

ClaimShield DV uses custom RBAC with these roles:

- **individual**: Basic users, can create their own appraisals
- **appraiser**: Professional appraisers, can create appraisals for clients
- **attorney**: Legal professionals, can manage team and client appraisals
- **body_shop**: Repair facilities, can create appraisals for customers
- **admin**: Full system access

Permissions are defined in `lib/utils/rbac.ts`.

## Next Steps

After Clerk is set up:

1. Test user sign-up and sign-in flows
2. Verify role selection in onboarding
3. Test protected routes and permissions
4. Set up Stripe integration for payments
5. Configure email notifications via SendGrid

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- ClaimShield DV Issues: [Your GitHub repo]

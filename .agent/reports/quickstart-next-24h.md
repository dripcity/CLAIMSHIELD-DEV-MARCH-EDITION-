# ClaimShield DV - Next 24 Hours Quick Start Guide

**Generated**: March 2, 2026  
**Target Audience**: Development Team  
**Goal**: Get from 85% to 90% complete in 24 hours

---

## Hour 1-2: Environment Setup (Critical Path)

### Task 1.1: Database Configuration (30 min)
```bash
# 1. Create production Neon database
# Visit: https://console.neon.tech
# Create new project: "claimshield-dv-prod"
# Copy connection string

# 2. Update .env.local
DATABASE_URL="postgresql://user:pass@endpoint.neon.tech/claimshield_dv?sslmode=require"

# 3. Run migrations
npm run db:push

# 4. Verify tables created
npm run db:studio
# Check: users, appraisals, comparable_vehicles tables exist
```

### Task 1.2: Clerk Authentication (30 min)
```bash
# 1. Create Clerk application
# Visit: https://dashboard.clerk.com
# Create application: "ClaimShield DV Production"

# 2. Configure OAuth providers (optional)
# - Google
# - GitHub
# - Apple

# 3. Set up webhook
# Endpoint: https://your-domain.com/api/webhooks/clerk
# Events: user.created, user.updated

# 4. Update .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# 5. Test authentication
npm run dev
# Visit: http://localhost:3000/sign-in
# Create test account
# Verify user created in database
```

### Task 1.3: Vercel Blob Storage (15 min)
```bash
# 1. Enable Vercel Blob
# Visit: https://vercel.com/dashboard
# Project Settings → Storage → Enable Blob

# 2. Generate token
# Copy BLOB_READ_WRITE_TOKEN

# 3. Update .env.local
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# 4. Test upload
# Use dashboard to upload a test file
# Verify file appears in Vercel Blob dashboard
```

### Task 1.4: Quick Verification (15 min)
```bash
# Run build to verify no errors
npm run build

# Run tests
npm test

# Start dev server
npm run dev

# Test critical paths:
# 1. Sign in works
# 2. Dashboard loads
# 3. Can create new appraisal
# 4. Can upload files
```

**Checkpoint 1**: ✓ Core infrastructure working

---

## Hour 3-4: AI & External Services (High Priority)

### Task 2.1: Google Gemini API (20 min)
```bash
# 1. Get API key
# Visit: https://ai.google.dev
# Create API key for Gemini 3.1 Pro

# 2. Update .env.local
GOOGLE_GEMINI_API_KEY="AIza..."

# 3. Test extraction (create test file)
# app/api/test-gemini/route.ts
```

```typescript
// app/api/test-gemini/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent('Say "Gemini API working!"');
    const response = await result.response;
    
    return NextResponse.json({ 
      success: true, 
      message: response.text() 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

```bash
# 4. Test endpoint
curl http://localhost:3000/api/test-gemini
# Should return: {"success":true,"message":"Gemini API working!"}

# 5. Delete test file after verification
rm app/api/test-gemini/route.ts
```

### Task 2.2: Apify Configuration (20 min)
```bash
# 1. Create Apify account
# Visit: https://console.apify.com
# Sign up for free tier

# 2. Get API token
# Settings → Integrations → API Token

# 3. Update .env.local
APIFY_API_TOKEN="apify_api_..."

# 4. Test with mock data first
USE_MOCK_SCRAPING=true

# 5. Verify comparable search works
# Create appraisal → Step 5 → Auto-search
# Should return mock data
```

### Task 2.3: Stripe Setup (30 min)
```bash
# 1. Create Stripe account (if not exists)
# Visit: https://dashboard.stripe.com

# 2. Create products (Test Mode first)
# Products:
# - Individual Report: $129 one-time
# - Professional Plan: $299/month subscription
# - Attorney Plan: $499/month subscription
# - Body Shop Plan: $399/month subscription

# 3. Copy Price IDs
# Save all price IDs from Stripe dashboard

# 4. Update .env.local
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# 5. Set up webhook
# Endpoint: https://your-domain.com/api/webhooks/stripe
# Events: 
# - checkout.session.completed
# - customer.subscription.updated
# - customer.subscription.deleted
# - invoice.payment_failed

STRIPE_WEBHOOK_SECRET="whsec_..."

# 6. Test checkout flow
# Dashboard → Buy Report
# Use test card: 4242 4242 4242 4242
# Verify payment completes
# Verify reportsRemaining incremented
```

### Task 2.4: SendGrid Email (20 min)
```bash
# 1. Create SendGrid account
# Visit: https://app.sendgrid.com

# 2. Verify sender email
# Settings → Sender Authentication
# Verify your domain or single sender

# 3. Create API key
# Settings → API Keys → Create API Key
# Permissions: Full Access

# 4. Update .env.local
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="reports@yourdomain.com"

# 5. Test email sending
# Complete an appraisal → Generate PDF
# Verify email received
```

**Checkpoint 2**: ✓ All external services configured

---

## Hour 5-6: Integration Testing (Critical)

### Task 3.1: Complete Appraisal Flow Test (45 min)

**Test Scenario**: Create complete appraisal from scratch

```bash
# 1. Start fresh
# Clear test data from database if needed

# 2. Create new appraisal
# Dashboard → Start New Appraisal

# Step 0: Upload Documents
# - Upload sample repair estimate PDF
# - Upload 2-3 damage photos
# - Verify AI extraction triggers (if Gemini configured)

# Step 1: Driver Info
# - Fill in owner information
# - Select state: Georgia (to test GA-specific features)
# - Verify state law banner appears

# Step 2: Vehicle Details
# - Enter VIN: 1HGBH41JXMN109186 (sample Honda)
# - Fill in year, make, model, trim
# - Add optional equipment with MSRP values

# Step 3: Accident Details
# - Select point of impact
# - Enter repair costs
# - Enter labor hours:
#   - Body: 15 hrs
#   - Frame: 5 hrs (triggers Level 4 severity)
#   - Refinish: 10 hrs
# - Check: Structural Damage, Frame Pulling
# - Add panels replaced

# Step 4: Pre-Accident Condition
# - Select: Excellent
# - Fill in condition details

# Step 5: Pre-Accident Comparables
# - Use Auto-Search (mock data)
# - Verify 3-5 comparables appear
# - Check adjustments calculated correctly

# Step 6: Post-Accident Comparables
# - Use Auto-Search (mock data)
# - Verify accident-history vehicles only
# - Check adjustments calculated

# Step 7: Review & Generate
# - Verify DV calculation appears
# - Verify severity: Level 4 - Major
# - Click Generate Report
# - Wait for PDF generation
# - Verify PDF downloads
# - Verify email sent

# 3. Verify results
# - DV amount calculated correctly
# - PDF contains all sections
# - Georgia-specific citations present
# - Anti-17c statement included
# - Severity justification correct
```

### Task 3.2: Payment Flow Test (30 min)

**Test Scenario 1**: One-time report purchase
```bash
# 1. Create new user account
# 2. Verify reportsRemaining = 0
# 3. Try to generate report → blocked
# 4. Click "Buy Report"
# 5. Complete Stripe checkout (test mode)
# 6. Verify reportsRemaining = 1
# 7. Generate report successfully
# 8. Verify reportsRemaining = 0
```

**Test Scenario 2**: Subscription
```bash
# 1. Create new user account
# 2. Subscribe to Professional Plan
# 3. Verify subscriptionStatus = 'active'
# 4. Verify role = 'appraiser'
# 5. Generate multiple reports (no limit)
# 6. Cancel subscription via Stripe portal
# 7. Verify subscriptionStatus = 'canceled'
# 8. Verify role reverted to 'individual'
```

### Task 3.3: Role-Based Access Test (15 min)

```bash
# Test each role:

# Individual:
# - Can generate reports (with credits)
# - Cannot access USPAP fields
# - Cannot manage team

# Appraiser:
# - Unlimited reports
# - Can access USPAP fields in Step 7
# - Can add signature

# Attorney:
# - Unlimited reports
# - Can manage team members
# - Can access all templates

# Body Shop:
# - Unlimited reports
# - Can access white-label settings
```

**Checkpoint 3**: ✓ All critical flows working

---

## Hour 7-8: Bug Fixes & Polish (Medium Priority)

### Task 4.1: Fix Any Issues Found (60 min)

**Common Issues to Check**:

1. **Auto-save not working**
   - Check: Wizard auto-saves every 30 seconds
   - Fix: Verify debounce logic in wizard state

2. **PDF generation timeout**
   - Check: PDF generates within 60 seconds
   - Fix: Optimize PDF component rendering

3. **Mobile responsiveness**
   - Check: All wizard steps work on 375px width
   - Fix: Adjust Tailwind breakpoints

4. **File upload errors**
   - Check: Files over 25MB rejected gracefully
   - Fix: Add client-side validation

5. **Calculation errors**
   - Check: Run all property-based tests
   - Fix: Verify constants match specification

### Task 4.2: Quick Wins (30 min)

**Easy improvements**:

1. **Add loading states**
```typescript
// Add to all async operations
const [loading, setLoading] = useState(false);

// Show spinner during operations
{loading && <Spinner />}
```

2. **Improve error messages**
```typescript
// Replace generic errors with specific ones
catch (error) {
  if (error.code === 'INSUFFICIENT_CREDITS') {
    toast.error('No reports remaining. Purchase more to continue.');
  } else {
    toast.error('An error occurred. Please try again.');
  }
}
```

3. **Add success confirmations**
```typescript
// After successful operations
toast.success('Appraisal saved successfully!');
toast.success('PDF generated and emailed!');
```

4. **Keyboard shortcuts**
```typescript
// Add to wizard
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && canGoNext) nextStep();
    if (e.key === 'ArrowLeft' && canGoBack) prevStep();
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [canGoNext, canGoBack]);
```

**Checkpoint 4**: ✓ Major bugs fixed, UX improved

---

## Hour 9-10: Documentation & Deployment Prep (Low Priority)

### Task 5.1: Update Documentation (30 min)

**Files to update**:

1. **README.md**
```markdown
# Add:
- Quick start guide
- Environment variables list
- Common troubleshooting
- Deployment instructions
```

2. **API_DOCUMENTATION.md**
```markdown
# Verify:
- All endpoints documented
- Request/response examples
- Authentication requirements
```

3. **DEPLOYMENT.md**
```markdown
# Add:
- Vercel deployment steps
- Environment variable setup
- Database migration process
- Monitoring setup
```

### Task 5.2: Deployment Preparation (60 min)

**Vercel Setup**:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
# ... (add all env vars)

# 5. Deploy to preview
vercel

# 6. Test preview deployment
# Visit preview URL
# Run through critical flows

# 7. Deploy to production (when ready)
vercel --prod
```

**Post-Deployment Checklist**:
```bash
# 1. Verify all environment variables set
vercel env ls

# 2. Check build logs
vercel logs

# 3. Test production URL
curl https://your-domain.com/api/health

# 4. Monitor errors
# Set up Sentry or similar

# 5. Set up uptime monitoring
# Use UptimeRobot or similar
```

**Checkpoint 5**: ✓ Ready for production deployment

---

## Success Criteria (End of 24 Hours)

### Must Have ✓
- [x] All environment variables configured
- [x] Database connected and migrated
- [x] Authentication working (Clerk)
- [x] File upload working (Vercel Blob)
- [x] Complete appraisal flow tested
- [x] Payment flow tested (test mode)
- [x] PDF generation working
- [x] Email delivery working

### Should Have ✓
- [x] AI extraction tested (with Gemini)
- [x] Comparable search tested (mock data)
- [x] All roles tested
- [x] Mobile responsiveness verified
- [x] Major bugs fixed

### Nice to Have
- [ ] Apify integration with real data
- [ ] Performance optimization
- [ ] Advanced error handling
- [ ] Comprehensive logging

---

## Troubleshooting Guide

### Issue: Build fails with TypeScript errors
```bash
# Solution:
npm run build 2>&1 | tee build-errors.log
# Fix errors one by one
# Common: missing types, incorrect imports
```

### Issue: Database connection fails
```bash
# Solution:
# 1. Verify DATABASE_URL format
# 2. Check Neon dashboard for connection string
# 3. Ensure ?sslmode=require appended
# 4. Test connection:
npm run db:studio
```

### Issue: Clerk authentication not working
```bash
# Solution:
# 1. Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set
# 2. Check Clerk dashboard for correct keys
# 3. Verify middleware.ts configured correctly
# 4. Clear browser cookies and try again
```

### Issue: File upload fails
```bash
# Solution:
# 1. Verify BLOB_READ_WRITE_TOKEN set
# 2. Check file size < 25MB
# 3. Verify file type allowed
# 4. Check Vercel Blob dashboard for errors
```

### Issue: PDF generation fails
```bash
# Solution:
# 1. Check all required data present
# 2. Verify @react-pdf/renderer installed
# 3. Check browser console for errors
# 4. Test with minimal data first
```

### Issue: Stripe webhook not working
```bash
# Solution:
# 1. Verify STRIPE_WEBHOOK_SECRET set
# 2. Check webhook endpoint in Stripe dashboard
# 3. Test with Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# 4. Verify signature validation logic
```

---

## Next Steps (After 24 Hours)

### Week 1: Integration Testing
- Complete all integration tests
- Test with real Apify data
- Load testing for PDF generation
- Security audit

### Week 2: Manual QA
- Browser compatibility testing
- Mobile device testing
- Accessibility testing
- User acceptance testing

### Week 3: Production Launch
- Deploy to production
- Monitor error rates
- Gather user feedback
- Optimize based on usage

---

## Emergency Contacts

**Critical Issues**:
- Database: Neon support (support@neon.tech)
- Authentication: Clerk support (support@clerk.com)
- Payments: Stripe support (support@stripe.com)
- Hosting: Vercel support (support@vercel.com)

**Internal Team**:
- Lead Developer: [Your contact]
- DevOps: [Your contact]
- QA Lead: [Your contact]

---

**Document Version**: 1.0  
**Last Updated**: March 2, 2026  
**Estimated Completion**: 90% after 24 hours

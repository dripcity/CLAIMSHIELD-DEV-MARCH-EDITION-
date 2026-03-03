# ClaimShield DV

Professional diminished value (DV) vehicle appraisal platform powered by AI.

## Overview

ClaimShield DV is a SaaS platform that generates legally-defensible diminished value appraisal reports using the comparable sales method. The platform leverages AI for document extraction, automated comparable vehicle search, and precise calculations with state-specific legal citations.

## Features

- **8-Step Appraisal Wizard**: Guided interface for creating comprehensive DV appraisals
- **AI Document Extraction**: Gemini-powered analysis of repair estimates and insurance documents
- **Automated Comparable Search**: Apify-based web scraping for vehicle comparables
- **Valuation Calculations**: Median-based comparable sales method with exact adjustment constants
- **PDF Report Generation**: Professional 15-25 page appraisal reports
- **Document Templates**: Demand letters, bad faith calculators, expert affidavits
- **Payment Processing**: Stripe integration for subscriptions and one-time purchases
- **Email Delivery**: SendGrid integration for report delivery

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **File Storage**: Vercel Blob
- **AI**: Google Gemini 3.1 Pro
- **Web Scraping**: Apify
- **Payments**: Stripe
- **Email**: SendGrid
- **PDF Generation**: @react-pdf/renderer
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL account
- Clerk account
- Stripe account
- SendGrid account
- Google Cloud account (for Gemini API)
- Apify account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/claimshield-dv.git
cd claimshield-dv
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

4. Set up the database:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Drizzle Studio to view database
npm run db:studio
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
claimshield-dv/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── _components/       # Shared components
├── lib/                   # Core business logic
│   ├── ai/               # AI extraction
│   ├── calculations/     # Valuation logic
│   ├── db/               # Database schema
│   ├── legal/            # Legal citations
│   ├── pdf/              # PDF generation
│   └── utils/            # Utilities
├── components/            # shadcn/ui components
└── public/               # Static assets
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

## Key Features

### Role-Based Access Control

The platform supports four user roles:

- **Individual**: Vehicle owners seeking DV claims
- **Appraiser**: Professional appraisers with USPAP certification
- **Attorney**: Legal professionals with team management
- **Body Shop**: Repair facilities with white-label options

### Calculation Methodology

The platform uses exact calculation constants for legally-defensible results:

- Mileage adjustment: $0.12 per mile
- Equipment adjustment: 80% of MSRP
- Year adjustment: 7% per year (vehicles under 5 years)
- Median-based valuation (not mean)

### State-Specific Legal Citations

- **Georgia**: O.C.G.A. § 33-4-6, § 33-4-7, Canal Ins. Co. v. Tullis
- **North Carolina**: N.C. Gen. Stat. § 20-279.21(d)(1)
- **Generic**: Restatement of Torts § 928

### Security Features

- Authentication via Clerk
- Role-based access control
- Private file storage with signed URLs
- Input sanitization and validation
- Rate limiting on API routes
- HTTPS enforcement
- Webhook signature validation

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/claimshield-dv)

## Environment Variables

See [.env.local.example](./.env.local.example) for required environment variables.

**Critical**: Never commit `.env.local` to version control. All sensitive keys must be server-side only.

## API Documentation

### Authentication

All API routes require authentication via Clerk. Include the Clerk session token in requests.

### Key Endpoints

- `POST /api/appraisals` - Create new appraisal
- `GET /api/appraisals` - List user's appraisals
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/extract` - Extract data from document
- `POST /api/comparables/search` - Search comparable vehicles
- `POST /api/calculations` - Calculate valuation
- `POST /api/appraisals/[id]/generate-pdf` - Generate PDF report

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- TypeScript strict mode (no `any` types)
- ESLint configuration must pass
- All components must be accessible (WCAG 2.1 AA)
- All API routes must validate authentication and authorization
- All calculations must use exact constants

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## License

Proprietary - All rights reserved

## Support

For support, email support@claimshield-dv.com or open an issue in the repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)
- Database by [Neon](https://neon.tech/)
- Deployed on [Vercel](https://vercel.com/)

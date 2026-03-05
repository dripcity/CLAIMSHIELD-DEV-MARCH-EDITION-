---
title: Technology Stack
inclusion: always
---

# ClaimShield DV - Technology Stack

## Framework and Language

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled, no `any` types)
- **React**: React 19
- **Build System**: Next.js build system

## Database

- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Connection**: `@neondatabase/serverless`

## Authentication and Authorization

- **Auth Provider**: Clerk
- **Auth Library**: `@clerk/nextjs`
- **Role System**: Custom role-based access (individual, appraiser, attorney, body_shop, admin)

## File Storage

- **Storage**: Vercel Blob
- **Library**: `@vercel/blob`
- **Access**: Private with signed URLs

## AI and Data Processing

- **AI Provider**: Google Gemini 3.1 Pro
- **Library**: `@google/generative-ai`
- **Web Scraping**: Apify
- **Library**: `apify-client`

## Payments and Email

- **Payments**: Stripe
- **Library**: `stripe`
- **Email**: SendGrid
- **Library**: `@sendgrid/mail`

## PDF Generation

- **Library**: `@react-pdf/renderer`
- **Document Format**: DOCX (using `docx` package)

## UI and Styling

- **CSS Framework**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Theme**: Custom brand colors (blue brand DEFAULT: #2563EB)
- **Icons**: Lucide React

## Validation

- **Validation Library**: Zod
- **Form Library**: React Hook Form with `@hookform/resolvers`

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Build and Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio

# Environment
# Copy .env.local.example to .env.local and fill in values
```

## Project Structure Conventions

```
app/                    # Next.js App Router pages
├── (auth)/            # Auth routes (sign-in, sign-up, onboarding)
├── (dashboard)/       # Protected routes
├── api/               # API routes
└── _components/       # Shared components

lib/                   # Core business logic
├── ai/               # AI extraction and Gemini client
├── calculations/     # Valuation and severity logic
├── db/               # Database schema and client
├── legal/            # State-specific legal citations
├── scraping/         # Apify web scraping
├── storage/          # Vercel Blob utilities
├── utils/            # Shared utilities (auth, formatting, constants)
├── validation/       # Zod schemas
└── env.ts            # Environment validation

components/            # shadcn/ui components
└── ui/               # UI component library
```

## Configuration Files

- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.ts` - Tailwind CSS with custom brand colors
- `components.json` - shadcn/ui configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `.env.local.example` - Environment variable template
# Kigali BIZHUB

Kigali BIZHUB is an AI-powered storefront and business-management SaaS for small businesses in Rwanda and, later, East Africa.

## Current build

- Next.js App Router + TypeScript
- Responsive marketing landing page
- Business dashboard shell
- Supabase-ready PostgreSQL schema
- Product, customer, order, payment and subscription data model
- Row Level Security policies for business-owner data isolation

## Local setup

Requirements: Node.js 20+ and npm.

```powershell
git clone https://github.com/CREDO-2020/Kigali-BIZHUB.git
cd Kigali-BIZHUB
npm install
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Add the project's URL and publishable key to `.env.local` when the application starts using Supabase.
5. Never commit service-role keys or other secrets.

## Product direction

The first monetizable release focuses on:
1. Business registration and onboarding.
2. Product and inventory management.
3. Public storefronts.
4. Customer and order management.
5. Rwanda payment integration.
6. AI business assistant.
7. Subscription plans.

The application should be built incrementally and tested at each stage rather than adding every feature at once.

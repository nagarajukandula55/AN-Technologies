# AN Technologies — Software Marketplace

Next.js 16 monorepo shell for a growing catalog of paid business tools. Shipped with a shared
core (auth, subscriptions, paywall) and two live products:

- **PDF Toolkit** (`/tools/pdf`) — merge/split PDFs, fully client-side
- **QR & Barcode Generator** (`/tools/qr`) — generate + export QR codes and barcodes

Free tier: 3 operations/day per tool, watermarked output. Pro/Business tiers unlock unlimited,
watermark-free usage via Lemon Squeezy subscriptions.

## Stack

- **Frontend/Backend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Auth**: NextAuth v5 (Google OAuth + email/password)
- **Database**: PostgreSQL via Prisma ORM
- **Payments**: Lemon Squeezy Checkout + subscriptions (merchant of record — handles global tax/
  VAT/GST and payouts to India without a registered business entity)
- **Hosting**: Vercel (serverless-first — no long-running services required)

## Local development

```bash
npm install
cp .env.example .env   # fill in values, see below
npx prisma db push     # sync schema to your database
npm run dev
```

Open http://localhost:3000.

## Required accounts (you create these, not Claude)

| Service | Why | Where |
|---|---|---|
| **Vercel** | Hosting | https://vercel.com/signup |
| **Neon** or **Supabase** | Postgres database | https://neon.tech or https://supabase.com |
| **Lemon Squeezy** | Payments/subscriptions | https://app.lemonsqueezy.com/register |
| **Google Cloud Console** (optional) | Google sign-in | https://console.cloud.google.com/apis/credentials |

### Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` / `DIRECT_URL` — from Neon/Supabase (Neon: use the pooled connection for
  `DATABASE_URL` and the direct connection for `DIRECT_URL`)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_APP_URL` — your deployed URL (e.g. `https://yourapp.vercel.app`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional, from Google Cloud Console (OAuth
  consent screen + credentials, redirect URI: `<APP_URL>/api/auth/callback/google`)
- `LEMONSQUEEZY_API_KEY` — from Lemon Squeezy → Settings → API
- `LEMONSQUEEZY_STORE_ID` — from Lemon Squeezy → Settings → Stores
- `LEMONSQUEEZY_WEBHOOK_SECRET` — from Lemon Squeezy → Settings → Webhooks (endpoint:
  `<APP_URL>/api/lemonsqueezy/webhook`, events: `subscription_created`,
  `subscription_updated`, `subscription_cancelled`, `subscription_expired`)
- `LEMONSQUEEZY_VARIANT_PRO` / `LEMONSQUEEZY_VARIANT_BUSINESS` — create two subscription
  products in Lemon Squeezy and paste their variant IDs here

## Deploying to Vercel

This app is built specifically to run cleanly on Vercel's serverless model — no Redis/BullMQ/
Socket.io in the critical path, so there's nothing that needs a persistent server.

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Vercel: **New Project** → import this repo.
3. Add all the environment variables above in **Project Settings → Environment Variables**.
4. Deploy. Vercel runs `prisma generate && next build` automatically (configured in
   `vercel.json` / `package.json`).
5. After first deploy, run `npx prisma db push` locally (pointed at your production
   `DATABASE_URL`) to create tables, or wire it into a CI step.
6. Add the Lemon Squeezy webhook endpoint pointing at
   `https://<your-domain>/api/lemonsqueezy/webhook` and copy the signing secret into
   `LEMONSQUEEZY_WEBHOOK_SECRET`.
7. Point your custom domain at the Vercel project (Project Settings → Domains) once you're ready
   to go live with a paid domain instead of the `*.vercel.app` subdomain.

## Adding the next product

Every tool lives under `src/app/tools/<name>/page.tsx` and reuses:

- `useTier()` / `checkAndRecordUsage()` (`src/hooks/use-tier.ts`) for paywall gating
- `<Nav />` (`src/components/nav.tsx`) for consistent navigation
- The `Subscription` / `ToolUsage` Prisma models for entitlements — no new tables needed for a
  typical utility tool

Follow the pattern in `src/app/tools/pdf/page.tsx` or `src/app/tools/qr/page.tsx`: client-side
processing where possible (keeps hosting costs near zero), gate with `checkAndRecordUsage`,
watermark/limit free-tier output.

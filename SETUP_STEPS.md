# Revolve Audit App Setup Steps (MVP)

This is the exact checklist to get your one-off Airbnb audit MVP running.

MVP scope locked:

- Free report
- One-off paid unlock (`GBP 3.49`)
- No monthly subscription
- No AirROI integration

## 1) Local project setup

1. Open terminal in `revolve-audit-app`.
2. Copy env template:
   - `cp .env.example .env.local`
3. Run the app:
   - `npm run dev`
4. Confirm app opens at `http://localhost:3000`.

## 2) Supabase setup (required first)

1. Create a new Supabase project.
2. Copy from `Project Settings -> API` into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. In `Authentication -> URL Configuration` set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. For deployed app later, add:
   - `https://<your-domain>/auth/callback`
5. In Supabase SQL Editor, run:
   - `supabase-schema.sql`

## 3) Stripe setup (one-time payment only)

1. Use Stripe test mode during development.
2. Create one product:
   - Name: `Full Airbnb Listing Audit`
   - Price: one-time `GBP 3.49`
3. Copy keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
4. For local development, use Stripe CLI (recommended):
   - `stripe login`
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the `whsec_...` value shown in terminal.
5. Copy webhook secret to:
   - `STRIPE_WEBHOOK_SECRET` in `.env.local`
6. Add Stripe price id to:
   - `STRIPE_PRICE_ONE_OFF_GBP_349`
   - Use Stripe price id format: `price_...` (recommended)

For production deployment later, create a Stripe Dashboard webhook endpoint:

- URL: `https://<your-domain>/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `payment_intent.payment_failed`
  - `charge.refunded`

## 4) OpenAI setup

1. Create/copy API key from OpenAI dashboard.
2. Put key in `OPENAI_API_KEY`.
3. Keep `OPENAI_MODEL` as default unless we optimize later.

## 5) Resend setup

1. Verify sending domain in Resend.
2. Add DNS records from Resend instructions.
3. Copy API key:
   - `RESEND_API_KEY`
4. Set sender email:
   - `RESEND_FROM_EMAIL` (must match verified domain)

## 6) Vercel setup (deployment)

1. Push app repo to GitHub/GitLab/Bitbucket.
2. Import project to Vercel.
3. Add all env vars from `.env.local` into Vercel project settings.
4. Deploy.
5. Update Supabase redirect URL and Stripe webhook URL to production domain.

## 7) Business/legal setup before launch

1. Publish these pages in app:
   - Privacy policy
   - Terms
   - Refund policy (standard one-off policy)
2. Add support email to app footer and payment confirmation.

## 8) Test plan before going live

1. Auth test:
   - Request magic link
   - Login and return to app successfully
2. Free report test:
   - Submit listing info
   - Confirm free report renders
3. Payment test:
   - Open Stripe checkout
   - Complete payment with test card
4. Unlock test:
   - Confirm full report unlocks after webhook event
5. Email test:
   - Confirm report-ready email sends and links work
6. Refund flow test:
   - Trigger refund in Stripe
   - Confirm app state updates correctly

## 9) Known non-MVP items (do later)

- Subscription billing
- Monthly report automation
- AirROI enrichment
- Bundle pricing logic

## 10) If anything breaks

Check in this order:

1. `.env.local` values are complete and correct
2. Supabase auth redirect URLs are correct
3. Stripe webhook secret matches endpoint
4. Resend sender domain is verified
5. OpenAI billing/quota is active

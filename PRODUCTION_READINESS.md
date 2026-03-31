# Production readiness — step-by-step action plan

Work through the phases in order. Check items off as you complete them.

---

## Phase 1 — Blocking (before real users or live payments)

### Step 1: Production environment variables

1. Create or update secrets on your host (Vercel, Railway, Docker env file, etc.). Do **not** commit real values.
2. Set **exactly** these for production:
   - `NEXT_PUBLIC_APP_URL` — your public **HTTPS** URL, no trailing slash (e.g. `https://audit.example.com`).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY` — **live** key when you go live.
   - `STRIPE_WEBHOOK_SECRET` — from the live webhook endpoint in Stripe.
   - `STRIPE_PRICE_ONE_OFF_GBP_349` — live `price_` or compatible product config (see checkout route).
   - `OPENAI_API_KEY`
   - Optional: `OPENAI_MODEL` (defaults if unset).
3. Remove any `NODE_ENV=development` override in production; the platform should set `NODE_ENV=production`.
4. Rotate any key that was ever exposed in logs, chat, or a public repo.

### Step 2: Fix Supabase RLS on `guest_intakes`

1. Open Supabase SQL Editor (production project).
2. **Remove public read** on guest PII. For example:
   - `DROP POLICY IF EXISTS "guest_intakes_select_any" ON public.guest_intakes;`
3. Keep **insert** only for roles that need it, or restrict insert to **service role** via API-only pattern (no anon select on the full table).
4. Confirm the app only reads `guest_intakes` through **server routes** using `SUPABASE_SERVICE_ROLE_KEY` (not the anon key from the browser).
5. Re-test: free report → email → checkout → success without `401`/`403` on server-side reads.

### Step 3: Persist paid guest full reports (recommended before scale)

1. Add columns or a table, e.g. `guest_intakes.full_report_json jsonb` and/or `stripe_checkout_session_id text`, `paid_at timestamptz`.
2. After successful payment verification in `/api/reports/full` (guest path), **upsert** the generated full report(s) to Supabase.
3. Update checkout success flow to **load from server** when localStorage is empty (e.g. GET by `report_id` + session validation).

**Already implemented in this repo**

- **Email:** When `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set:
  - **Free preview:** Sent automatically from `POST /api/reports/free` to the address the user entered (HTML + plain text).
  - **Full paid report:** Sent after `POST /api/reports/full` (guests: one send per purchase via `guest_intakes.full_report_emailed_at`; signed-in: on first generation from the API).
- **Download:** Free preview and paid success pages offer **PDF downloads** generated in the browser (**html2canvas** + **jsPDF**) to match on-screen layout (multi-page A4 where needed). Host the logo under your own origin (e.g. `/public`) if you want it inside the free-report PDF; the header logo is skipped in capture to avoid cross-origin canvas tainting.

4. Optional later: PDF export, magic links back to a hosted report view, or attaching `.md` files to Resend emails.

### Step 4: Stripe live configuration

1. In Stripe **live** mode: create products/prices to match your tier logic; set `STRIPE_PRICE_ONE_OFF_GBP_349` accordingly.
2. Add webhook endpoint: `https://your-domain/api/stripe/webhook` — events at minimum: `checkout.session.completed`, and any you already handle (`payment_intent.payment_failed`, `charge.refunded`).
3. Copy the **signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. Confirm **Success** and **Cancel** URLs resolve to your production domain (driven by `NEXT_PUBLIC_APP_URL`).

### Step 5: Protect `/api/reports/free` from abuse

1. Add **rate limiting** (per IP or per fingerprint): middleware, edge config, Redis, or your CDN/WAF.
2. Optional: add **Turnstile** or **hCaptcha** on the step that triggers the POST to `/api/reports/free`.
3. Monitor OpenAI usage and `guest_intakes` insert rate after deploy.

### Step 6: Sanitize API error responses

1. In `src/app/api/reports/free/route.ts` (and similar routes), **log** full `Error` server-side (`console.error` or your logger).
2. Return a **generic** JSON message to clients (e.g. “Something went wrong”) instead of raw `error.message` in production.

### Step 7: Repository and deploy hygiene

1. Delete or add to `.gitignore`: `tmp-figma-ref/` (and any other design exports) so they are not deployed.
2. Ensure `.env.local` is never committed (already covered by `.env*` in `.gitignore`).
3. Production process: **`npm run build`** then **`npm run start`** (or platform equivalent). Do not expose `next dev` to the public internet.

---

## Phase 2 — Important (first week after launch)

### Step 8: Security headers

1. In `next.config.ts` or your reverse proxy (Nginx, Cloudflare), add:
   - `Strict-Transport-Security`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy`
   - `Permissions-Policy` (minimal whitelist)
2. Introduce **Content-Security-Policy** incrementally; allow Stripe, your CDN/logo hosts, and Supabase as needed.

### Step 9: Decide on the signed-in product path

1. APIs already support `reports` / `listings` + Supabase Auth.
2. Either **ship** login + dashboard in the UI, or **document** that v1 is guest-only and regression-test only guest flows.

### Step 10: Observability

1. Add **error tracking** (e.g. Sentry) for server and client.
2. Use **structured logs** on the server; aggregate in your host’s log drain.
3. Set alerts on: HTTP 5xx rate, Stripe failures, OpenAI quota/errors, Supabase errors.

### Step 11: Legal and trust pages

1. Replace footer `#` links with real **Privacy**, **Terms**, and contact routes or external URLs.
2. Ensure copy describes what you store (`guest_intakes`, emails, listing URLs) and retention.

### Step 12: Idempotency for paid report generation

1. In the guest branch of `/api/reports/full`, if payment was already verified and `full_report_json` exists in DB (after Step 3), **return cached data** instead of calling OpenAI again.
2. Optionally key idempotency on Stripe `session_id` + `reportId`.

---

## Phase 3 — Polish and maintainability

### Step 13: Clean up unused env and dependencies

1. Confirm whether `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is required; document in `.env.example` or remove.

### Step 14: Images and performance

1. Consider `next/image` with `remotePatterns` for the Revolve logo URL.
2. Review Lighthouse on `/`, `/pre-report/*`, and checkout success.

### Step 15: Database migrations

1. Move incremental DDL out of ad-hoc runs: use Supabase migration files or a documented migration order for every prod change.
2. Enable **backups** and test a restore in a staging project.

### Step 16: CI

1. Add a pipeline step: `npm ci` → `npm run lint` → `npm run build` on every PR.
2. Optional: preview deployment per branch.

---

## Final go-live checklist

| Item | Done |
|------|------|
| All Phase 1 steps complete | ☐ |
| Production URL uses HTTPS | ☐ |
| Stripe **live** webhook returns 200 | ☐ |
| Guest checkout → full report works on a clean browser profile | ☐ |
| RLS: no public dump of `guest_intakes` | ☐ |
| Rate limit verified on free report endpoint | ☐ |
| Privacy + Terms linked | ☐ |

---

## Reference files in this repo

- `supabase-schema.sql` — baseline schema (apply + amend with Phase 1 Step 2 and Step 3).
- `.env.example` — variable names only; copy to `.env.local` for local dev.

When in doubt, fix **RLS**, **secrets**, **persistence of paid output**, and **abuse limits** before spending on ads or heavy traffic.

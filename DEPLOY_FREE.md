# Free Deployment Guide (Click-by-Click)

This is the easiest mostly-free launch path:

- Vercel Hobby: frontend + API
- Supabase free tier: database + auth
- Resend free tier: transactional email
- Stripe: payments (no monthly fee, but transaction fees apply)

You only need to do portal clicks for Supabase, Vercel, Stripe, and Resend. Everything else in this repo is already prepared.

---

## A) Before touching cloud portals (local quick check)

Run this in terminal from project root:

```bash
npm run build && npm run lint && cd server && npm run build && npm run lint
```

If all pass, proceed.

---

## B) Supabase setup (database + security)

### 1) Open SQL Editor

1. Go to Supabase Dashboard.
2. Open your project.
3. Left menu → SQL Editor.

### 2) Run schema SQL (first)

1. Open [src/lib/database.schema.sql](src/lib/database.schema.sql) in this repo.
2. Copy all SQL.
3. Paste into Supabase SQL Editor.
4. Click Run.

### 3) Run production RLS SQL (second)

1. Open [supabase/rls_setup.sql](supabase/rls_setup.sql).
2. Copy all SQL.
3. Paste into SQL Editor.
4. Click Run.

### 4) Insert first admin user

1. In Supabase, open Authentication → Users.
2. Create/sign in once with the admin email you want.
3. Copy that user email.
4. SQL Editor → run:

```sql
insert into public.admin_users (email)
values ('your-admin@email.com')
on conflict (email) do nothing;
```

---

## C) Gather keys/values (copy these once)

### From Supabase (Project Settings → API)

- `SUPABASE_URL`
- `VITE_SUPABASE_URL` (same value)
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)

### From Stripe

- Dashboard → Developers → API keys:
	- `STRIPE_SECRET_KEY` (starts `sk_test_` first)
	- `VITE_STRIPE_PUBLIC_KEY` (starts `pk_test_` first)

### From Resend

- Create API key:
	- `RESEND_API_KEY`
- Sender:
	- `EMAIL_FROM` (example: `RALYX <onboarding@your-domain.com>`)
- Support:
	- `SUPPORT_EMAIL`

---

## D) Create Vercel project (free path)

1. Go to Vercel Dashboard.
2. Click Add New → Project.
3. Import `muzzibuilds/ralyx` repository.
4. Framework preset: Vite (auto detected).
5. Click Environment Variables and add all values below.

### Required Vercel environment variables

Set these exactly:

```txt
VITE_SUPABASE_URL=<your supabase url>
VITE_SUPABASE_ANON_KEY=<your anon key>
VITE_STRIPE_PUBLIC_KEY=<your stripe publishable key>
VITE_APP_ENV=production
VITE_APP_NAME=RALYX
VITE_SEASON_YEAR=2025

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://<your-project>.vercel.app
SUPABASE_URL=<your supabase url>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
STRIPE_SECRET_KEY=<your stripe secret key>
STRIPE_WEBHOOK_SECRET=placeholder_until_webhook_created
RESEND_API_KEY=<your resend api key>
EMAIL_FROM=<verified sender>
SUPPORT_EMAIL=<support mailbox>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
PAYMENT_RATE_LIMIT_MAX_REQUESTS=20
NOTIFICATION_RATE_LIMIT_MAX_REQUESTS=10
```

Important:

- Do not set `VITE_BACKEND_URL` on Vercel (leave unset).
- If you use a custom domain later, update `FRONTEND_URL` to that domain.

6. Click Deploy.

---

## E) Verify deployment immediately

After Vercel deploy succeeds, open these URLs:

- `https://<your-project>.vercel.app/health`
- `https://<your-project>.vercel.app/health/ready`

`/health/ready` must show ready/pass.

Also verify pages:

- `/`
- `/standings`
- `/admin/login`

---

## F) Configure Stripe webhook

1. Stripe Dashboard → Developers → Webhooks.
2. Add endpoint:

`https://<your-project>.vercel.app/webhooks/stripe`

3. Select events:
	 - `payment_intent.succeeded`
	 - `payment_intent.payment_failed`
	 - `payment_intent.canceled`
	 - `charge.refunded`
4. Save endpoint.
5. Copy webhook signing secret (`whsec_...`).
6. Go back to Vercel project env vars.
7. Replace `STRIPE_WEBHOOK_SECRET` placeholder with real `whsec_...` value.
8. Redeploy once.

---

## G) Smoke test (must pass before live)

1. Register a new player.
2. Pay using Stripe test card `4242 4242 4242 4242`.
3. Confirm registration becomes paid/confirmed in Supabase.
4. Confirm payment confirmation email arrives.
5. Submit waitlist flow and confirm waitlist email.
6. Login as admin and open admin pages.
7. Enter a match result and verify standings update.

---

## H) Switch to live mode

Only after all tests pass:

1. Replace Stripe test keys (`pk_test`, `sk_test`) with live keys (`pk_live`, `sk_live`) in Vercel env vars.
2. Create/live webhook in Stripe live mode and update `STRIPE_WEBHOOK_SECRET`.
3. Redeploy.

---

## What is free vs paid

- Vercel Hobby: free tier limits apply.
- Supabase: free tier limits apply.
- Resend: free tier limits apply.
- Stripe: no monthly fee, but payment processing fees on real payments.

If traffic grows, you can upgrade later without code rewrites.
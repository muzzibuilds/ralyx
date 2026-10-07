# Free Deployment Guide

This project is prepared for a hobby-tier launch using:

- Vercel Hobby for frontend + API
- Supabase free tier for database/auth
- Resend free tier for transactional email
- Stripe for payments

## 1. Supabase

Run these SQL files in order:

1. [src/lib/database.schema.sql](src/lib/database.schema.sql)
2. [supabase/rls_setup.sql](supabase/rls_setup.sql)

Then insert your first admin user into `public.admin_users`.

## 2. Vercel project

Import the GitHub repo into Vercel.

Set these environment variables in Vercel:

### Frontend/runtime

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_APP_ENV=production`
- `VITE_APP_NAME=RALYX`
- `VITE_SEASON_YEAR=2025`

Leave `VITE_BACKEND_URL` unset for same-origin API calls on Vercel.

### Backend/runtime

- `NODE_ENV=production`
- `PORT=3001`
- `FRONTEND_URL=https://your-vercel-domain.vercel.app`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPPORT_EMAIL`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=200`
- `PAYMENT_RATE_LIMIT_MAX_REQUESTS=20`
- `NOTIFICATION_RATE_LIMIT_MAX_REQUESTS=10`

If using a custom domain, set `FRONTEND_URL` to that domain instead.

## 3. Deploy

Trigger the first Vercel deployment.

After deploy, verify:

- `/health`
- `/health/ready`
- homepage loads
- `/standings` route loads directly
- `/admin/login` route loads directly

## 4. Stripe webhook

In Stripe dashboard, add webhook endpoint:

- `https://your-vercel-domain.vercel.app/webhooks/stripe`

Subscribe at minimum to:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. Smoke test

1. Submit a registration
2. Complete payment with Stripe test card `4242 4242 4242 4242`
3. Confirm registration record becomes paid/confirmed
4. Confirm confirmation email sends
5. Join waitlist and confirm waitlist email sends
6. Log into admin and verify protected pages
7. Record a result and verify standings update

## 6. Go live

Switch Stripe keys from test to live only after full smoke testing.

## Notes

- Stripe still charges payment processing fees on live transactions.
- Free tiers can change at any time.
- If traffic grows, upgrade Vercel/Supabase/Resend as needed.
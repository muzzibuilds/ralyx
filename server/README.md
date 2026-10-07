# RALYX Backend Server

Backend API server for RALYX paddle league platform. Handles payment processing with Stripe and manages registrations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Stripe account (for API keys)
- Supabase account (for database)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

3. **Add your credentials to `.env`**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on: `http://localhost:3001`

## 📚 API Endpoints

### Payment Intents

#### Create Payment Intent
```
POST /api/payments/create-intent
Content-Type: application/json

{
  "amount": 5000,           // cents ($50.00)
  "email": "player@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "registrationId": "reg_123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx",
  "amount": 5000,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

#### Get Payment Intent
```
GET /api/payments/:paymentIntentId
```

**Response:**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxx",
  "status": "succeeded",
  "amount": 5000,
  "currency": "usd"
}
```

#### Confirm Payment
```
POST /api/payments/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "registrationId": "reg_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and registration updated",
  "paymentIntentId": "pi_xxx",
  "registrationId": "reg_123"
}
```

### Waitlist Confirmation
```
POST /api/notifications/waitlist-confirmation
Content-Type: application/json

{
  "firstName": "John",
  "email": "player@example.com",
  "seasonName": "RALYX Winter 2027"
}
```

## 🪝 Webhooks

### Stripe Webhooks
```
POST /webhooks/stripe
```

**Signature:** `stripe-signature` header

**Handled Events:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment declined
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Refund processed

## 🗄️ Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  registration_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50),
  email VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Status Values:**
- `requires_payment_method` - Initial state
- `succeeded` - Payment complete
- `failed` - Payment failed
- `canceled` - Payment canceled
- `refunded` - Payment refunded

### Registrations Updates
```sql
ALTER TABLE registrations ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE registrations ADD COLUMN stripe_payment_intent_id TEXT;
```

**Payment Status Values:**
- `pending` - Not yet paid
- `paid` - Payment confirmed
- `failed` - Payment failed

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |
| `SERVER_URL` | No | Server URL for webhooks (default: http://localhost:3001) |
| `RESEND_API_KEY` | No | Resend API key for transactional emails |
| `EMAIL_FROM` | No | Sender identity for league emails |
| `SUPPORT_EMAIL` | No | Reply-to/support address used in emails |
| `RATE_LIMIT_WINDOW_MS` | No | Global rate-limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max API requests per IP per window |
| `PAYMENT_RATE_LIMIT_MAX_REQUESTS` | No | Max payment requests per IP per window |
| `NOTIFICATION_RATE_LIMIT_MAX_REQUESTS` | No | Max notification requests per IP per window |

## 🧪 Testing with Stripe

### Test Payment Methods

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Failed Payment:**
- Card: `4000 0000 0000 0002`

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

### Webhooks (Local Testing)

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhook events to local server
stripe listen --forward-to localhost:3001/webhooks/stripe

# In another terminal, trigger test events:
stripe trigger payment_intent.succeeded
```

## 📦 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t ralyx-backend ./server
docker run --env-file ./server/.env -p 3001:3001 ralyx-backend
```

### Health Checks
- `GET /health` - liveness
- `GET /health/ready` - readiness / env validation

### Security Controls
- CORS origin allowlist via `FRONTEND_URL` (comma-separated values supported)
- IP-based rate limiting on `/api/*`, with stricter limits on payment and notification routes
- Response hardening headers for content type sniffing, frames, and referrer policy

### Environment for Production
1. Set all required environment variables
2. Use production Stripe keys (sk_live_...)
3. Configure CORS origin for production frontend
4. Set HTTPS for webhook endpoints
5. Configure proper logging and monitoring
6. Add Resend credentials to enable transactional emails
7. Point Stripe webhooks to `/webhooks/stripe`
8. Verify `/health/ready` before routing traffic
9. Tune rate-limit environment values for your traffic profile

## 🐛 Debugging

### Enable verbose logging
```bash
DEBUG=* npm run dev
```

### Check payment status
```bash
curl http://localhost:3001/api/payments/pi_xxx
```

### Webhook logs
All webhooks are logged with timestamps. Monitor the console for event processing.

## 📝 Notes

- All amounts in cents ($50 = 5000 cents)
- Service role key required for database writes (backend only)
- Webhook signature verification is required for security
- Registration confirmation emails are sent from the backend when `RESEND_API_KEY` is configured

## 🤝 Contributing

This is part of the RALYX project. Follow the same coding standards and commit conventions.

## 📄 License

MIT

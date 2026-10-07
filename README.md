# RALYX - Premier Pickleball League Management Platform

A modern, full-stack web application for managing competitive pickleball leagues with real-time standings, secure payments, and comprehensive admin tools.

## 🎯 Project Overview

RALYX is a production-ready platform for league operators to manage:
- **Player Registration** with DUPR rating integration & payment processing
- **Real-time Standings** with leaderboard display
- **Match Management** with results entry and score tracking
- **Admin Controls** with secure authentication
- **Payment Processing** via Stripe integration

**Latest Build**: October 7, 2024 | **Status**: Production-Ready Core Features

## 🚀 What's Built

### ✅ Completed Features

**Phase 6B: Real Stripe Payment Processing**
- Express.js backend with Stripe API integration
- Webhook handlers for payment confirmations
- Frontend CardElement payment form
- Full end-to-end payment flow
- Production-grade error handling

**Phase 7: Standings & Leaderboard**
- Real-time standings page
- Player rankings with win/loss records
- DUPR rating display
- Responsive mobile design
- Season integration

**Phase 8: Authentication System**
- Supabase email/password authentication
- Protected admin routes
- Login page with secure session handling
- User session display
- Sign-out functionality

**Phase 9: Security Blueprint** 
- Comprehensive RLS (Row-Level Security) policies
- Database security architecture
- Backend authorization patterns
- Payment processing security
- Implementation & testing checklists

**Phase 10: Match Results Entry**
- Admin interface for recording match results
- Score entry with validation
- Winner selection (Player 1, Player 2, Draw)
- Real-time match list
- Standings update integration

## 💻 Tech Stack

### Frontend
- **React** 19.2.8 with TypeScript 6.0 (strict mode)
- **Vite** 8.3.0 for fast development & builds
- **React Router** for navigation
- **React Query** for server state management
- **Stripe.js** for payment integration
- **Oxlint** for code quality

### Backend
- **Node.js + Express** 4.18.2
- **TypeScript** with strict mode
- **Stripe API** for payment processing
- **Supabase** admin client for database operations
- **CORS** middleware for security

### Database
- **Supabase PostgreSQL** with real-time subscriptions
- Tables: players, registrations, standings, seasons, matches, sessions, payments, admin_users

### Deployment Ready
- Frontend: Supabase Hosting or Vercel
- Backend: Node.js (self-hosted or Fly.io/Heroku)
- Database: Supabase PostgreSQL
- Payments: Stripe (live mode)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase project with PostgreSQL database
- Stripe API keys (test or live)

### Frontend Setup
```bash
cd /Users/muzammilmohammed/Ralyx

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update with your values:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_STRIPE_PUBLIC_KEY
# VITE_BACKEND_URL

# Development
npm run dev      # Dev server at http://localhost:5173

# Production build
npm run build    # Build optimized bundle
npm run lint     # Run Oxlint checks
```

### Backend Setup
```bash
cd server

# Install dependencies  
npm install

# Create environment file
cp .env.example .env

# Update with your values:
# STRIPE_SECRET_KEY
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# FRONTEND_URL

# Development
npm run dev      # Server at http://localhost:3001

# Production
npm run build
npm start
```

## 🔑 Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
FRONTEND_URL=http://localhost:5173
```

## 🗂️ Project Structure

```
├── src/
│   ├── pages/                    # Page components
│   │   ├── Home.tsx             # Landing page
│   │   ├── Register.tsx         # Registration with payment
│   │   ├── Standings.tsx        # Leaderboard
│   │   ├── Login.tsx            # Admin login
│   │   └── admin/               # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── ResultsPage.tsx  # Match results entry
│   │       └── ...
│   ├── components/               # Reusable components
│   │   ├── Navigation.tsx
│   │   ├── StripeCheckout.tsx   # Payment form
│   │   ├── ProtectedRoute.tsx   # Route protection
│   │   └── ...
│   ├── services/                 # API integration
│   │   ├── stripeService.ts     # Stripe operations
│   │   ├── standings.service.ts # Standings queries
│   │   └── ...
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx      # Auth state
│   ├── types/                    # TypeScript types
│   └── lib/                      # Utilities
│       └── supabase.ts          # Supabase client
├── server/
│   ├── src/
│   │   ├── server.ts            # Express setup
│   │   ├── stripe.config.ts     # Stripe client
│   │   ├── supabase.ts          # Supabase admin
│   │   └── routes/              # API routes
│   │       ├── payment.routes.ts
│   │       ├── webhook.routes.ts
│   │       └── health.routes.ts
│   └── package.json
├── SECURITY.md                   # Security guide
├── PROJECT_STATUS.md             # Build status report
└── README.md                     # This file
```

## 🔐 Security

### Current Implementation
- ✅ Supabase Authentication
- ✅ Protected admin routes
- ✅ Stripe webhook signature verification
- ✅ CORS headers configured
- ✅ TypeScript strict mode (prevents type issues)
- ✅ Environment variable protection
- ✅ Production RLS script in [supabase/rls_setup.sql](supabase/rls_setup.sql)

### Roadmap
- [ ] Apply RLS script in Supabase project
- [ ] Rate limiting
- [ ] 2FA for admin accounts
- [ ] Audit logging
- [ ] Data encryption at rest

**For full security documentation**, see [SECURITY.md](./SECURITY.md)

### Supabase Security Apply Order
1. Run [src/lib/database.schema.sql](src/lib/database.schema.sql)
2. Run [supabase/rls_setup.sql](supabase/rls_setup.sql)
3. Insert your admin user into `admin_users`
4. Verify public registration and admin dashboard flows

## 🧪 Testing

### Build Verification
```bash
npm run build  # Verify no TypeScript errors
npm run lint   # Check code quality

# Check specific files
npm run build -- src/pages/Standings.tsx
```

### Manual Testing Checklist
- [ ] Landing page loads
- [ ] Registration flow works
- [ ] Stripe payment processes (test mode)
- [ ] Standings page displays
- [ ] Admin login works
- [ ] Admin routes protected
- [ ] Match results entry functions

## 📊 Current Build Status

| Metric | Status |
|--------|--------|
| **Build** | ✅ 202 modules, 0 errors |
| **Lint** | ✅ 0 errors, 3 warnings (pre-existing) |
| **TypeScript** | ✅ Strict mode, 100% typed |
| **Bundle Size** | ~263 kB JS, ~59 kB CSS |
| **Build Time** | ~150ms (optimized) |

## 🚀 Deployment

### Frontend Deployment (Supabase/Vercel)
```bash
# Build
npm run build

# Deploy (Vercel example)
vercel deploy
```

### Backend Deployment
```bash
cd server

# Build
npm run build

# Deploy to Fly.io/Heroku/Self-hosted
fly deploy
# OR
heroku create ralyx-api
heroku config:set STRIPE_SECRET_KEY=sk_...
git push heroku main
```

## 📋 API Endpoints

### Payment Endpoints
- `POST /api/payments/create-intent` - Create Stripe PaymentIntent
- `GET /api/payments/:paymentIntentId` - Get payment status
- `POST /api/payments/confirm` - Confirm payment & update registration

### Webhooks
- `POST /webhooks/stripe` - Stripe webhook handler

### Health
- `GET /health` - Health check

## 🎯 Next Steps (Recommended)

### Phase 11: Match Scheduling
- Weekly session creation
- Court/time assignments
- Conflict resolution

### Phase 12: Email Notifications
- Waitlist confirmations
- Registration confirmation emails
- Payment receipts / season details

### Phase 13: Analytics Dashboard
- Registration metrics
- Payment summaries
- Player statistics

### Phase 14: Production Deployment
- Domain setup
- SSL certificates
- Database backups
- Monitoring alerts
- RLS policy implementation

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)** - Security architecture & RLS policies
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Build session report
- **[server/README.md](./server/README.md)** - Backend API documentation
- **[.env.example](./.env.example)** - Environment variables reference

## 🤝 Contributing

Guidelines:
1. Create feature branches (`git checkout -b feature/name`)
2. Use TypeScript strict mode
3. Run `npm run lint` before committing
4. Keep components focused and reusable
5. Document complex business logic

## 📞 Support

For issues or questions:
1. Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for build info
2. Review [SECURITY.md](./SECURITY.md) for security questions
3. Check Git history for implementation details
4. Review component documentation inline

## 📄 License

Private project - RALYX League Management

---

**Last Updated**: October 7, 2024  
**Current Version**: 1.0 (Feature Complete Core)  
**Next Milestone**: Production Deployment

Built with ❤️ for pickleball league operators.

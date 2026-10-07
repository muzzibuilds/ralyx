/**
 * RALYX Row-Level Security (RLS) & Data Security
 * Phase 9: Security Implementation Guide
 * 
 * This document outlines all RLS policies and security measures
 * required for production deployment.
 */

# RALYX Security & RLS Implementation Guide

## Overview

This guide covers Row-Level Security (RLS) policies, data access control, and security best practices for the RALYX league management platform.

## Core Security Principles

1. **Users own their data**: Players can only access their own registrations and profiles
2. **Admins have full access**: League administrators can view and modify all data
3. **Public data is readable**: Standings, schedules, and results are public
4. **Write access is restricted**: Only authorized users can modify data
5. **Audit trails**: Track who made changes and when

## Database Tables & RLS Policies

### 1. PUBLIC SCHEMA

#### players table

**Purpose**: Store player profiles and DUPR ratings
**Ownership**: Players own their own record, admins can edit all

```sql
-- RLS Policy: Players can read all (public leaderboard)
CREATE POLICY "Players can read all"
ON public.players
FOR SELECT
USING (true);

-- RLS Policy: Players can update their own record
CREATE POLICY "Players can update own"
ON public.players
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policy: Admins can do anything
CREATE POLICY "Admins can manage players"
ON public.players
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### registrations table

**Purpose**: Store registration records and payment info
**Ownership**: Players own their registration, admins can manage all

```sql
-- RLS Policy: Players can read their own registration
CREATE POLICY "Players can read own registration"
ON public.registrations
FOR SELECT
USING (auth.uid() = player_id);

-- RLS Policy: Admins can read all registrations
CREATE POLICY "Admins can read all registrations"
ON public.registrations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));

-- RLS Policy: Players can update their own (status only)
CREATE POLICY "Players can update own registration"
ON public.registrations
FOR UPDATE
USING (auth.uid() = player_id)
WITH CHECK (
  auth.uid() = player_id AND
  status != 'confirmed'  -- Cannot modify after confirmed
);

-- RLS Policy: Admins can update all
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));

-- RLS Policy: Only system/admins can insert
CREATE POLICY "Only admins can create registrations"
ON public.registrations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### standings table

**Purpose**: Season standings and leaderboard
**Access**: Public read, admin write only

```sql
-- RLS Policy: Public can read standings
CREATE POLICY "Public can read standings"
ON public.standings
FOR SELECT
USING (true);

-- RLS Policy: Only admins can write standings
CREATE POLICY "Only admins can modify standings"
ON public.standings
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));

CREATE POLICY "Only admins can update standings"
ON public.standings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### seasons table

**Purpose**: Season/tournament configuration
**Access**: Public read, admin write

```sql
-- RLS Policy: Public can read seasons
CREATE POLICY "Public can read seasons"
ON public.seasons
FOR SELECT
USING (true);

-- RLS Policy: Only admins can manage seasons
CREATE POLICY "Only admins can manage seasons"
ON public.seasons
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### matches table

**Purpose**: Match scheduling and results
**Access**: Public read, players/admins can write results

```sql
-- RLS Policy: Public can read matches
CREATE POLICY "Public can read matches"
ON public.matches
FOR SELECT
USING (true);

-- RLS Policy: Players can only update matches they're in
CREATE POLICY "Players can update own matches"
ON public.matches
FOR UPDATE
USING (
  auth.uid() = player1_id OR 
  auth.uid() = player2_id
)
WITH CHECK (
  (auth.uid() = player1_id OR auth.uid() = player2_id) AND
  (status = 'scheduled' OR status = 'in_progress')
);

-- RLS Policy: Admins can manage all matches
CREATE POLICY "Admins can manage matches"
ON public.matches
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### sessions table

**Purpose**: Weekly sessions and court assignments
**Access**: Public read, admin write

```sql
-- RLS Policy: Public can read sessions
CREATE POLICY "Public can read sessions"
ON public.sessions
FOR SELECT
USING (true);

-- RLS Policy: Only admins can manage sessions
CREATE POLICY "Only admins can manage sessions"
ON public.sessions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));
```

#### payments table

**Purpose**: Stripe payment records
**Access**: Private, players see their own, admins see all

```sql
-- RLS Policy: Players can only read their own payments
CREATE POLICY "Players can read own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = player_id OR player_id IS NULL);

-- RLS Policy: Admins can read all payments
CREATE POLICY "Admins can read all payments"
ON public.payments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid()
));

-- RLS Policy: Only backend can insert payments
-- (Authorization handled in backend API)
CREATE POLICY "Backend service can create payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.jwt() ->> 'iss' = 'YOUR_BACKEND_SERVICE_ROLE');
```

#### admin_users table

**Purpose**: Admin user registry
**Access**: Private, only admins

```sql
-- RLS Policy: Only admins can read this table
CREATE POLICY "Only admins can view admin list"
ON public.admin_users
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_users as au
  WHERE au.user_id = auth.uid()
));

-- RLS Policy: Cannot modify this table from client
-- All admin changes should go through backend
CREATE POLICY "No direct admin modifications"
ON public.admin_users
FOR UPDATE
USING (false)
WITH CHECK (false);
```

## Backend API Security

### Authentication

All backend API endpoints require:
1. Valid Supabase JWT token in `Authorization: Bearer <token>` header
2. Server-side validation of user permissions
3. Never trust client-provided user_id

### Authorization Pattern (Backend)

```typescript
// Verify user is authenticated
const { user } = await supabase.auth.getUser(token);
if (!user) throw new Error('Unauthorized');

// Check permissions based on operation
const isAdmin = await checkAdminStatus(user.id);
const isOwner = user.id === resource.owner_id;

if (!isAdmin && !isOwner) {
  throw new Error('Forbidden');
}
```

### Payment Processing (Secure)

1. **Client sends**: email, firstName, lastName, registrationId
2. **Server verifies**: registrationId belongs to authenticated player
3. **Server creates**: Stripe PaymentIntent with metadata
4. **Server stores**: Payment record in database
5. **Webhook updates**: Payment status after Stripe confirmation
6. **RLS prevents**: Other players from seeing this payment

## Implementation Checklist

- [x] Create production SQL script: [supabase/rls_setup.sql](supabase/rls_setup.sql)
- [ ] Enable RLS on all tables
- [ ] Create base policies for each table
- [ ] Test policies with different user roles
- [ ] Set up admin_users table with initial admins
- [ ] Document admin onboarding procedure
- [ ] Implement rate limiting on payment endpoints
- [ ] Add audit logging for sensitive operations
- [ ] Set up monitoring for suspicious activity
- [ ] Create password policy requirements
- [ ] Implement 2FA for admin accounts
- [ ] Regular security audits (monthly)
- [ ] Backup strategy (daily backups to cold storage)

## Testing RLS Policies

### Test Script Template

```typescript
// Test: Player can read own registration
const playerUser = { id: 'player123' };
const result = await supabase
  .from('registrations')
  .select('*')
  .eq('player_id', playerUser.id)
  .single();
// Should succeed

// Test: Player cannot read other registrations
const otherPlayerResult = await supabase
  .from('registrations')
  .select('*')
  .eq('player_id', 'other_player_id')
  .single();
// Should return empty result

// Test: Admin can read all
const adminUser = { id: 'admin123' };
const allRegistrations = await supabase
  .from('registrations')
  .select('*');
// Should return all registrations
```

## Deployment Checklist

### SQL Apply Order

1. Run [src/lib/database.schema.sql](src/lib/database.schema.sql)
2. Run [supabase/rls_setup.sql](supabase/rls_setup.sql)
3. Insert at least one admin into `public.admin_users`
4. Validate:
  - public registration insert works
  - admin login can read/write protected tables
  - service-role backend can manage `payments`

### Pre-Production

- [ ] All RLS policies deployed and tested
- [ ] Admin users configured
- [ ] Stripe webhook signatures verified
- [ ] Email notifications configured
- [ ] Backup routine scheduled
- [ ] Monitoring alerts set up
- [x] Rate limiting configured

### Production

- [ ] Enable HTTPS only
- [ ] Configure CORS properly (whitelist domains)
- [ ] SSO/OAuth setup for future scaling
- [ ] Regular security updates
- [ ] Intrusion detection monitoring
- [ ] Data retention policies

### Backend Runtime Controls

- API traffic is rate limited at the Express layer.
- Payment and notification endpoints use tighter per-IP limits than the rest of the API.
- `FRONTEND_URL` supports a comma-separated allowlist for multi-environment CORS.
- Readiness checks are exposed on `/health/ready` for deployment gating.

## Security Contacts & Incident Response

- **Security Issues**: security@ralyx.local
- **On-Call Admin**: Defined in admin panel
- **Incident Response Time**: 1 hour for high severity

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Security Checklist](https://owasp.org/www-project-web-security-testing-guide/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-07  
**Maintained By**: RALYX Dev Team

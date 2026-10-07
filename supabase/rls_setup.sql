-- RALYX production security setup
-- Run this AFTER src/lib/database.schema.sql in the Supabase SQL editor.
-- This script is idempotent and focuses on production-ready row-level security.

begin;

-- ============================================================
-- SUPPORTING TABLES / COLUMNS
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text unique not null,
  role text not null default 'admin' check (role in ('admin', 'operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  amount numeric(10, 2) not null,
  currency text not null default 'usd',
  status text not null,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations
  add column if not exists payment_status text default 'pending'
  check (payment_status in ('pending', 'paid', 'failed'));

create index if not exists idx_admin_users_user_id on public.admin_users(user_id);
create index if not exists idx_payments_registration_id on public.payments(registration_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_registrations_payment_status on public.registrations(payment_status);

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table public.admin_users enable row level security;
alter table public.payments enable row level security;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.is_active = true
      and (
        au.user_id = auth.uid()
        or lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ============================================================
-- CLEAN UP LEGACY POLICIES
-- ============================================================

-- seasons
 drop policy if exists "Seasons are viewable by everyone" on public.seasons;
 drop policy if exists "Public can read seasons" on public.seasons;
 drop policy if exists "Only admins can manage seasons" on public.seasons;

-- players
 drop policy if exists "Players are viewable by everyone" on public.players;
 drop policy if exists "Players can read all" on public.players;
 drop policy if exists "Players can update own" on public.players;
 drop policy if exists "Admins can manage players" on public.players;

-- registrations
 drop policy if exists "Registrations visible to own player and admin" on public.registrations;
 drop policy if exists "Players can read own registration" on public.registrations;
 drop policy if exists "Admins can read all registrations" on public.registrations;
 drop policy if exists "Players can update own registration" on public.registrations;
 drop policy if exists "Admins can update registrations" on public.registrations;
 drop policy if exists "Only admins can create registrations" on public.registrations;

-- demand leads
 drop policy if exists "Demand leads visible to everyone (public)" on public.demand_leads;

-- sessions
 drop policy if exists "Sessions are viewable by everyone" on public.sessions;
 drop policy if exists "Public can read sessions" on public.sessions;
 drop policy if exists "Only admins can manage sessions" on public.sessions;

-- court assignments
 drop policy if exists "Court assignments are viewable by everyone" on public.court_assignments;

-- matches
 drop policy if exists "Matches are viewable by everyone" on public.matches;
 drop policy if exists "Public can read matches" on public.matches;
 drop policy if exists "Players can update own matches" on public.matches;
 drop policy if exists "Admins can manage matches" on public.matches;

-- awards
 drop policy if exists "Awards are viewable by everyone" on public.awards;

-- standings
 drop policy if exists "Standings are viewable by everyone" on public.standings;
 drop policy if exists "Public can read standings" on public.standings;
 drop policy if exists "Only admins can modify standings" on public.standings;
 drop policy if exists "Only admins can update standings" on public.standings;

-- admin_users / payments
 drop policy if exists "Admins can view admin users" on public.admin_users;
 drop policy if exists "Service role manages admin users" on public.admin_users;
 drop policy if exists "Admins can read payments" on public.payments;
 drop policy if exists "Service role manages payments" on public.payments;

-- ============================================================
-- TABLE POLICIES
-- ============================================================

-- Seasons
create policy "public_read_seasons"
  on public.seasons
  for select
  using (true);

create policy "admin_manage_seasons"
  on public.seasons
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Players
-- Public read is currently required for leaderboard joins and registration email lookups.
create policy "public_read_players"
  on public.players
  for select
  using (true);

create policy "public_insert_players"
  on public.players
  for insert
  with check (true);

create policy "admin_update_players"
  on public.players
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_players"
  on public.players
  for delete
  to authenticated
  using (public.is_admin());

-- Registrations
-- Public can create registrations and only read confirmed rows. Admins can manage all.
create policy "public_insert_registrations"
  on public.registrations
  for insert
  with check (true);

create policy "public_read_confirmed_registrations"
  on public.registrations
  for select
  using (status = 'confirmed');

create policy "admin_read_all_registrations"
  on public.registrations
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_update_registrations"
  on public.registrations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_registrations"
  on public.registrations
  for delete
  to authenticated
  using (public.is_admin());

-- Demand leads
create policy "public_insert_demand_leads"
  on public.demand_leads
  for insert
  with check (true);

create policy "admin_manage_demand_leads"
  on public.demand_leads
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sessions
create policy "public_read_sessions"
  on public.sessions
  for select
  using (true);

create policy "admin_manage_sessions"
  on public.sessions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Court assignments
create policy "public_read_court_assignments"
  on public.court_assignments
  for select
  using (true);

create policy "admin_manage_court_assignments"
  on public.court_assignments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Matches
create policy "public_read_matches"
  on public.matches
  for select
  using (true);

create policy "admin_manage_matches"
  on public.matches
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Awards
create policy "public_read_awards"
  on public.awards
  for select
  using (true);

create policy "admin_manage_awards"
  on public.awards
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Standings
create policy "public_read_standings"
  on public.standings
  for select
  using (true);

create policy "admin_manage_standings"
  on public.standings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin users
create policy "admins_read_admin_users"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

create policy "admins_manage_admin_users"
  on public.admin_users
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Payments
create policy "admins_read_payments"
  on public.payments
  for select
  to authenticated
  using (public.is_admin());

-- No anon/authenticated client writes to payments. Backend service_role bypasses RLS.

-- ============================================================
-- GRANTS
-- ============================================================

grant usage on schema public to anon, authenticated;
grant select on public.seasons, public.sessions, public.court_assignments, public.matches, public.awards, public.standings to anon, authenticated;
grant select on public.players to anon, authenticated;
grant insert on public.players, public.registrations, public.demand_leads to anon, authenticated;
grant select on public.registrations to anon, authenticated;
grant all on public.admin_users, public.payments to service_role;
grant all on public.seasons, public.players, public.registrations, public.demand_leads, public.sessions, public.court_assignments, public.matches, public.awards, public.standings to service_role;

commit;

-- ============================================================
-- POST-RUN CHECKLIST
-- ============================================================
-- 1. Insert at least one admin row, e.g.:
--    insert into public.admin_users (user_id, email, role)
--    values ('YOUR_AUTH_USER_UUID', 'you@example.com', 'admin')
--    on conflict (email) do update set user_id = excluded.user_id, is_active = true;
--
-- 2. Test public registration flow (players + registrations + demand_leads inserts).
-- 3. Test authenticated admin CRUD in the dashboard.
-- 4. Confirm the backend service role can create/update payments.

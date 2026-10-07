/**
 * RALYX Database Schema
 * 
 * Run this SQL in the Supabase SQL editor to set up the database.
 * Then run supabase/rls_setup.sql for production-ready policies,
 * admin access control, and payment tables.
 * 
 * Tables:
 * - seasons
 * - players
 * - registrations
 * - demand_leads
 * - sessions
 * - court_assignments
 * - matches
 * - awards
 * - standings
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp functions
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================================
-- SEASONS TABLE
-- ============================================================
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 16,
  min_dupr_rating DECIMAL NOT NULL DEFAULT 4.0,
  registration_price NUMERIC(10, 2),
  registration_open_date TIMESTAMP WITH TIME ZONE,
  registration_close_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'full', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (start_date < end_date)
);

-- ============================================================
-- PLAYERS TABLE
-- ============================================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  dupr_rating DECIMAL(4, 2) NOT NULL,
  dupr_profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX idx_players_email ON players(email);

-- ============================================================
-- REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'payment_pending', 'paid', 'confirmed', 'waitlisted', 'cancelled', 'refunded')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  amount NUMERIC(10, 2),
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_player_season UNIQUE (player_id, season_id)
);

-- Create indexes for common queries
CREATE INDEX idx_registrations_season ON registrations(season_id);
CREATE INDEX idx_registrations_player ON registrations(player_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- ============================================================
-- DEMAND LEADS TABLE
-- Queue of interested players when season is full
-- ============================================================
CREATE TABLE demand_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  dupr_rating DECIMAL(4, 2),
  dupr_profile_url TEXT,
  preferred_day TEXT CHECK (preferred_day IN ('Saturday', 'Sunday', 'Either')),
  reason TEXT[], -- Array of reasons like 'consistent_competition', 'dupr_matches', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on email for deduplication
CREATE INDEX idx_demand_leads_email ON demand_leads(email);

-- ============================================================
-- SESSIONS TABLE
-- Weekly playing sessions
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_season_week UNIQUE (season_id, week_number)
);

-- Create index for timeline queries
CREATE INDEX idx_sessions_season_date ON sessions(season_id, session_date);

-- ============================================================
-- COURT ASSIGNMENTS TABLE
-- Court group assignments for each set
-- ============================================================
CREATE TABLE court_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number IN (1, 2)),
  court_number INTEGER NOT NULL CHECK (court_number IN (1, 2, 3, 4)),
  players UUID[] NOT NULL, -- Array of player IDs (max 4)
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_court_assignment UNIQUE (session_id, set_number, court_number)
);

-- Create index for court lookups
CREATE INDEX idx_court_assignments_session ON court_assignments(session_id);

-- ============================================================
-- MATCHES TABLE
-- Individual game results
-- ============================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  court_assignment_id UUID NOT NULL REFERENCES court_assignments(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number IN (1, 2)),
  team1_players UUID[] NOT NULL, -- Array of player IDs (2 players)
  team2_players UUID[] NOT NULL, -- Array of player IDs (2 players)
  team1_score INTEGER NOT NULL CHECK (team1_score >= 0),
  team2_score INTEGER NOT NULL CHECK (team2_score >= 0),
  winner INTEGER NOT NULL CHECK (winner IN (1, 2)),
  point_differential INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_matches_session ON matches(session_id);
CREATE INDEX idx_matches_court ON matches(court_assignment_id);

-- ============================================================
-- AWARDS TABLE
-- Weekly recognition and awards
-- ============================================================
CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  award_type TEXT NOT NULL CHECK (award_type IN ('king_of_court', 'perfect_six', 'biggest_climber', 'upset_of_the_week', 'court_1_streak')),
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_award UNIQUE (session_id, player_id, award_type)
);

-- Create indexes for award queries
CREATE INDEX idx_awards_session ON awards(session_id);
CREATE INDEX idx_awards_player ON awards(player_id);

-- ============================================================
-- STANDINGS TABLE
-- Season standings (snapshot per player per update)
-- ============================================================
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_percentage DECIMAL(5, 2) DEFAULT 0.00,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  point_differential INTEGER NOT NULL DEFAULT 0,
  current_court INTEGER CHECK (current_court IN (1, 2, 3, 4)),
  court_1_appearances INTEGER DEFAULT 0,
  perfect_6_games INTEGER DEFAULT 0,
  season_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_standing UNIQUE (season_id, player_id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_standings_season ON standings(season_id);
CREATE INDEX idx_standings_player ON standings(player_id);
CREATE INDEX idx_standings_rank ON standings(season_id, rank);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- NOTE: baseline policies below are development-friendly.
-- For production, run supabase/rls_setup.sql after this file.
-- ============================================================

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Seasons: Public read, admin write
CREATE POLICY "Seasons are viewable by everyone"
  ON seasons FOR SELECT
  USING (true);

-- Players: Public read (excluding sensitive data handled at app level), admin write
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT
  USING (true);

-- Registrations: Readable by self and admin
CREATE POLICY "Registrations visible to own player and admin"
  ON registrations FOR SELECT
  USING (true); -- Will be filtered at app level

-- Demand Leads: Admin read/write only
CREATE POLICY "Demand leads visible to everyone (public)"
  ON demand_leads FOR SELECT
  USING (true);

-- Sessions: Public read
CREATE POLICY "Sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (true);

-- Court Assignments: Public read
CREATE POLICY "Court assignments are viewable by everyone"
  ON court_assignments FOR SELECT
  USING (true);

-- Matches: Public read
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

-- Awards: Public read
CREATE POLICY "Awards are viewable by everyone"
  ON awards FOR SELECT
  USING (true);

-- Standings: Public read
CREATE POLICY "Standings are viewable by everyone"
  ON standings FOR SELECT
  USING (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_assignments_updated_at BEFORE UPDATE ON court_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DATA (For Development - Can be deleted for production)
-- ============================================================

-- Insert a sample season
INSERT INTO seasons (name, location, start_date, end_date, capacity, min_dupr_rating, status)
VALUES (
  'Season I',
  'Columbus',
  NOW(),
  NOW() + INTERVAL '8 weeks',
  16,
  4.0,
  'open'
);

/**
 * Application configuration and constants
 * Centralized settings for RALYX
 */

export const APP_CONFIG = {
  // League configuration
  LEAGUE_NAME: 'RALYX',
  TAGLINE: 'EARN YOUR COURT',
  SEASON_NAME: 'Season I',
  SEASON_LOCATION: 'Columbus',

  // Season configuration
  TOTAL_PLAYERS: 16,
  TOTAL_COURTS: 4,
  GAMES_PER_WEEK: 6,
  SEASON_WEEKS: 8,
  MIN_DUPR_RATING: 4.0,

  // Session configuration
  SESSION_DAY: 'Saturday',
  SESSION_START_TIME: '9:00 AM',
  SESSION_END_TIME: '11:00 AM',
  GAMES_PER_SET: 3,
  TOTAL_SETS: 2,

  // Messaging
  DEMAND_QUEUE_ENABLED: true,
  REGISTRATION_OPEN: true,

  // Development / Environment
  ENVIRONMENT: (import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production',
} as const;

export const BRAND_COLORS = {
  primary: {
    dark: '#0f1117',
    darker: '#06070d',
  },
  accent: {
    lime: '#00ff00',
    bright: '#00ff00',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e8e8e8',
    tertiary: '#a0a0a0',
  },
  border: {
    default: '#1a1a1f',
    light: '#2a2a2f',
  },
} as const;

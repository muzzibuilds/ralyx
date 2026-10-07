/**
 * Shared TypeScript types for RALYX application
 */

/**
 * Player registration status
 */
export type RegistrationStatus = 
  | 'pending'
  | 'approved'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'waitlisted'
  | 'cancelled'
  | 'refunded';

/**
 * Base player information
 */
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  duprRating: number;
  duprProfileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Registration record
 */
export interface Registration {
  id: string;
  playerId: string;
  seasonId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  paidAt?: Date;
  amount?: number;
  stripeSessionId?: string;
}

/**
 * Demand queue lead (interested player when season is full)
 */
export interface DemandLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  duprRating: number;
  duprProfileUrl?: string;
  preferredDay?: 'Saturday' | 'Sunday' | 'Either';
  reason?: string[];
  createdAt: Date;
}

/**
 * Season configuration
 */
export interface Season {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  minDuprRating: number;
  registrationPrice: number;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  status: 'draft' | 'open' | 'full' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Weekly session
 */
export interface Session {
  id: string;
  seasonId: string;
  weekNumber: number;
  sessionDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Court assignment for a session
 */
export interface CourtAssignment {
  id: string;
  sessionId: string;
  setNumber: 1 | 2;
  courtNumber: 1 | 2 | 3 | 4;
  players: string[]; // Player IDs
  status: 'scheduled' | 'in_progress' | 'completed';
}

/**
 * Match result
 */
export interface Match {
  id: string;
  sessionId: string;
  courtId: string;
  setNumber: 1 | 2;
  team1Players: string[]; // Player IDs
  team2Players: string[]; // Player IDs
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  pointDifferential: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Weekly award/recognition
 */
export type AwardType = 
  | 'king_of_court'
  | 'perfect_six'
  | 'biggest_climber'
  | 'upset_of_the_week'
  | 'court_1_streak';

export interface Award {
  id: string;
  sessionId: string;
  playerId: string;
  awardType: AwardType;
  description: string;
  displayOrder: number;
  createdAt: Date;
}

/**
 * Season standings for a player
 */
export interface Standing {
  id: string;
  seasonId: string;
  playerId: string;
  rank: number;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  currentCourt: 1 | 2 | 3 | 4;
  court1Appearances: number;
  perfect6Games: number;
  seasonPoints: number;
  lastUpdated: Date;
}

/**
 * UI component props types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export type CardVariant = 'default' | 'elevated' | 'highlighted';

export interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
}

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

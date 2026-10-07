/**
 * Standings & Results Types
 */

export interface Standing {
  id: string;
  seasonId: string;
  playerId: string;
  wins: number;
  losses: number;
  draws: number;
  points: number; // calculated: wins * 3 + draws * 1
  matchesPlayed: number; // wins + losses + draws
  winRate: number; // (wins / matchesPlayed) * 100
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  seasonId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  winner: 'player1' | 'player2' | 'draw' | null; // null = not yet played
  player1Score?: number;
  player2Score?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  playedAt?: string;
  scheduledFor?: string; // ISO datetime
  court?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonStats {
  seasonId: string;
  seasonName: string;
  totalRegistrations: number;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  topPlayer?: {
    id: string;
    name: string;
    wins: number;
    points: number;
  };
}

export interface PlayerStandingWithDetails extends Standing {
  playerName: string;
  playerEmail: string;
  duprRating?: number;
  duprProfileUrl?: string;
  rank: number; // calculated based on points
}

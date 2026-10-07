/**
 * Standings Page
 * Displays season standings and leaderboard rankings
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { standingService } from '../services/standings.service';
import { seasonService } from '../services/seasons.service';
import type { Standing, Season } from '../types';
import './Standings.css';

interface StandingWithPlayers extends Standing {
  players?: {
    first_name: string;
    last_name: string;
    dupr_rating?: number;
  };
}

export function StandingsPage() {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current season on mount
  useEffect(() => {
    const loadSeason = async () => {
      try {
        setLoading(true);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const season = await seasonService.getCurrentSeason() as any;
        if (!season) {
          setError('No active season found');
          setLoading(false);
          return;
        }
        setCurrentSeason(season);
      } catch (err) {
        console.error('Error loading season:', err);
        setError('Failed to load season data');
        setLoading(false);
      }
    };

    loadSeason();
  }, []);

  // Fetch standings for current season
  const { data: standings, isLoading: standingsLoading, isError: standingsError } = useQuery({
    queryKey: ['standings', currentSeason?.id],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => currentSeason ? standingService.getSeasonStandings(currentSeason.id) as Promise<StandingWithPlayers[]> : Promise.resolve([]),
    enabled: !!currentSeason,
  });

  if (loading) {
    return (
      <div className="standings-container">
        <div className="loading">Loading standings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="standings-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="standings-container">
      {/* Header */}
      <div className="standings-header">
        <h1>Season Standings</h1>
        {currentSeason && (
          <p className="season-info">
            {currentSeason.name} • {new Date(currentSeason.startDate).toLocaleDateString()} - {new Date(currentSeason.endDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Standings Table */}
      {standingsLoading ? (
        <div className="loading">Loading standings...</div>
      ) : standingsError ? (
        <div className="error">Failed to load standings</div>
      ) : standings && standings.length > 0 ? (
        <div className="standings-table-wrapper">
          <table className="standings-table">
            <thead>
              <tr>
                <th className="rank">Rank</th>
                <th className="player">Player</th>
                <th className="record">Record</th>
                <th className="points">Points</th>
                <th className="dupr">DUPR Rating</th>
                <th className="other">PF</th>
                <th className="other">PA</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing: StandingWithPlayers, idx: number) => (
                <tr key={standing.id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                  <td className="rank">
                    <span className="rank-badge">{standing.rank}</span>
                  </td>
                  <td className="player">
                    <div className="player-info">
                      <span className="player-name">
                        {standing.players?.first_name} {standing.players?.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="record">
                    <span className="record-text">
                      {standing.wins}-{standing.losses}
                    </span>
                    <span className="win-pct">({(standing.winPercentage * 100).toFixed(1)}%)</span>
                  </td>
                  <td className="points">
                    <span className="points-value">{standing.seasonPoints}</span>
                  </td>
                  <td className="dupr">
                    {standing.players?.dupr_rating ? (
                      <span className="dupr-rating">{standing.players.dupr_rating.toFixed(2)}</span>
                    ) : (
                      <span className="no-rating">-</span>
                    )}
                  </td>
                  <td className="other">{standing.pointsFor}</td>
                  <td className="other">{standing.pointsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-standings">
          <p>No standings data available yet.</p>
          <p className="secondary">Standings will appear once matches have been played.</p>
        </div>
      )}

      {/* Stats Summary */}
      {standings && standings.length > 0 && (
        <div className="standings-stats">
          <div className="stat-card">
            <div className="stat-label">Total Players</div>
            <div className="stat-value">{standings.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Leader</div>
            <div className="stat-value">
              {standings[0]?.players?.first_name} {standings[0]?.players?.last_name}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Leader Record</div>
            <div className="stat-value">
              {standings[0]?.wins}-{standings[0]?.losses}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StandingsPage;

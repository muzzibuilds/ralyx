/**
 * Results Page (Admin)
 * Record and manage match results
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import './ResultsPage.css';

interface Match {
  id: string;
  season_id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  player1_score?: number;
  player2_score?: number;
  winner?: 'player1' | 'player2' | 'draw' | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  played_at?: string;
  scheduled_for: string;
  court?: number;
  notes?: string;
}

export function ResultsPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch scheduled/in-progress matches
  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ['matches', 'scorecard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:player1_id(first_name, last_name),
          player2:player2_id(first_name, last_name)
        `)
        .in('status', ['scheduled', 'in_progress', 'completed'])
        .order('scheduled_for', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Format the response
      return (data || []).map((match: any) => ({
        id: match.id,
        season_id: match.season_id,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        player1_name: match.player1?.first_name + ' ' + match.player1?.last_name,
        player2_name: match.player2?.first_name + ' ' + match.player2?.last_name,
        player1_score: match.player1_score,
        player2_score: match.player2_score,
        winner: match.winner,
        status: match.status,
        played_at: match.played_at,
        scheduled_for: match.scheduled_for,
        court: match.court,
        notes: match.notes,
      }));
    },
  });

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setPlayer1Score(match.player1_score?.toString() || '');
    setPlayer2Score(match.player2_score?.toString() || '');
    setWinner(match.winner || '');
    setError('');
    setSuccess('');
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !winner) {
      setError('Please select a winner');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const p1Score = parseInt(player1Score, 10);
      const p2Score = parseInt(player2Score, 10);

      if (isNaN(p1Score) || isNaN(p2Score)) {
        throw new Error('Please enter valid scores');
      }

      // Update match result
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          player1_score: p1Score,
          player2_score: p2Score,
          winner,
          played_at: new Date().toISOString(),
        })
        .eq('id', selectedMatch.id);

      if (updateError) throw updateError;

      // Update standings (this would typically be done via a Supabase function)
      // For now, just update the match
      setSuccess('Match result recorded successfully!');
      setSelectedMatch(null);
      setPlayer1Score('');
      setPlayer2Score('');
      setWinner('');
      refetch();
    } catch (err) {
      console.error('Error saving result:', err);
      setError(err instanceof Error ? err.message : 'Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page results-page">
      <div className="admin-page__header">
        <h1>Match Results</h1>
        <p className="admin-page__subtitle">Record and manage match results</p>
      </div>

      <div className="results-layout">
        {/* Matches List */}
        <div className="results-matches-list">
          <h2>Scores to Enter</h2>

          {isLoading ? (
            <div className="results-loading">Loading matches...</div>
          ) : matches && matches.length > 0 ? (
            <div className="results-cards">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={`results-card ${selectedMatch?.id === match.id ? 'results-card--selected' : ''}`}
                  onClick={() => handleSelectMatch(match)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="results-card__status">
                    <span className={`status-badge status-badge--${match.status}`}>
                      {match.status === 'scheduled' && 'Scheduled'}
                      {match.status === 'in_progress' && 'In Progress'}
                      {match.status === 'completed' && 'Completed'}
                    </span>
                  </div>

                  <div className="results-card__matchup">
                    <div className="results-card__player">
                      <span className="player-name">{match.player1_name}</span>
                      {match.player1_score !== undefined && (
                        <span className="player-score">{match.player1_score}</span>
                      )}
                    </div>

                    <div className="results-card__vs">vs</div>

                    <div className="results-card__player">
                      <span className="player-name">{match.player2_name}</span>
                      {match.player2_score !== undefined && (
                        <span className="player-score">{match.player2_score}</span>
                      )}
                    </div>
                  </div>

                  <div className="results-card__meta">
                    <span className="meta-item">
                      {new Date(match.scheduled_for).toLocaleDateString()}
                    </span>
                    {match.court && (
                      <span className="meta-item">Court {match.court}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-empty">
              <p>No matches to record</p>
            </div>
          )}
        </div>

        {/* Result Entry Form */}
        <div className="results-form-panel">
          {selectedMatch ? (
            <>
              <h2>Record Result</h2>

              <div className="results-form-header">
                <div className="match-players">
                  <div className="player-card">
                    <div className="player-number">1</div>
                    <div className="player-info">
                      <p className="player-name">{selectedMatch.player1_name}</p>
                    </div>
                  </div>
                  <div className="player-vs">VS</div>
                  <div className="player-card">
                    <div className="player-number">2</div>
                    <div className="player-info">
                      <p className="player-name">{selectedMatch.player2_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="results-error">{error}</div>}
              {success && <div className="results-success">{success}</div>}

              <form onSubmit={handleSubmitResult} className="results-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Player 1 Score</label>
                    <input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Player 2 Score</label>
                    <input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Winner</label>
                  <div className="winner-buttons">
                    <button
                      type="button"
                      className={`winner-btn ${winner === 'player1' ? 'winner-btn--selected' : ''}`}
                      onClick={() => setWinner('player1')}
                    >
                      {selectedMatch.player1_name}
                    </button>
                    <button
                      type="button"
                      className={`winner-btn ${winner === 'draw' ? 'winner-btn--selected' : ''}`}
                      onClick={() => setWinner('draw')}
                    >
                      Draw
                    </button>
                    <button
                      type="button"
                      className={`winner-btn ${winner === 'player2' ? 'winner-btn--selected' : ''}`}
                      onClick={() => setWinner('player2')}
                    >
                      {selectedMatch.player2_name}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Result'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedMatch(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="results-form-empty">
              <p>Select a match to record results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;

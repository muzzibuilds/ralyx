/**
 * Results Page (Admin)
 * Record and manage match results
 */

import { useState } from 'react';
import { useRecordMatchResult, useScorecardMatches } from '../../hooks';
import Button from '../../components/ui/Button';
import type { MatchScorecardRow } from '../../services/matches.service';
import './ResultsPage.css';

export function ResultsPage() {
  const [selectedMatch, setSelectedMatch] = useState<MatchScorecardRow | null>(null);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const recordResult = useRecordMatchResult();

  const { data: matches = [], isLoading, refetch } = useScorecardMatches();

  const handleSelectMatch = (match: MatchScorecardRow) => {
    setSelectedMatch(match);
    setTeam1Score(match.team1Score > 0 ? match.team1Score.toString() : '');
    setTeam2Score(match.team2Score > 0 ? match.team2Score.toString() : '');
    setError('');
    setSuccess('');
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) {
      setError('Please select a match');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const parsedTeam1Score = parseInt(team1Score, 10);
      const parsedTeam2Score = parseInt(team2Score, 10);

      if (isNaN(parsedTeam1Score) || isNaN(parsedTeam2Score)) {
        throw new Error('Please enter valid scores');
      }

      await recordResult.mutateAsync({
        matchId: selectedMatch.id,
        team1Score: parsedTeam1Score,
        team2Score: parsedTeam2Score,
      });

      setSuccess('Match result recorded and standings synced.');
      setSelectedMatch(null);
      setTeam1Score('');
      setTeam2Score('');
      refetch();
    } catch (err) {
      console.error('Error saving result:', err);
      setError(err instanceof Error ? err.message : 'Failed to save result');
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
                      <span className="player-name">{match.team1Names.join(' / ')}</span>
                      {match.status === 'completed' && (
                        <span className="player-score">{match.team1Score}</span>
                      )}
                    </div>

                    <div className="results-card__vs">vs</div>

                    <div className="results-card__player">
                      <span className="player-name">{match.team2Names.join(' / ')}</span>
                      {match.status === 'completed' && (
                        <span className="player-score">{match.team2Score}</span>
                      )}
                    </div>
                  </div>

                  <div className="results-card__meta">
                    <span className="meta-item">Week {match.weekNumber}</span>
                    <span className="meta-item">Set {match.setNumber}</span>
                    <span className="meta-item">Court {match.courtNumber}</span>
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
                      <p className="player-name">{selectedMatch.team1Names.join(' / ')}</p>
                    </div>
                  </div>
                  <div className="player-vs">VS</div>
                  <div className="player-card">
                    <div className="player-number">2</div>
                    <div className="player-info">
                      <p className="player-name">{selectedMatch.team2Names.join(' / ')}</p>
                    </div>
                  </div>
                </div>
                <div className="results-card__meta">
                  <span className="meta-item">Week {selectedMatch.weekNumber}</span>
                  <span className="meta-item">Set {selectedMatch.setNumber}</span>
                  <span className="meta-item">Court {selectedMatch.courtNumber}</span>
                </div>
              </div>

              {error && <div className="results-error">{error}</div>}
              {success && <div className="results-success">{success}</div>}

              <form onSubmit={handleSubmitResult} className="results-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Team 1 Score</label>
                    <input
                      type="number"
                      min="0"
                      value={team1Score}
                      onChange={(e) => setTeam1Score(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Team 2 Score</label>
                    <input
                      type="number"
                      min="0"
                      value={team2Score}
                      onChange={(e) => setTeam2Score(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={recordResult.isPending}
                  >
                    {recordResult.isPending ? 'Saving...' : 'Save Result'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedMatch(null)}
                    disabled={recordResult.isPending}
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

/**
 * Weeks & Matches Page
 * Create weekly sessions, assign players, and preview court groupings
 */

import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import {
  useCreateSession,
  useCurrentSeason,
  useDeleteSession,
  useSeasonRegistrations,
  useSeasonSessions,
  useSeasonStandings,
  useUpdateSession,
} from '../../hooks';
import './AdminPage.css';
import './WeeksPage.css';

type SessionStatus = 'scheduled' | 'in_progress' | 'completed';

type PlayerOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  duprRating: number | null;
  standingRank?: number;
  status: string;
};

type SessionRow = {
  id: string;
  week_number: number;
  session_date: string;
  status: SessionStatus;
  attendees?: string[] | null;
};

type StandingRow = {
  player_id: string;
  rank?: number;
};

type RegistrationRow = {
  id: string;
  status: string;
  players?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    dupr_rating?: number | null;
  } | null;
};

function formatDateForInput(date: Date) {
  return date.toISOString().split('T')[0];
}

const TODAY_INPUT_VALUE = formatDateForInput(new Date());

function buildCourtGroups(players: PlayerOption[]) {
  if (players.length === 0) return [] as PlayerOption[][];

  const courtCount = Math.max(1, Math.ceil(players.length / 4));
  const groups = Array.from({ length: courtCount }, () => [] as PlayerOption[]);

  players.forEach((player, index) => {
    const round = Math.floor(index / courtCount);
    const slot = index % courtCount;
    const target = round % 2 === 0 ? slot : courtCount - slot - 1;
    groups[target].push(player);
  });

  return groups;
}

interface SessionEditorProps {
  selectedSession: SessionRow;
  playerPool: PlayerOption[];
  saveMessage: string;
  saving: boolean;
  onDelete: () => Promise<void>;
  onSave: (payload: {
    id: string;
    weekNumber: number;
    sessionDate: string;
    status: SessionStatus;
    attendees: string[];
  }) => Promise<void>;
}

function SessionEditor({
  selectedSession,
  playerPool,
  saveMessage,
  saving,
  onDelete,
  onSave,
}: SessionEditorProps) {
  const [weekNumber, setWeekNumber] = useState<number>(selectedSession.week_number);
  const [sessionDate, setSessionDate] = useState<string>(selectedSession.session_date.split('T')[0]);
  const [status, setStatus] = useState<SessionStatus>(selectedSession.status);
  const [attendees, setAttendees] = useState<string[]>(selectedSession.attendees ?? []);

  const selectedPlayers = useMemo(
    () => playerPool.filter((player) => attendees.includes(player.id)),
    [attendees, playerPool],
  );

  const courtGroups = useMemo(() => buildCourtGroups(selectedPlayers), [selectedPlayers]);

  const toggleAttendee = (playerId: string) => {
    setAttendees((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId],
    );
  };

  const fillConfirmedPlayers = () => {
    setAttendees(playerPool.slice(0, 16).map((player) => player.id));
  };

  const clearAttendees = () => {
    setAttendees([]);
  };

  const capacityWarning = attendees.length % 4 !== 0;

  return (
    <>
      <div className="weeks-form-grid">
        <label className="weeks-field">
          <span>Week Number</span>
          <input
            type="number"
            min={1}
            value={weekNumber}
            onChange={(event) => setWeekNumber(Number(event.target.value))}
          />
        </label>

        <label className="weeks-field">
          <span>Session Date</span>
          <input
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </label>

        <label className="weeks-field">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as SessionStatus)}>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <div className="weeks-toolbar">
        <div className="weeks-toolbar__actions">
          <Button variant="secondary" onClick={fillConfirmedPlayers} disabled={playerPool.length === 0 || saving}>
            Fill Top 16
          </Button>
          <Button variant="ghost" onClick={clearAttendees} disabled={attendees.length === 0 || saving}>
            Clear Roster
          </Button>
        </div>
        <div className="weeks-toolbar__summary">
          <span>{attendees.length} selected</span>
          {capacityWarning && attendees.length > 0 ? (
            <span className="weeks-warning">Not divisible by 4</span>
          ) : (
            <span className="weeks-ok">Court-ready</span>
          )}
        </div>
      </div>

      <div className="weeks-roster-grid">
        <div className="weeks-roster-panel">
          <h3>Eligible Players</h3>
          {playerPool.length === 0 ? (
            <p className="weeks-muted">No confirmed or paid players found for this season.</p>
          ) : (
            <div className="weeks-player-list">
              {playerPool.map((player) => {
                const checked = attendees.includes(player.id);
                return (
                  <label key={player.id} className={`weeks-player-row${checked ? ' weeks-player-row--selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttendee(player.id)}
                    />
                    <div>
                      <strong>{player.firstName} {player.lastName}</strong>
                      <span>
                        {player.duprRating ? `DUPR ${player.duprRating.toFixed(2)}` : 'No DUPR'}
                        {player.standingRank ? ` • Rank ${player.standingRank}` : ''}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="weeks-roster-panel">
          <h3>Court Preview</h3>
          {selectedPlayers.length === 0 ? (
            <p className="weeks-muted">Choose players to generate court groupings.</p>
          ) : (
            <div className="weeks-courts">
              {courtGroups.map((group, index) => (
                <div key={`court-${index + 1}`} className="weeks-court-card">
                  <div className="weeks-court-card__header">
                    <strong>Court {index + 1}</strong>
                    <span>{group.length}/4 players</span>
                  </div>
                  <ul>
                    {group.map((player) => (
                      <li key={player.id}>
                        <span>{player.firstName} {player.lastName}</span>
                        <small>
                          {player.standingRank ? `#${player.standingRank}` : 'Unranked'}
                          {player.duprRating ? ` • ${player.duprRating.toFixed(2)}` : ''}
                        </small>
                      </li>
                    ))}
                  </ul>
                  {group.length === 4 && (
                    <div className="weeks-court-card__rotation">
                      <span>Suggested pairings</span>
                      <small>{group[0].lastName}/{group[3].lastName} vs {group[1].lastName}/{group[2].lastName}</small>
                      <small>{group[0].lastName}/{group[2].lastName} vs {group[1].lastName}/{group[3].lastName}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="weeks-footer">
        <div className="weeks-footer__message">{saveMessage}</div>
        <div className="weeks-footer__actions">
          <Button variant="ghost" onClick={onDelete} disabled={saving}>
            Delete Week
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onSave({
                id: selectedSession.id,
                weekNumber,
                sessionDate,
                status,
                attendees,
              })
            }
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Session'}
          </Button>
        </div>
      </div>
    </>
  );
}

export function WeeksPage() {
  const { data: season } = useCurrentSeason();
  const { data: registrations = [], isLoading: registrationsLoading } = useSeasonRegistrations(season?.id || '');
  const { data: standings = [] } = useSeasonStandings(season?.id || '');
  const { data: sessions = [], isLoading: sessionsLoading } = useSeasonSessions(season?.id || '');

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const typedSessions = sessions as SessionRow[];
  const typedRegistrations = registrations as RegistrationRow[];
  const typedStandings = standings as StandingRow[];

  const playerPool = useMemo<PlayerOption[]>(() => {
    const standingMap = new Map(typedStandings.map((standing) => [standing.player_id, standing.rank ?? Number.MAX_SAFE_INTEGER]));

    return typedRegistrations
      .filter((registration) => registration.status === 'confirmed' || registration.status === 'paid')
      .flatMap((registration) => {
        if (!registration.players) return [];

        return [
          {
            id: registration.players.id,
            firstName: registration.players.first_name,
            lastName: registration.players.last_name,
            email: registration.players.email,
            duprRating: registration.players.dupr_rating ?? null,
            standingRank: standingMap.get(registration.players.id),
            status: registration.status,
          },
        ];
      })
      .sort((a, b) => {
        const rankA = a.standingRank ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.standingRank ?? Number.MAX_SAFE_INTEGER;

        if (rankA !== rankB) return rankA - rankB;
        return (b.duprRating ?? 0) - (a.duprRating ?? 0);
      });
  }, [typedRegistrations, typedStandings]);

  const activeSessionId = selectedSessionId || typedSessions[0]?.id || '';

  const selectedSession = useMemo(
    () => typedSessions.find((sessionItem) => sessionItem.id === activeSessionId) ?? null,
    [activeSessionId, typedSessions],
  );

  const nextWeekNumber = useMemo(() => {
    if (typedSessions.length === 0) return 1;
    return Math.max(...typedSessions.map((sessionItem) => sessionItem.week_number)) + 1;
  }, [typedSessions]);

  const handleCreateSession = async () => {
    if (!season?.id) return;

    try {
      const created = await createSession.mutateAsync({
        seasonId: season.id,
        weekNumber: nextWeekNumber,
        sessionDate: new Date(TODAY_INPUT_VALUE),
        status: 'scheduled',
        attendees: [],
      });

      setSelectedSessionId(created.id);
      setSaveMessage('Session created. Add attendees and save.');
    } catch (error) {
      console.error('Error creating session:', error);
      setSaveMessage('Unable to create session right now.');
    }
  };

  const handleSaveSession = async (payload: {
    id: string;
    weekNumber: number;
    sessionDate: string;
    status: SessionStatus;
    attendees: string[];
  }) => {
    try {
      await updateSession.mutateAsync({
        id: payload.id,
        updates: {
          weekNumber: payload.weekNumber,
          sessionDate: new Date(payload.sessionDate),
          status: payload.status,
          attendees: payload.attendees,
        },
      });
      setSaveMessage('Session saved successfully.');
    } catch (error) {
      console.error('Error saving session:', error);
      setSaveMessage('Unable to save session changes.');
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    const confirmed = window.confirm(`Delete Week ${selectedSession.week_number}?`);
    if (!confirmed) return;

    try {
      await deleteSession.mutateAsync(selectedSession.id);
      setSelectedSessionId('');
      setSaveMessage('Session deleted.');
    } catch (error) {
      console.error('Error deleting session:', error);
      setSaveMessage('Unable to delete session.');
    }
  };

  const saving = createSession.isPending || updateSession.isPending || deleteSession.isPending;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Weeks & Matches</h1>
          <p className="weeks-page__subtitle">
            Create weekly sessions, assign players, and preview balanced court groupings.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateSession} disabled={!season?.id || saving}>
          + Create Week {nextWeekNumber}
        </Button>
      </div>

      {!season ? (
        <div className="weeks-panel weeks-panel--empty">
          <h2>No active season</h2>
          <p>Create or activate a season before building weekly schedules.</p>
        </div>
      ) : (
        <div className="weeks-layout">
          <aside className="weeks-sidebar weeks-panel">
            <div className="weeks-sidebar__header">
              <div>
                <h2>{season.name}</h2>
                <p>{typedSessions.length} sessions planned</p>
              </div>
            </div>

            <div className="weeks-sidebar__list">
              {sessionsLoading ? (
                <p className="weeks-muted">Loading sessions...</p>
              ) : typedSessions.length === 0 ? (
                <p className="weeks-muted">No sessions yet. Create the first week to begin scheduling.</p>
              ) : (
                typedSessions.map((sessionItem) => (
                  <button
                    key={sessionItem.id}
                    className={`weeks-session-card${activeSessionId === sessionItem.id ? ' weeks-session-card--active' : ''}`}
                    onClick={() => {
                      setSelectedSessionId(sessionItem.id);
                      setSaveMessage('');
                    }}
                    type="button"
                  >
                    <div className="weeks-session-card__top">
                      <strong>Week {sessionItem.week_number}</strong>
                      <span className={`weeks-status weeks-status--${sessionItem.status}`}>
                        {sessionItem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="weeks-session-card__meta">
                      <span>{new Date(sessionItem.session_date).toLocaleDateString()}</span>
                      <span>{sessionItem.attendees?.length ?? 0} players</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="weeks-content">
            <div className="weeks-panel weeks-editor">
              <div className="weeks-editor__header">
                <div>
                  <h2>{selectedSession ? `Week ${selectedSession.week_number}` : 'Select a session'}</h2>
                  <p>Configure the session details and roster.</p>
                </div>
              </div>

              {selectedSession ? (
                registrationsLoading ? (
                  <p className="weeks-muted">Loading confirmed players...</p>
                ) : (
                  <SessionEditor
                    key={selectedSession.id}
                    selectedSession={selectedSession}
                    playerPool={playerPool}
                    saveMessage={saveMessage}
                    saving={saving}
                    onDelete={handleDeleteSession}
                    onSave={handleSaveSession}
                  />
                )
              ) : (
                <div className="weeks-panel weeks-panel--empty">
                  <p>Select a session from the left or create a new week.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default WeeksPage;

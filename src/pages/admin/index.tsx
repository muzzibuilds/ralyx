/**
 * Admin page exports
 */

export { PlayersPage } from './PlayersPage';
export { RegistrationsPage } from './RegistrationsPage';
export { DemandQueuePage } from './DemandQueuePage';

export function WeeksPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>Weeks & Matches</h1>
      <p style={{ color: '#999' }}>Coming in Phase 5 (Session Management)</p>
    </div>
  );
}

export function ResultsPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>Results</h1>
      <p style={{ color: '#999' }}>Coming in Phase 7 (Results & Standings)</p>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>Settings</h1>
      <p style={{ color: '#999' }}>Season configuration coming soon</p>
    </div>
  );
}

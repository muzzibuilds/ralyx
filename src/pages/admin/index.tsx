/**
 * Admin page exports
 */

export { PlayersPage } from './PlayersPage';
export { RegistrationsPage } from './RegistrationsPage';
export { DemandQueuePage } from './DemandQueuePage';
export { ResultsPage } from './ResultsPage';

export function WeeksPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>Weeks & Matches</h1>
      <p style={{ color: '#999' }}>Coming in Phase 10 (Match Scheduling)</p>
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

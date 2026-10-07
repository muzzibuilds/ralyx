/**
 * Admin page exports
 */

export { PlayersPage } from './PlayersPage';
export { RegistrationsPage } from './RegistrationsPage';
export { DemandQueuePage } from './DemandQueuePage';
export { ResultsPage } from './ResultsPage';
export { WeeksPage } from './WeeksPage';

export function SettingsPage() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>Settings</h1>
      <p style={{ color: '#999' }}>Season configuration coming soon</p>
    </div>
  );
}

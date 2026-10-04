/**
 * Admin stub pages for Phase 2 scaffolding
 */

import { Container, Section } from '../../components/ui';

const PageTemplate = ({ title }: { title: string }) => (
  <Section>
    <Container>
      <h1>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-lg)' }}>
        This page will be implemented in later phases.
      </p>
    </Container>
  </Section>
);

export function PlayersPage() {
  return <PageTemplate title="Players Management" />;
}

export function RegistrationsPage() {
  return <PageTemplate title="Registrations" />;
}

export function DemandQueuePage() {
  return <PageTemplate title="Demand Queue" />;
}

export function WeeksPage() {
  return <PageTemplate title="Weeks & Matches" />;
}

export function ResultsPage() {
  return <PageTemplate title="Results" />;
}

export function SettingsPage() {
  return <PageTemplate title="Settings" />;
}

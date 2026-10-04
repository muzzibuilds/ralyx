/**
 * Admin Dashboard
 * Overview of season status, registrations, demand queue
 * 
 * Phase 9: Will implement full admin dashboard
 * Phase 2: Scaffold only
 */

import { Container, Section } from '../../components/ui';

export default function AdminDashboard() {
  return (
    <Section>
      <Container>
        <h1>Admin Dashboard</h1>
        
        <div style={{ marginTop: 'var(--spacing-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Dashboard implementation coming in Phase 8-9.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginTop: 'var(--spacing-xl)',
            }}
          >
            <DashboardCard
              title="Season Status"
              placeholder="TBA"
              description="Current season details"
            />
            <DashboardCard
              title="Registrations"
              placeholder="0 / 16"
              description="Confirmed players"
            />
            <DashboardCard
              title="Demand Queue"
              placeholder="0"
              description="Interested players"
            />
            <DashboardCard
              title="Next Session"
              placeholder="TBA"
              description="Dates to be confirmed"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function DashboardCard({
  title,
  placeholder,
  description,
}: {
  title: string;
  placeholder: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(0, 255, 0, 0.01)',
      }}
    >
      <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--accent-lime)',
          marginBottom: 'var(--spacing-sm)',
        }}
      >
        {placeholder}
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{description}</p>
    </div>
  );
}

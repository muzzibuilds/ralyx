/**
 * Dashboard Page
 * Overview of key metrics and recent activity
 */

import { useMemo } from 'react';
import { useCurrentSeason, useSeasonRegistrations, useDemandLeadsCount } from '../../hooks';
import { AdminStatsGrid } from '../../components/admin';
import { Card } from '../../components/ui';
import './AdminPage.css';

export default function AdminDashboard() {
  const { data: season } = useCurrentSeason();
  const { data: registrations = [] } = useSeasonRegistrations(season?.id || '');
  const { data: demandCount = 0 } = useDemandLeadsCount();

  const stats = useMemo(() => {
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const paid = registrations.filter((r) => r.status === 'paid').length;

    return [
      {
        label: 'Current Season',
        value: season?.name || 'No active season',
      },
      {
        label: 'Registrations',
        value: `${confirmed}/16`,
        trend: confirmed === 16 ? ('up' as const) : ('neutral' as const),
      },
      {
        label: 'Paid',
        value: paid,
        trend: 'up' as const,
      },
      {
        label: 'Waitlist',
        value: demandCount,
      },
    ];
  }, [season, registrations, demandCount]);

  const recentRegistrations = useMemo(
    () =>
      registrations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [registrations],
  );

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#999', margin: '0' }}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <AdminStatsGrid stats={stats} />

      <div style={{ marginTop: '32px' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>
              Recent Registrations
            </h2>
            {recentRegistrations.length === 0 ? (
              <p style={{ color: '#999' }}>No recent registrations.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      padding: '12px',
                      background: '#0a0a0a',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ color: '#ddd', fontSize: '14px', fontWeight: '500' }}>
                        Player #{reg.playerId.substring(0, 8)}
                      </div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor:
                          reg.status === 'paid'
                            ? 'rgba(0, 255, 0, 0.2)'
                            : reg.status === 'confirmed'
                              ? 'rgba(255, 255, 0, 0.2)'
                              : 'rgba(255, 100, 100, 0.2)',
                        color:
                          reg.status === 'paid'
                            ? '#00ff00'
                            : reg.status === 'confirmed'
                              ? '#ffff00'
                              : '#ff6464',
                      }}
                    >
                      {reg.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

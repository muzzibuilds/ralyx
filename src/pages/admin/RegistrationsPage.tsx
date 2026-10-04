/**
 * Registrations Management Page
 * Track registrations, payment status, and confirmations
 */

import { useMemo, useState } from 'react';
import { useSeasons, useSeasonRegistrations, useUpdateRegistrationStatus, useMarkAsPaid } from '../../hooks';
import { AdminTable, AdminStatsGrid, type TableColumn } from '../../components/admin';
import type { Registration } from '../../types';
import './AdminPage.css';

export function RegistrationsPage() {
  const { data: seasons = [] } = useSeasons();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  const currentSeason = seasons[0];
  const seasonId = selectedSeasonId || currentSeason?.id || '';

  const { data: registrations = [], isLoading } = useSeasonRegistrations(seasonId);
  const updateStatusMutation = useUpdateRegistrationStatus();
  const markAsPaidMutation = useMarkAsPaid();

  // Calculate stats
  const stats = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const paid = registrations.filter((r) => r.status === 'paid').length;
    const pending = registrations.filter((r) => r.status === 'pending').length;

    return [
      { label: 'Total Registrations', value: total },
      { label: 'Confirmed', value: confirmed },
      { label: 'Paid', value: paid, trend: 'up' as const },
      { label: 'Pending', value: pending },
    ];
  }, [registrations]);

  const columns: TableColumn<Registration>[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'Registration ID',
        width: '20%',
        render: (value) => value.substring(0, 8),
      },
      {
        key: 'seasonId',
        label: 'Season',
        width: '15%',
        render: (value) => seasons.find((s) => s.id === value)?.name || '—',
      },
      {
        key: 'playerId',
        label: 'Player ID',
        width: '20%',
        render: (value) => value.substring(0, 8),
      },
      {
        key: 'status',
        label: 'Status',
        width: '15%',
        render: (value) => (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor:
                value === 'paid'
                  ? 'rgba(0, 255, 0, 0.2)'
                  : value === 'confirmed'
                    ? 'rgba(255, 255, 0, 0.2)'
                    : 'rgba(255, 100, 100, 0.2)',
              color:
                value === 'paid'
                  ? '#00ff00'
                  : value === 'confirmed'
                    ? '#ffff00'
                    : '#ff6464',
            }}
          >
            {value.toUpperCase()}
          </span>
        ),
      },
      {
        key: 'registeredAt',
        label: 'Registered',
        width: '15%',
        render: (value) =>
          new Date(value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          }),
      },
    ],
    [seasons],
  );

  const handleStatusChange = async (registration: Registration, newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: registration.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMarkPaid = async (registration: Registration) => {
    const amount = prompt('Enter payment amount:');
    if (amount) {
      try {
        await markAsPaidMutation.mutateAsync({
          id: registration.id,
          amount: parseFloat(amount),
          stripeSessionId: 'manual-payment',
        });
      } catch (error) {
        console.error('Error marking as paid:', error);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Registrations</h1>
        {seasons.length > 1 && (
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              color: '#fff',
              borderRadius: '4px',
            }}
          >
            <option value="">All Seasons</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <AdminStatsGrid stats={stats} />

      <AdminTable
        columns={columns}
        data={registrations}
        isLoading={isLoading}
        actions={(registration) => (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-xs btn-secondary"
              onClick={() =>
                handleStatusChange(
                  registration,
                  registration.status === 'pending' ? 'confirmed' : 'pending',
                )
              }
            >
              {registration.status === 'pending' ? 'Confirm' : 'Unconfirm'}
            </button>
            {registration.status !== 'paid' && (
              <button
                className="btn btn-xs btn-primary"
                onClick={() => handleMarkPaid(registration)}
              >
                Mark Paid
              </button>
            )}
          </div>
        )}
        emptyMessage="No registrations for this season."
      />
    </div>
  );
}

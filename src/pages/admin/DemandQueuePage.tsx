/**
 * Demand Queue Page
 * Manage the waitlist for sold-out seasons
 */

import { useMemo } from 'react';
import { useDemandLeads, useDeleteDemandLead } from '../../hooks';
import { AdminTable, type TableColumn } from '../../components/admin';
import type { DemandLead } from '../../types';
import './AdminPage.css';

export function DemandQueuePage() {
  const { data: demandLeads = [], isLoading } = useDemandLeads(50, 0);
  const deleteLeadMutation = useDeleteDemandLead();

  const columns: TableColumn<DemandLead>[] = useMemo(
    () => [
      {
        key: 'email',
        label: 'Email',
        width: '35%',
      },
      {
        key: 'firstName',
        label: 'Name',
        width: '25%',
        render: (_value, row) => `${row.firstName} ${row.lastName}`,
      },
      {
        key: 'preferredDay',
        label: 'Preferred Day',
        width: '20%',
        render: (_value, row) => row.preferredDay || '—',
      },
      {
        key: 'createdAt',
        label: 'Added',
        width: '15%',
        render: (value) =>
          new Date(value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          }),
      },
    ],
    [],
  );

  const handleDelete = async (lead: DemandLead) => {
    if (confirm(`Remove ${lead.email} from waitlist?`)) {
      try {
        await deleteLeadMutation.mutateAsync(lead.id);
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Demand Queue / Waitlist</h1>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Total: {demandLeads.length} people interested
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={demandLeads}
        isLoading={isLoading}
        actions={(lead) => (
          <button
            className="btn btn-xs btn-danger"
            onClick={() => handleDelete(lead)}
          >
            Remove
          </button>
        )}
        emptyMessage="No one on the waitlist. All caught up!"
      />
    </div>
  );
}

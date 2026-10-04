/**
 * Players Management Page
 * CRUD operations for player database
 */

import { useState, useMemo } from 'react';
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from '../../hooks';
import { AdminTable, AdminModal, AdminForm, type TableColumn, type FormFieldConfig } from '../../components/admin';
import Button from '../../components/ui/Button';
import type { Player } from '../../types';
import './AdminPage.css';

const PLAYER_FORM_FIELDS: FormFieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'John',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Doe',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'john@example.com',
  },
  {
    name: 'duprRating',
    label: 'DUPR Rating',
    type: 'number',
    placeholder: '3.5',
  },
];

export function PlayersPage() {
  const { data: players = [], isLoading } = usePlayers();
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  const deletePlayerMutation = useDeletePlayer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const columns: TableColumn<Player>[] = useMemo(
    () => [
      {
        key: 'firstName',
        label: 'First Name',
        width: '20%',
      },
      {
        key: 'lastName',
        label: 'Last Name',
        width: '20%',
      },
      {
        key: 'email',
        label: 'Email',
        width: '35%',
      },
      {
        key: 'duprRating',
        label: 'DUPR Rating',
        width: '15%',
        render: (value) => value ? value.toFixed(1) : '—',
      },
      {
        key: 'createdAt',
        label: 'Joined',
        width: '10%',
        render: (value) => new Date(value).toLocaleDateString(),
      },
    ],
    [],
  );

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
    } else {
      setEditingPlayer(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPlayer) {
        await updatePlayerMutation.mutateAsync({
          id: editingPlayer.id,
          updates: values,
        });
      } else {
        await createPlayerMutation.mutateAsync(values);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleDelete = async (player: Player) => {
    if (confirm(`Delete ${player.firstName} ${player.lastName}?`)) {
      try {
        await deletePlayerMutation.mutateAsync(player.id);
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Players Management</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Add Player
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={players}
        isLoading={isLoading}
        actions={(player) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handleOpenModal(player)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(player)}
            >
              Delete
            </button>
          </div>
        )}
        emptyMessage="No players yet. Create your first player!"
      />

      <AdminModal
        isOpen={isModalOpen}
        title={editingPlayer ? 'Edit Player' : 'Add Player'}
        onClose={handleCloseModal}
        onSubmit={() => handleSubmit({} as any)}
        submitLabel={editingPlayer ? 'Update' : 'Create'}
        isSubmitting={createPlayerMutation.isPending || updatePlayerMutation.isPending}
      >
        <AdminForm
          fields={PLAYER_FORM_FIELDS}
          initialValues={editingPlayer || {}}
          onSubmit={handleSubmit}
          isSubmitting={createPlayerMutation.isPending || updatePlayerMutation.isPending}
        />
      </AdminModal>
    </div>
  );
}

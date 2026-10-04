/**
 * Admin Modal Component
 * Modal for add/edit operations
 */

import { type ReactNode } from 'react';
import './AdminModal.css';

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function AdminModal({
  isOpen,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{title}</h2>
          <button className="admin-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
        {onSubmit && (
          <div className="admin-modal__footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

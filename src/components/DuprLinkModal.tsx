/**
 * DUPR Link Modal
 * Modal for linking DUPR profile to registration
 */

import { useState } from 'react';
import './DuprLinkModal.css';

interface DuprLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (duprProfileUrl: string, duprRating: number) => void;
  isLoading?: boolean;
}

export default function DuprLinkModal({ isOpen, onClose, onLink, isLoading = false }: DuprLinkModalProps) {
  const [duprUsername, setDuprUsername] = useState('');
  const [duprLink, setDuprLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'loading'>('input');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setDuprUsername(value);
    
    // Auto-generate DUPR link
    if (value) {
      setDuprLink(`https://dupr.gg/player/${value}`);
    } else {
      setDuprLink('');
    }
    setError(null);
  };

  const handleLink = async () => {
    if (!duprUsername.trim()) {
      setError('Please enter your DUPR username or profile URL');
      return;
    }

    try {
      setStep('loading');
      setError(null);

      // Mock DUPR API call - in production, would call real DUPR API
      // For now, we'll just extract rating from input or use default
      const mockRating = Math.random() * 2 + 3; // Random 3.0-5.0 for demo
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      onLink(duprLink, Number(mockRating.toFixed(2)));
      
      // Reset form
      setDuprUsername('');
      setDuprLink('');
      setStep('input');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link DUPR profile');
      setStep('input');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dupr-modal__overlay" onClick={onClose}>
      <div className="dupr-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="dupr-modal__header">
          <h3 className="dupr-modal__title">Link Your DUPR Profile</h3>
          <button className="dupr-modal__close" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {step === 'input' ? (
          <>
            <div className="dupr-modal__body">
              <p className="dupr-modal__description">
                Connect your DUPR account to automatically pull your rating and create fair matchups.
              </p>

              <div className="dupr-modal__input-group">
                <label className="dupr-modal__label">DUPR Username</label>
                <input
                  type="text"
                  value={duprUsername}
                  onChange={handleInputChange}
                  placeholder="e.g., john_doe_pickleball"
                  className="dupr-modal__input"
                  disabled={isLoading}
                  autoFocus
                />
                {duprLink && (
                  <p className="dupr-modal__link-preview">
                    Profile: {duprLink}
                  </p>
                )}
              </div>

              {error && <div className="dupr-modal__error">{error}</div>}
            </div>

            <div className="dupr-modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleLink}
                disabled={isLoading || !duprUsername.trim()}
              >
                {isLoading ? 'Linking...' : 'Link Profile'}
              </button>
            </div>
          </>
        ) : (
          <div className="dupr-modal__loading">
            <div className="dupr-modal__spinner"></div>
            <p className="dupr-modal__loading-text">Linking your DUPR profile...</p>
          </div>
        )}
      </div>
    </div>
  );
}

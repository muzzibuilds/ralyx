/**
 * Registration Form Component
 * Player registration for current season with DUPR linking
 */

import { useState, useRef } from 'react';
import DuprLinkModal from './DuprLinkModal';
import './RegistrationForm.css';

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  duprRating?: number;
  duprProfileUrl?: string;
}

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isFull?: boolean;
  onDemandQueue?: (data: RegistrationFormData) => void;
}

export default function RegistrationForm({
  onSubmit,
  isLoading = false,
  error = null,
  isFull = false,
  onDemandQueue,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    duprRating: undefined,
    duprProfileUrl: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDuprModalOpen, setIsDuprModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleDuprLink = (duprProfileUrl: string, duprRating: number) => {
    setFormData((prev) => ({
      ...prev,
      duprProfileUrl,
      duprRating,
    }));
  };

  const handleRemoveDupr = () => {
    setFormData((prev) => ({
      ...prev,
      duprProfileUrl: undefined,
      duprRating: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleJoinWaitlist = () => {
    if (!validateForm()) {
      return;
    }
    onDemandQueue?.(formData);
  };

  return (
    <>
      <form ref={formRef} className="registration-form" onSubmit={handleSubmit}>
        <div className="registration-form__container">
          {/* Header with DUPR Badge */}
          <div className="registration-form__header">
            <div className="registration-form__title-section">
              <h2 className="registration-form__title">Join Season I</h2>
              <p className="registration-form__description">
                Secure your spot in RALYX's inaugural competitive league.
              </p>
            </div>

            {formData.duprProfileUrl && formData.duprRating !== undefined && (
              <div className="registration-form__dupr-badge">
                <div className="registration-form__dupr-badge-icon">🎾</div>
                <div className="registration-form__dupr-badge-content">
                  <div className="registration-form__dupr-badge-label">DUPR Rating</div>
                  <div className="registration-form__dupr-badge-value">{formData.duprRating}</div>
                </div>
                <button
                  type="button"
                  className="registration-form__dupr-badge-edit"
                  onClick={() => setIsDuprModalOpen(true)}
                  title="Change DUPR profile"
                >
                  ↻
                </button>
              </div>
            )}
          </div>

          {error && <div className="registration-form__error-banner">{error}</div>}

          {/* Name Fields */}
          <div className="registration-form__row">
            <div className="registration-form__group registration-form__group--half">
              <label className="registration-form__label">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`registration-form__input ${
                  errors.firstName && touched.firstName ? 'registration-form__input--error' : ''
                }`}
                placeholder="John"
                disabled={isLoading}
                required
              />
              {errors.firstName && touched.firstName && (
                <span className="registration-form__error">{errors.firstName}</span>
              )}
            </div>

            <div className="registration-form__group registration-form__group--half">
              <label className="registration-form__label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`registration-form__input ${
                  errors.lastName && touched.lastName ? 'registration-form__input--error' : ''
                }`}
                placeholder="Doe"
                disabled={isLoading}
                required
              />
              {errors.lastName && touched.lastName && (
                <span className="registration-form__error">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="registration-form__group">
            <label className="registration-form__label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`registration-form__input ${
                errors.email && touched.email ? 'registration-form__input--error' : ''
              }`}
              placeholder="you@example.com"
              disabled={isLoading}
              required
            />
            {errors.email && touched.email && (
              <span className="registration-form__error">{errors.email}</span>
            )}
          </div>

          {/* DUPR Section */}
          <div className="registration-form__dupr-section">
            {formData.duprProfileUrl && formData.duprRating !== undefined ? (
              <div className="registration-form__dupr-linked">
                <div className="registration-form__dupr-linked-status">
                  <span className="registration-form__dupr-linked-icon">✓</span>
                  <span className="registration-form__dupr-linked-text">DUPR Profile Linked</span>
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--secondary"
                  onClick={() => setIsDuprModalOpen(true)}
                >
                  Change Profile
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={handleRemoveDupr}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="registration-form__dupr-cta">
                <div className="registration-form__dupr-cta-content">
                  <p className="registration-form__dupr-cta-title">Link Your DUPR Profile</p>
                  <p className="registration-form__dupr-cta-description">
                    Automatically pull your DUPR rating for fair matchups. Optional but recommended.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsDuprModalOpen(true)}
                  disabled={isLoading}
                >
                  Link DUPR
                </button>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="registration-form__actions">
            {isFull ? (
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleJoinWaitlist}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding to Waitlist...' : 'Season Full - Join Waitlist'}
                </button>
                <p className="registration-form__full-message">
                  Season I is at capacity (16/16), but you can join the waitlist to be notified if a spot opens.
                </p>
              </>
            ) : (
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={isLoading}
              >
                {isLoading ? 'Securing Your Spot...' : 'Secure Your Spot'}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="registration-form__footer">
            <p className="registration-form__terms">
              By registering, you agree to our league rules and competitive format.
            </p>
          </div>
        </div>
      </form>

      {/* DUPR Link Modal */}
      <DuprLinkModal
        isOpen={isDuprModalOpen}
        onClose={() => setIsDuprModalOpen(false)}
        onLink={handleDuprLink}
        isLoading={isLoading}
      />
    </>
  );
}

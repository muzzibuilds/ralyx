/**
 * Registration Form Component
 * Player registration for current season
 */

import { useState, useRef } from 'react';
import './RegistrationForm.css';

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  duprRating?: number;
}

export default RegistrationForm;

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isFull?: boolean;
  onDemandQueue?: (data: RegistrationFormData) => void;
}

export function RegistrationForm({
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    <form ref={formRef} className="registration-form" onSubmit={handleSubmit}>
      <div className="registration-form__container">
        <h2 className="registration-form__title">Join Season I</h2>
        <p className="registration-form__description">
          Secure your spot in RALYX's inaugural competitive league.
        </p>

        {error && <div className="registration-form__error-banner">{error}</div>}

        <div className="registration-form__group">
          <label className="registration-form__label">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`registration-form__input ${errors.firstName && touched.firstName ? 'registration-form__input--error' : ''}`}
            placeholder="John"
            disabled={isLoading}
            required
          />
          {errors.firstName && touched.firstName && (
            <span className="registration-form__error">{errors.firstName}</span>
          )}
        </div>

        <div className="registration-form__group">
          <label className="registration-form__label">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`registration-form__input ${errors.lastName && touched.lastName ? 'registration-form__input--error' : ''}`}
            placeholder="Doe"
            disabled={isLoading}
            required
          />
          {errors.lastName && touched.lastName && (
            <span className="registration-form__error">{errors.lastName}</span>
          )}
        </div>

        <div className="registration-form__group">
          <label className="registration-form__label">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`registration-form__input ${errors.email && touched.email ? 'registration-form__input--error' : ''}`}
            placeholder="you@example.com"
            disabled={isLoading}
            required
          />
          {errors.email && touched.email && (
            <span className="registration-form__error">{errors.email}</span>
          )}
        </div>

        <div className="registration-form__group">
          <label className="registration-form__label">DUPR Rating (Optional)</label>
          <input
            type="number"
            name="duprRating"
            value={formData.duprRating || ''}
            onChange={handleChange}
            className="registration-form__input"
            placeholder="3.5"
            step="0.1"
            min="1"
            max="7"
            disabled={isLoading}
          />
          <p className="registration-form__hint">
            Your current DUPR rating helps us seed matchups fairly.
          </p>
        </div>

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

        <div className="registration-form__footer">
          <p className="registration-form__terms">
            By registering, you agree to our league rules and competitive format.
          </p>
        </div>
      </div>
    </form>
  );
}

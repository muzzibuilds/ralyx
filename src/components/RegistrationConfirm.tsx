/**
 * Registration Confirmation Screen
 * Review details before final submission
 */

import type { RegistrationFormData } from './RegistrationForm';
import './RegistrationConfirm.css';

interface RegistrationConfirmProps {
  data: RegistrationFormData;
  onConfirm: () => Promise<void>;
  onEdit: () => void;
  isLoading?: boolean;
  isFull?: boolean;
}

export default function RegistrationConfirm({
  data,
  onConfirm,
  onEdit,
  isLoading = false,
  isFull = false,
}: RegistrationConfirmProps) {
  return (
    <div className="registration-confirm">
      <div className="registration-confirm__container">
        <div className="registration-confirm__header">
          <h2 className="registration-confirm__title">Review Your Details</h2>
          <p className="registration-confirm__description">
            Please confirm everything looks correct before submitting.
          </p>
        </div>

        <div className="registration-confirm__sections">
          {/* Personal Info Section */}
          <div className="registration-confirm__section">
            <h3 className="registration-confirm__section-title">Personal Information</h3>
            <div className="registration-confirm__grid">
              <div className="registration-confirm__field">
                <label className="registration-confirm__label">First Name</label>
                <p className="registration-confirm__value">{data.firstName}</p>
              </div>
              <div className="registration-confirm__field">
                <label className="registration-confirm__label">Last Name</label>
                <p className="registration-confirm__value">{data.lastName}</p>
              </div>
              <div className="registration-confirm__field registration-confirm__field--full">
                <label className="registration-confirm__label">Email</label>
                <p className="registration-confirm__value">{data.email}</p>
              </div>
              {data.phone && (
                <div className="registration-confirm__field registration-confirm__field--full">
                  <label className="registration-confirm__label">Phone</label>
                  <p className="registration-confirm__value">{data.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* DUPR Section */}
          {data.duprProfileUrl && data.duprRating !== undefined && (
            <div className="registration-confirm__section">
              <h3 className="registration-confirm__section-title">DUPR Profile</h3>
              <div className="registration-confirm__dupr-info">
                <div className="registration-confirm__dupr-icon">🎾</div>
                <div className="registration-confirm__dupr-details">
                  <p className="registration-confirm__dupr-label">DUPR Rating</p>
                  <p className="registration-confirm__dupr-value">{data.duprRating}</p>
                </div>
              </div>
            </div>
          )}

          {/* League Terms Section */}
          <div className="registration-confirm__section registration-confirm__section--highlight">
            <h3 className="registration-confirm__section-title">Season I Registration</h3>
            <div className="registration-confirm__terms-check">
              <div className="registration-confirm__terms-icon">✓</div>
              <div>
                <p className="registration-confirm__terms-text">
                  You agree to RALYX league rules and competitive format
                </p>
                <p className="registration-confirm__terms-subtext">
                  Spot: <strong>{isFull ? 'Waitlist' : 'Active Registration'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="registration-confirm__actions">
          <button type="button" className="btn btn--secondary" onClick={onEdit} disabled={isLoading}>
            Back to Edit
          </button>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? `${isFull ? 'Joining...' : 'Securing...'}  Your Spot`
              : `${isFull ? 'Join' : 'Secure'} Your Spot`}
          </button>
        </div>
      </div>
    </div>
  );
}

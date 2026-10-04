/**
 * Registration Success Screen
 * Confirmation after successful registration
 */

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import './RegistrationSuccess.css';

interface RegistrationSuccessProps {
  firstName: string;
  email: string;
  seasonName: string;
}

export default RegistrationSuccess;

export function RegistrationSuccess({
  firstName,
  email,
  seasonName,
}: RegistrationSuccessProps) {
  const navigate = useNavigate();

  return (
    <div className="registration-success">
      <div className="registration-success__container">
        <div className="registration-success__icon">✓</div>
        <h2 className="registration-success__title">You're In!</h2>
        <p className="registration-success__message">
          Welcome to {seasonName}, {firstName}!
        </p>

        <div className="registration-success__details">
          <div className="registration-success__detail">
            <span className="registration-success__detail-label">Confirmation Email</span>
            <span className="registration-success__detail-value">{email}</span>
          </div>

          <div className="registration-success__detail">
            <span className="registration-success__detail-label">What's Next?</span>
            <span className="registration-success__detail-value">
              Check your email for league rules, schedule, and venue details. Season begins soon!
            </span>
          </div>

          <div className="registration-success__detail">
            <span className="registration-success__detail-label">Payment Due</span>
            <span className="registration-success__detail-value">
              Payment information will be sent to your email.
            </span>
          </div>
        </div>

        <div className="registration-success__actions">
          <button
            className="btn btn--primary"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Back to Home
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Register Another Player
          </button>
        </div>

        <p className="registration-success__footer">
          Have questions? Email support@ralyx.com or check out our FAQ.
        </p>
      </div>
    </div>
  );
}

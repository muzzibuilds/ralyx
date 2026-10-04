/**
 * Waitlist Success Screen
 * Confirmation for adding to waitlist
 */

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import './WaitlistSuccess.css';

interface WaitlistSuccessProps {
  firstName: string;
  email: string;
}

export default WaitlistSuccess;

export function WaitlistSuccess({ firstName, email }: WaitlistSuccessProps) {
  const navigate = useNavigate();

  return (
    <div className="waitlist-success">
      <div className="waitlist-success__container">
        <div className="waitlist-success__icon">⏱</div>
        <h2 className="waitlist-success__title">You Haven't Missed Your Shot</h2>
        <p className="waitlist-success__message">
          {firstName}, you're now on the Season I waitlist!
        </p>

        <div className="waitlist-success__details">
          <div className="waitlist-success__detail">
            <span className="waitlist-success__detail-label">Confirmation Email</span>
            <span className="waitlist-success__detail-value">{email}</span>
          </div>

          <div className="waitlist-success__detail">
            <span className="waitlist-success__detail-label">What Happens Next?</span>
            <span className="waitlist-success__detail-value">
              If a spot opens up before the season starts, we'll email you immediately with instructions to secure your registration.
            </span>
          </div>

          <div className="waitlist-success__detail">
            <span className="waitlist-success__detail-label">Season I is Full (16/16)</span>
            <span className="waitlist-success__detail-value">
              Keep an eye on your inbox—you're at the top of the list!
            </span>
          </div>
        </div>

        <div className="waitlist-success__actions">
          <button
            className="btn btn--primary"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Back to Home
          </button>
        </div>

        <p className="waitlist-success__footer">
          Thanks for your interest in RALYX. We're excited about Season II!
        </p>
      </div>
    </div>
  );
}

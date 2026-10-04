/**
 * Registration Page
 * Player registration form flow
 * 
 * Phase 5: Will implement full Stripe checkout flow
 * Phase 2: Scaffold only
 */

import { Container, Section } from '../components/ui';
import './Register.css';

export default function RegisterPage() {
  return (
    <Section className="register-page">
      <Container>
        <div className="register-content">
          <h1>CLAIM YOUR SPOT</h1>
          <p className="register-subtitle">Join THE FOUNDING 16</p>

          <div className="register-placeholder">
            <div className="placeholder-content">
              <p>Registration workflow will be implemented in Phase 5.</p>
              <p>This page will include:</p>
              <ul>
                <li>Player information form</li>
                <li>DUPR rating & profile URL</li>
                <li>Waiver & terms acceptance</li>
                <li>Stripe Checkout integration</li>
                <li>Payment confirmation</li>
              </ul>
              <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--text-tertiary)' }}>
                Status: Coming soon
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

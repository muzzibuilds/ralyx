/**
 * Registration Page
 * Player registration form flow with payment processing
 * 
 * Phase 6: Added Stripe payment processing after form confirmation
 */

import { useState } from 'react';
import { Container, Section } from '../components/ui';
import RegistrationForm from '../components/RegistrationForm';
import RegistrationSuccess from '../components/RegistrationSuccess';
import WaitlistSuccess from '../components/WaitlistSuccess';
import PaymentConfirm from '../components/PaymentConfirm';
import { useCurrentSeason } from '../hooks/useSeason';
import { useConfirmedCount } from '../hooks/useRegistration';
import { useCreateRegistration } from '../hooks/useRegistration';
import { useCreateDemandLead } from '../hooks/useDemand';
import { playerService } from '../services/players.service';
import { demandService } from '../services/demand.service';
import { generateInvoiceData } from '../services/stripeService';
import type { RegistrationFormData } from '../components/RegistrationForm';
import './Register.css';

type RegistrationState = 'form' | 'payment' | 'payment-confirm' | 'success' | 'waitlist-success';

interface SuccessData {
  firstName: string;
  email: string;
  seasonName: string;
}

interface PendingRegistration {
  formData: RegistrationFormData;
  playerId?: string;
  paymentIntentId?: string;
}

export default function RegisterPage() {
  const [state, setState] = useState<RegistrationState>('form');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hooks for data and mutations
  const { data: currentSeason } = useCurrentSeason();
  const { data: confirmedCount = 0 } = useConfirmedCount(currentSeason?.id);
  const createRegistration = useCreateRegistration();
  const createDemandLead = useCreateDemandLead();

  const isFull = (confirmedCount ?? 0) >= 16;

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    try {
      setError(null);

      if (!currentSeason) {
        setError('No active season found. Please try again.');
        return;
      }

      // If season is full, join waitlist (no payment needed)
      if (isFull) {
        await demandService.createDemandLead({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '',
          duprRating: formData.duprRating || 0,
          preferredDay: undefined,
        });

        setSuccessData({
          firstName: formData.firstName,
          email: formData.email,
          seasonName: currentSeason.name,
        });
        setState('waitlist-success');
        return;
      }

      // Get or create player
      let playerId: string;
      try {
        const existingPlayer = await playerService.getPlayerByEmail(formData.email);
        playerId = existingPlayer.id;
      } catch {
        // Player doesn't exist, create new one
        const newPlayer = await playerService.createPlayer({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '',
          duprRating: formData.duprRating || 0,
          duprProfileUrl: formData.duprProfileUrl || '',
        });
        playerId = newPlayer.id;
      }

      // Store pending registration and move to payment
      setPendingRegistration({
        formData,
        playerId,
      });
      setState('payment');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prepare registration';
      setError(errorMessage);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Note: For production, this would handle actual Stripe payment response
    if (!pendingRegistration || !currentSeason) {
      return;
    }

    try {
      setPaymentStatus('processing');
      const { formData, playerId } = pendingRegistration;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create registration (payment intent ID would be included in production)
      await createRegistration.mutateAsync({
        playerId: playerId!,
        seasonId: currentSeason.id,
        status: 'confirmed',
        registeredAt: new Date(),
      });

      // Update pending registration with success
      setPendingRegistration({
        ...pendingRegistration,
        paymentIntentId,
      });

      setPaymentStatus('success');
      setSuccessData({
        firstName: formData.firstName,
        email: formData.email,
        seasonName: currentSeason.name,
      });

      // Auto-transition to success after 2 seconds
      setTimeout(() => {
        setState('success');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete registration';
      setPaymentError(errorMessage);
      setPaymentStatus('error');
    }
  };

  const handlePaymentRetry = () => {
    setPaymentStatus('processing');
    setPaymentError(null);
  };

  const handlePaymentBack = () => {
    setState('form');
    setPendingRegistration(null);
    setPaymentStatus('processing');
    setPaymentError(null);
  };

  const handleJoinWaitlist = async (formData: RegistrationFormData) => {
    try {
      setError(null);

      if (!currentSeason) {
        setError('No active season found. Please try again.');
        return;
      }

      await demandService.createDemandLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        duprRating: formData.duprRating || 0,
        preferredDay: undefined,
      });

      setSuccessData({
        firstName: formData.firstName,
        email: formData.email,
        seasonName: currentSeason.name,
      });
      setState('waitlist-success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join waitlist';
      setError(errorMessage);
    }
  };

  return (
    <Section className="register-page">
      <Container>
        {state === 'form' && (
          <div className="register-content">
            <h1>CLAIM YOUR SPOT</h1>
            <p className="register-subtitle">Join THE FOUNDING 16</p>

            <RegistrationForm
              onSubmit={handleRegistrationSubmit}
              onDemandQueue={handleJoinWaitlist}
              isLoading={createRegistration.isPending || createDemandLead.isPending}
              error={error}
              isFull={isFull}
            />
          </div>
        )}

        {state === 'payment' && pendingRegistration && (
          <div className="register-content">
            <h1>SECURE YOUR REGISTRATION</h1>
            <p className="register-subtitle">Complete payment to confirm your spot</p>

            <PaymentConfirm
              status="success"
              amount={5000} // $50.00 in cents
              email={pendingRegistration.formData.email}
              firstName={pendingRegistration.formData.firstName}
              lastName={pendingRegistration.formData.lastName}
              paymentIntentId={`pi_demo_${Math.random().toString(36).substr(2, 9)}`}
              invoiceData={
                generateInvoiceData(
                  5000,
                  `${pendingRegistration.formData.firstName} ${pendingRegistration.formData.lastName}`,
                  pendingRegistration.formData.email,
                  pendingRegistration.formData.duprProfileUrl
                )
              }
              onContinue={() => handlePaymentSuccess(`pi_demo_${Math.random().toString(36).substr(2, 9)}`)}
              isLoading={createRegistration.isPending}
            />

            <p className="payment-disabled-note">
              💳 Demo Payment: In production, this will integrate with Stripe for real payment processing.
            </p>
          </div>
        )}

        {state === 'payment-confirm' && pendingRegistration && (
          <div className="register-content">
            <h1>PAYMENT CONFIRMATION</h1>
            <p className="register-subtitle">Your registration is nearly complete</p>

            <PaymentConfirm
              status={paymentStatus}
              amount={5000}
              email={pendingRegistration.formData.email}
              firstName={pendingRegistration.formData.firstName}
              lastName={pendingRegistration.formData.lastName}
              paymentIntentId={pendingRegistration.paymentIntentId}
              invoiceData={
                pendingRegistration.formData.email
                  ? generateInvoiceData(
                      5000,
                      `${pendingRegistration.formData.firstName} ${pendingRegistration.formData.lastName}`,
                      pendingRegistration.formData.email,
                      pendingRegistration.formData.duprProfileUrl
                    )
                  : undefined
              }
              error={paymentError || undefined}
              onContinue={() => {
                if (paymentStatus === 'success' && successData) {
                  setState('success');
                } else {
                  handlePaymentBack();
                }
              }}
              onRetry={handlePaymentRetry}
              isLoading={createRegistration.isPending}
            />
          </div>
        )}

        {state === 'success' && successData && (
          <RegistrationSuccess
            firstName={successData.firstName}
            email={successData.email}
            seasonName={successData.seasonName}
          />
        )}

        {state === 'waitlist-success' && successData && (
          <WaitlistSuccess
            firstName={successData.firstName}
            email={successData.email}
          />
        )}
      </Container>
    </Section>
  );
}

/**
 * Registration Page
 * Player registration form flow with payment processing
 * 
 * Phase 6B: Real Stripe payment integration with backend API
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Container, Section } from '../components/ui';
import RegistrationForm from '../components/RegistrationForm';
import RegistrationSuccess from '../components/RegistrationSuccess';
import WaitlistSuccess from '../components/WaitlistSuccess';
import PaymentConfirm from '../components/PaymentConfirm';
import StripeCheckout from '../components/StripeCheckout';
import StripeProvider from '../components/StripeProvider';
import { useCurrentSeason } from '../hooks/useSeason';
import { useConfirmedCount } from '../hooks/useRegistration';
import { useCreateRegistration } from '../hooks/useRegistration';
import { useCreateDemandLead } from '../hooks/useDemand';
import { playerService } from '../services/players.service';
import { demandService } from '../services/demand.service';
import { registrationService } from '../services/registrations.service';
import { confirmPayment, generateInvoiceData, calculateRegistrationFee } from '../services/stripeService';
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
  registrationId?: string;
  paymentIntentId?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const queryClient = useQueryClient();
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

  const notifyWaitlistConfirmation = async (formData: RegistrationFormData, seasonName: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/notifications/waitlist-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
          seasonName,
        }),
      });
    } catch (notificationError) {
      console.warn('Waitlist confirmation email could not be sent:', notificationError);
    }
  };

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

        await notifyWaitlistConfirmation(formData, currentSeason.name);

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

      const existingRegistration = await registrationService.getRegistrationByPlayerAndSeason(
        playerId,
        currentSeason.id
      );

      if (existingRegistration?.status === 'confirmed') {
        setError('This email is already registered for the current season.');
        return;
      }

      const registration = existingRegistration ?? await createRegistration.mutateAsync({
        playerId,
        seasonId: currentSeason.id,
        status: 'payment_pending',
        registeredAt: new Date(),
        amount: calculateRegistrationFee() / 100,
      });

      // Store pending registration and move to payment
      setPendingRegistration({
        formData,
        playerId,
        registrationId: registration.id,
      });
      setState('payment');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prepare registration';
      setError(errorMessage);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Handle successful Stripe payment
    if (!pendingRegistration || !currentSeason) {
      setPaymentError('Registration data missing');
      setPaymentStatus('error');
      return;
    }

    try {
      setPaymentStatus('processing');
      const { formData, registrationId } = pendingRegistration;

      if (!registrationId) {
        throw new Error('Registration data missing. Please restart the registration flow.');
      }

      const confirmation = await confirmPayment(paymentIntentId, registrationId);

      if (!confirmation.success) {
        throw new Error(confirmation.error || 'Payment confirmation failed');
      }

      await queryClient.invalidateQueries({ queryKey: ['registrations', 'count', currentSeason.id] });
      await queryClient.invalidateQueries({ queryKey: ['registrations', 'season', currentSeason.id] });

      // Update state for success
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

      // Auto-transition to success after 3 seconds
      setTimeout(() => {
        setState('success');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete registration after payment';
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

      await notifyWaitlistConfirmation(formData, currentSeason.name);

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

            <StripeProvider>
              <StripeCheckout
                amount={calculateRegistrationFee()}
                email={pendingRegistration.formData.email}
                firstName={pendingRegistration.formData.firstName}
                lastName={pendingRegistration.formData.lastName}
                registrationId={pendingRegistration.registrationId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={(error) => {
                  setPaymentError(error);
                  setPaymentStatus('error');
                }}
                isProcessing={createRegistration.isPending}
              />
            </StripeProvider>

            <p className="payment-note">
              🔒 Your card information is encrypted and secure. We never store full card details.
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

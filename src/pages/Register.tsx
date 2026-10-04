/**
 * Registration Page
 * Player registration form flow
 * 
 * Phase 5: Registration form with validation, capacity checking, and success states
 */

import { useState } from 'react';
import { Container, Section } from '../components/ui';
import RegistrationForm from '../components/RegistrationForm';
import RegistrationSuccess from '../components/RegistrationSuccess';
import WaitlistSuccess from '../components/WaitlistSuccess';
import { useCurrentSeason } from '../hooks/useSeason';
import { useConfirmedCount } from '../hooks/useRegistration';
import { useCreateRegistration } from '../hooks/useRegistration';
import { useCreateDemandLead } from '../hooks/useDemand';
import { playerService } from '../services/players.service';
import { demandService } from '../services/demand.service';
import type { RegistrationFormData } from '../components/RegistrationForm';
import './Register.css';

type RegistrationState = 'form' | 'success' | 'waitlist-success';

interface SuccessData {
  firstName: string;
  email: string;
  seasonName: string;
}

export default function RegisterPage() {
  const [state, setState] = useState<RegistrationState>('form');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
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

      // If season is full, join waitlist
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

      // Create or get player
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

      // Create registration
      await createRegistration.mutateAsync({
        playerId,
        seasonId: currentSeason.id,
        status: 'pending',
        registeredAt: new Date(),
      });

      setSuccessData({
        firstName: formData.firstName,
        email: formData.email,
        seasonName: currentSeason.name,
      });
      setState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete registration';
      setError(errorMessage);
    }
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

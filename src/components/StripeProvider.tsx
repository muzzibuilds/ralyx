import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getStripePublicKey } from '../services/stripeService';

const stripePublishableKey = getStripePublicKey();

const stripePromise = loadStripe(stripePublishableKey);

interface StripeProviderProps {
  children: React.ReactNode;
}

/**
 * Stripe Provider Wrapper
 * Initializes Stripe and provides it to child components
 */
export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

export default StripeProvider;

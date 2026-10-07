import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCheckoutProps } from '../types/stripe';
import { formatCurrency, calculateRegistrationFee, createPaymentIntent } from '../services/stripeService';
import './StripeCheckout.css';

/**
 * Stripe Checkout Form Component
 * Handles payment processing with Stripe Card Element and backend integration
 */
export function StripeCheckout({
  amount,
  email,
  firstName,
  lastName,
  registrationId,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent on mount
  useEffect(() => {
    const setupPayment = async () => {
      try {
        const displayAmount = amount > 0 ? amount : calculateRegistrationFee();
        const paymentData = await createPaymentIntent(
          displayAmount,
          email,
          firstName,
          lastName,
          registrationId
        );
        
        setClientSecret(paymentData.clientSecret);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
        setCardError(errorMessage);
        onPaymentError(errorMessage);
      }
    };

    setupPayment();
  }, [amount, email, firstName, lastName, onPaymentError, registrationId]);

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      const msg = 'Payment system not ready. Please refresh the page.';
      setCardError(msg);
      onPaymentError(msg);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Payment method not found');
      onPaymentError('Payment method not found');
      return;
    }

    if (cardError) {
      onPaymentError(cardError);
      return;
    }

    setIsLoading(true);

    try {
      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email,
            name: `${firstName} ${lastName}`
          }
        }
      });

      if (error) {
        setCardError(error.message || 'Payment failed');
        onPaymentError(error.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        setCardError('Payment was not processed. Please try again.');
        onPaymentError('Payment status unclear');
        setIsLoading(false);
        return;
      }

      // Success - pass payment intent ID to parent
      setCardError('');
      onPaymentSuccess(paymentIntent.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setCardError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const registrationFee = calculateRegistrationFee();
  const displayAmount = amount > 0 ? amount : registrationFee;

  return (
    <form className="stripe-checkout" onSubmit={handleSubmit}>
      <div className="stripe-checkout__header">
        <h2>Payment Details</h2>
        <p className="stripe-checkout__subtitle">Complete your registration with a secure payment</p>
      </div>

      <div className="stripe-checkout__amount">
        <div className="stripe-checkout__amount-label">Amount to Pay</div>
        <div className="stripe-checkout__amount-value">{formatCurrency(displayAmount)}</div>
      </div>

      <div className="stripe-checkout__card-section">
        <label className="stripe-checkout__label">Card Information</label>
        <div className="stripe-checkout__card-element">
          <CardElement
            onChange={handleCardChange}
            options={{
              style: {
                base: {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  '::placeholder': {
                    color: '#888',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                }
              },
              hidePostalCode: false
            }}
          />
        </div>
      </div>

      {cardError && (
        <div className="stripe-checkout__error">
          <span className="stripe-checkout__error-icon">⚠️</span>
          {cardError}
        </div>
      )}

      <div className="stripe-checkout__details">
        <div className="stripe-checkout__detail-row">
          <span>Cardholder Name</span>
          <span>{firstName} {lastName}</span>
        </div>
        <div className="stripe-checkout__detail-row">
          <span>Email</span>
          <span>{email}</span>
        </div>
      </div>

      <div className="stripe-checkout__security">
        <span className="stripe-checkout__security-icon">🔒</span>
        Your payment information is encrypted and secure
      </div>

      <button
        type="submit"
        className="stripe-checkout__submit"
        disabled={!stripe || !elements || isLoading || isProcessing || !!cardError}
      >
        {isLoading || isProcessing ? (
          <>
            <span className="stripe-checkout__spinner"></span>
            Processing Payment...
          </>
        ) : (
          <>Pay {formatCurrency(displayAmount)}</>
        )}
      </button>

      <p className="stripe-checkout__disclaimer">
        By completing this payment, you agree to our terms and conditions.
        For assistance, contact support@ralyx.app
      </p>
    </form>
  );
}

export default StripeCheckout;

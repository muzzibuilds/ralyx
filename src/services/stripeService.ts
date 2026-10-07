import type { PaymentIntentResponse, PaymentResult, InvoiceData, InvoiceItem } from '../types/stripe';
import { apiUrl } from '../lib/api';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

/**
 * Create a payment intent for registration via backend API
 */
export async function createPaymentIntent(
  amount: number,
  email: string,
  firstName: string,
  lastName: string,
  registrationId?: string
): Promise<PaymentIntentResponse> {
  try {
    const response = await fetch(apiUrl('/api/payments/create-intent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        email,
        firstName,
        lastName,
        registrationId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    };
  } catch (error) {
    throw new Error(`Payment setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Confirm payment with backend API
 */
export async function confirmPayment(
  paymentIntentId: string,
  registrationId: string
): Promise<PaymentResult> {
  try {
    const response = await fetch(apiUrl('/api/payments/confirm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        registrationId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Payment confirmation failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
      status: 'succeeded',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate invoice data for receipt
 */
export function generateInvoiceData(
  amount: number,
  customerName: string,
  customerEmail: string,
  duprProfileUrl?: string
): InvoiceData {
  const now = new Date();
  const invoiceNumber = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const items: InvoiceItem[] = [
    {
      description: 'RALYX Season Registration 2025',
      quantity: 1,
      unitPrice: amount,
      total: amount
    }
  ];
  
  if (duprProfileUrl) {
    items.push({
      description: 'DUPR Profile Linking',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  }

  return {
    invoiceNumber,
    date: now.toISOString().split('T')[0],
    amount,
    currency: 'usd',
    customerName,
    customerEmail,
    items,
    paymentMethod: 'card',
    paymentDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Format amount for display (cents to dollars)
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toLowerCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

/**
 * Validate Stripe public key is configured
 */
export function isStripeConfigured(): boolean {
  return !!STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY !== 'your_stripe_public_key_here';
}

/**
 * Get Stripe public key
 */
export function getStripePublicKey(): string {
  if (!isStripeConfigured()) {
    throw new Error('Stripe public key is not configured in environment variables');
  }
  return STRIPE_PUBLIC_KEY;
}

/**
 * Calculate registration fee (in cents)
 * Season registration: $50 = 5000 cents
 */
export function calculateRegistrationFee(): number {
  return 5000; // $50.00
}

/**
 * Get registration fee for display
 */
export function getRegistrationFeeDisplay(): string {
  return formatCurrency(calculateRegistrationFee());
}

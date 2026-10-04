import type { PaymentIntentResponse, PaymentResult, InvoiceData, InvoiceItem } from '../types/stripe';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

/**
 * Create a payment intent for registration
 * This is normally done server-side for security
 * For demo purposes, this shows the client-side pattern
 */
export async function createPaymentIntent(
  amount: number
): Promise<PaymentIntentResponse> {
  try {
    // In production, call your backend endpoint instead
    // const response = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount, metadata })
    // });
    
    // For now, we'll simulate the response
    // Your backend should create this via Stripe API
    return {
      clientSecret: `pi_test_${generateMockSecret()}`,
      amount,
      currency: 'usd',
      status: 'requires_payment_method'
    };
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Confirm payment with Stripe
 * @param paymentIntentId - The payment intent ID
 * @returns Payment confirmation
 */
export async function confirmPayment(
  paymentIntentId: string
): Promise<PaymentResult> {
  try {
    // Call your backend to confirm payment
    // const response = await fetch('/api/confirm-payment', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ paymentIntentId })
    // });
    
    return {
      success: true,
      paymentIntentId,
      status: 'succeeded'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
 * Mock secret generation for testing (remove in production)
 */
function generateMockSecret(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

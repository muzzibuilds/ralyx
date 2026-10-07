import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

/**
 * Stripe client instance
 * Configured with API version for consistency
 */
export const stripe = new Stripe(apiKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Create a payment intent for registration
 */
export async function createPaymentIntentForRegistration(
  amount: number,
  email: string,
  firstName: string,
  lastName: string,
  registrationId?: string
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount), // Amount in cents
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      email,
      firstName,
      lastName,
      registrationId: registrationId || 'pending',
      purpose: 'season_registration',
      createdAt: new Date().toISOString(),
    },
    receipt_email: email,
  });

  return paymentIntent;
}

/**
 * Retrieve payment intent details
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Confirm payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create refund
 */
export async function createRefund(
  paymentIntentId: string,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason,
  });
}

/**
 * Construct webhook event from raw body and signature
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

import express, { Router } from 'express';
import { createPaymentIntentForRegistration, getPaymentIntent } from '../stripe.config';
import { createPayment, updateRegistrationPaymentStatus } from '../supabase';
import { sendRegistrationConfirmationForPaymentIntent } from '../email';

export const paymentRouter = Router();

/**
 * Create payment intent for registration
 * POST /api/payments/create-intent
 */
paymentRouter.post('/create-intent', express.json(), async (req, res) => {
  try {
    const {
      amount,
      email,
      firstName,
      lastName,
      registrationId,
    } = req.body;

    // Validate required fields
    if (!amount || !email || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'amount, email, firstName, and lastName are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0',
      });
      return;
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntentForRegistration(
      amount,
      email,
      firstName,
      lastName,
      registrationId
    );

    // Create payment record in database
    const payment = await createPayment({
      registrationId: registrationId || paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      email,
      metadata: {
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    });
  }
});

/**
 * Retrieve payment intent status
 * GET /api/payments/:paymentIntentId
 */
paymentRouter.get('/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
      return;
    }

    const paymentIntent = await getPaymentIntent(paymentIntentId);

    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      lastPaymentError: paymentIntent.last_payment_error,
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    });
  }
});

/**
 * Confirm payment and update registration
 * POST /api/payments/confirm
 */
paymentRouter.post('/confirm', express.json(), async (req, res) => {
  try {
    const { paymentIntentId, registrationId } = req.body;

    if (!paymentIntentId || !registrationId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'paymentIntentId and registrationId are required',
      });
      return;
    }

    // Get payment intent from Stripe
    const paymentIntent = await getPaymentIntent(paymentIntentId);

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({
        success: false,
        error: 'Payment not confirmed',
        message: `Payment status is ${paymentIntent.status}`,
      });
      return;
    }

    // Update registration with payment info
    const registration = await updateRegistrationPaymentStatus(
      registrationId,
      'paid'
    );

    await sendRegistrationConfirmationForPaymentIntent(paymentIntentId);

    res.json({
      success: true,
      message: 'Payment confirmed and registration updated',
      paymentIntentId,
      registrationId,
      registration,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    });
  }
});

export default paymentRouter;

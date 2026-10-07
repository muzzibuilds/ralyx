import express, { Router } from 'express';
import { constructWebhookEvent } from '../stripe.config';
import { 
  updatePaymentByStripeIntentId, 
  updateRegistrationPaymentStatus
} from '../supabase';

export const webhookRouter = Router();

/**
 * Stripe webhook endpoint
 * Handles payment events (payment_intent.succeeded, payment_intent.payment_failed, etc.)
 * POST /webhooks/stripe
 */
webhookRouter.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Construct Stripe event from raw body and signature
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing Stripe signature',
      });
      return;
    }

    const event = constructWebhookEvent(req.body, signature);

    // Log webhook
    console.log(`🪝 Webhook received: ${event.type}`);
    console.log(`   ID: ${event.id}`);
    console.log(`   Timestamp: ${new Date(event.created * 1000).toISOString()}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        // Update payment record
        await updatePaymentByStripeIntentId(paymentIntent.id, {
          status: 'succeeded',
          metadata: {
            succeededAt: new Date().toISOString(),
            chargeId: paymentIntent.charges?.data?.[0]?.id,
          },
        });

        // Update registration if metadata contains registration ID
        if (paymentIntent.metadata?.registrationId && paymentIntent.metadata.registrationId !== 'pending') {
          await updateRegistrationPaymentStatus(
            paymentIntent.metadata.registrationId,
            'paid'
          );
          console.log(`📝 Registration ${paymentIntent.metadata.registrationId} marked as paid`);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        console.log(`   Error: ${paymentIntent.last_payment_error?.message}`);

        // Update payment record
        await updatePaymentByStripeIntentId(paymentIntent.id, {
          status: 'failed',
          metadata: {
            failedAt: new Date().toISOString(),
            failureReason: paymentIntent.last_payment_error?.message,
          },
        });

        // Update registration
        if (paymentIntent.metadata?.registrationId && paymentIntent.metadata.registrationId !== 'pending') {
          await updateRegistrationPaymentStatus(
            paymentIntent.metadata.registrationId,
            'failed'
          );
        }

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as any;
        console.log(`⏹️  Payment canceled: ${paymentIntent.id}`);

        // Update payment record
        await updatePaymentByStripeIntentId(paymentIntent.id, {
          status: 'canceled',
          metadata: {
            canceledAt: new Date().toISOString(),
          },
        });

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        console.log(`💰 Charge refunded: ${charge.id}`);
        console.log(`   Amount: $${(charge.amount_refunded / 100).toFixed(2)}`);

        // Update payment record
        if (charge.payment_intent) {
          await updatePaymentByStripeIntentId(charge.payment_intent, {
            status: 'refunded',
            metadata: {
              refundedAt: new Date().toISOString(),
              refundAmount: charge.amount_refunded,
              refundId: charge.refunds?.data?.[0]?.id,
            },
          });
        }

        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Return 200 OK immediately to acknowledge receipt
    res.json({
      success: true,
      message: 'Webhook processed',
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Return 400 Bad Request for signature/parsing errors
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    });
  }
});

export default webhookRouter;

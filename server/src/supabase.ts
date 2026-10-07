import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}

/**
 * Supabase client with service role permissions
 * Used for backend operations that need full database access
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMetadata(existing: unknown, incoming: unknown) {
  const existingRecord = isRecord(existing) ? existing : {};
  const incomingRecord = isRecord(incoming) ? incoming : {};

  const merged = {
    ...existingRecord,
    ...incomingRecord,
  };

  if (isRecord(existingRecord.notifications) || isRecord(incomingRecord.notifications)) {
    merged.notifications = {
      ...(isRecord(existingRecord.notifications) ? existingRecord.notifications : {}),
      ...(isRecord(incomingRecord.notifications) ? incomingRecord.notifications : {}),
    };
  }

  return merged;
}

/**
 * Get payment from database
 */
export async function getPayment(paymentId: string) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get payment by Stripe intent ID
 */
export async function getPaymentByStripeIntentId(stripePaymentIntentId: string) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Create payment record
 */
export async function createPayment(payment: {
  registrationId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  email: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert([
      {
        registration_id: payment.registrationId,
        stripe_payment_intent_id: payment.stripePaymentIntentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        email: payment.email,
        metadata: payment.metadata || {},
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  metadata?: Record<string, any>
) {
  const existingPayment = await getPayment(paymentId);

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      status,
      metadata: mergeMetadata(existingPayment.metadata, metadata),
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payment by Stripe intent ID
 */
export async function updatePaymentByStripeIntentId(
  stripePaymentIntentId: string,
  updates: {
    status?: string;
    metadata?: Record<string, any>;
  }
) {
  const existingPayment = await getPaymentByStripeIntentId(stripePaymentIntentId);

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      status: updates.status,
      metadata: mergeMetadata(existingPayment?.metadata, updates.metadata),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get registration by ID
 */
export async function getRegistration(registrationId: string) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get season by ID
 */
export async function getSeason(seasonId: string) {
  const { data, error } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update registration payment status
 */
export async function updateRegistrationPaymentStatus(
  registrationId: string,
  status: 'pending' | 'paid' | 'failed'
) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update({
      status: status === 'paid' ? 'confirmed' : 'pending',
      payment_status: status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get player by email
 */
export async function getPlayerByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get player by ID
 */
export async function getPlayerById(playerId: string) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a payment notification as sent
 */
export async function markPaymentNotificationSent(
  stripePaymentIntentId: string,
  notificationKey: string
) {
  const payment = await getPaymentByStripeIntentId(stripePaymentIntentId);

  if (!payment) {
    return null;
  }

  const metadata = mergeMetadata(payment.metadata, {
    notifications: {
      [notificationKey]: new Date().toISOString(),
    },
  });

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

import { Resend } from 'resend';
import {
  getPaymentByStripeIntentId,
  getPlayerById,
  getRegistration,
  getSeason,
  markPaymentNotificationSent,
} from './supabase';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'RALYX <noreply@ralyx.app>';
const supportEmail = process.env.SUPPORT_EMAIL || 'support@ralyx.app';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function formatCurrencyFromCents(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

function formatSeasonStart(dateValue?: string) {
  if (!dateValue) return 'the upcoming season';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue));
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!resend) {
    console.warn('Email delivery skipped: RESEND_API_KEY is not configured');
    return { skipped: true };
  }

  await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
    text,
    replyTo: supportEmail,
  });

  return { skipped: false };
}

export async function sendWaitlistConfirmationEmail({
  firstName,
  email,
  seasonName,
}: {
  firstName: string;
  email: string;
  seasonName?: string;
}) {
  const subject = seasonName
    ? `You're on the ${seasonName} waitlist`
    : "You're on the RALYX waitlist";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h1 style="margin-bottom: 12px;">You're on the waitlist 🎾</h1>
      <p>Hi ${firstName},</p>
      <p>
        Thanks for joining the ${seasonName || 'RALYX'} waitlist. If a spot opens up,
        we'll email you right away with the next steps to claim it.
      </p>
      <p>
        In the meantime, keep an eye on your inbox and feel free to reply to this email
        if you have any questions.
      </p>
      <p>
        — Team RALYX<br />
        <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>
  `;

  const text = `Hi ${firstName},\n\nThanks for joining the ${seasonName || 'RALYX'} waitlist. If a spot opens up, we'll email you right away with the next steps to claim it.\n\nQuestions? Reply to ${supportEmail}.\n\n— Team RALYX`;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendRegistrationConfirmationForPaymentIntent(paymentIntentId: string) {
  const payment = await getPaymentByStripeIntentId(paymentIntentId);

  if (!payment) {
    return { skipped: true, reason: 'payment_not_found' };
  }

  const notifications = payment.metadata?.notifications as Record<string, string> | undefined;
  if (notifications?.registrationConfirmationSentAt) {
    return { skipped: true, reason: 'already_sent' };
  }

  const registrationId = payment.registration_id;
  if (!registrationId || registrationId === paymentIntentId || String(registrationId).startsWith('pi_')) {
    return { skipped: true, reason: 'registration_not_linked' };
  }

  const registration = await getRegistration(registrationId);
  const [player, season] = await Promise.all([
    getPlayerById(registration.player_id),
    getSeason(registration.season_id),
  ]);

  const fullName = `${player.first_name} ${player.last_name}`;
  const seasonStart = formatSeasonStart(season?.start_date);
  const amountPaid = formatCurrencyFromCents(payment.amount);

  const subject = `Registration confirmed for ${season?.name || 'RALYX'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h1 style="margin-bottom: 12px;">You're officially in 🎉</h1>
      <p>Hi ${player.first_name},</p>
      <p>
        Your payment has been received and your registration for
        <strong>${season?.name || 'the upcoming RALYX season'}</strong> is confirmed.
      </p>

      <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>Player:</strong> ${fullName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${player.email}</p>
        <p style="margin: 0 0 8px;"><strong>Season:</strong> ${season?.name || 'RALYX'}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${season?.location || 'TBD'}</p>
        <p style="margin: 0 0 8px;"><strong>Season starts:</strong> ${seasonStart}</p>
        <p style="margin: 0;"><strong>Amount paid:</strong> ${amountPaid}</p>
      </div>

      <p>
        We'll share league details, weekly scheduling updates, and results at
        <a href="${frontendUrl}">${frontendUrl}</a>.
      </p>

      <p>
        Questions? Reply to this email or contact <a href="mailto:${supportEmail}">${supportEmail}</a>.
      </p>

      <p>— Team RALYX</p>
    </div>
  `;

  const text = `Hi ${player.first_name},\n\nYour payment has been received and your registration for ${season?.name || 'the upcoming RALYX season'} is confirmed.\n\nPlayer: ${fullName}\nEmail: ${player.email}\nSeason: ${season?.name || 'RALYX'}\nLocation: ${season?.location || 'TBD'}\nSeason starts: ${seasonStart}\nAmount paid: ${amountPaid}\n\nWe'll share league details and weekly updates at ${frontendUrl}.\n\nQuestions? Reply to ${supportEmail}.\n\n— Team RALYX`;

  await sendEmail({
    to: player.email,
    subject,
    html,
    text,
  });

  await markPaymentNotificationSent(paymentIntentId, 'registrationConfirmationSentAt');

  return { skipped: false };
}

export function emailNotificationsEnabled() {
  return !!resend;
}
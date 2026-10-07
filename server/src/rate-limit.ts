import rateLimit from 'express-rate-limit';

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const defaultWindowMs = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const defaultMaxRequests = parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 200);
const paymentMaxRequests = parseNumber(process.env.PAYMENT_RATE_LIMIT_MAX_REQUESTS, 20);
const notificationMaxRequests = parseNumber(process.env.NOTIFICATION_RATE_LIMIT_MAX_REQUESTS, 10);

export const apiRateLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: defaultMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please slow down and try again shortly.',
  },
});

export const paymentRateLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: paymentMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many payment attempts',
    message: 'Too many payment requests from this IP. Please try again later.',
  },
});

export const notificationRateLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: notificationMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many notification requests',
    message: 'Too many notification requests from this IP. Please try again later.',
  },
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentRouter } from './routes/payment.routes';
import { webhookRouter } from './routes/webhook.routes';
import { healthRouter } from './routes/health.routes';
import { notificationRouter } from './routes/notification.routes';
import { apiRateLimiter, notificationRateLimiter, paymentRateLimiter } from './rate-limit';

dotenv.config();

export function getAllowedOrigins() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.disable('x-powered-by');

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }));

  app.use((_, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Stripe requires the raw request body for webhook signature verification.
  app.use('/webhooks', webhookRouter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use('/health', healthRouter);

  app.use('/api', apiRateLimiter);
  app.use('/api/payments', paymentRateLimiter, paymentRouter);
  app.use('/api/notifications', notificationRateLimiter, notificationRouter);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Route ${req.path} not found`,
    });
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);

    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { details: err }),
    });
  });

  return app;
}

const app = createApp();

export default app;
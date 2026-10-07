import { Router } from 'express';

export const healthRouter = Router();

const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FRONTEND_URL',
];

/**
 * Health check endpoint
 * GET /health
 */
healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Readiness check endpoint
 * GET /health/ready
 */
healthRouter.get('/ready', (_req, res) => {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  const isReady = missingEnvVars.length === 0;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      env: isReady ? 'pass' : 'fail',
      missingEnvVars,
    },
  });
});

export default healthRouter;

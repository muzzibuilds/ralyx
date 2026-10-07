import { Router } from 'express';

export const healthRouter = Router();

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

export default healthRouter;

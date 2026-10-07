import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentRouter } from './routes/payment.routes';
import { webhookRouter } from './routes/webhook.routes';
import { healthRouter } from './routes/health.routes';
import { notificationRouter } from './routes/notification.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Stripe requires the raw request body for webhook signature verification.
app.use('/webhooks', webhookRouter);

// Parse JSON with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check route (must be early for monitoring)
app.use('/health', healthRouter);

// API Routes
app.use('/api/payments', paymentRouter);
app.use('/api/notifications', notificationRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { details: err }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RALYX Backend running on port ${PORT}`);
  console.log(`📍 Frontend: ${FRONTEND_URL}`);
  console.log(`🔗 Payment API: http://localhost:${PORT}/api/payments`);
  console.log(`🪝 Webhooks: http://localhost:${PORT}/webhooks`);
});

export default app;

import app, { getAllowedOrigins } from './app';

const PORT = process.env.PORT || 3001;
const allowedOrigins = getAllowedOrigins();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RALYX Backend running on port ${PORT}`);
  console.log(`📍 Allowed Frontend Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Payment API: http://localhost:${PORT}/api/payments`);
  console.log(`🪝 Webhooks: http://localhost:${PORT}/webhooks`);
});

export default app;

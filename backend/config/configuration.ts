export default () => ({
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL
});
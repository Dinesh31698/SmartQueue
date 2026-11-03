require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartqueue',
  jwtSecret: process.env.JWT_SECRET || 'smartqueue_dev_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim()),
  defaultStoreId: process.env.DEFAULT_STORE_ID || 'STORE-001',
  defaultStoreName: process.env.DEFAULT_STORE_NAME || 'SmartQueue Supermarket Flagship',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
};

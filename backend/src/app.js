const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const apiRoutes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigins.includes('*') ||
        config.corsOrigins.includes(origin) ||
        origin.startsWith('http://localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to support Android emulator / desktop
    },
    credentials: true,
  })
);

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// API Base Route
app.use('/api', apiRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SmartQueue Centralized Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    docs: '/api/health',
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

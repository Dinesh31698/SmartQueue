const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    System health check
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      service: 'SmartQueue Centralized Backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      version: '1.0.0',
    },
    message: 'SmartQueue Backend is operational.',
  });
});

module.exports = router;

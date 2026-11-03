const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/dashboard', analyticsController.getDashboardSummary);
router.get('/sales', analyticsController.getSalesTrends);
router.get('/queue-traffic', analyticsController.getQueueTraffic);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/cashier-stats', analyticsController.getCashierStats);

module.exports = router;

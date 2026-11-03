const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public route for digital queue display screens
router.get('/display', queueController.getPublicDisplay);

// Customer queue operations
router.post('/join', authenticateToken, queueController.joinQueue);
router.get('/ticket/current', authenticateToken, queueController.getCurrentTicket);
router.get('/ticket/:id', authenticateToken, queueController.getTicketById);
router.post('/ticket/:id/cancel', authenticateToken, queueController.cancelTicket);

// Cashier & Staff queue operations
router.get('/status', authenticateToken, queueController.getStoreQueueOverview);
router.post('/call-next', authenticateToken, authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), queueController.callNextCustomer);
router.post('/ticket/:id/serve', authenticateToken, authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), queueController.serveTicket);
router.post('/ticket/:id/complete', authenticateToken, authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), queueController.completeTicket);
router.post('/ticket/:id/skip', authenticateToken, authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), queueController.skipTicket);

module.exports = router;

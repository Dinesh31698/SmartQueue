const express = require('express');
const router = express.Router();
const counterController = require('../controllers/counter.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', counterController.listCounters);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), counterController.createCounter);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), counterController.updateCounter);

// Cashier claim / status
router.post('/:id/assign', authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), counterController.assignCounter);
router.post('/:id/unassign', authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), counterController.unassignCounter);
router.patch('/:id/status', authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), counterController.updateCounterStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/', storeController.listStores);
router.post('/resolve-tag', storeController.resolveTag);
router.get('/:id', storeController.getStoreById);

// Protected routes (Admin / Manager)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), storeController.createStore);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), storeController.updateStore);
router.get('/:id/settings', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), storeController.getStoreSettings);
router.put('/:id/settings', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), storeController.updateStoreSettings);

module.exports = router;

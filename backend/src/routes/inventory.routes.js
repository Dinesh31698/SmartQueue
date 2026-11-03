const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'MANAGER', 'CASHIER'));

router.get('/', inventoryController.listInventory);
router.get('/low-stock', inventoryController.getLowStockAlerts);
router.post('/restock', inventoryController.restockProduct);
router.put('/:id', inventoryController.updateInventoryDetails);

module.exports = router;

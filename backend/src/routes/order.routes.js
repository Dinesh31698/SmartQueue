const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', orderController.createOrder);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', authorizeRoles('CASHIER', 'MANAGER', 'ADMIN'), orderController.updateOrderStatus);

module.exports = router;

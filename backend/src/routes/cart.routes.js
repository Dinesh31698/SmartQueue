const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateItemQuantity);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;

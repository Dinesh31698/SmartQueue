const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Barcode lookup MUST come before /:id
router.get('/barcode/:barcode', productController.getByBarcode);

// Public / Customer browsing
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);

// Staff management
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), productController.deleteProduct);

module.exports = router;

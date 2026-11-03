const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected (Admin / Manager)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), categoryController.deleteCategory);

module.exports = router;

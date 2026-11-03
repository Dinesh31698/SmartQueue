const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Employee & user management (Admin & Manager)
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), userController.createEmployee);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), userController.listUsers);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), userController.getUserById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), userController.updateUser);
router.patch('/:id/status', authorizeRoles('ADMIN', 'MANAGER'), userController.toggleUserStatus);

module.exports = router;

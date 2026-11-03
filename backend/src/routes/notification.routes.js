const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', notifController.listNotifications);
router.patch('/:id/read', notifController.markAsRead);
router.post('/read-all', notifController.markAllAsRead);

module.exports = router;

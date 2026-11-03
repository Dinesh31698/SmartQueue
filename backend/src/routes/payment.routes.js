const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/process', paymentController.processPayment);
router.get('/receipt/:orderId', paymentController.getReceipt);

module.exports = router;

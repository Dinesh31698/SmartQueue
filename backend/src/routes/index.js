const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const storeRoutes = require('./store.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const queueRoutes = require('./queue.routes');
const counterRoutes = require('./counter.routes');
const paymentRoutes = require('./payment.routes');
const recommendationRoutes = require('./recommendation.routes');
const analyticsRoutes = require('./analytics.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/queue', queueRoutes);
router.use('/counters', counterRoutes);
router.use('/payment', paymentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

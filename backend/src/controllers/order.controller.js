const { Order, Cart, Product, Inventory } = require('../models');
const { emitToStore, emitToUser } = require('../sockets/socketManager');

// Helper to generate unique order number: ORD-YYYYMMDD-XXXX
const generateOrderNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const {
      storeId,
      items: incomingItems,
      fromCart = false,
      paymentMethod = 'PENDING',
      notes = '',
    } = req.body;

    const customerId = req.user.id;
    let orderItems = [];

    if (fromCart) {
      const cart = await Cart.findOne({ userId: customerId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, error: 'Cannot checkout with an empty cart.' });
      }

      orderItems = cart.items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        barcode: item.productId.barcode,
        price: item.priceAtAdd,
        quantity: item.quantity,
        subtotal: item.priceAtAdd * item.quantity,
      }));
    } else if (incomingItems && incomingItems.length > 0) {
      // Direct items array (e.g. Cashier pos terminal or quick scan checkout)
      for (const item of incomingItems) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        orderItems.push({
          productId: product._id,
          name: product.name,
          barcode: product.barcode,
          price: product.price,
          quantity: item.quantity || 1,
          subtotal: product.price * (item.quantity || 1),
        });
      }
    } else {
      return res.status(400).json({ success: false, error: 'No items provided for order.' });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid items found to create order.' });
    }

    // Compute totals
    const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const discountAmount = 0;
    const finalTotal = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerId,
      storeId: storeId || req.user.storeId,
      items: orderItems,
      subtotal,
      taxAmount,
      discountAmount,
      finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'PENDING' ? 'PENDING' : 'PAID',
      orderStatus: 'PENDING',
      notes,
    });

    // Deduct inventory for each item
    for (const item of orderItems) {
      const inv = await Inventory.findOne({ productId: item.productId, storeId: order.storeId });
      if (inv) {
        const balance = Math.max(0, inv.currentStock - item.quantity);
        inv.currentStock = balance;
        inv.stockMovements.push({
          type: 'SALE',
          quantity: -item.quantity,
          balanceAfter: balance,
          reason: `Order #${order.orderNumber}`,
          recordedBy: customerId,
          timestamp: new Date(),
        });
        await inv.save();
      }
    }

    // Clear user cart if ordered from cart
    if (fromCart) {
      await Cart.findOneAndUpdate({ userId: customerId }, { items: [], subtotal: 0 });
    }

    // Socket notification
    emitToStore(order.storeId, 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
    });
    emitToUser(customerId, 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: `Order #${order.orderNumber} placed successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
const listOrders = async (req, res, next) => {
  try {
    const { role, id: userId, storeId: userStoreId } = req.user;
    const { status, storeId, page = 1, limit = 20, search } = req.query;

    const filter = {};

    if (role === 'CUSTOMER') {
      filter.customerId = userId;
    } else {
      // Cashier, Manager, Admin view store orders
      const targetStoreId = storeId || userStoreId;
      if (targetStoreId) filter.storeId = targetStoreId;
    }

    if (status) filter.orderStatus = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('storeId', 'storeCode name')
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('storeId', 'storeCode name address contactNumber')
      .populate('cashierId', 'name')
      .populate('counterId', 'counterNumber name')
      .populate('items.productId', 'name barcode imageUrl');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Role check: customer can only view their own order
    if (req.user.role === 'CUSTOMER' && order.customerId && order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this order.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (req.user && ['CASHIER', 'MANAGER', 'ADMIN'].includes(req.user.role)) {
      order.cashierId = req.user.id;
    }

    await order.save();

    // Sockets
    emitToStore(order.storeId, 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    emitToUser(order.customerId, 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${order.orderStatus}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
};

const { Payment, Order, Transaction, Store } = require('../models');
const { emitToStore, emitToUser } = require('../sockets/socketManager');

// Helper to generate transaction ID: TXN-YYYYMMDD-XXXX
const generateTransactionId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TXN-${dateStr}-${rand}`;
};

// POST /api/payment/process
const processPayment = async (req, res, next) => {
  try {
    const { orderId, method = 'CASH', amountPaid, notes = '' } = req.body;

    const order = await Order.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('storeId', 'storeCode name address contactNumber');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, error: 'This order is already marked as PAID.' });
    }

    const transactionId = generateTransactionId();
    const paidAmount = amountPaid !== undefined ? parseFloat(amountPaid) : order.finalTotal;

    // Create Payment record
    const payment = await Payment.create({
      orderId: order._id,
      transactionId,
      method,
      amount: paidAmount,
      currency: 'USD',
      status: 'SUCCESS',
      paymentGatewayResponse: {
        mode: 'SIMULATED_GATEWAY',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        processedAt: new Date(),
      },
    });

    // Record Transaction ledger entry
    const transaction = await Transaction.create({
      storeId: order.storeId._id,
      orderId: order._id,
      cashierId: req.user ? req.user.id : null,
      counterId: order.counterId || null,
      amount: paidAmount,
      paymentMethod: method,
      status: 'SUCCESS',
    });

    // Update order
    order.paymentStatus = 'PAID';
    order.orderStatus = 'COMPLETED';
    order.paymentMethod = method;
    await order.save();

    // Sockets
    emitToStore(order.storeId._id, 'order_status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: 'COMPLETED',
      paymentStatus: 'PAID',
    });
    if (order.customerId) {
      emitToUser(order.customerId._id, 'order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: 'COMPLETED',
        paymentStatus: 'PAID',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order,
        payment,
        transaction,
        receipt: {
          store: order.storeId,
          orderNumber: order.orderNumber,
          date: new Date(),
          items: order.items,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          discountAmount: order.discountAmount,
          finalTotal: order.finalTotal,
          paymentMethod: method,
          transactionId,
          customerName: order.customerId ? order.customerId.name : 'Walk-in Customer',
        },
      },
      message: `Payment of $${paidAmount.toFixed(2)} processed successfully via ${method}.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payment/receipt/:orderId
const getReceipt = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('storeId', 'storeCode name address contactNumber')
      .populate('cashierId', 'name')
      .populate('counterId', 'counterNumber name');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const payment = await Payment.findOne({ orderId: order._id, status: 'SUCCESS' }).sort({ createdAt: -1 });

    const receipt = {
      store: order.storeId,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      finalTotal: order.finalTotal,
      paymentMethod: order.paymentMethod,
      transactionId: payment ? payment.transactionId : 'N/A',
      customerName: order.customerId ? order.customerId.name : 'Customer',
      cashierName: order.cashierId ? order.cashierId.name : 'Self-Checkout',
      counterNumber: order.counterId ? order.counterId.counterNumber : null,
    };

    res.status(200).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processPayment,
  getReceipt,
};

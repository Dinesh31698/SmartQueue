const mongoose = require('mongoose');
const { orderItemSchema } = require('./OrderItem');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueTicket',
      default: null,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: function () {
        return this.finalTotal || 0;
      },
      min: 0,
    },
    finalTotal: {
      type: Number,
      default: function () {
        return this.totalAmount || 0;
      },
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'SELF_CHECKOUT', 'PENDING'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PLACED', 'VERIFIED', 'COMPLETED', 'CANCELLED'],
      default: 'PLACED',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    counterNumber: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assignedCashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'BUSY'],
      default: 'OPEN',
      index: true,
    },
    acceptedPaymentType: {
      type: String,
      enum: ['ALL', 'UPI', 'CARD', 'CASH', 'SELF_CHECKOUT'],
      default: 'ALL',
    },
    currentTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueTicket',
      default: null,
    },
    currentServingTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueTicket',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

counterSchema.index({ storeId: 1, counterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);

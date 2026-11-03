const mongoose = require('mongoose');

const queueTicketSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null,
    },
    ticketNumber: {
      type: String,
      required: true,
      index: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'SELF_CHECKOUT'],
      default: 'UPI',
    },
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    servingAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    skippedReason: {
      type: String,
      default: '',
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

// Compound index for querying active tickets in store
queueTicketSchema.index({ storeId: 1, status: 1 });

module.exports = mongoose.model('QueueTicket', queueTicketSchema);

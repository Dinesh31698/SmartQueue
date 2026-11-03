const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'SELF_CHECKOUT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'SIMULATED_TEST'],
      default: 'PENDING',
      index: true,
    },
    paymentDetails: {
      providerRef: String,
      upiId: String,
      cardLast4: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

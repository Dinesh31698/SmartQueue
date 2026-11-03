const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true, // format: YYYY-MM-DD
      index: true,
    },
    currentSequenceNumber: {
      type: Number,
      default: 100,
    },
    activeTicketsCount: {
      type: Number,
      default: 0,
    },
    averageServiceTimeMinutes: {
      type: Number,
      default: 2.5,
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index({ storeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);

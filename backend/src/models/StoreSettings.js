const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
    },
    maxQueuePerLane: {
      type: Number,
      default: 15,
    },
    defaultEstimatedWaitPerCustomerMinutes: {
      type: Number,
      default: 2.5,
    },
    businessHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
    autoAssignCounter: {
      type: Boolean,
      default: true,
    },
    enableAiRecommendations: {
      type: Boolean,
      default: true,
    },
    enableNfc: {
      type: Boolean,
      default: true,
    },
    enableQr: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

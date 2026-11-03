const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    storeCode: {
      type: String,
      required: [true, 'Store code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    phone: String,
    email: String,
    nfcTagPayload: {
      type: String,
      default: function () {
        return `SMARTQUEUE:STORE:${this.storeCode}`;
      },
    },
    qrCodePayload: {
      type: String,
      default: function () {
        return `SMARTQUEUE:STORE:${this.storeCode}`;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    openingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Store', storeSchema);

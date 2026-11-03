const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUST', 'SALE', 'RETURN'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referenceId: {
      type: String,
      default: null, // Order ID or Restock Batch ID
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const inventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minThreshold: {
      type: Number,
      default: 10,
    },
    lastRestockedAt: {
      type: Date,
      default: null,
    },
    stockMovements: [stockMovementSchema],
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of store and product
inventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);

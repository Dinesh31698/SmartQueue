const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
      default: null,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be non-negative'],
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockThreshold: {
      type: Number,
      default: 10,
    },
    unit: {
      type: String,
      default: 'item',
    },
    aisleLocation: {
      type: String,
      default: 'Aisle 1',
    },
    taxPercent: {
      type: Number,
      default: 5,
    },
    description: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    nutritionalInfo: {
      calories: { type: Number, default: 0 },
      sugar: { type: String, default: '0g' },
      protein: { type: String, default: '0g' },
      fat: { type: String, default: '0g' },
      sodium: { type: String, default: '0mg' },
    },
    nutrition: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isHealthyPick: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    dietaryFlags: {
      isOrganic: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for barcode per store
productSchema.index({ storeId: 1, barcode: 1 }, { unique: true });

// Text search index
productSchema.index({ name: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);

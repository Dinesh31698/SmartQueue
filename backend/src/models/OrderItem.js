const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    productName: {
      type: String,
      default: function () {
        return this.name || '';
      },
    },
    barcode: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      default: 0,
    },
    unitPrice: {
      type: Number,
      default: function () {
        return this.price || 0;
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

module.exports = {
  orderItemSchema,
  OrderItem: mongoose.model('OrderItem', orderItemSchema),
};
